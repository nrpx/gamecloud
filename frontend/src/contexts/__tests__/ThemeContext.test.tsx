import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Mock для localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock для matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', { 
  value: mockMatchMedia,
  writable: true
})

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })
  })

  // Тест 1: Инициализация с дефолтными значениями
  it('initializes with default values', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    expect(result.current.theme).toBe('system')
    expect(result.current.language).toBe('ru')
    expect(result.current.effectiveTheme).toBe('light')
  })

  // Тест 2: Переключение темы
  it('changes theme correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.effectiveTheme).toBe('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gamecloud-theme', 'dark')
  })

  // Тест 3: Переключение языка
  it('changes language correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.language).toBe('en')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gamecloud-language', 'en')
  })
})