package database

import (
	"gamecloud/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func Initialize(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&models.Game{},
		&models.Download{},
		&models.User{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
