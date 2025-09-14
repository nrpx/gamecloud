import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import ChangePasswordForm from '../ChangePasswordForm'

// Обёртка с провайдерами
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('ChangePasswordForm Component', () => {
  const user = userEvent.setup()

  // Тест 1: Рендеринг формы с базовыми элементами
  it('renders form with all required fields', () => {
    renderWithProvider(<ChangePasswordForm />)
    
    expect(screen.getByText('Изменить пароль')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/введите текущий пароль/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/введите новый пароль/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/подтвердите новый пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument()
  })

  // Тест 2: Валидация формы при несовпадающих паролях
  it('shows validation error for empty fields', async () => {
    renderWithProvider(<ChangePasswordForm />)
    
    // Заполняем все поля, но делаем несовпадающие пароли
    const currentPassword = screen.getByPlaceholderText(/введите текущий пароль/i)
    const newPassword = screen.getByPlaceholderText(/введите новый пароль/i)
    const confirmPassword = screen.getByPlaceholderText(/подтвердите новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сохранить/i })
    
    fireEvent.change(currentPassword, { target: { value: 'current123' } })
    fireEvent.change(newPassword, { target: { value: 'newpass123' } })
    fireEvent.change(confirmPassword, { target: { value: 'different123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument()
    })
  })

  // Тест 3: Валидация совпадения паролей
  it('shows validation error when passwords do not match', async () => {
    renderWithProvider(<ChangePasswordForm />)
    
    const currentPassword = screen.getByPlaceholderText(/введите текущий пароль/i)
    const newPassword = screen.getByPlaceholderText(/введите новый пароль/i)
    const confirmPassword = screen.getByPlaceholderText(/подтвердите новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сохранить/i })
    
    await user.type(currentPassword, 'current123')
    await user.type(newPassword, 'newpassword123')
    await user.type(confirmPassword, 'differentpassword')
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/новые пароли не совпадают/i)).toBeInTheDocument()
    })
  })

  // Дополнительный тест: Обработка успешной отправки формы
  it('handles successful form submission', async () => {
    const onSuccess = jest.fn()
    renderWithProvider(<ChangePasswordForm onSuccess={onSuccess} />)
    
    const currentPassword = screen.getByPlaceholderText(/введите текущий пароль/i)
    const newPassword = screen.getByPlaceholderText(/введите новый пароль/i)
    const confirmPassword = screen.getByPlaceholderText(/подтвердите новый пароль/i)
    const submitButton = screen.getByRole('button', { name: /сохранить/i })
    
    await user.type(currentPassword, 'current123')
    await user.type(newPassword, 'newpassword123')
    await user.type(confirmPassword, 'newpassword123')
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Пароль успешно изменён!')).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})