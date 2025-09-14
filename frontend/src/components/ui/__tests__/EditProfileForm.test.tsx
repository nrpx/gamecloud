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
      expect(screen.getByText(/имя не может быть пустым/i)).toBeInTheDocument()
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

    const submitButton = screen.getByRole('button', { name: /сохранить/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})