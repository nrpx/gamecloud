import '@testing-library/jest-dom'

// Полифил для structuredClone (Node.js < 18)
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    if (obj === undefined) return undefined
    if (obj === null) return null
    if (typeof obj !== 'object') return obj
    
    try {
      // Обрабатываем объекты рекурсивно, чтобы избежать ошибок с undefined значениями
      const cloneObj = (source) => {
        if (source === null || source === undefined) return source
        if (typeof source !== 'object') return source
        if (source instanceof Date) return new Date(source.getTime())
        if (Array.isArray(source)) return source.map(cloneObj)
        
        const result = {}
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            const value = source[key]
            result[key] = value === undefined ? undefined : cloneObj(value)
          }
        }
        return result
      }
      
      return cloneObj(obj)
    } catch (e) {
      // Fallback для простых случаев
      try {
        return JSON.parse(JSON.stringify(obj))
      } catch (e2) {
        return obj
      }
    }
  }
}

// Глобальные моки
global.fetch = jest.fn()

// Мок для IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Мок для ResizeObserver  
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Мок для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Мок для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Мок для sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

import '@testing-library/jest-dom'

// Полифил для structuredClone (Node.js < 18)
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    if (obj === undefined || obj === null) return obj
    if (typeof obj !== 'object') return obj
    if (obj instanceof Function) return obj
    if (obj instanceof RegExp) return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    try {
      return JSON.parse(JSON.stringify(obj))
    } catch (e) {
      // Для сложных объектов используем простое копирование
      if (Array.isArray(obj)) {
        return obj.map(item => global.structuredClone(item))
      }
      const copy = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = global.structuredClone(obj[key])
        }
      }
      return copy
    }
  }
}

// Глобальные моки
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

// Мок для WebSocket
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}))

// Мок для next-auth - базовая версия
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'loading'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))
global.WebSocket = class WebSocket {
  constructor() {
    this.readyState = 1
  }
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

// Мок для next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Мок для next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Мок для next/link
jest.mock('next/link', () => {
  return ({ children }) => children
})