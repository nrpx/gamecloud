import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import TorrentsPage from '../torrents/page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Мокаем зависимости
jest.mock('next-auth/react')
jest.mock('@/hooks/useWebSocket')
jest.mock('@/stores/torrentsStore')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ChakraProvider>
)

describe('TorrentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Мокаем store hooks
    require('@/stores/torrentsStore').useTorrentsData.mockReturnValue([])
    require('@/stores/torrentsStore').useTorrentsLoading.mockReturnValue(false)
    require('@/stores/torrentsStore').useTorrentsInitialized.mockReturnValue(true)
    require('@/stores/torrentsStore').useFetchDownloads.mockReturnValue(jest.fn())
    
    require('@/hooks/useWebSocket').useWebSocket.mockReturnValue({
      isConnected: true,
      progressUpdates: {},
      lastError: null
    })
  })

  it('показывает заголовок страницы загрузок', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <TorrentsPage />
      </TestWrapper>
    )

    expect(screen.getByText(/торрент-менеджер/i)).toBeInTheDocument()
  })

  it('показывает статус WebSocket подключения', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <TorrentsPage />
      </TestWrapper>
    )

    expect(screen.getByText(/real-time/i)).toBeInTheDocument()
  })

  it('обрабатывает обновление списка загрузок', async () => {
    const mockRefreshDownloads = jest.fn()
    require('@/stores/torrentsStore').useRefreshDownloads.mockReturnValue(mockRefreshDownloads)

    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <TorrentsPage />
      </TestWrapper>
    )

    const refreshButton = screen.getByRole('button', { name: /обновить/i })
    fireEvent.click(refreshButton)

    expect(mockRefreshDownloads).toHaveBeenCalled()
  })
})