// Типы для единой формы игры с react-hook-form

export interface GameFormData {
  // Обязательные поля
  title: string
  genre: string
  
  // Необязательные поля
  description?: string
  developer?: string
  releaseYear?: number
  steamgridId?: string
  
  // Изображения SteamGridDB
  images?: {
    grid?: string      // 460x215 или 920x430
    hero?: string      // 1920x620
    logo?: string      // PNG с прозрачностью
    icon?: string      // 32x32 или 64x64
  }
  
  // Торрент (один из вариантов)
  torrent?: {
    method: 'url' | 'file'
    url?: string        // Магнет-ссылка или URL торрента
    file?: FileList     // Торрент-файл
  }
}

// Список жанров (фиксированный)
export const GAME_GENRES = [
  'Action',
  'Adventure', 
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Shooter',
  'Fighting',
  'Puzzle',
  'Platformer',
  'Horror',
  'Survival',
  'MMORPG',
  'Indie',
  'Casual',
  'Educational',
  'Music',
  'Other'
] as const

export type GameGenre = typeof GAME_GENRES[number]

// Опции для select жанров
export const GENRE_OPTIONS = GAME_GENRES.map(genre => ({
  value: genre,
  label: genre
}))

// Типы для API (соответствие с backend)
export interface CreateGameRequest {
  title: string
  description?: string
  genre: string
  developer?: string
  release_year?: number
  steamgriddb_id?: string
  grid_image_url?: string
  hero_image_url?: string
  logo_image_url?: string
  icon_image_url?: string
  torrent_url?: string
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {
  id: string
}