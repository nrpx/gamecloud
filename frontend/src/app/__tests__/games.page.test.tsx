import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import GamesLibraryPage from '../games/page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Мокаем зависимости
jest.mock('next-auth/react')
jest.mock('@/hooks/useWebSocket')
jest.mock('@/stores/gamesLibraryStore')
jest.mock('@/stores/torrentsStore')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ChakraProvider>
)

describe('GamesLibraryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Мокаем store hooks
    require('@/stores/gamesLibraryStore').useGamesLibraryData.mockReturnValue([])
    require('@/stores/gamesLibraryStore').useGamesLibraryLoading.mockReturnValue(false)
    require('@/stores/gamesLibraryStore').useGamesLibraryInitialized.mockReturnValue(true)
    require('@/stores/gamesLibraryStore').useFetchGames.mockReturnValue(jest.fn())
    
    require('@/stores/torrentsStore').useTorrentsData.mockReturnValue([])
    require('@/stores/torrentsStore').useFetchDownloads.mockReturnValue(jest.fn())
    
    require('@/hooks/useWebSocket').useWebSocket.mockReturnValue({
      isConnected: true,
      progressUpdates: {},
      lastError: null
    })
  })

  it('показывает заголовок страницы библиотеки игр', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GamesLibraryPage />
      </TestWrapper>
    )

    expect(screen.getByText(/библиотека игр/i)).toBeInTheDocument()
  })

  it('показывает поле поиска и фильтры', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GamesLibraryPage />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText(/поиск по названию или жанру/i)).toBeInTheDocument()
  })

  it('обрабатывает поиск по играм', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GamesLibraryPage />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText(/поиск по названию или жанру/i)
    fireEvent.change(searchInput, { target: { value: 'test game' } })

    expect(searchInput).toHaveValue('test game')
  })
})