import { useGamesLibraryStore } from '../gamesLibraryStore'

// Мок для API
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('gamesLibraryStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Полный сброс состояния store
    const store = useGamesLibraryStore.getState()
    store.clearGames()
    store.setError(null)
    useGamesLibraryStore.setState({
      games: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetched: null
    })
  })

  // Тест 1: Инициализация store с дефолтными значениями
  it('initializes with default state', () => {
    const { games, isLoading, isInitialized, error } = useGamesLibraryStore.getState()

    expect(games).toEqual([])
    expect(isLoading).toBe(false)
    expect(isInitialized).toBe(false)
    expect(error).toBeNull()
  })

  // Тест 2: Загрузка списка игр
  it('fetches games successfully', async () => {
    const mockToken = 'test-token'
    const mockGames = [
      {
        id: '1',
        title: 'Test Game 1',
        genre: 'Action',
        description: 'Test description',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Test Game 2',
        genre: 'RPG',
        description: 'Another test',
        created_at: '2024-01-02T00:00:00Z'
      }
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGames)
      })

    const { fetchGames } = useGamesLibraryStore.getState()
    await fetchGames()

    const { games, isLoading, isInitialized } = useGamesLibraryStore.getState()
    expect(games).toEqual(mockGames)
    expect(isLoading).toBe(false)
    expect(isInitialized).toBe(true)
  })

  // Тест 3: Удаление игры
  it('deletes game successfully', async () => {
    const mockToken = 'test-token'
    
    // Сначала добавляем игры
    useGamesLibraryStore.setState({ 
      games: [
        {
          id: '1',
          title: 'Test Game',
          genre: 'Action',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z'
        }
      ],
      isInitialized: true
    })

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]) // Пустой массив после удаления
      })

    const { deleteGame } = useGamesLibraryStore.getState()
    await deleteGame('1')

    const { games } = useGamesLibraryStore.getState()
    expect(games).toEqual([])
  })
})