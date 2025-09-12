package torrent

import (
	"fmt"
	"gamecloud/internal/config"
	"sync"
	"time"

	"github.com/anacrolix/torrent"
)

type Client struct {
	client *torrent.Client
	config *config.TorrentConfig
	mu     sync.RWMutex
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
	clientConfig.DataDir = cfg.DownloadDir
	clientConfig.Seed = true
	clientConfig.Debug = false
	
	// Создаем клиент
	client, err := torrent.NewClient(clientConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create torrent client: %w", err)
	}

	return &Client{
		client: client,
		config: cfg,
	}, nil
}

func (c *Client) Close() error {
	errs := c.client.Close()
	if len(errs) > 0 {
		return errs[0] // Возвращаем первую ошибку
	}
	return nil
}

func (c *Client) AddMagnet(magnetLink, downloadPath string) (*TorrentInfo, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Добавляем торрент по магнет-ссылке
	t, err := c.client.AddMagnet(magnetLink)
	if err != nil {
		return nil, fmt.Errorf("failed to add magnet link: %w", err)
	}

	// Ждем получения информации о торренте
	select {
	case <-t.GotInfo():
	case <-time.After(30 * time.Second):
		return nil, fmt.Errorf("timeout waiting for torrent info")
	}

	// Запускаем загрузку всех файлов
	t.DownloadAll()

	stats := t.Stats()
	
	return &TorrentInfo{
		InfoHash:     t.InfoHash().String(),
		Name:         t.Name(),
		Size:         t.Length(),
		Downloaded:   t.BytesCompleted(),
		DownloadRate: stats.ConnStats.BytesReadData.Int64(),
		UploadRate:   stats.ConnStats.BytesWrittenData.Int64(),
		Progress:     float64(t.BytesCompleted()) / float64(t.Length()) * 100,
		Status:       getStatus(t),
		MagnetLink:   magnetLink,
		DownloadDir:  c.config.DownloadDir,
		torrent:      t,
	}, nil
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

func getStatus(t *torrent.Torrent) string {
	if t.BytesCompleted() == t.Length() {
		return "completed"
	}
	
	if t.BytesCompleted() > 0 {
		return "downloading"
	}
	
	return "waiting"
}
