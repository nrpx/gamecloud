import { useGameStore } from '../gameStore'

// Mock для axios
jest.mock('axios')
const mockAxios = require('axios')

describe('gameStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Сбрасываем состояние store
    useGameStore.setState({ 
      games: [], 
      loading: false, 
      error: null 
    })
  })

  // Тест 1: Инициализация store с дефолтными значениями
  it('initializes with default state', () => {
    const { games, loading, error } = useGameStore.getState()

    expect(games).toEqual([])
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  // Тест 2: Загрузка списка игр
  it('fetches games successfully', async () => {
    const mockGames = [
      { 
        id: '1', 
        title: 'Test Game',
        description: 'Test Description', 
        genre: 'Action',
        torrent_url: 'test.torrent',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]

    mockAxios.get.mockResolvedValueOnce({ data: mockGames })

    const { fetchGames } = useGameStore.getState()
    await fetchGames()

    const { games, loading, error } = useGameStore.getState()
    expect(games).toEqual(mockGames)
    expect(loading).toBe(false)
    expect(error).toBeNull()
  })

  // Тест 3: Добавление новой игры
  it('adds game successfully', async () => {
    const newGame = {
      title: 'New Game',
      description: 'New Description',
      genre: 'RPG',
      status: 'available' as const
    }

    const mockResponse = {
      id: '2',
      ...newGame,
      torrent_url: 'new.torrent',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    mockAxios.post.mockResolvedValueOnce({ data: mockResponse })

    const { addGame } = useGameStore.getState()
    const result = await addGame(newGame)

    expect(result).toEqual(mockResponse)
    expect(useGameStore.getState().games).toContain(mockResponse)
  })
})