import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import HomePage from '../page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Мокаем зависимости
jest.mock('next-auth/react')
jest.mock('@/stores/gamesLibraryStore', () => ({
  useGamesLibraryData: jest.fn(() => []),
  useFetchGames: jest.fn(() => jest.fn())
}))
jest.mock('@/stores/torrentsStore', () => ({
  useTorrentsData: jest.fn(() => []),
  useFetchDownloads: jest.fn(() => jest.fn())
}))
jest.mock('@/lib/api', () => ({
  formatFileSize: jest.fn((size) => `${size} B`),
  formatSpeed: jest.fn((speed) => `${speed} B/s`)
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ChakraProvider>
)

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Мокаем fetch для API запросов
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        totalGames: 5,
        activeDownloads: 2,
        completedDownloads: 3,
        totalDownloadSize: 1024000000,
        downloadSpeed: 1048576
      })
    })
  })

  it('показывает форму входа для неавторизованного пользователя', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(screen.getByText(/вход в gamecloud/i)).toBeInTheDocument()
  })

  it('показывает загрузку во время проверки сессии', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('показывает панель управления для авторизованного пользователя', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: '2024-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/панель управления/i)).toBeInTheDocument()
    })
  })
})