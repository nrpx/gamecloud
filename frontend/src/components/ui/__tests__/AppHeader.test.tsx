import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { AppHeader } from '../AppHeader'

// Мок для next-auth/react
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER'
  }
}

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession, status: 'authenticated' }),
  signOut: jest.fn(),
}))

// Мок для next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}))

// Мокаем ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    language: 'ru',
    setTheme: jest.fn(),
    setLanguage: jest.fn(),
    effectiveTheme: 'dark'
  })
}))

// Обёртка с провайдерами
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('AppHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Рендеринг заголовка с пользователем
  it('renders header with authenticated user', () => {
    renderWithProvider(<AppHeader />)
    
    expect(screen.getByText('GameCloud')).toBeInTheDocument()
    // Убираем проверку имени пользователя, так как оно не отображается в компоненте
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })

  // Тест 2: Обработка клика по кнопке выхода
  it('handles sign out button click', () => {
    renderWithProvider(<AppHeader />)
    
    const signOutButton = screen.getByRole('button', { name: 'Выйти' })
    fireEvent.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  // Тест 3: Рендеринг навигационных ссылок
  it('renders navigation links', () => {
    const { container } = renderWithProvider(<AppHeader />)
    
    // Проверяем наличие кнопок через title атрибут
    expect(screen.getByRole('button', { name: 'Библиотека игр' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Торренты' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Статистика' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Настройки' })).toBeInTheDocument()
  })
})