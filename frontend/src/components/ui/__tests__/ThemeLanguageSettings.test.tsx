import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import ThemeLanguageSettings from '../ThemeLanguageSettings'

// Mock для ThemeContext
const mockSetTheme = jest.fn()
const mockSetLanguage = jest.fn()

const mockThemeContext = {
  theme: 'light',
  language: 'ru',
  effectiveTheme: 'light',
  setTheme: mockSetTheme,
  setLanguage: mockSetLanguage
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext
}))

// Wrapper для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('ThemeLanguageSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Рендеринг настроек темы и языка
  it('renders theme and language settings', () => {
    render(
      <TestWrapper>
        <ThemeLanguageSettings />
      </TestWrapper>
    )

    expect(screen.getByText(/тема оформления/i)).toBeInTheDocument()
    expect(screen.getByText(/язык интерфейса/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /🌙.*темная/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /☀️.*светлая/i })).toBeInTheDocument()
  })

  // Тест 2: Переключение темы
  it('changes theme when option is clicked', () => {
    render(
      <TestWrapper>
        <ThemeLanguageSettings />
      </TestWrapper>
    )

    const darkThemeButton = screen.getByRole('button', { name: /🌙.*темная/i })
    fireEvent.click(darkThemeButton)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  // Тест 3: Переключение языка
  it('changes language when option is clicked', () => {
    render(
      <TestWrapper>
        <ThemeLanguageSettings />
      </TestWrapper>
    )

    const englishButton = screen.getByRole('button', { name: /english/i })
    fireEvent.click(englishButton)

    expect(mockSetLanguage).toHaveBeenCalledWith('en')
  })
})