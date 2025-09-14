import { renderHook, act } from '@testing-library/react'
import { useStatsStore, useStatsData, useStatsLoading, useFetchStats } from '../statsStore'

// Мок для fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Мок для getAuthToken (внутренняя функция)
jest.mock('../statsStore', () => {
  const actual = jest.requireActual('../statsStore')
  return {
    ...actual,
    // Мокаем внутреннюю функцию через модуль
  }
})

describe('StatsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
    useStatsStore.getState().clearStats()
  })

  // Тест 1: Инициальное состояние store
  it('has correct initial state', () => {
    const { result } = renderHook(() => ({
      stats: useStatsData(),
      isLoading: useStatsLoading(),
    }))

    expect(result.current.stats).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  // Тест 2: Успешная загрузка статистики
  it('fetches stats successfully', async () => {
    const mockStats = {
      totalGames: 10,
      totalSize: '100GB',
      downloadSpeed: '5MB/s',
      uploadSpeed: '2MB/s',
      activeDownloads: 3,
      seedingTorrents: 2,
    }

    // Мок для токена
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })

    const { result } = renderHook(() => ({
      stats: useStatsData(),
      isLoading: useStatsLoading(),
      fetchStats: useFetchStats(),
    }))

    await act(async () => {
      await result.current.fetchStats()
    })

    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.isLoading).toBe(false)
  })

  // Тест 3: Обработка ошибки при загрузке
  it('handles fetch error correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => ({
      stats: useStatsData(),
      isLoading: useStatsLoading(),
      fetchStats: useFetchStats(),
    }))

    await act(async () => {
      await result.current.fetchStats()
    })

    expect(result.current.stats).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })
})