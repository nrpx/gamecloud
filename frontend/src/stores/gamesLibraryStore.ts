import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'

// Типы для игр с загрузками
interface GameDownload {
  id: string
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
  progress: number
  total_size: number
  downloaded_size: number
}

interface GameWithDownload {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
  download?: GameDownload
  created_at: string
}

interface GamesLibraryState {
  // Данные
  games: GameWithDownload[]
  
  // Состояния загрузки
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Кэширование
  lastFetched: number | null
  cacheTimeout: number // в миллисекундах (2 минуты)
  
  // Действия
  fetchGames: () => Promise<void>
  refreshGames: () => Promise<void>
  pauseGameDownload: (gameId: string) => Promise<void>
  resumeGameDownload: (gameId: string) => Promise<void>
  cancelGameDownload: (gameId: string) => Promise<void>
  clearGames: () => void
  setError: (error: string | null) => void
}

// Функция для получения токена из API роута
async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/token')
    if (!response.ok) {
      throw new Error('Failed to get auth token')
    }
    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('🔴 [GamesLibraryStore] Error getting auth token:', error)
    return null
  }
}

// Функция для вызова API библиотеки
async function fetchGamesAPI(): Promise<GameWithDownload[]> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available')
  }
  
  const response = await fetch('/api/v1/library', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  
  console.log('🔍 [GamesLibraryStore] Raw API response:', data)
  
  // Убеждаемся, что возвращаем массив
  if (!Array.isArray(data)) {
    console.warn('🟡 [GamesLibraryStore] API returned non-array data:', data)
    return []
  }
  
  console.log('✅ [GamesLibraryStore] Valid array data received:', data.length, 'items')
  return data
}

// Функция для действий с загрузками игр
async function gameDownloadActionAPI(downloadId: string, action: 'pause' | 'resume' | 'cancel'): Promise<void> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available')
  }
  
  const response = await fetch(`/api/v1/downloads/${downloadId}/${action}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
}

// Создаем store с middleware для devtools и subscriptions
export const useGamesLibraryStore = create<GamesLibraryState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Начальное состояние
      games: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetched: null,
      cacheTimeout: 2 * 60 * 1000, // 2 минуты
      
      // Основная функция загрузки игр с кэшированием
      fetchGames: async () => {
        const state = get()
        const now = Date.now()
        
        // Проверяем кэш: если данные свежие, не делаем запрос
        if (
          state.games.length > 0 &&
          state.lastFetched !== null &&
          (now - state.lastFetched) < state.cacheTimeout &&
          !state.isLoading
        ) {
          console.log('🎮 [GamesLibraryStore] Using cached games data')
          return
        }
        
        // Предотвращаем множественные одновременные запросы
        if (state.isLoading) {
          console.log('🎮 [GamesLibraryStore] Games request already in progress, skipping')
          return
        }
        
        try {
          console.log('🎮 [GamesLibraryStore] Fetching fresh games data...')
          set({ isLoading: true, error: null })
          
          const games = await fetchGamesAPI()
          
          // Дополнительная проверка на случай, если games равно null или undefined
          const validGames = Array.isArray(games) ? games : []
          
          set({
            games: validGames,
            isLoading: false,
            isInitialized: true,
            error: null,
            lastFetched: now,
          })
          
          console.log('✅ [GamesLibraryStore] Games loaded successfully:', validGames.length, 'items')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [GamesLibraryStore] Error loading games:', errorMessage)
          
          set({
            isLoading: false,
            error: errorMessage,
            isInitialized: true,
          })
        }
      },
      
      // Принудительное обновление (игнорирует кэш)
      refreshGames: async () => {
        console.log('🔄 [GamesLibraryStore] Force refreshing games...')
        set({ lastFetched: null }) // Сбрасываем кэш
        return get().fetchGames()
      },
      
      // Пауза загрузки игры
      pauseGameDownload: async (gameId: string) => {
        try {
          const game = get().games.find(g => g.id === gameId)
          if (!game?.download) {
            throw new Error('Game download not found')
          }
          
          console.log('⏸ [GamesLibraryStore] Pausing game download:', gameId)
          await gameDownloadActionAPI(game.download.id, 'pause')
          // Обновляем данные после действия
          await get().refreshGames()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [GamesLibraryStore] Error pausing game download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Возобновление загрузки игры
      resumeGameDownload: async (gameId: string) => {
        try {
          const game = get().games.find(g => g.id === gameId)
          if (!game?.download) {
            throw new Error('Game download not found')
          }
          
          console.log('▶️ [GamesLibraryStore] Resuming game download:', gameId)
          await gameDownloadActionAPI(game.download.id, 'resume')
          // Обновляем данные после действия
          await get().refreshGames()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [GamesLibraryStore] Error resuming game download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Отмена загрузки игры
      cancelGameDownload: async (gameId: string) => {
        try {
          const game = get().games.find(g => g.id === gameId)
          if (!game?.download) {
            throw new Error('Game download not found')
          }
          
          console.log('🗑 [GamesLibraryStore] Canceling game download:', gameId)
          await gameDownloadActionAPI(game.download.id, 'cancel')
          // Обновляем данные после действия
          await get().refreshGames()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [GamesLibraryStore] Error canceling game download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Очистка данных игр
      clearGames: () => {
        console.log('🗑️ [GamesLibraryStore] Clearing games data')
        set({
          games: [],
          isLoading: false,
          isInitialized: false,
          error: null,
          lastFetched: null,
        })
      },
      
      // Установка ошибки
      setError: (error: string | null) => {
        set({ error, isLoading: false })
      },
    })),
    {
      name: 'games-library-store', // Имя для Redux DevTools
    }
  )
)

// Хуки для удобного доступа к состоянию
export const useGamesLibraryLoading = () => 
  useGamesLibraryStore(state => state.isLoading)

export const useGamesLibraryData = () => 
  useGamesLibraryStore(state => state.games)

export const useGamesLibraryInitialized = () => 
  useGamesLibraryStore(state => state.isInitialized)

export const useGamesLibraryError = () => 
  useGamesLibraryStore(state => state.error)

// Отдельные хуки для каждого действия
export const useFetchGames = () => 
  useGamesLibraryStore(state => state.fetchGames)

export const useRefreshGames = () => 
  useGamesLibraryStore(state => state.refreshGames)

export const usePauseGameDownload = () => 
  useGamesLibraryStore(state => state.pauseGameDownload)

export const useResumeGameDownload = () => 
  useGamesLibraryStore(state => state.resumeGameDownload)

export const useCancelGameDownload = () => 
  useGamesLibraryStore(state => state.cancelGameDownload)

export const useClearGames = () => 
  useGamesLibraryStore(state => state.clearGames)