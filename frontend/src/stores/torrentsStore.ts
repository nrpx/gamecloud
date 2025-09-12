import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'

// Типы для торрентов/загрузок
interface Download {
  id: string
  torrent_url: string
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
  progress: number
  total_size: number
  downloaded_size: number
  upload_speed: number
  download_speed: number
  seeds_connected: number
  peers_connected: number
  eta?: number
  created_at: string
  updated_at: string
}

interface TorrentsState {
  // Данные
  downloads: Download[]
  
  // Состояния загрузки
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Кэширование
  lastFetched: number | null
  cacheTimeout: number // в миллисекундах (1 минута для более частого обновления статуса)
  
  // Действия
  fetchDownloads: () => Promise<void>
  refreshDownloads: () => Promise<void>
  pauseDownload: (downloadId: string) => Promise<void>
  resumeDownload: (downloadId: string) => Promise<void>
  cancelDownload: (downloadId: string) => Promise<void>
  clearDownloads: () => void
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
    console.error('🔴 [TorrentsStore] Error getting auth token:', error)
    return null
  }
}

// Функция для вызова API загрузок
async function fetchDownloadsAPI(): Promise<Download[]> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available')
  }
  
  const response = await fetch('/api/v1/downloads', {
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

// Функция для действий с торрентами
async function downloadActionAPI(downloadId: string, action: 'pause' | 'resume' | 'cancel'): Promise<void> {
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
export const useTorrentsStore = create<TorrentsState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Начальное состояние
      downloads: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetched: null,
      cacheTimeout: 60 * 1000, // 1 минута для торрентов (более частое обновление)
      
      // Основная функция загрузки торрентов с кэшированием
      fetchDownloads: async () => {
        const state = get()
        const now = Date.now()
        
        // Проверяем кэш: если данные свежие, не делаем запрос
        if (
          state.downloads.length > 0 &&
          state.lastFetched !== null &&
          (now - state.lastFetched) < state.cacheTimeout &&
          !state.isLoading
        ) {
          console.log('🌐 [TorrentsStore] Using cached downloads data')
          return
        }
        
        // Предотвращаем множественные одновременные запросы
        if (state.isLoading) {
          console.log('🌐 [TorrentsStore] Downloads request already in progress, skipping')
          return
        }
        
        try {
          console.log('🌐 [TorrentsStore] Fetching fresh downloads data...')
          set({ isLoading: true, error: null })
          
          const downloads = await fetchDownloadsAPI()
          
          set({
            downloads,
            isLoading: false,
            isInitialized: true,
            error: null,
            lastFetched: now,
          })
          
          console.log('✅ [TorrentsStore] Downloads loaded successfully:', downloads.length, 'items')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [TorrentsStore] Error loading downloads:', errorMessage)
          
          set({
            isLoading: false,
            error: errorMessage,
            isInitialized: true,
          })
        }
      },
      
      // Принудительное обновление (игнорирует кэш)
      refreshDownloads: async () => {
        console.log('🔄 [TorrentsStore] Force refreshing downloads...')
        set({ lastFetched: null }) // Сбрасываем кэш
        return get().fetchDownloads()
      },
      
      // Пауза торрента
      pauseDownload: async (downloadId: string) => {
        try {
          console.log('⏸ [TorrentsStore] Pausing download:', downloadId)
          await downloadActionAPI(downloadId, 'pause')
          // Обновляем данные после действия
          await get().refreshDownloads()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [TorrentsStore] Error pausing download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Возобновление торрента
      resumeDownload: async (downloadId: string) => {
        try {
          console.log('▶️ [TorrentsStore] Resuming download:', downloadId)
          await downloadActionAPI(downloadId, 'resume')
          // Обновляем данные после действия
          await get().refreshDownloads()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [TorrentsStore] Error resuming download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Отмена торрента
      cancelDownload: async (downloadId: string) => {
        try {
          console.log('🗑 [TorrentsStore] Canceling download:', downloadId)
          await downloadActionAPI(downloadId, 'cancel')
          // Обновляем данные после действия
          await get().refreshDownloads()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          console.error('🔴 [TorrentsStore] Error canceling download:', errorMessage)
          set({ error: errorMessage })
          throw error
        }
      },
      
      // Очистка данных торрентов
      clearDownloads: () => {
        console.log('🗑️ [TorrentsStore] Clearing downloads data')
        set({
          downloads: [],
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
      name: 'torrents-store', // Имя для Redux DevTools
    }
  )
)

// Хуки для удобного доступа к состоянию
export const useTorrentsLoading = () => 
  useTorrentsStore(state => state.isLoading)

export const useTorrentsData = () => 
  useTorrentsStore(state => state.downloads)

export const useTorrentsInitialized = () => 
  useTorrentsStore(state => state.isInitialized)

export const useTorrentsError = () => 
  useTorrentsStore(state => state.error)

// Отдельные хуки для каждого действия
export const useFetchDownloads = () => 
  useTorrentsStore(state => state.fetchDownloads)

export const useRefreshDownloads = () => 
  useTorrentsStore(state => state.refreshDownloads)

export const usePauseDownload = () => 
  useTorrentsStore(state => state.pauseDownload)

export const useResumeDownload = () => 
  useTorrentsStore(state => state.resumeDownload)

export const useCancelDownload = () => 
  useTorrentsStore(state => state.cancelDownload)

export const useClearDownloads = () => 
  useTorrentsStore(state => state.clearDownloads)