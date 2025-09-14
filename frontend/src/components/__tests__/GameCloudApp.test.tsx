import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import GameCloudApp from '../GameCloudApp'

// Мокаем зависимости
const mockUseSession = jest.fn()
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn()
}))

jest.mock('@/stores/statsStore', () => ({
  useStatsStore: jest.fn(),
  useStatsLoading: () => false,
  useStatsData: () => null,
  useStatsInitialized: () => true,
  useStatsError: () => null,
  useFetchStats: () => jest.fn(),
  useClearStats: () => jest.fn()
}))

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    language: 'ru',
    setTheme: jest.fn(),
    setLanguage: jest.fn()
  })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('GameCloudApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('рендерит состояние загрузки', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GameCloudApp />
      </TestWrapper>
    )

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument()
  })

  it('отображает заголовок приложения для авторизованного пользователя', () => {
    mockUseSession.mockReturnValue({
      data: { 
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GameCloudApp />
      </TestWrapper>
    )

    expect(screen.getByText(/gamecloud/i)).toBeInTheDocument()
  })

  it('показывает быстрые действия для авторизованного пользователя', () => {
    mockUseSession.mockReturnValue({
      data: { 
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31'
      },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <GameCloudApp />
      </TestWrapper>
    )

    expect(screen.getByText(/быстрые действия/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /добавить игру/i })).toBeInTheDocument()
  })
})