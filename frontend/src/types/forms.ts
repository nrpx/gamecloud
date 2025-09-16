/**
 * Типы данных для форм игр
 */

export interface GameFormData {
  title: string
  description: string
  genre: string
  imageUrl: string
}

export interface TorrentFormData {
  method: 'url' | 'file'
  url: string
  file: FileList | null
}

export interface CompleteGameFormData extends GameFormData {
  torrent: TorrentFormData
}

// Опции жанров для select
export const GAME_GENRES = [
  { value: 'action', label: 'Экшн' },
  { value: 'adventure', label: 'Приключения' },
  { value: 'rpg', label: 'RPG' },
  { value: 'strategy', label: 'Стратегия' },
  { value: 'simulation', label: 'Симулятор' },
  { value: 'sports', label: 'Спорт' },
  { value: 'racing', label: 'Гонки' },
  { value: 'shooter', label: 'Шутер' },
  { value: 'puzzle', label: 'Головоломка' },
  { value: 'arcade', label: 'Аркада' },
  { value: 'indie', label: 'Инди' },
  { value: 'mmo', label: 'MMO' },
  { value: 'other', label: 'Другое' },
]

// Методы загрузки торрента
export const TORRENT_METHODS = [
  { value: 'url', label: 'URL ссылка' },
  { value: 'file', label: 'Файл .torrent' },
]