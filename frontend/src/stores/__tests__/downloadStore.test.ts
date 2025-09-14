import { useDownloadStore } from '../downloadStore'

// Mock для axios
jest.mock('axios')
const mockAxios = require('axios')

describe('downloadStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Сбрасываем состояние store
    useDownloadStore.setState({ 
      downloads: [], 
      loading: false, 
      error: null 
    })
  })

  // Тест 1: Инициализация store с дефолтными значениями
  it('initializes with default state', () => {
    const { downloads, loading, error } = useDownloadStore.getState()

    expect(downloads).toEqual([])
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  // Тест 2: Загрузка списка загрузок
  it('fetches downloads successfully', async () => {
    const mockDownloads = [
      { 
        id: '1', 
        game_id: 'game1',
        torrent_url: 'test.torrent',
        status: 'downloading' as const, 
        progress: 50,
        speed: 1000,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]

    mockAxios.get.mockResolvedValueOnce({ data: mockDownloads })

    const { fetchDownloads } = useDownloadStore.getState()
    await fetchDownloads()

    const { downloads, loading, error } = useDownloadStore.getState()
    expect(downloads).toEqual(mockDownloads)
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  // Тест 3: Приостановка загрузки
  it('pauses download successfully', async () => {
    // Устанавливаем начальное состояние
    useDownloadStore.setState({
      downloads: [
        { 
          id: '1', 
          game_id: 'game1',
          torrent_url: 'test.torrent',
          status: 'downloading' as const, 
          progress: 50,
          speed: 1000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    })

    mockAxios.put.mockResolvedValueOnce({})

    const { pauseDownload } = useDownloadStore.getState()
    await pauseDownload('1')

    const { downloads } = useDownloadStore.getState()
    expect(downloads[0].status).toBe('paused')
    expect(mockAxios.put).toHaveBeenCalledWith('/api/v1/downloads/1/pause')
  })
})