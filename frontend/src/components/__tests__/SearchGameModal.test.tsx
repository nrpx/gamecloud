import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import SearchGameModal from '../SearchGameModal'

// Мокаем зависимости
jest.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    searchGames: jest.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Test Game',
        genre: 'Action',
        description: 'Test description',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ])
  })
}))

// Мокаем API
jest.mock('@/lib/api', () => ({
  searchApi: {
    searchGames: jest.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Test Game',
        genre: 'Action',
        description: 'Test description',
        torrent_url: 'http://example.com/test.torrent',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ])
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('SearchGameModal', () => {
  const mockOnClose = jest.fn()
  const mockOnGameSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('отображает модальное окно поиска', () => {
    render(
      <TestWrapper>
        <SearchGameModal 
          isOpen={true}
          onClose={mockOnClose}
          onGameSelect={mockOnGameSelect}
        />
      </TestWrapper>
    )

    expect(screen.getByText(/поиск игр/i)).toBeInTheDocument()
  })

  it('обрабатывает поиск игр', async () => {
    render(
      <TestWrapper>
        <SearchGameModal 
          isOpen={true}
          onClose={mockOnClose}
          onGameSelect={mockOnGameSelect}
        />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText(/введите название игры/i)
    const searchButton = screen.getByRole('button', { name: /найти/i })
    
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument()
    })
  })

  it('закрывается при нажатии на кнопку закрытия', () => {
    render(
      <TestWrapper>
        <SearchGameModal 
          isOpen={true}
          onClose={mockOnClose}
          onGameSelect={mockOnGameSelect}
        />
      </TestWrapper>
    )

    const closeButton = screen.getByRole('button', { name: /отмена/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})