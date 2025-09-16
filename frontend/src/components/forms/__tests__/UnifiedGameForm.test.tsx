/**
 * Тесты для единой формы создания/редактирования игр
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import UnifiedGameForm, { convertFormDataToCreateRequest } from '../UnifiedGameForm'
import { GameFormData } from '@/types/game-form'

// Mock для компонентов форм
jest.mock('../FormInput', () => ({
  FormInput: ({ name, label, placeholder, form, rules, error, isRequired, type }: any) => (
    <div>
      <label>{label}{isRequired && ' *'}</label>
      <input
        {...form.register(name, rules)}
        placeholder={placeholder}
        type={type || 'text'}
        data-testid={name}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  )
}))

jest.mock('../FormTextarea', () => ({
  FormTextarea: ({ name, label, placeholder, form, rules, error, rows }: any) => (
    <div>
      <label>{label}</label>
      <textarea
        {...form.register(name, rules)}
        placeholder={placeholder}
        rows={rows}
        data-testid={name}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  )
}))

jest.mock('../FormSelect', () => ({
  FormSelect: ({ name, label, placeholder, options, form, rules, error, isRequired }: any) => (
    <div>
      <label>{label}{isRequired && ' *'}</label>
      <select {...form.register(name, rules)} data-testid={name}>
        <option value="">{placeholder}</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </div>
  )
}))

jest.mock('../FormFile', () => ({
  FormFile: ({ name, label, accept, form, rules, error }: any) => (
    <div>
      <label>{label}</label>
      <input
        type="file"
        accept={accept}
        {...form.register(name, rules)}
        data-testid={name}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  )
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('UnifiedGameForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('рендерит форму создания игры с обязательными полями', () => {
    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    // Проверяем обязательные поля
    expect(screen.getByLabelText(/название игры \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/жанр \*/i)).toBeInTheDocument()
    
    // Проверяем необязательные поля
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/разработчик/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/год выпуска/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/steamgriddb id/i)).toBeInTheDocument()
  })

  it('рендерит форму редактирования с начальными данными', () => {
    const initialData: Partial<GameFormData> = {
      title: 'Test Game',
      genre: 'Action',
      description: 'Test Description',
      developer: 'Test Developer',
      releaseYear: 2024
    }

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    expect(screen.getByDisplayValue('Test Game')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Action')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Developer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024')).toBeInTheDocument()
  })

  it('показывает ошибки валидации для обязательных полей', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
          actions={<button type="submit">Создать</button>}
        />
      </TestWrapper>
    )

    // Пытаемся отправить пустую форму
    const submitButton = screen.getByRole('button', { name: /создать/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/это поле обязательно для заполнения/i)).toBeInTheDocument()
    })
  })

  it('переключает методы торрента', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    const methodSelect = screen.getByTestId('torrent.method')
    
    // По умолчанию должен быть URL
    expect(screen.getByTestId('torrent.url')).toBeInTheDocument()
    
    // Переключаем на файл
    await user.selectOptions(methodSelect, 'file')
    
    await waitFor(() => {
      expect(screen.getByTestId('torrent.file')).toBeInTheDocument()
      expect(screen.queryByTestId('torrent.url')).not.toBeInTheDocument()
    })
  })

  it('валидирует год выпуска', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    const yearInput = screen.getByTestId('releaseYear')
    
    // Вводим неверный год
    await user.clear(yearInput)
    await user.type(yearInput, '1900')
    
    await waitFor(() => {
      expect(screen.getByText(/год должен быть от 1970 до текущего года/i)).toBeInTheDocument()
    })
  })

  it('валидирует SteamGridDB ID', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    const steamgridInput = screen.getByTestId('steamgridId')
    
    // Вводим неверный ID (с буквами)
    await user.clear(steamgridInput)
    await user.type(steamgridInput, 'abc123')
    
    // Проверяем что поле содержит некорректное значение
    expect(steamgridInput).toHaveValue('abc123')
    
    // Заполняем обязательные поля для корректной отправки
    const titleInput = screen.getByTestId('title')
    const genreSelect = screen.getByTestId('genre')
    
    await user.type(titleInput, 'Test Game')
    await user.selectOptions(genreSelect, 'Action')
    
    // Пытаемся отправить форму чтобы запустить валидацию
    const submitButton = screen.getByRole('button', { name: /создать/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      // Форма не должна отправиться с некорректными данными
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('отправляет корректные данные формы', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    // Заполняем форму
    await user.type(screen.getByTestId('title'), 'Test Game')
    await user.selectOptions(screen.getByTestId('genre'), 'Action')
    await user.type(screen.getByTestId('description'), 'Test Description')
    await user.type(screen.getByTestId('developer'), 'Test Developer')
    await user.type(screen.getByTestId('releaseYear'), '2024')
    await user.type(screen.getByTestId('torrent.url'), 'magnet:?xt=urn:btih:test')

    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /создать/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Game',
          genre: 'Action',
          description: 'Test Description',
          developer: 'Test Developer',
          releaseYear: 2024, // Должно быть сконвертировано в число
          steamgridId: undefined, // Пустые строки должны стать undefined
          images: expect.objectContaining({
            grid: undefined,
            hero: undefined,
            logo: undefined,
            icon: undefined
          }),
          torrent: expect.objectContaining({
            method: 'url',
            url: 'magnet:?xt=urn:btih:test',
            file: undefined
          })
        })
      )
    })
  })

  it('валидирует URL изображений', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <UnifiedGameForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    )

    const gridImageInput = screen.getByTestId('images.grid')
    
    // Вводим неверный URL
    await user.clear(gridImageInput)
    await user.type(gridImageInput, 'invalid-url')
    
    // Проверяем что поле содержит некорректное значение
    expect(gridImageInput).toHaveValue('invalid-url')
    
    // Заполняем обязательные поля
    const titleInput = screen.getByTestId('title')
    const genreSelect = screen.getByTestId('genre')
    
    await user.type(titleInput, 'Test Game')
    await user.selectOptions(genreSelect, 'Action')
    
    // Пытаемся отправить форму чтобы запустить валидацию
    const submitButton = screen.getByRole('button', { name: /создать/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      // Форма не должна отправиться с некорректными данными
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})

