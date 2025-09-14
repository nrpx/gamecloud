package torrent

import (
	"context"
	"fmt"
	"gamecloud/internal/config"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/anacrolix/torrent/storage"
	"github.com/google/uuid"
)

type Client struct {
	client    *torrent.Client
	config    *config.TorrentConfig
	mu        sync.RWMutex
	downloads map[string]*DownloadJob
	stopCh    chan struct{}
}

type DownloadJob struct {
	ID       string
	Torrent  *torrent.Torrent
	Progress chan ProgressUpdate
	Done     chan struct{}
	Error    chan error
	ctx      context.Context
	cancel   context.CancelFunc
	mu       sync.RWMutex
}

type ProgressUpdate struct {
	ID           string    `json:"id"`
	InfoHash     string    `json:"info_hash"`
	Name         string    `json:"name"`
	Size         int64     `json:"size"`
	Downloaded   int64     `json:"downloaded"`
	DownloadRate float64   `json:"download_rate"`
	UploadRate   float64   `json:"upload_rate"`
	Progress     float64   `json:"progress"`
	Status       string    `json:"status"`
	ETA          int64     `json:"eta"`
	Peers        int       `json:"peers"`
	Seeds        int       `json:"seeds"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type TorrentInfo struct {
	InfoHash     string    `json:"info_hash"`
	Name         string    `json:"name"`
	Size         int64     `json:"size"`
	Downloaded   int64     `json:"downloaded"`
	DownloadRate int64     `json:"download_rate"`
	UploadRate   int64     `json:"upload_rate"`
	Progress     float64   `json:"progress"`
	Status       string    `json:"status"`
	MagnetLink   string    `json:"magnet_link"`
	DownloadDir  string    `json:"download_dir"`
	torrent      *torrent.Torrent
}

func NewClient(cfg *config.TorrentConfig) (*Client, error) {
	// Создаем конфигурацию для anacrolix/torrent
	clientConfig := torrent.NewDefaultClientConfig()
	
	// Настраиваем директорию загрузки
	if cfg.DownloadDir != "" {
		err := os.MkdirAll(cfg.DownloadDir, 0755)
		if err != nil {
			return nil, fmt.Errorf("failed to create download directory: %w", err)
		}
		// Используем правильный API для storage
		clientConfig.DefaultStorage = storage.NewFile(cfg.DownloadDir)
	}
	
	clientConfig.Seed = true
	clientConfig.Debug = false
	
	// Увеличиваем лимиты для лучшей производительности  
	clientConfig.MaxUnverifiedBytes = 64 << 20 // 64MB
	
	// Создаем клиент
	client, err := torrent.NewClient(clientConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create torrent client: %w", err)
	}

	return &Client{
		client:    client,
		config:    cfg,
		downloads: make(map[string]*DownloadJob),
		stopCh:    make(chan struct{}),
	}, nil
}

func (c *Client) Close() error {
	close(c.stopCh)
	
	// Отменяем все загрузки
	c.mu.Lock()
	for _, job := range c.downloads {
		job.cancel()
	}
	c.mu.Unlock()
	
	errs := c.client.Close()
	if len(errs) > 0 {
		return errs[0] // Возвращаем первую ошибку
	}
	return nil
}

func (c *Client) AddMagnet(magnetLink, downloadPath string) (string, chan ProgressUpdate, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Добавляем торрент по магнет-ссылке
	t, err := c.client.AddMagnet(magnetLink)
	if err != nil {
		return "", nil, fmt.Errorf("failed to add magnet link: %w", err)
	}

	// Создаем контекст для управления загрузкой
	ctx, cancel := context.WithCancel(context.Background())
	
	// Генерируем уникальный ID для загрузки
	downloadID := uuid.New().String()
	
	// Создаем задачу загрузки
	job := &DownloadJob{
		ID:       downloadID,
		Torrent:  t,
		Progress: make(chan ProgressUpdate, 100),
		Done:     make(chan struct{}),
		Error:    make(chan error, 1),
		ctx:      ctx,
		cancel:   cancel,
	}
	
	c.downloads[downloadID] = job
	
	// Запускаем горутину для обработки загрузки
	go c.processDownload(job, downloadPath)
	
	return downloadID, job.Progress, nil
}

func (c *Client) AddTorrentURL(torrentURL, downloadPath string) (string, chan ProgressUpdate, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Загружаем .torrent файл по URL
	resp, err := http.Get(torrentURL)
	if err != nil {
		return "", nil, fmt.Errorf("failed to download torrent file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("failed to download torrent file: HTTP %d", resp.StatusCode)
	}

	// Читаем metainfo из загруженного файла
	metaInfo, err := metainfo.Load(resp.Body)
	if err != nil {
		return "", nil, fmt.Errorf("failed to parse torrent file: %w", err)
	}

	// Добавляем торрент
	t, err := c.client.AddTorrent(metaInfo)
	if err != nil {
		return "", nil, fmt.Errorf("failed to add torrent: %w", err)
	}

	// Создаем контекст для управления загрузкой
	ctx, cancel := context.WithCancel(context.Background())
	
	// Генерируем уникальный ID для загрузки
	downloadID := uuid.New().String()
	
	// Создаем задачу загрузки
	job := &DownloadJob{
		ID:       downloadID,
		Torrent:  t,
		Progress: make(chan ProgressUpdate, 100),
		Done:     make(chan struct{}),
		Error:    make(chan error, 1),
		ctx:      ctx,
		cancel:   cancel,
	}
	
	c.downloads[downloadID] = job
	
	// Запускаем горутину для обработки загрузки
	go c.processDownload(job, downloadPath)
	
	return downloadID, job.Progress, nil
}

func (c *Client) AddTorrentFile(torrentFile io.Reader, downloadPath string) (string, chan ProgressUpdate, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Читаем metainfo из файла
	metaInfo, err := metainfo.Load(torrentFile)
	if err != nil {
		return "", nil, fmt.Errorf("failed to parse torrent file: %w", err)
	}

	// Добавляем торрент
	t, err := c.client.AddTorrent(metaInfo)
	if err != nil {
		return "", nil, fmt.Errorf("failed to add torrent: %w", err)
	}

	// Создаем контекст для управления загрузкой
	ctx, cancel := context.WithCancel(context.Background())
	
	// Генерируем уникальный ID для загрузки
	downloadID := uuid.New().String()
	
	// Создаем задачу загрузки
	job := &DownloadJob{
		ID:       downloadID,
		Torrent:  t,
		Progress: make(chan ProgressUpdate, 100),
		Done:     make(chan struct{}),
		Error:    make(chan error, 1),
		ctx:      ctx,
		cancel:   cancel,
	}
	
	c.downloads[downloadID] = job
	
	// Запускаем горутину для обработки загрузки
	go c.processDownload(job, downloadPath)
	
	return downloadID, job.Progress, nil
}

func (c *Client) processDownload(job *DownloadJob, downloadPath string) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic recovered in processDownload: %v", r)
		}
		
		// Безопасное закрытие каналов
		if job != nil {
			if job.Progress != nil {
				close(job.Progress)
			}
			if job.Done != nil {
				close(job.Done)
			}
			if job.Error != nil {
				close(job.Error)
			}
		}
		
		// Удаляем из карты активных загрузок
		if job != nil {
			c.mu.Lock()
			delete(c.downloads, job.ID)
			c.mu.Unlock()
		}
	}()

	if job == nil || job.Torrent == nil {
		log.Printf("Invalid job in processDownload")
		return
	}

	t := job.Torrent
	
	// Ждем получения информации о торренте
	select {
	case <-t.GotInfo():
		log.Printf("Got torrent info for: %s", t.Name())
	case <-time.After(60 * time.Second):
		if job.Error != nil {
			job.Error <- fmt.Errorf("timeout waiting for torrent info")
		}
		return
	case <-job.ctx.Done():
		log.Printf("Download cancelled before getting torrent info")
		return
	}

	// Запускаем загрузку всех файлов
	t.DownloadAll()

	// Мониторинг прогресса в отдельной горутине
	go c.monitorProgress(job)

	// Ждем завершения загрузки
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			// Проверяем, завершена ли загрузка
			if t.BytesCompleted() >= t.Length() {
				log.Printf("Download completed: %s", t.Name())
				
				// Отправляем финальный статус
				finalUpdate := ProgressUpdate{
					ID:           job.ID,
					InfoHash:     t.InfoHash().String(),
					Name:         t.Name(),
					Size:         t.Length(),
					Downloaded:   t.BytesCompleted(),
					Progress:     100.0,
					Status:       "completed",
					UpdatedAt:    time.Now(),
				}
				
				if job.Progress != nil {
					select {
					case job.Progress <- finalUpdate:
					case <-job.ctx.Done():
					}
				}
				return
			}
		case <-job.ctx.Done():
			log.Printf("Download cancelled: %s", t.Name())
			return
		}
	}
}

func (c *Client) monitorProgress(job *DownloadJob) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic recovered in monitorProgress: %v", r)
		}
	}()

	if job == nil || job.Torrent == nil {
		log.Printf("Invalid job in monitorProgress")
		return
	}

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	var lastDownloaded int64
	var lastUpdate time.Time = time.Now()

	for {
		select {
		case <-ticker.C:
			t := job.Torrent
			
			if t == nil || t.Info() == nil {
				continue
			}

			stats := t.Stats()
			now := time.Now()
			downloaded := t.BytesCompleted()
			
			// Вычисляем скорость скачивания
			var downloadRate float64
			if !lastUpdate.IsZero() {
				timeDiff := now.Sub(lastUpdate).Seconds()
				if timeDiff > 0 {
					downloadRate = float64(downloaded-lastDownloaded) / timeDiff
				}
			}
			
			// Вычисляем ETA
			var eta int64
			if downloadRate > 0 {
				remaining := t.Length() - downloaded
				eta = int64(float64(remaining) / downloadRate)
			}

			progress := float64(downloaded) / float64(t.Length()) * 100
			
			update := ProgressUpdate{
				ID:           job.ID,
				InfoHash:     t.InfoHash().String(),
				Name:         t.Name(),
				Size:         t.Length(),
				Downloaded:   downloaded,
				DownloadRate: downloadRate,
				UploadRate:   float64(stats.ConnStats.BytesWrittenData.Int64()),
				Progress:     progress,
				Status:       getStatus(t),
				ETA:          eta,
				Peers:        stats.ActivePeers,
				Seeds:        stats.ConnectedSeeders,
				UpdatedAt:    now,
			}

			if job.Progress != nil {
				select {
				case job.Progress <- update:
				case <-job.ctx.Done():
					return
				default:
					// Канал заполнен, пропускаем обновление
				}
			}

			lastDownloaded = downloaded
			lastUpdate = now

		case <-job.ctx.Done():
			return
		}
	}
}

func (c *Client) CancelDownload(downloadID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if job, exists := c.downloads[downloadID]; exists {
		job.cancel()
		job.Torrent.Drop()
		return nil
	}
	
	return fmt.Errorf("download not found: %s", downloadID)
}

func (c *Client) PauseDownload(downloadID string) error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if job, exists := c.downloads[downloadID]; exists {
		// Для библиотеки anacrolix/torrent паузу можно реализовать 
		// через отключение всех соединений
		job.Torrent.CancelPieces(0, job.Torrent.NumPieces())
		return nil
	}
	
	return fmt.Errorf("download not found: %s", downloadID)
}

func (c *Client) ResumeDownload(downloadID string) error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if job, exists := c.downloads[downloadID]; exists {
		// Возобновляем загрузку всех файлов
		job.Torrent.DownloadAll()
		return nil
	}
	
	return fmt.Errorf("download not found: %s", downloadID)
}

func (c *Client) GetTorrents() ([]*TorrentInfo, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	torrents := c.client.Torrents()
	infos := make([]*TorrentInfo, 0, len(torrents))

	for _, t := range torrents {
		if t.Info() != nil {
			stats := t.Stats()
			
			info := &TorrentInfo{
				InfoHash:     t.InfoHash().String(),
				Name:         t.Name(),
				Size:         t.Length(),
				Downloaded:   t.BytesCompleted(),
				DownloadRate: stats.ConnStats.BytesReadData.Int64(),
				UploadRate:   stats.ConnStats.BytesWrittenData.Int64(),
				Progress:     float64(t.BytesCompleted()) / float64(t.Length()) * 100,
				Status:       getStatus(t),
				DownloadDir:  c.config.DownloadDir,
				torrent:      t,
			}
			
			infos = append(infos, info)
		}
	}

	return infos, nil
}

func (c *Client) GetActiveDownloads() map[string]*DownloadJob {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	// Возвращаем копию карты для безопасности
	downloads := make(map[string]*DownloadJob)
	for id, job := range c.downloads {
		downloads[id] = job
	}
	
	return downloads
}

func getStatus(t *torrent.Torrent) string {
	if t.BytesCompleted() == t.Length() {
		return "completed"
	}
	
	if t.BytesCompleted() > 0 {
		return "downloading"
	}
	
	return "waiting"
}
