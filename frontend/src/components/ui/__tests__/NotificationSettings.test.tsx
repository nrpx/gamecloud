import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import NotificationSettings from '../NotificationSettings'

// Wrapper для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('NotificationSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Рендеринг с настройками по умолчанию
  it('renders with default notification settings', () => {
    render(
      <TestWrapper>
        <NotificationSettings />
      </TestWrapper>
    )

    expect(screen.getByText('Настройки уведомлений')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument()
  })

  // Тест 2: Переключение настроек уведомлений
  it('toggles notification settings', async () => {
    render(
      <TestWrapper>
        <NotificationSettings />
      </TestWrapper>
    )

    // Используем getAllByRole для получения всех чекбоксов по порядку
    const checkboxes = screen.getAllByRole('checkbox')
    const emailToggle = checkboxes[0] // Первый чекбокс - Email уведомления
    
    expect(emailToggle).toBeChecked()
    
    fireEvent.click(emailToggle)
    
    await waitFor(() => {
      expect(emailToggle).not.toBeChecked()
    })
  })

  // Тест 3: Сохранение настроек
  it('saves notification settings successfully', async () => {
    const mockOnSuccess = jest.fn()
    
    render(
      <TestWrapper>
        <NotificationSettings onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const saveButton = screen.getByRole('button', { name: /сохранить/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})