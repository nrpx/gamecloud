import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'

// Типы для статистики - соответствуют backend API
// Типы для статистики
interface Stats {
  total_games: number
  active_downloads: number
  completed_downloads: number
  total_downloaded_size: number
  total_upload_size: number
}

interface StatsState {
  // Данные статистики
  stats: Stats | null
  
  // Состояния загрузки
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Кэширование
  lastFetched: number | null
  cacheTimeout: number // в миллисекундах (5 минут)
  
  // Действия
  fetchStats: () => Promise<void>
  refreshStats: () => Promise<void>
  clearStats: () => void
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
    console.error('🔴 [StatsStore] Error getting auth token:', error)
    return null
  }
}

// Функция для вызова API статистики
async function fetchStatsAPI(): Promise<Stats> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available')
  }
  
  const response = await fetch('/api/v1/stats', {
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
  
  return await response.json()
}

// Создаем store с middleware для devtools и subscriptions
export const useStatsStore = create<StatsState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Начальное состояние
      stats: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetched: null,
      cacheTimeout: 5 * 60 * 1000, // 5 минут
      
      // Основная функция загрузки статистики с кэшированием
      fetchStats: async () => {
        const state = get()
        const now = Date.now()
        
        // Проверяем кэш: если данные свежие, не делаем запрос
        if (
          state.stats !== null &&
          state.lastFetched !== null &&
          (now - state.lastFetched) < state.cacheTimeout &&
          !state.isLoading
        ) {
          console.log('📈 [StatsStore] Using cached stats data')
          return
        }
        
        // Предотвращаем множественные одновременные запросы
        if (state.isLoading) {
          console.log('📈 [StatsStore] Stats request already in progress, skipping')
          return
        }
        
        try {
          console.log('📈 [StatsStore] Fetching fresh stats data...')
          set({ isLoading: true, error: null })
          
          const stats = await fetchStatsAPI()
          
          set({
            stats,
            isLoading: false,
            isInitialized: true,
            error: null,
            lastFetched: now,
          })
          
          console.log('✅ [StatsStore] Stats loaded successfully:', stats)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [StatsStore] Error loading stats:', errorMessage)
          
          set({
            isLoading: false,
            error: errorMessage,
            // Не очищаем isInitialized, чтобы показать ошибку
            isInitialized: true,
          })
        }
      },
      
      // Принудительное обновление (игнорирует кэш)
      refreshStats: async () => {
        console.log('🔄 [StatsStore] Force refreshing stats...')
        set({ lastFetched: null }) // Сбрасываем кэш
        return get().fetchStats()
      },
      
      // Очистка данных статистики
      clearStats: () => {
        console.log('🗑️ [StatsStore] Clearing stats data')
        set({
          stats: null,
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
      name: 'stats-store', // Имя для Redux DevTools
    }
  )
)

// Хук для удобного доступа к состоянию загрузки
export const useStatsLoading = () => 
  useStatsStore(state => state.isLoading)

// Хук для получения данных статистики
export const useStatsData = () => 
  useStatsStore(state => state.stats)

// Хук для проверки инициализации
export const useStatsInitialized = () => 
  useStatsStore(state => state.isInitialized)

// Хук для получения ошибки
export const useStatsError = () => 
  useStatsStore(state => state.error)

// Отдельные хуки для каждого действия - избегаем создания нового объекта
export const useFetchStats = () => 
  useStatsStore(state => state.fetchStats)

export const useRefreshStats = () => 
  useStatsStore(state => state.refreshStats)

export const useClearStats = () => 
  useStatsStore(state => state.clearStats)

export const useSetStatsError = () => 
  useStatsStore(state => state.setError)