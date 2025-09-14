import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import SearchPage from '../search/page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { searchApi } from '@/lib/api'

// Мокаем зависимости
jest.mock('next/navigation')
jest.mock('@/lib/api')

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockSearchApi = searchApi as jest.Mocked<typeof searchApi>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ChakraProvider>
)

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      has: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      toString: jest.fn(),
      forEach: jest.fn(),
      getAll: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn()
    } as any)

    mockSearchApi.searchGames = jest.fn().mockResolvedValue([])
  })

  it('показывает поле поиска', () => {
    render(
      <TestWrapper>
        <SearchPage />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText(/введите название игры/i)).toBeInTheDocument()
  })

  it('выполняет поиск при вводе запроса', async () => {
    const mockResults = [
      { 
        id: '1', 
        title: 'Test Game', 
        genre: 'Action',
        description: 'Test description',
        torrent_url: 'http://example.com/test.torrent',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]
    mockSearchApi.searchGames.mockResolvedValue(mockResults)

    render(
      <TestWrapper>
        <SearchPage />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText(/введите название игры/i)
    const searchButton = screen.getByRole('button', { name: /поиск/i })

    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockSearchApi.searchGames).toHaveBeenCalledWith('test')
    })
  })

  it('показывает результаты поиска', async () => {
    const mockResults = [
      { 
        id: '1', 
        title: 'Test Game', 
        genre: 'Action',
        description: 'Test description',
        torrent_url: 'http://example.com/test.torrent',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]
    mockSearchApi.searchGames.mockResolvedValue(mockResults)

    render(
      <TestWrapper>
        <SearchPage />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText(/введите название игры/i)
    const searchButton = screen.getByRole('button', { name: /поиск/i })

    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument()
    })
  })
})