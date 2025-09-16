package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Game struct {
	ID               uuid.UUID  `json:"id" gorm:"type:uuid;primary_key"`
	UserID           string     `json:"user_id" gorm:"not null;index"`
	Title            string     `json:"title" gorm:"not null"`
	Description      string     `json:"description"`
	Genre            string     `json:"genre" gorm:"not null"`
	Developer        string     `json:"developer"`
	Publisher        string     `json:"publisher"`
	ReleaseYear      *int       `json:"release_year"`
	ReleaseDate      *time.Time `json:"release_date"`
	
	// SteamGridDB изображения
	GridImageURL     string     `json:"grid_image_url"`     // 460x215 grid изображение
	HeroImageURL     string     `json:"hero_image_url"`     // 1920x620 hero изображение 
	LogoImageURL     string     `json:"logo_image_url"`     // прозрачный логотип
	IconImageURL     string     `json:"icon_image_url"`     // иконка 32x32
	SteamGridDBID    string     `json:"steamgriddb_id"`     // ID игры в SteamGridDB
	
	// Устаревшие поля для обратной совместимости
	CoverURL         string     `json:"cover_url"`
	ImageURL         string     `json:"image_url"`
	Screenshots      []string   `json:"screenshots" gorm:"type:json"`
	
	// Торрент информация
	TorrentURL       string     `json:"torrent_url"`
	
	// Файловая информация
	Size             int64      `json:"size"` // Size in bytes
	Status           string     `json:"status"` // available, downloading, not_available
	FilePath         string     `json:"file_path"`
	
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (g *Game) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}

type Download struct {
	ID               uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	UserID           string    `json:"user_id" gorm:"not null;index"`
	GameID           uuid.UUID `json:"game_id" gorm:"type:uuid;not null"`
	Game             Game      `json:"game" gorm:"foreignKey:GameID;constraint:OnDelete:CASCADE"`
	TorrentURL       string    `json:"torrent_url"`
	MagnetURL        string    `json:"magnet_url"`
	TorrentID        string    `json:"torrent_id"` // ID от торрент-клиента
	Status           string    `json:"status"` // pending, downloading, completed, failed, paused, seeding
	Progress         float64   `json:"progress"` // 0.0 to 100.0
	DownloadSpeed    int64     `json:"download_speed"` // bytes per second
	UploadSpeed      int64     `json:"upload_speed"` // bytes per second
	TotalBytes       int64     `json:"total_bytes"` // total size in bytes
	DownloadedBytes  int64     `json:"downloaded_bytes"` // downloaded size in bytes
	PeersConnected   int       `json:"peers_connected"`
	SeedsConnected   int       `json:"seeds_connected"`
	ETA              int64     `json:"eta"` // seconds remaining
	InfoHash         string    `json:"info_hash"` // торрент info hash
	Error            string    `json:"error,omitempty"`
	StartedAt        *time.Time `json:"started_at,omitempty"`
	CompletedAt      *time.Time `json:"completed_at,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (d *Download) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

type User struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	Username  string    `json:"username" gorm:"unique;not null"`
	Email     string    `json:"email" gorm:"unique;not null"`
	Password  string    `json:"-" gorm:"not null"`
	Role      string    `json:"role" gorm:"default:user"` // admin, user
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type UserSettings struct {
	ID             uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	UserID         string    `json:"user_id" gorm:"unique;not null;index"`
	DownloadPath   string    `json:"download_path" gorm:"default:'/home/user/Downloads/Games'"`
	MaxDownloads   int       `json:"max_downloads" gorm:"default:3"`
	UploadLimit    int       `json:"upload_limit" gorm:"default:1000"` // KB/s, 0 = unlimited
	AutoStart      bool      `json:"auto_start" gorm:"default:true"`
	Notifications  bool      `json:"notifications" gorm:"default:true"`
	Theme          string    `json:"theme" gorm:"default:'system'"` // system, light, dark
	Language       string    `json:"language" gorm:"default:'ru'"` // ru, en
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (us *UserSettings) BeforeCreate(tx *gorm.DB) error {
	if us.ID == uuid.Nil {
		us.ID = uuid.New()
	}
	return nil
}
