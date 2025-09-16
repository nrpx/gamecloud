// Типы для формы игры

export interface GameFormData {
  // Обязательные поля
  title: string
  genre: string
  
  // Необязательные поля
  description?: string
  developer?: string
  publisher?: string
  release_year?: number
  
  // SteamGridDB изображения
  grid_image_url?: string     // 460x215 grid изображение
  hero_image_url?: string     // 1920x620 hero изображение 
  logo_image_url?: string     // прозрачный логотип
  icon_image_url?: string     // иконка 32x32
  steamgriddb_id?: string     // ID игры в SteamGridDB
  
  // Торрент данные (один из вариантов)
  torrent_url?: string        // ссылка на торрент/магнет-ссылка
  torrent_file?: File | null  // файл торрента
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
  'Puzzle',
  'Horror',
  'Fighting',
  'Platform',
  'Arcade',
  'MMORPG',
  'Survival',
  'Battle Royale',
  'Card Game',
  'Visual Novel',
  'Educational',
  'Music',
  'Indie',
  'Casual'
] as const

export type GameGenre = typeof GAME_GENRES[number]

// Тип для режимов формы
export type GameFormMode = 'create' | 'edit'

// Пропы для компонента формы игры
export interface GameFormProps {
  mode: GameFormMode
  initialData?: Partial<GameFormData>
  onSubmit: (data: GameFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}