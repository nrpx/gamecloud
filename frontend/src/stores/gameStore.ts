import { create } from 'zustand'
import axios from 'axios'
import { Game, CreateGame } from '@/types'

interface GameState {
  games: Game[]
  loading: boolean
  error: string | null
  fetchGames: () => Promise<void>
  addGame: (game: CreateGame) => Promise<Game>
  updateGame: (id: string, game: Partial<Game>) => Promise<void>
  deleteGame: (id: string) => Promise<void>
  searchGames: (query: string) => Promise<Game[]>
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  loading: false,
  error: null,

  fetchGames: async () => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get('/api/v1/games')
      set({ games: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch games', loading: false })
    }
  },

  addGame: async (game: CreateGame) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.post('/api/v1/games', game)
      const newGame = response.data
      set(state => ({
        games: [...state.games, newGame],
        loading: false
      }))
      return newGame
    } catch (error) {
      set({ error: 'Failed to add game', loading: false })
      throw error
    }
  },

  updateGame: async (id: string, game: Partial<Game>) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.put(`/api/v1/games/${id}`, game)
      const updatedGame = response.data
      set(state => ({
        games: state.games.map(g => g.id === id ? updatedGame : g),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to update game', loading: false })
    }
  },

  deleteGame: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await axios.delete(`/api/v1/games/${id}`)
      set(state => ({
        games: state.games.filter(g => g.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete game', loading: false })
    }
  },

  searchGames: async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/search/games?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Failed to search games:', error)
      return []
    }
  },
}))
