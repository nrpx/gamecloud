package download

import (
	"context"
	"fmt"
	"gamecloud/internal/config"
	"gamecloud/internal/models"
	"gamecloud/internal/torrent"
	"io"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WebSocketBroadcaster интерфейс для отправки WebSocket сообщений
type WebSocketBroadcaster interface {
	BroadcastProgress(userID string, progress torrent.ProgressUpdate)
}

type Manager struct {
	torrentClient *torrent.Client
	db            *gorm.DB
	cfg           *config.Config
	downloads     map[uuid.UUID]*DownloadJob
	progressChans map[string]chan torrent.ProgressUpdate
	queue         chan *models.Download
	workers       int
	stopCh        chan struct{}
	wg            sync.WaitGroup
	mu            sync.RWMutex
	wsHub         WebSocketBroadcaster // WebSocket hub для real-time обновлений
}

type DownloadJob struct {
	Download        *models.Download
	TorrentID       string
	ProgressChan    chan torrent.ProgressUpdate
	ctx             context.Context
	cancel          context.CancelFunc
	mu              sync.RWMutex
}

func NewManager(torrentClient *torrent.Client, db *gorm.DB, cfg *config.Config) *Manager {
	return &Manager{
		torrentClient: torrentClient,
		db:            db,
		cfg:           cfg,
		downloads:     make(map[uuid.UUID]*DownloadJob),
		progressChans: make(map[string]chan torrent.ProgressUpdate),
		queue:         make(chan *models.Download, 100),
		workers:       5, // Увеличиваем количество воркеров для параллельной обработки
		stopCh:        make(chan struct{}),
	}
}

// SetWebSocketHub устанавливает WebSocket hub для real-time обновлений
func (m *Manager) SetWebSocketHub(hub WebSocketBroadcaster) {
	m.wsHub = hub
}

func (m *Manager) Start() {
	log.Println("Starting download manager with enhanced multithreading")
	
	// Start workers для обработки очереди
	for i := 0; i < m.workers; i++ {
		m.wg.Add(1)
		go m.worker(i)
	}

	// Start global status updater
	m.wg.Add(1)
	go m.globalStatusUpdater()

	// Resume incomplete downloads
	go m.resumeDownloads()
}

func (m *Manager) Stop() {
	log.Println("Stopping download manager")
	
	// Останавливаем все активные загрузки
	m.mu.Lock()
	for _, job := range m.downloads {
		if job.cancel != nil {
			job.cancel()
		}
	}
	m.mu.Unlock()
	
	close(m.stopCh)
	m.wg.Wait()
}

func (m *Manager) AddDownload(download *models.Download) error {
	// Save to database first
	if err := m.db.Create(download).Error; err != nil {
		return fmt.Errorf("failed to save download to database: %w", err)
	}

	// Add to queue for processing
	select {
	case m.queue <- download:
		log.Printf("Added download to queue: %s", download.Game.Title)
	default:
		log.Printf("Download queue is full, download will be processed later: %s", download.Game.Title)
		// Обновляем статус в БД
		download.Status = "queued"
		m.db.Save(download)
	}

	return nil
}

func (m *Manager) AddTorrentFile(download *models.Download, torrentFile io.Reader) error {
	if m.torrentClient == nil {
		return fmt.Errorf("torrent client is not available")
	}

	// Save to database first
	if err := m.db.Create(download).Error; err != nil {
		return fmt.Errorf("failed to save download to database: %w", err)
	}

	// Создаем контекст для управления загрузкой
	ctx, cancel := context.WithCancel(context.Background())
	
	// Запускаем торрент из файла
	torrentID, progressChan, err := m.torrentClient.AddTorrentFile(torrentFile, m.cfg.TorrentConfig.DownloadDir)
	if err != nil {
		// Обновляем статус ошибки в БД
		download.Status = "failed"
		download.Error = err.Error()
		m.db.Save(download)
		return fmt.Errorf("failed to start torrent: %w", err)
	}

	// Создаем задачу загрузки
	job := &DownloadJob{
		Download:     download,
		TorrentID:    torrentID,
		ProgressChan: progressChan,
		ctx:          ctx,
		cancel:       cancel,
	}

	// Добавляем в активные загрузки
	m.mu.Lock()
	m.downloads[download.ID] = job
	m.progressChans[torrentID] = progressChan
	m.mu.Unlock()

	// Запускаем мониторинг в отдельной горутине
	go m.monitorDownloadProgress(job)

	log.Printf("Started torrent download from file: %s", download.Game.Title)
	return nil
}

func (m *Manager) GetDownload(id uuid.UUID) (*models.Download, error) {
	var download models.Download
	err := m.db.Preload("Game").First(&download, "id = ?", id).Error
	return &download, err
}

func (m *Manager) GetAllDownloads() ([]models.Download, error) {
	var downloads []models.Download
	err := m.db.Preload("Game").Find(&downloads).Error
	return downloads, err
}

func (m *Manager) PauseDownload(id uuid.UUID) error {
	if m.torrentClient == nil {
		return fmt.Errorf("torrent client not available")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	if job, exists := m.downloads[id]; exists {
		// Приостанавливаем в торрент-клиенте
		if err := m.torrentClient.PauseDownload(job.TorrentID); err != nil {
			return fmt.Errorf("failed to pause torrent: %w", err)
		}
		
		// Обновляем статус в БД
		job.Download.Status = "paused"
		return m.db.Save(job.Download).Error
	}
	return fmt.Errorf("download not found: %s", id)
}

func (m *Manager) ResumeDownload(id uuid.UUID) error {
	if m.torrentClient == nil {
		return fmt.Errorf("torrent client not available")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	if job, exists := m.downloads[id]; exists {
		// Возобновляем в торрент-клиенте
		if err := m.torrentClient.ResumeDownload(job.TorrentID); err != nil {
			return fmt.Errorf("failed to resume torrent: %w", err)
		}
		
		// Обновляем статус в БД
		job.Download.Status = "downloading"
		return m.db.Save(job.Download).Error
	}
	
	// Если загрузка не активна, добавляем обратно в очередь
	var download models.Download
	if err := m.db.Preload("Game").First(&download, "id = ?", id).Error; err != nil {
		return err
	}

	download.Status = "queued"
	if err := m.db.Save(&download).Error; err != nil {
		return err
	}

	select {
	case m.queue <- &download:
		log.Printf("Resumed download: %s", download.Game.Title)
	default:
		log.Printf("Download queue is full")
	}

	return nil
}

func (m *Manager) CancelDownload(id uuid.UUID, db *gorm.DB) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if job, exists := m.downloads[id]; exists {
		// Отменяем в торрент-клиенте (если доступен)
		if m.torrentClient != nil {
			if err := m.torrentClient.CancelDownload(job.TorrentID); err != nil {
				log.Printf("Failed to cancel torrent: %v", err)
			}
		}
		
		// Отменяем контекст
		if job.cancel != nil {
			job.cancel()
		}
		
		// Удаляем из активных загрузок
		delete(m.downloads, id)
		delete(m.progressChans, job.TorrentID)
		
		// Удаляем из БД
		return db.Delete(&models.Download{}, "id = ?", id).Error
	}
	
	// Если загрузка не активна, просто удаляем из БД
	return db.Delete(&models.Download{}, "id = ?", id).Error
}

func (m *Manager) worker(workerID int) {
	defer m.wg.Done()
	
	log.Printf("Download worker %d started", workerID)

	for {
		select {
		case download := <-m.queue:
			if download.Status == "paused" || download.Status == "cancelled" {
				continue
			}

			log.Printf("Worker %d processing download: %s", workerID, download.Game.Title)
			m.processDownload(download, workerID)

		case <-m.stopCh:
			log.Printf("Download worker %d stopped", workerID)
			return
		}
	}
}

func (m *Manager) processDownload(download *models.Download, workerID int) {
	if m.torrentClient == nil {
		log.Printf("Worker %d: Torrent client not available", workerID)
		download.Status = "failed"
		download.Error = "Torrent client not available"
		m.db.Save(download)
		return
	}

	// Создаем контекст для управления загрузкой
	ctx, cancel := context.WithCancel(context.Background())
	
	// Обновляем статус на "загрузка"
	download.Status = "downloading"
	now := time.Now()
	download.StartedAt = &now
	if err := m.db.Save(download).Error; err != nil {
		log.Printf("Worker %d: Failed to update download status: %v", workerID, err)
		return
	}

	// Запускаем торрент
	var torrentID string
	var progressChan chan torrent.ProgressUpdate
	var err error

	if download.MagnetURL != "" {
		torrentID, progressChan, err = m.torrentClient.AddMagnet(download.MagnetURL, m.cfg.TorrentConfig.DownloadDir)
	} else if download.TorrentURL != "" {
		torrentID, progressChan, err = m.torrentClient.AddTorrentURL(download.TorrentURL, m.cfg.TorrentConfig.DownloadDir)
	} else {
		log.Printf("Worker %d: No magnet URL or torrent URL provided", workerID)
		download.Status = "failed"
		download.Error = "No magnet URL or torrent URL provided"
		m.db.Save(download)
		return
	}

	if err != nil {
		log.Printf("Worker %d: Failed to start torrent: %v", workerID, err)
		download.Status = "failed"
		download.Error = err.Error()
		m.db.Save(download)
		return
	}

	// Создаем задачу загрузки
	job := &DownloadJob{
		Download:     download,
		TorrentID:    torrentID,
		ProgressChan: progressChan,
		ctx:          ctx,
		cancel:       cancel,
	}

	// Добавляем в активные загрузки
	m.mu.Lock()
	m.downloads[download.ID] = job
	m.progressChans[torrentID] = progressChan
	m.mu.Unlock()

	// Запускаем мониторинг в отдельной горутине
	go m.monitorDownloadProgress(job)

	log.Printf("Worker %d: Successfully started download: %s", workerID, download.Game.Title)
}

func (m *Manager) monitorDownloadProgress(job *DownloadJob) {
	// Добавляем защиту от panic
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic recovered in monitorDownloadProgress: %v", r)
		}
		
		// Очищаем ресурсы при завершении
		if job != nil && job.Download != nil {
			m.mu.Lock()
			delete(m.downloads, job.Download.ID)
			if job.TorrentID != "" {
				delete(m.progressChans, job.TorrentID)
			}
			m.mu.Unlock()
		}
	}()

	// Проверяем валидность job
	if job == nil || job.Download == nil {
		log.Printf("Invalid job in monitorDownloadProgress")
		return
	}

	for {
		select {
		case update, ok := <-job.ProgressChan:
			if !ok {
				// Канал закрыт - загрузка завершена или отменена
				log.Printf("Progress channel closed for download: %s", job.Download.Game.Title)
				return
			}

			// Защищаем от nil pointers
			if job.Download == nil {
				log.Printf("Download job became nil during monitoring")
				return
			}

			// Обновляем данные в БД
			job.Download.Progress = update.Progress
			job.Download.DownloadedBytes = update.Downloaded
			job.Download.TotalBytes = update.Size
			job.Download.DownloadSpeed = int64(update.DownloadRate)
			job.Download.UploadSpeed = int64(update.UploadRate)
			job.Download.Status = update.Status
			job.Download.ETA = update.ETA
			job.Download.PeersConnected = update.Peers
			job.Download.SeedsConnected = update.Seeds

			if update.Status == "completed" {
				completed := time.Now()
				job.Download.CompletedAt = &completed
				log.Printf("Download completed: %s", job.Download.Game.Title)
			}

			// Сохраняем в БД с обработкой ошибок
			if m.db != nil && job.Download != nil {
				if err := m.db.Save(job.Download).Error; err != nil {
					log.Printf("Failed to update download progress in DB: %v", err)
				}
			}

			// Отправляем обновление через WebSocket
			if m.wsHub != nil && job.Download != nil {
				// Создаём расширенное обновление с информацией об игре
				enhancedUpdate := update
				enhancedUpdate.ID = job.Download.ID.String()
				
				m.wsHub.BroadcastProgress(job.Download.UserID, enhancedUpdate)
				
				var gameTitle string
				if job.Download.Game.Title != "" {
					gameTitle = job.Download.Game.Title
				} else {
					gameTitle = "Unknown Game"
				}
				
				log.Printf("WebSocket progress sent for user %s: %.1f%% (%s)", 
					job.Download.UserID, update.Progress, gameTitle)
			}

		case <-job.ctx.Done():
			// Загрузка отменена
			var gameTitle string
			if job.Download != nil && job.Download.Game.Title != "" {
				gameTitle = job.Download.Game.Title
			} else {
				gameTitle = "Unknown Game"
			}
			log.Printf("Download monitoring stopped for: %s", gameTitle)
			return
		}
	}
}

