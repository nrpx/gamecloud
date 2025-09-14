import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import SettingsPage from '../settings/page'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { settingsApi } from '@/lib/api'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Мокаем зависимости
jest.mock('next-auth/react')
jest.mock('@/lib/api')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSettingsApi = settingsApi as jest.Mocked<typeof settingsApi>

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </ChakraProvider>
)

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSettingsApi.getSettings = jest.fn().mockResolvedValue({
      theme: 'dark',
      language: 'ru',
      notifications: true,
      download_path: '/downloads',
      max_downloads: 3,
      upload_limit: 1000,
      auto_start: true
    })
  })

  it('показывает заголовок страницы настроек', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: /настройки/i })[0]).toBeInTheDocument()
    })
  })

  it('загружает настройки при инициализации', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(mockSettingsApi.getSettings).toHaveBeenCalled()
    })
  })

  it('показывает компонент настроек темы и языка', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn()
    })

    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/тема оформления/i)[0]).toBeInTheDocument()
    })
  })
})