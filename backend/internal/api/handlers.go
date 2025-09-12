package api

import (
	"gamecloud/internal/download"
	"gamecloud/internal/middleware"
	"gamecloud/internal/models"
	"gamecloud/internal/search"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Games handlers
func getGames(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _, _, ok := middleware.GetUserFromContext(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		var games []models.Game
		if err := db.Where("user_id = ?", userID).Find(&games).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, games)
	}
}

func getGame(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
			return
		}

		var game models.Game
		if err := db.First(&game, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, game)
	}
}

func createGame(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _, _, ok := middleware.GetUserFromContext(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		var game models.Game
		if err := c.ShouldBindJSON(&game); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Устанавливаем UserID из JWT токена
		game.UserID = userID

		// Use search service to enhance game info with SteamGridDB metadata
		searchService := search.NewSearchService(db)
		enhancedGame, err := searchService.EnhanceGameInfo(c.Request.Context(), &game)
		if err != nil {
			// Log the error but continue with the original game data
			// Enhancement is optional and shouldn't block game creation
			enhancedGame = &game
		}

		if err := db.Create(enhancedGame).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, *enhancedGame)
	}
}

func updateGame(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
			return
		}

		var game models.Game
		if err := db.First(&game, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := c.ShouldBindJSON(&game); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Save(&game).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, game)
	}
}

func deleteGame(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
			return
		}

		if err := db.Delete(&models.Game{}, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusNoContent, nil)
	}
}

// Library handlers
func getLibrary(db *gorm.DB, dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var games []models.Game
		if err := db.Find(&games).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Get all downloads to match with games
		downloads, err := dm.GetAllDownloads()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Create a map of downloads by game ID for quick lookup
		downloadsByGameID := make(map[string]interface{})
		for _, download := range downloads {
			downloadsByGameID[download.GameID.String()] = download
		}

		// Create library response with download information
		library := make([]map[string]interface{}, 0)
		for _, game := range games {
			gameData := map[string]interface{}{
				"id":          game.ID,
				"title":       game.Title,
				"description": game.Description,
				"genre":       game.Genre,
				"developer":   game.Developer,
				"publisher":   game.Publisher,
				"release_date": game.ReleaseDate,
				"cover_url":   game.CoverURL,
				"screenshots": game.Screenshots,
				"image_url":   game.ImageURL,
				"size":        game.Size,
				"status":      game.Status,
				"file_path":   game.FilePath,
				"torrent_url": game.TorrentURL,
				"created_at":  game.CreatedAt,
				"updated_at":  game.UpdatedAt,
			}

			// Add download information if available
			if download, exists := downloadsByGameID[game.ID.String()]; exists {
				gameData["download"] = download
			}

			library = append(library, gameData)
		}

		c.JSON(http.StatusOK, library)
	}
}

// Downloads handlers
func getDownloads(dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		downloads, err := dm.GetAllDownloads()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, downloads)
	}
}

func getDownload(dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid download ID"})
			return
		}

		download, err := dm.GetDownload(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Download not found"})
			return
		}

		c.JSON(http.StatusOK, download)
	}
}

func createDownload(db *gorm.DB, dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _, _, ok := middleware.GetUserFromContext(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		var download models.Download
		if err := c.ShouldBindJSON(&download); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		download.UserID = userID
		download.Status = "pending"
		download.Progress = 0.0

		if err := dm.AddDownload(&download); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, download)
	}
}

func pauseDownload(dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid download ID"})
			return
		}

		if err := dm.PauseDownload(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Download paused"})
	}
}

func resumeDownload(dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid download ID"})
			return
		}

		if err := dm.ResumeDownload(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Download resumed"})
	}
}

func cancelDownload(dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid download ID"})
			return
		}

		if err := dm.CancelDownload(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Download cancelled"})
	}
}

// Search handlers
func searchGames(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
			return
		}

		// Use the new search service for enhanced game search
		searchService := search.NewSearchService(db)
		games, err := searchService.SearchGames(c.Request.Context(), query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, games)
	}
}

// Get torrent sources for a game
func getTorrentSources(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		gameTitle := c.Query("title")
		if gameTitle == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'title' is required"})
			return
		}

		searchService := search.NewSearchService(db)
		sources, err := searchService.GetTorrentSources(c.Request.Context(), gameTitle)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"sources": sources})
	}
}

// Auth handlers (placeholder implementations)
func login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement JWT authentication
		c.JSON(http.StatusOK, gin.H{"message": "Login endpoint - not implemented yet"})
	}
}

func createDownloadFromTorrentFile(db *gorm.DB, dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем файл из формы
		file, err := c.FormFile("torrent")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No torrent file provided"})
			return
		}

		gameIDStr := c.PostForm("game_id")
		if gameIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Game ID is required"})
			return
		}

		gameID, err := uuid.Parse(gameIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID format"})
			return
		}

		// Открываем файл
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open torrent file"})
			return
		}
		defer src.Close()

		// Создаем download объект
		download := models.Download{
			GameID:    gameID,
			MagnetURL: "torrent:" + file.Filename, // Указываем, что это торрент файл
			Status:    "queued",
			Progress:  0.0,
		}

		// Добавляем в менеджер загрузок
		if err := dm.AddDownload(&download); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, download)
	}
}

func register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement user registration
		c.JSON(http.StatusOK, gin.H{"message": "Register endpoint - not implemented yet"})
	}
}

func logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement logout
		c.JSON(http.StatusOK, gin.H{"message": "Logout endpoint - not implemented yet"})
	}
}

// Statistics handler
func getStats(db *gorm.DB, dm *download.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _, _, ok := middleware.GetUserFromContext(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		// Получаем статистику игр
		var totalGames int64
		if err := db.Model(&models.Game{}).Where("user_id = ?", userID).Count(&totalGames).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count games"})
			return
		}

		// Получаем статистику загрузок
		var activeDownloads int64
		if err := db.Model(&models.Download{}).Where("user_id = ? AND status IN ?", userID, []string{"downloading", "pending"}).Count(&activeDownloads).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count active downloads"})
			return
		}

		var completedDownloads int64
		if err := db.Model(&models.Download{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&completedDownloads).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count completed downloads"})
			return
		}

		// Получаем общий размер загруженных данных
		var totalDownloadedSize int64
		if err := db.Model(&models.Download{}).
			Where("user_id = ? AND status = ?", userID, "completed").
			Select("COALESCE(SUM(downloaded_size), 0)").
			Scan(&totalDownloadedSize).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate downloaded size"})
			return
		}

		// Получаем общий размер отданных данных (upload)
		var totalUploadSize int64
		// Пока просто возвращаем 0, так как в модели нет поля для upload
		// TODO: Добавить поле uploaded_size в модель Download

		stats := gin.H{
			"total_games":            totalGames,
			"active_downloads":       activeDownloads,
			"completed_downloads":    completedDownloads,
			"total_downloaded_size":  totalDownloadedSize,
			"total_upload_size":      totalUploadSize,
		}

		c.JSON(http.StatusOK, stats)
	}
}
