import { render, screen, fireEvent } from '@testing-library/react'
import { useSession, signOut } from 'next-auth/react'
import ProfilePage from '../profile/page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Мокаем зависимости
jest.mock('next-auth/react')

// Мокаем ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    language: 'ru',
    setTheme: jest.fn(),
    setLanguage: jest.fn()
  })
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('показывает сообщение для неавторизованного пользователя', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <ProfilePage />
      </TestWrapper>
    )

    expect(screen.getByText(/пожалуйста, войдите в систему/i)).toBeInTheDocument()
  })

  it('показывает профиль авторизованного пользователя', () => {
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
        <ProfilePage />
      </TestWrapper>
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('обрабатывает выход из системы', () => {
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
        <ProfilePage />
      </TestWrapper>
    )

    const logoutButton = screen.getByRole('button', { name: 'Выйти из системы' })
    fireEvent.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/auth/signin' })
  })
})