// API клиент для взаимодействия с Golang backend

import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Типы данных
export interface Game {
  id: string
  title: string
  description?: string
  genre: string
  developer?: string
  publisher?: string
  release_year?: number
  release_date?: string
  
  // SteamGridDB изображения
  grid_image_url?: string     // 460x215 grid изображение
  hero_image_url?: string     // 1920x620 hero изображение 
  logo_image_url?: string     // прозрачный логотип
  icon_image_url?: string     // иконка 32x32
  steamgriddb_id?: string     // ID игры в SteamGridDB
  
  // Устаревшие поля для обратной совместимости
  image_url?: string
  cover_url?: string
  
  // Торрент информация
  torrent_url: string
  magnet_link?: string
  file_size?: number
  
  created_at: string
  updated_at: string
}

export interface Download {
  id: string
  game_id: string
  user_id: string
  torrent_url: string
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
  progress: number
  download_speed: number
  upload_speed: number
  total_size: number
  downloaded_size: number
  peers_connected: number
  seeds_connected: number
  eta?: number
  created_at: string
  updated_at: string
}

export interface GameWithDownload extends Game {
  download?: Download
}

export interface SearchResult {
  title: string
  description: string
  genre?: string
  size?: string
  torrent_url: string
  magnet_link?: string
  image_url?: string
  source: string
}

export interface Statistics {
  total_games: number
  active_downloads: number
  completed_downloads: number
  total_downloaded_size: number
  total_upload_size: number
}

export interface UserSettings {
  id: string
  user_id: string
  download_path: string
  max_downloads: number
  upload_limit: number
  auto_start: boolean
  notifications: boolean
  theme: 'system' | 'light' | 'dark'
  language: 'ru' | 'en'
  created_at: string
  updated_at: string
}

// Получение JWT токена из сессии
async function getAuthToken(): Promise<string | null> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Пользователь не авторизован')
  }
  
  // Получаем JWT токен для backend
  const tokenResponse = await fetch('/api/token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!tokenResponse.ok) {
    throw new Error('Ошибка получения токена авторизации')
  }

  const { token } = await tokenResponse.json()
  return token
}

// Базовая функция для API запросов
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

// API функции для игр
export const gamesApi = {
  // Получить все игры
  getAll: (): Promise<Game[]> =>
    apiRequest<Game[]>('/api/v1/games'),

  // Получить игру по ID
  getById: (id: string): Promise<Game> =>
    apiRequest<Game>(`/api/v1/games/${id}`),

  // Создать новую игру
  create: (gameData: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<Game> =>
    apiRequest<Game>('/api/v1/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    }),

  // Обновить игру
  update: (id: string, gameData: Partial<Game>): Promise<Game> =>
    apiRequest<Game>(`/api/v1/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    }),

  // Удалить игру
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/api/v1/games/${id}`, {
      method: 'DELETE',
    }),
}

// API функции для загрузок
export const downloadsApi = {
  // Получить все загрузки
  getAll: (): Promise<Download[]> =>
    apiRequest<Download[]>('/api/v1/downloads'),

  // Получить загрузку по ID
  getById: (id: string): Promise<Download> =>
    apiRequest<Download>(`/api/v1/downloads/${id}`),

  // Создать новую загрузку
  create: (downloadData: { game_id: string; torrent_url: string }): Promise<Download> =>
    apiRequest<Download>('/api/v1/downloads', {
      method: 'POST',
      body: JSON.stringify(downloadData),
    }),

  // Создать загрузку из торрент файла
  createFromFile: async (gameId: string, torrentFile: File): Promise<Download> => {
    const token = await getAuthToken()
    const formData = new FormData()
    formData.append('game_id', gameId)
    formData.append('torrent_file', torrentFile)
    
    const response = await fetch(`${API_BASE_URL}/api/v1/downloads/torrent`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  },

  // Приостановить загрузку
  pause: (id: string): Promise<Download> =>
    apiRequest<Download>(`/api/v1/downloads/${id}/pause`, {
      method: 'PUT',
    }),

  // Возобновить загрузку
  resume: (id: string): Promise<Download> =>
    apiRequest<Download>(`/api/v1/downloads/${id}/resume`, {
      method: 'PUT',
    }),

  // Отменить загрузку
  cancel: (id: string): Promise<void> =>
    apiRequest<void>(`/api/v1/downloads/${id}`, {
      method: 'DELETE',
    }),
}

// API функции для поиска
export const searchApi = {
  // Поиск игр в базе данных
  searchGames: (query: string): Promise<Game[]> =>
    apiRequest<Game[]>(`/api/v1/search/games?q=${encodeURIComponent(query)}`),

  // Получить источники торрентов
  getTorrentSources: (): Promise<string[]> =>
    apiRequest<string[]>('/api/v1/search/torrents'),

  // Поиск торрентов (будет реализован позже)
  searchTorrents: (query: string, source?: string): Promise<SearchResult[]> => {
    const params = new URLSearchParams({ q: query })
    if (source) params.append('source', source)
    
    return apiRequest<SearchResult[]>(`/api/v1/search/torrents?${params.toString()}`)
  },
}

// API функции для статистики
export const statsApi = {
  // Получить статистику пользователя
  getUserStats: (): Promise<Statistics> =>
    apiRequest<Statistics>('/api/v1/stats'),
}

// API функции для настроек
export const settingsApi = {
  // Получить настройки пользователя
  getSettings: (): Promise<UserSettings> =>
    apiRequest<UserSettings>('/api/v1/settings'),
  
  // Обновить настройки пользователя
  updateSettings: (settings: Partial<UserSettings>): Promise<UserSettings> =>
    apiRequest<UserSettings>('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
}

// Комбинированные функции
export const libraryApi = {
  // Получить библиотеку игр с информацией о загрузках
  getLibraryWithDownloads: async (): Promise<GameWithDownload[]> => {
    const [games, downloads] = await Promise.all([
      gamesApi.getAll(),
      downloadsApi.getAll(),
    ])

    return games.map(game => {
      const download = downloads.find(d => d.game_id === game.id)
      return { ...game, download }
    })
  },
}

// Функции-помощники
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s'
}

export const formatETA = (seconds: number): string => {
  if (seconds === 0) return 'Неизвестно'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  } else if (minutes > 0) {
    return `${minutes}м`
  } else {
    return '<1м'
  }
}
