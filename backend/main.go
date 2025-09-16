package main

import (
	"log"

	"gamecloud/internal/api"
	"gamecloud/internal/config"
	"gamecloud/internal/database"
	"gamecloud/internal/download"
	"gamecloud/internal/torrent"
	websocketPkg "gamecloud/internal/websocket"

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
	log.Println("Database initialized successfully")

	// Initialize torrent client
	log.Println("Initializing torrent client...")
	torrentClient, err := torrent.NewClient(&cfg.TorrentConfig)
	if err != nil {
		log.Fatal("Failed to initialize torrent client:", err)
	}
	log.Println("Torrent client initialized successfully")
	defer torrentClient.Close()

	// Initialize WebSocket hub
	wsHub := websocketPkg.NewHub(cfg.JWTSecret)
	go wsHub.Run()

	// Initialize download manager with torrent client
	downloadManager := download.NewManager(torrentClient, db, cfg)
	downloadManager.SetWebSocketHub(wsHub) // Подключаем WebSocket hub
	downloadManager.Start()
	defer downloadManager.Stop()

	// Setup API routes
	router := gin.Default()
	
	// Настройка безопасных прокси для устранения предупреждений
	router.SetTrustedProxies([]string{"127.0.0.1", "::1"}) // Доверяем только localhost
	
	api.SetupRoutes(router, db, downloadManager, cfg, wsHub)

	// Start server
	log.Printf("Starting server on port %s", cfg.Port)
	log.Fatal(router.Run(":" + cfg.Port))
}
