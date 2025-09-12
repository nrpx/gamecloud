package download

import (
	"gamecloud/internal/config"
	"gamecloud/internal/models"
	"gamecloud/internal/torrent"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Manager struct {
	torrentClient *torrent.Client
	db            *gorm.DB
	cfg           *config.Config
	downloads     map[uuid.UUID]*DownloadJob
	queue         chan *models.Download
	workers       int
	stopCh        chan struct{}
	wg            sync.WaitGroup
	mu            sync.RWMutex
}

type DownloadJob struct {
	Download *models.Download
	Torrent  interface{} // *torrent.Torrent
	mu       sync.RWMutex
}

func NewManager(torrentClient *torrent.Client, db *gorm.DB, cfg *config.Config) *Manager {
	return &Manager{
		torrentClient: torrentClient,
		db:            db,
		cfg:           cfg,
		downloads:     make(map[uuid.UUID]*DownloadJob),
		queue:         make(chan *models.Download, 100),
		workers:       3,
		stopCh:        make(chan struct{}),
	}
}

func (m *Manager) Start() {
	log.Println("Starting download manager")
	
	// Start workers
	for i := 0; i < m.workers; i++ {
		m.wg.Add(1)
		go m.worker()
	}

	// Start status updater
	m.wg.Add(1)
	go m.statusUpdater()

	// Resume incomplete downloads
	go m.resumeDownloads()
}

func (m *Manager) Stop() {
	log.Println("Stopping download manager")
	close(m.stopCh)
	m.wg.Wait()
}

func (m *Manager) AddDownload(download *models.Download) error {
	// Save to database
	if err := m.db.Create(download).Error; err != nil {
		return err
	}

	// Add to queue
	select {
	case m.queue <- download:
		log.Printf("Added download to queue: %s", download.Game.Title)
	default:
		log.Printf("Download queue is full, download will be processed later: %s", download.Game.Title)
	}

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
	m.mu.Lock()
	defer m.mu.Unlock()

	if job, exists := m.downloads[id]; exists {
		job.Download.Status = "paused"
		return m.db.Save(job.Download).Error
	}
	return nil
}

func (m *Manager) ResumeDownload(id uuid.UUID) error {
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
	default:
		log.Printf("Download queue is full")
	}

	return nil
}

func (m *Manager) CancelDownload(id uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if job, exists := m.downloads[id]; exists {
		job.Download.Status = "cancelled"
		delete(m.downloads, id)
		return m.db.Save(job.Download).Error
	}
	return nil
}

func (m *Manager) worker() {
	defer m.wg.Done()

	for {
		select {
		case download := <-m.queue:
			if download.Status == "paused" || download.Status == "cancelled" {
				continue
			}

			log.Printf("Starting download: %s", download.Game.Title)
			m.processDownload(download)

		case <-m.stopCh:
			return
		}
	}
}

func (m *Manager) processDownload(download *models.Download) {
	m.mu.Lock()
	job := &DownloadJob{Download: download}
	m.downloads[download.ID] = job
	m.mu.Unlock()

	// Update status to downloading
	download.Status = "downloading"
	now := time.Now()
	download.StartedAt = &now
	m.db.Save(download)

	// Start torrent download
	var err error
	if download.MagnetURL != "" {
		job.Torrent, err = m.torrentClient.AddMagnet(download.MagnetURL, m.cfg.TorrentConfig.DownloadDir)
	} else {
		// Handle torrent file download
		log.Printf("Torrent file downloads not implemented yet")
		err = nil
	}

	if err != nil {
		download.Status = "failed"
		download.Error = err.Error()
		m.db.Save(download)
		
		m.mu.Lock()
		delete(m.downloads, download.ID)
		m.mu.Unlock()
		return
	}

	log.Printf("Download started successfully: %s", download.Game.Title)
}

func (m *Manager) statusUpdater() {
	defer m.wg.Done()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.updateDownloadStatuses()
		case <-m.stopCh:
			return
		}
	}
}

func (m *Manager) updateDownloadStatuses() {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, job := range m.downloads {
		if job.Download.Status == "downloading" && job.Torrent != nil {
			// Update progress, speed, etc.
			// This would need to interface with the actual torrent library
			// For now, we'll just update the database
			m.db.Save(job.Download)
		}
	}
}

func (m *Manager) resumeDownloads() {
	var downloads []models.Download
	m.db.Preload("Game").Where("status IN ?", []string{"downloading", "queued"}).Find(&downloads)

	for _, download := range downloads {
		download.Status = "queued"
		m.db.Save(&download)

		select {
		case m.queue <- &download:
		default:
			log.Printf("Download queue is full during resume")
		}
	}
}
