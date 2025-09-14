import { render } from '@testing-library/react'
import AuthProvider from '../AuthProvider'

// Mock для next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('AuthProvider Component', () => {
  // Тест 1: Рендеринг дочерних элементов
  it('renders children correctly', () => {
    const TestChild = () => <div>Test Child</div>
    
    const { getByText } = render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })

  // Тест 2: Оборачивает детей в SessionProvider
  it('wraps children with SessionProvider', () => {
    const { container } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    )

    expect(container.firstChild).toContainHTML('<div>Content</div>')
  })

  // Тест 3: Работает без детей
  it('works without children', () => {
    const { container } = render(<AuthProvider>{null}</AuthProvider>)
    
    expect(container).toBeInTheDocument()
  })
})