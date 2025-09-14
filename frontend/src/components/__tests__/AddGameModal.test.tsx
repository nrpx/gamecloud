import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import AddGameModal from '../AddGameModal'

// Mock для window.alert
global.alert = jest.fn()

// Mock для gameStore
const mockAddGame = jest.fn()
jest.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    addGame: mockAddGame
  })
}))

// Wrapper для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('AddGameModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Рендеринг модалки когда открыта
  it('renders modal when open', () => {
    render(
      <TestWrapper>
        <AddGameModal isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.getByRole('heading', { name: 'Добавить игру' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/название игры/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/описание/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument()
  })

  // Тест 2: Не рендерится когда закрыта
  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <AddGameModal isOpen={false} onClose={jest.fn()} />
      </TestWrapper>
    )

    expect(screen.queryByText('Добавить игру')).not.toBeInTheDocument()
  })

  // Тест 3: Заполнение формы и отправка
  it('handles form submission', async () => {
    const mockOnClose = jest.fn()
    mockAddGame.mockResolvedValueOnce({})

    render(
      <TestWrapper>
        <AddGameModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    )

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText(/название игры/i), {
      target: { value: 'Test Game' }
    })
    fireEvent.change(screen.getByPlaceholderText(/описание/i), {
      target: { value: 'Test Description' }
    })
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Action' }
    })
    fireEvent.change(screen.getByPlaceholderText(/magnet:.*xt=urn:btih/i), {
      target: { value: 'magnet:?xt=urn:btih:test123' }
    })

    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    await waitFor(() => {
      expect(mockAddGame).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Game',
        description: 'Test Description',
        genre: 'Action'
      }))
    })
  })
})