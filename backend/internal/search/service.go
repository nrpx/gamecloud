package search

import (
	"context"
	"fmt"
	"gamecloud/internal/config"
	"gamecloud/internal/models"
	"gamecloud/internal/steamgrid"
	"net/url"
	"strings"
	"time"

	"gorm.io/gorm"
)

type GameSearchResult struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Genres      []string `json:"genres"`
	Developer   string   `json:"developer"`
	Publisher   string   `json:"publisher"`
	ReleaseYear string   `json:"release_year"`
	CoverURL    string   `json:"cover_url"`
	Rating      float64  `json:"rating"`
}

type TorrentSource struct {
	Name       string    `json:"name"`
	Size       string    `json:"size"`
	Seeds      int       `json:"seeds"`
	Peers      int       `json:"peers"`
	MagnetLink string    `json:"magnet_link"`
	Source     string    `json:"source"`
	UploadDate time.Time `json:"upload_date"`
}

type Service struct {
	db              *gorm.DB
	steamGridClient *steamgrid.Client
}

func NewSearchService(db *gorm.DB) *Service {
	cfg := config.Load()
	return &Service{
		db:              db,
		steamGridClient: steamgrid.NewClient(cfg.SteamGridDBKey),
	}
}

// SearchGames searches for games across multiple sources
func (s *Service) SearchGames(ctx context.Context, query string) ([]models.Game, error) {
	var results []models.Game

	// First search in the local database
	var dbGames []models.Game
	searchPattern := "%" + query + "%"
	if s.db != nil {
		if err := s.db.Where("title LIKE ? OR description LIKE ? OR genre LIKE ?", 
			searchPattern, searchPattern, searchPattern).Find(&dbGames).Error; err == nil {
			results = append(results, dbGames...)
		}
	}

	// Search via mock data for additional results
	mockResults := s.searchMockData(query)
	for _, mockResult := range mockResults {
		// Parse release date
		var releaseDate *time.Time
		if mockResult.ReleaseYear != "" {
			if parsed, err := time.Parse("2006", mockResult.ReleaseYear); err == nil {
				releaseDate = &parsed
			}
		}
		
		// Convert mock result to Game model
		game := models.Game{
			Title:       mockResult.Title,
			Description: mockResult.Description,
			Genre:       strings.Join(mockResult.Genres, ", "),
			Developer:   mockResult.Developer,
			Publisher:   mockResult.Publisher,
			ReleaseDate: releaseDate,
			CoverURL:    mockResult.CoverURL,
		}
		
		// Try to enhance with SteamGridDB covers
		if coverURL, err := s.steamGridClient.GetBestCover(mockResult.Title); err == nil && coverURL != "" {
			game.CoverURL = coverURL
		}
		
		results = append(results, game)
	}

	return results, nil
}

// EnhanceGameInfo enhances game information with SteamGridDB metadata
func (s *Service) EnhanceGameInfo(ctx context.Context, game *models.Game) (*models.Game, error) {
	if game.Title == "" {
		return game, nil
	}

	// Try to get cover from SteamGridDB
	if coverURL, err := s.steamGridClient.GetBestCover(game.Title); err == nil && coverURL != "" {
		game.CoverURL = coverURL
	}

	return game, nil
}

// GetTorrentSources returns mock torrent sources for a game
func (s *Service) GetTorrentSources(ctx context.Context, gameTitle string) ([]TorrentSource, error) {
	// Mock torrent sources - in production this would query real torrent trackers
	sources := []TorrentSource{
		{
			Name:        fmt.Sprintf("%s - Repack", gameTitle),
			Size:        "15.2 GB",
			Seeds:       42,
			Peers:       7,
			MagnetLink:  fmt.Sprintf("magnet:?xt=urn:btih:example123&dn=%s", url.QueryEscape(gameTitle)),
			Source:      "Mock Tracker",
			UploadDate:  time.Now().AddDate(0, 0, -5),
		},
		{
			Name:        fmt.Sprintf("%s - Complete Edition", gameTitle),
			Size:        "23.8 GB",
			Seeds:       156,
			Peers:       23,
			MagnetLink:  fmt.Sprintf("magnet:?xt=urn:btih:example456&dn=%s", url.QueryEscape(gameTitle+" Complete")),
			Source:      "Mock Tracker",
			UploadDate:  time.Now().AddDate(0, 0, -12),
		},
	}

	return sources, nil
}

// searchMockData provides mock search results for testing
func (s *Service) searchMockData(query string) []GameSearchResult {
	mockGames := []GameSearchResult{
		{
			Title:       "The Witcher 3: Wild Hunt",
			Description: "An action RPG in a fantasy world",
			Genres:      []string{"RPG", "Fantasy"},
			Developer:   "CD Projekt RED",
			Publisher:   "CD Projekt",
			ReleaseYear: "2015",
			Rating:      9.3,
		},
		{
			Title:       "Cyberpunk 2077",
			Description: "An open-world, action-adventure story set in Night City",
			Genres:      []string{"Action RPG", "Cyberpunk"},
			Developer:   "CD Projekt RED",
			Publisher:   "CD Projekt",
			ReleaseYear: "2020",
			Rating:      7.8,
		},
		{
			Title:       "Red Dead Redemption 2",
			Description: "An epic tale of life in America's unforgiving heartland",
			Genres:      []string{"Action", "Adventure", "Western"},
			Developer:   "Rockstar Games",
			Publisher:   "Rockstar Games",
			ReleaseYear: "2019",
			Rating:      9.7,
		},
		{
			Title:       "Grand Theft Auto V",
			Description: "An action-adventure game played from either a third-person or first-person perspective",
			Genres:      []string{"Action", "Adventure", "Crime"},
			Developer:   "Rockstar North",
			Publisher:   "Rockstar Games",
			ReleaseYear: "2015",
			Rating:      9.0,
		},
		{
			Title:       "Elden Ring",
			Description: "A fantasy action-RPG adventure set within a world created by Hidetaka Miyazaki and George R.R. Martin",
			Genres:      []string{"Action RPG", "Souls-like", "Fantasy"},
			Developer:   "FromSoftware",
			Publisher:   "Bandai Namco Entertainment",
			ReleaseYear: "2022",
			Rating:      9.5,
		},
	}

	// Filter results based on query
	var filteredResults []GameSearchResult
	queryLower := strings.ToLower(query)

	for _, game := range mockGames {
		if strings.Contains(strings.ToLower(game.Title), queryLower) ||
			strings.Contains(strings.ToLower(strings.Join(game.Genres, " ")), queryLower) ||
			strings.Contains(strings.ToLower(game.Developer), queryLower) {
			filteredResults = append(filteredResults, game)
		}
	}

	return filteredResults
}