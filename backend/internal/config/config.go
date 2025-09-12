package config

import (
	"os"
)

type Config struct {
	Port           string
	DatabasePath   string
	TorrentConfig  TorrentConfig
	JWTSecret      string
	SteamGridDBKey string
}

type TorrentConfig struct {
	DownloadDir string
	MaxPeers    int
}

func Load() *Config {
	// Пытаемся получить JWT секрет из переменных окружения
	// Сначала проверяем JWT_SECRET, затем AUTH_SECRET для совместимости с фронтендом
	jwtSecret := getEnv("JWT_SECRET", "")
	if jwtSecret == "" {
		jwtSecret = getEnv("AUTH_SECRET", "your-secret-key")
	}

	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabasePath: getEnv("DATABASE_PATH", "./gamecloud.db"),
		TorrentConfig: TorrentConfig{
			DownloadDir: getEnv("DOWNLOAD_DIR", "./downloads"),
			MaxPeers:    50,
		},
		JWTSecret:      jwtSecret,
		SteamGridDBKey: getEnv("STEAMGRIDDB_API_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
