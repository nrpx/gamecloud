import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Обёртка с провайдерами для тестирования
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  )
}

// Кастомная функция рендеринга
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Переэкспортируем всё из testing-library
export * from '@testing-library/react'

// Переопределяем render
export { customRender as render }