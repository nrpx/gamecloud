import { useState, useMemo } from 'react'
import { ViewMode } from '@/components/ui/ViewToggle'

interface GameDownload {
  id: string
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
  progress: number
  total_size: number
  downloaded_size: number
}

interface Game {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
  download?: GameDownload
}

export const useGameFilters = (games: Game[] | null) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'downloading' | 'completed' | 'seeding'>('all')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredGames = useMemo(() => {
    if (!games) return []

    return games.filter(game => {
      // Поиск по названию и жанру
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.genre.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false
      
      // Фильтр по жанру
      if (genreFilter !== 'all' && game.genre.toLowerCase() !== genreFilter) return false
      
      // Фильтр по статусу загрузки
      if (statusFilter === 'all') return true
      
      const download = game.download
      if (!download) return false
      
      switch (statusFilter) {
        case 'downloading':
          return ['downloading', 'pending'].includes(download.status)
        case 'completed':
          return download.status === 'completed'
        case 'seeding':
          return download.status === 'seeding'
        default:
          return true
      }
    })
  }, [games, searchTerm, genreFilter, statusFilter])

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    genreFilter,
    setGenreFilter,
    viewMode,
    setViewMode,
    filteredGames
  }
}