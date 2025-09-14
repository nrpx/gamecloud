import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import BrandButton from '../BrandButton'

// Обёртка с Chakra Provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('BrandButton Component', () => {
  // Тест 1: Рендеринг кнопки с базовыми пропсами
  it('renders button with default props', () => {
    renderWithProvider(<BrandButton>Test Button</BrandButton>)
    
    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Test Button')
  })

  // Тест 2: Рендеринг кнопки с иконкой
  it('renders button with icon', () => {
    const { container } = renderWithProvider(
      <BrandButton icon="gamepad">Play Game</BrandButton>
    )
    
    const button = screen.getByRole('button', { name: /play game/i })
    const icon = container.querySelector('svg')
    
    expect(button).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(button).toHaveTextContent('Play Game')
  })

  // Тест 3: Обработка клика по кнопке
  it('handles click events', () => {
    const handleClick = jest.fn()
    
    renderWithProvider(
      <BrandButton onClick={handleClick}>Click Me</BrandButton>
    )
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Дополнительный тест: Проверка кастомных пропсов
  it('applies custom colorScheme', () => {
    renderWithProvider(
      <BrandButton colorScheme="red" data-testid="custom-button">
        Custom Button
      </BrandButton>
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toBeInTheDocument()
  })
})