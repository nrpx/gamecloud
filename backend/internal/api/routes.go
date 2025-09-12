package api

import (
	"gamecloud/internal/config"
	"gamecloud/internal/download"
	"gamecloud/internal/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, downloadManager *download.Manager, cfg *config.Config) {
	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes with JWT authentication
	api := router.Group("/api/v1")
	api.Use(middleware.JWTAuthMiddleware(cfg.JWTSecret))
	{
		// Games routes
		games := api.Group("/games")
		{
			games.GET("", getGames(db))
			games.GET("/:id", getGame(db))
			games.POST("", createGame(db))
			games.PUT("/:id", updateGame(db))
			games.DELETE("/:id", deleteGame(db))
		}

		// Library route (games with download info)
		api.GET("/library", getLibrary(db, downloadManager))

		// Downloads routes
		downloads := api.Group("/downloads")
		{
			downloads.GET("", getDownloads(downloadManager))
			downloads.GET("/:id", getDownload(downloadManager))
			downloads.POST("", createDownload(db, downloadManager))
			downloads.POST("/torrent", createDownloadFromTorrentFile(db, downloadManager))
			downloads.PUT("/:id/pause", pauseDownload(downloadManager))
			downloads.PUT("/:id/resume", resumeDownload(downloadManager))
			downloads.DELETE("/:id", cancelDownload(downloadManager))
		}

		// Search routes
		search := api.Group("/search")
		{
			search.GET("/games", searchGames(db))
			search.GET("/torrents", getTorrentSources(db))
		}

		// Statistics route
		api.GET("/stats", getStats(db, downloadManager))
	}

	// Public auth routes (no JWT required)
	auth := router.Group("/api/v1/auth")
	{
		auth.POST("/login", login(db))
		auth.POST("/register", register(db))
		auth.POST("/logout", logout())
	}
}