describe('convertFormDataToCreateRequest', () => {
  it('правильно преобразует данные формы в запрос API', () => {
    const formData: GameFormData = {
      title: 'Test Game',
      genre: 'Action',
      description: 'Test Description',
      developer: 'Test Developer',
      releaseYear: 2024,
      steamgridId: '123456',
      images: {
        grid: 'https://example.com/grid.jpg',
        hero: 'https://example.com/hero.jpg',
        logo: 'https://example.com/logo.png',
        icon: 'https://example.com/icon.png'
      },
      torrent: {
        method: 'url',
        url: 'magnet:?xt=urn:btih:test'
      }
    }

    const result = convertFormDataToCreateRequest(formData)

    expect(result).toEqual({
      title: 'Test Game',
      description: 'Test Description',
      genre: 'Action',
      developer: 'Test Developer',
      release_year: 2024,
      steamgriddb_id: '123456',
      grid_image_url: 'https://example.com/grid.jpg',
      hero_image_url: 'https://example.com/hero.jpg',
      logo_image_url: 'https://example.com/logo.png',
      icon_image_url: 'https://example.com/icon.png',
      torrent_url: 'magnet:?xt=urn:btih:test'
    })
  })

  it('обрабатывает пустые необязательные поля', () => {
    const formData: GameFormData = {
      title: 'Test Game',
      genre: 'Action'
    }

    const result = convertFormDataToCreateRequest(formData)

    expect(result).toEqual({
      title: 'Test Game',
      description: undefined, // convertFormDataToCreateRequest не обрабатывает пустые строки
      genre: 'Action',
      developer: undefined,
      release_year: undefined,
      steamgriddb_id: undefined,
      grid_image_url: undefined,
      hero_image_url: undefined,
      logo_image_url: undefined,
      icon_image_url: undefined,
      torrent_url: undefined
    })
  })
})