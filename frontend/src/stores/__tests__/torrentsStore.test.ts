import { renderHook, act } from '@testing-library/react'
import {
  useTorrentsData,
  useTorrentsLoading,
  useTorrentsInitialized,
  useFetchDownloads,
  useRefreshDownloads,
  usePauseDownload
} from '../torrentsStore'

// Мокаем fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('torrentsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Мокаем токен API
    mockFetch.mockImplementation((url) => {
      if (url === '/api/token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-token' })
        } as Response)
      }
      
      // Мокаем успешный ответ API для других запросов
      return Promise.resolve({
        ok: true,
        json: async () => ([
          {
            id: '1',
            torrent_url: 'http://example.com/test.torrent',
            status: 'downloading',
            progress: 50,
            total_size: 1000000,
            downloaded_size: 500000,
            download_speed: 1000000,
            upload_speed: 100000,
            seeds_connected: 5,
            peers_connected: 10,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ])
      } as Response)
    })
  })

  it('загружает данные о торрентах', async () => {
    const { result } = renderHook(() => ({
      data: useTorrentsData(),
      loading: useTorrentsLoading(),
      fetch: useFetchDownloads()
    }))

    await act(async () => {
      await result.current.fetch()
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].torrent_url).toBe('http://example.com/test.torrent')
    expect(result.current.loading).toBe(false)
  })

  it('обновляет список загрузок', async () => {
    const { result } = renderHook(() => ({
      data: useTorrentsData(),
      refresh: useRefreshDownloads()
    }))

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockFetch).toHaveBeenCalled()
  })

  it('ставит загрузку на паузу', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

    const { result } = renderHook(() => ({
      pause: usePauseDownload()
    }))

    await act(async () => {
      await result.current.pause('test-id')
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/downloads/test-id/pause'),
      expect.any(Object)
    )
  })
})