import React from 'react'
import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'

describe('Icon Component', () => {
  // Тест 1: Рендеринг иконки с базовыми пропсами
  it('renders icon with default props', () => {
    const { container } = render(<Icon name="gamepad" />)
    const svg = container.querySelector('svg')
    
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  // Тест 2: Рендеринг иконки с кастомными размерами и цветом
  it('renders icon with custom size and color', () => {
    const customSize = 32
    const customColor = '#ff0000'
    
    const { container } = render(<Icon name="settings" size={customSize} color={customColor} />)
    const svg = container.querySelector('svg')
    
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', customSize.toString())
    expect(svg).toHaveAttribute('height', customSize.toString()) 
    expect(svg).toHaveAttribute('stroke', customColor)
  })

  // Тест 3: Рендеринг иконки с style и className
  it('renders icon with style and className', () => {
    const customStyle = { marginRight: '8px' }
    const customClass = 'test-icon'
    
    const { container } = render(<Icon name="user" style={customStyle} className={customClass} />)
    const svg = container.querySelector('svg')
    
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveStyle('margin-right: 8px')
    expect(svg).toHaveClass('test-icon')
  })

  // Дополнительный тест: Проверяем все доступные иконки
  it('renders all available icons correctly', () => {
    const iconNames = ['gamepad', 'library', 'download', 'stats', 'settings', 'user', 'search', 'add', 'edit', 'delete']
    
    iconNames.forEach(iconName => {
      const { container } = render(<Icon name={iconName} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.querySelector('path')).toBeInTheDocument()
    })
  })

  // Тест для несуществующей иконки
  it('returns null and logs warning for non-existent icon', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { container } = render(<Icon name="non-existent-icon" />)
    
    expect(container.firstChild).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Icon "non-existent-icon" not found')
    
    consoleSpy.mockRestore()
  })
})