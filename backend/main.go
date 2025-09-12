package main

import (
	"log"

	"gamecloud/internal/api"
	"gamecloud/internal/config"
	"gamecloud/internal/database"
	"gamecloud/internal/download"
	"gamecloud/internal/torrent"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabasePath)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize torrent client
	torrentClient, err := torrent.NewClient(&cfg.TorrentConfig)
	if err != nil {
		log.Fatal("Failed to initialize torrent client:", err)
	}
	defer torrentClient.Close()

	// Initialize download manager
	downloadManager := download.NewManager(torrentClient, db, cfg)
	downloadManager.Start()
	defer downloadManager.Stop()

	// Setup API routes
	router := gin.Default()
	api.SetupRoutes(router, db, downloadManager, cfg)

	// Start server
	log.Printf("Starting server on port %s", cfg.Port)
	log.Fatal(router.Run(":" + cfg.Port))
}