func (m *Manager) globalStatusUpdater() {
	defer m.wg.Done()

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.updateGlobalStatus()
		case <-m.stopCh:
			return
		}
	}
}

func (m *Manager) updateGlobalStatus() {
	m.mu.RLock()
	activeDownloads := len(m.downloads)
	m.mu.RUnlock()

	if activeDownloads > 0 {
		log.Printf("Active downloads: %d", activeDownloads)
	}
	
	// Можно добавить дополнительную логику для глобального мониторинга
}

func (m *Manager) resumeDownloads() {
	log.Println("Resuming incomplete downloads...")
	
	var downloads []models.Download
	m.db.Preload("Game").Where("status IN ?", []string{"downloading", "queued"}).Find(&downloads)

	for _, download := range downloads {
		download.Status = "queued"
		m.db.Save(&download)

		select {
		case m.queue <- &download:
			log.Printf("Resumed download: %s", download.Game.Title)
		default:
			log.Printf("Download queue is full during resume, skipping: %s", download.Game.Title)
		}
	}
	
	log.Printf("Attempted to resume %d downloads", len(downloads))
}

// GetActiveDownloads возвращает список активных загрузок
func (m *Manager) GetActiveDownloads() map[uuid.UUID]*DownloadJob {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	// Возвращаем копию карты для безопасности
	downloads := make(map[uuid.UUID]*DownloadJob)
	for id, job := range m.downloads {
		downloads[id] = job
	}
	
	return downloads
}

// GetDownloadProgress возвращает текущий прогресс загрузки
func (m *Manager) GetDownloadProgress(id uuid.UUID) (*DownloadJob, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	job, exists := m.downloads[id]
	return job, exists
}
