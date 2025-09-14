import { gamesApi, formatFileSize, formatSpeed } from '../api'

// Мок для fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Мок для next-auth/react  
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => Promise.resolve({
    user: { id: '1', name: 'Test User' },
    expires: '2024-12-31'
  }))
}))

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: gamesApi.getAll - успешный запрос
  it('gamesApi.getAll fetches games successfully', async () => {
    const mockGames = [
      { id: '1', title: 'Test Game', genre: 'Action' }
    ]
    
    // Мок для получения токена
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' })
      })
      // Мок для получения игр
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGames)
      })

    const result = await gamesApi.getAll()
    expect(result).toEqual(mockGames)
  })

  // Тест 2: formatFileSize - форматирование размера файла
  it('formatFileSize formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  // Тест 3: formatSpeed - форматирование скорости
  it('formatSpeed formats speed correctly', () => {
    expect(formatSpeed(1024)).toBe('1 KB/s')
    expect(formatSpeed(1048576)).toBe('1 MB/s')
    expect(formatSpeed(0)).toBe('0 B/s')
  })
})