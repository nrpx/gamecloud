export interface Game {
  id: string
  title: string
  description?: string
  genre?: string
  developer?: string
  publisher?: string
  release_date?: string
  cover_url?: string
  screenshots?: string[]
  size?: number
  status: 'available' | 'downloading' | 'not_available'
  file_path?: string
  created_at?: string
  updated_at?: string
}

export interface CreateGame {
  title: string
  description?: string
  genre?: string
  developer?: string
  publisher?: string
  release_date?: string
  cover_url?: string
  screenshots?: string[]
  size?: number
  status: 'available' | 'downloading' | 'not_available'
  file_path?: string
}

export interface Download {
  id: string
  user_id: string
  game_id: string
  game?: Game
  torrent_url?: string
  magnet_url?: string
  torrent_id?: string
  status: 'pending' | 'queued' | 'downloading' | 'completed' | 'failed' | 'paused' | 'seeding' | 'error'
  progress: number
  download_speed?: number
  upload_speed?: number
  total_bytes?: number
  downloaded_bytes?: number
  peers_connected?: number
  seeds_connected?: number
  eta?: number
  info_hash?: string
  error?: string
  started_at?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  created_at?: string
  updated_at?: string
}
