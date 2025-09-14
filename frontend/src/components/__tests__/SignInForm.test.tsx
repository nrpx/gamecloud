import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import SignInForm from '../SignInForm'

// Mock для next-auth
jest.mock('next-auth/react')
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

// Mock для window.location
delete (window as any).location
window.location = { href: '' } as any

// Wrapper для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('SignInForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Рендеринг формы входа
  it('renders sign in form with all fields', () => {
    render(
      <TestWrapper>
        <SignInForm />
      </TestWrapper>
    )

    expect(screen.getByText('Вход в GameCloud')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/имя пользователя/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  // Тест 2: Успешный вход
  it('handles successful sign in', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      ok: true, 
      error: undefined,
      status: 200,
      url: '/',
      code: '200'
    })

    render(
      <TestWrapper>
        <SignInForm />
      </TestWrapper>
    )

    fireEvent.change(screen.getByPlaceholderText(/имя пользователя/i), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'testuser',
        password: 'password123',
        callbackUrl: '/',
        redirect: false
      })
    })
  })

  // Тест 3: Обработка ошибки входа
  it('handles sign in error', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      ok: false, 
      error: 'Invalid credentials',
      status: 401,
      url: '',
      code: '401'
    })

    render(
      <TestWrapper>
        <SignInForm />
      </TestWrapper>
    )

    fireEvent.change(screen.getByPlaceholderText(/имя пользователя/i), {
      target: { value: 'baduser' }
    })
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), {
      target: { value: 'badpass' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(screen.getByText('Неверные учетные данные')).toBeInTheDocument()
    })
  })
})