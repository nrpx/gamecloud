import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'

// Мок для useSession
const mockSession = {
  user: { id: '1', name: 'Test User' },
  expires: new Date(Date.now() + 86400000).toISOString()
}

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession })
}))

// Мок для fetch (для получения токена)
const mockFetch = jest.fn()
global.fetch = mockFetch

// Мок для WebSocket
class MockWebSocket {
  url: string
  readyState: number
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    this.readyState = WebSocket.CONNECTING
    
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string) {}
  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }
}

global.WebSocket = MockWebSocket as any

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'test-token' })
    })
  })

  // Тест 1: Инициализация хука
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useWebSocket())

    expect(result.current.isConnected).toBe(false)
    expect(result.current.progressUpdates.size).toBe(0)
    expect(result.current.lastError).toBeNull()
  })

  // Тест 2: Подключение WebSocket
  it('can connect to WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket())

    await act(async () => {
      await result.current.connect()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/token')
  })

  // Тест 3: Отключение WebSocket
  it('can disconnect from WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket())

    await act(async () => {
      await result.current.connect()
      result.current.disconnect()
    })

    expect(result.current.isConnected).toBe(false)
  })
})