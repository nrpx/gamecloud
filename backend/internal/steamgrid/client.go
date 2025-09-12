package steamgrid

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

const (
	BaseURL = "https://www.steamgriddb.com/api/v2"
)

type Client struct {
	apiKey     string
	httpClient *http.Client
}

type Game struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Types       []int  `json:"types"`
	Verified    bool   `json:"verified"`
	ReleaseDate int64  `json:"release_date"`
}

type Grid struct {
	ID       int    `json:"id"`
	Score    int    `json:"score"`
	Style    string `json:"style"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
	NSFW     bool   `json:"nsfw"`
	Humor    bool   `json:"humor"`
	Epilepsy bool   `json:"epilepsy"`
	Untagged bool   `json:"untagged"`
	URL      string `json:"url"`
	Thumb    string `json:"thumb"`
	Tags     []string `json:"tags"`
	Author   Author `json:"author"`
}

type Author struct {
	Name    string `json:"name"`
	Steam64 string `json:"steam64"`
	Avatar  string `json:"avatar"`
}

type SearchResponse struct {
	Success bool   `json:"success"`
	Data    []Game `json:"data"`
}

type GridResponse struct {
	Success bool   `json:"success"`
	Data    []Grid `json:"data"`
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) makeRequest(endpoint string) (*http.Response, error) {
	req, err := http.NewRequest("GET", BaseURL+endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	return resp, nil
}

func (c *Client) SearchGames(query string) ([]Game, error) {
	encodedQuery := url.QueryEscape(query)
	endpoint := fmt.Sprintf("/search/autocomplete/%s", encodedQuery)

	resp, err := c.makeRequest(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var searchResp SearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !searchResp.Success {
		return nil, fmt.Errorf("API request was not successful")
	}

	return searchResp.Data, nil
}

func (c *Client) GetGameGrids(gameID int, dimensions string) ([]Grid, error) {
	endpoint := fmt.Sprintf("/grids/game/%d", gameID)
	
	// Add dimensions parameter if specified
	if dimensions != "" {
		endpoint += "?dimensions=" + dimensions
	}

	resp, err := c.makeRequest(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var gridResp GridResponse
	if err := json.NewDecoder(resp.Body).Decode(&gridResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !gridResp.Success {
		return nil, fmt.Errorf("API request was not successful")
	}

	return gridResp.Data, nil
}

func (c *Client) GetGameHeroes(gameID int) ([]Grid, error) {
	endpoint := fmt.Sprintf("/heroes/game/%d", gameID)

	resp, err := c.makeRequest(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var gridResp GridResponse
	if err := json.NewDecoder(resp.Body).Decode(&gridResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !gridResp.Success {
		return nil, fmt.Errorf("API request was not successful")
	}

	return gridResp.Data, nil
}

func (c *Client) GetGameLogos(gameID int) ([]Grid, error) {
	endpoint := fmt.Sprintf("/logos/game/%d", gameID)

	resp, err := c.makeRequest(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var gridResp GridResponse
	if err := json.NewDecoder(resp.Body).Decode(&gridResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !gridResp.Success {
		return nil, fmt.Errorf("API request was not successful")
	}

	return gridResp.Data, nil
}

// GetBestCover returns the best cover image for a game
func (c *Client) GetBestCover(gameTitle string) (string, error) {
	// Search for the game
	games, err := c.SearchGames(gameTitle)
	if err != nil {
		return "", err
	}

	if len(games) == 0 {
		return "", fmt.Errorf("no games found for title: %s", gameTitle)
	}

	// Use the first (most relevant) game
	game := games[0]

	// Try to get grids (cover images)
	grids, err := c.GetGameGrids(game.ID, "600x900")
	if err != nil {
		return "", err
	}

	if len(grids) == 0 {
		// Try getting any available grids
		grids, err = c.GetGameGrids(game.ID, "")
		if err != nil {
			return "", err
		}
	}

	if len(grids) == 0 {
		return "", fmt.Errorf("no cover images found for game: %s", gameTitle)
	}

	// Return the highest scored grid
	bestGrid := grids[0]
	for _, grid := range grids {
		if grid.Score > bestGrid.Score {
			bestGrid = grid
		}
	}

	return bestGrid.URL, nil
}
