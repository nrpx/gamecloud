package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Game struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	UserID      string    `json:"user_id" gorm:"not null;index"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Genre       string    `json:"genre"`
	Developer   string    `json:"developer"`
	Publisher   string    `json:"publisher"`
	ReleaseDate *time.Time `json:"release_date"`
	CoverURL    string    `json:"cover_url"`
	Screenshots []string  `json:"screenshots" gorm:"type:json"`
	Size        int64     `json:"size"` // Size in bytes
	Status      string    `json:"status"` // available, downloading, not_available
	FilePath    string    `json:"file_path"`
	TorrentURL  string    `json:"torrent_url"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
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
	Game             Game      `json:"game" gorm:"foreignKey:GameID"`
	TorrentURL       string    `json:"torrent_url"`
	MagnetURL        string    `json:"magnet_url"`
	Status           string    `json:"status"` // pending, downloading, completed, failed, paused, seeding
	Progress         float64   `json:"progress"` // 0.0 to 100.0
	DownloadSpeed    int64     `json:"download_speed"` // bytes per second
	UploadSpeed      int64     `json:"upload_speed"` // bytes per second
	TotalSize        int64     `json:"total_size"` // total size in bytes
	DownloadedSize   int64     `json:"downloaded_size"` // downloaded size in bytes
	PeersConnected   int       `json:"peers_connected"`
	SeedsConnected   int       `json:"seeds_connected"`
	ETA              int64     `json:"eta"` // seconds
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
