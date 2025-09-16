import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import EditProfileForm from '../EditProfileForm'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Wrapper для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

// Мок для next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUpdate = jest.fn()

// Мок для fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('EditProfileForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
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
      update: mockUpdate
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })  // Тест 1: Рендеринг формы с данными пользователя
  it('renders form with user data', () => {
    render(
      <TestWrapper>
        <EditProfileForm />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument()
  })

  // Тест 2: Валидация пустого имени
  it('validates empty display name', async () => {
    render(
      <TestWrapper>
        <EditProfileForm />
      </TestWrapper>
    )

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /сохранить/i })

    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/это поле обязательно для заполнения/i)).toBeInTheDocument()
    })
  })

  // Тест 3: Успешное сохранение профиля
  it('saves profile successfully', async () => {
    const mockOnSuccess = jest.fn()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    render(
      <TestWrapper>
        <EditProfileForm onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    // Поскольку в DOM есть два пустых поля, используем более специфичный селектор
    const inputs = screen.getAllByRole('textbox')
    const nameField = inputs[0] // Первое поле - displayName
    const emailField = inputs[1] // Второе поле - email
    
    // Вводим данные (это сделает форму dirty)
    fireEvent.change(nameField, { target: { value: 'Updated User' } })
    fireEvent.change(emailField, { target: { value: 'updated@example.com' } })

    const submitButton = screen.getByRole('button', { name: /сохранить/i })
    
    // Теперь кнопка должна быть активна
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
    
    fireEvent.click(submitButton)

    // Продвигаем время для симуляции API запроса (1000ms)
    jest.advanceTimersByTime(1000)
    
    // Ждем до обновления состояния
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })

    // Продвигаем время для setTimeout onSuccess (2000ms)
    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})