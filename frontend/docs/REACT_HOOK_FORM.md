# React Hook Form Integration для GameCloud

Этот документ описывает интеграцию react-hook-form с ChakraUI и Zustand в проекте GameCloud.

## Архитектура

### Компоненты форм
- **FormFieldWrapper** - базовый wrapper для полей формы
- **FormInput** - поле ввода с валидацией
- **FormTextarea** - многострочное поле ввода
- **FormSelect** - выпадающий список
- **FormFile** - загрузка файлов

### Утилиты
- **validation.ts** - правила валидации и константы
- **useFormIntegration.ts** - хуки для интеграции с Zustand

## Быстрый старт

### 1. Базовая форма

```tsx
import { useForm } from 'react-hook-form'
import { FormInput, FormTextarea, FormSelect } from '@/components/forms'
import { VALIDATION_RULES } from '@/lib/validation'

interface MyFormData {
  title: string
  description: string
  category: string
}

export const MyForm = () => {
  const form = useForm<MyFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
    mode: 'onBlur', // Валидация при потере фокуса
  })

  const { handleSubmit, formState: { isSubmitting } } = form

  const onSubmit = async (data: MyFormData) => {
    console.log('Form data:', data)
    // Отправка данных
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4}>
        <FormInput
          name="title"
          label="Название"
          placeholder="Введите название"
          form={form}
          rules={VALIDATION_RULES.gameTitle}
          isRequired
          isDisabled={isSubmitting}
        />

        <FormTextarea
          name="description"
          label="Описание"
          placeholder="Введите описание"
          form={form}
          rules={VALIDATION_RULES.gameDescription}
          isDisabled={isSubmitting}
        />

        <FormSelect
          name="category"
          label="Категория"
          placeholder="Выберите категорию"
          options={[
            { value: 'games', label: 'Игры' },
            { value: 'apps', label: 'Приложения' },
          ]}
          form={form}
          rules={VALIDATION_RULES.required}
          isRequired
          isDisabled={isSubmitting}
        />

        <Button type="submit" loading={isSubmitting}>
          Сохранить
        </Button>
      </VStack>
    </form>
  )
}
```

### 2. Форма с загрузкой файлов

```tsx
import { FormFile } from '@/components/forms'

// В компоненте формы
<FormFile
  name="torrentFile"
  label="Торрент-файл"
  placeholder="Выберите .torrent файл"
  buttonText="Выбрать файл"
  accept=".torrent"
  form={form}
  rules={VALIDATION_RULES.required}
  isRequired
  maxSizeMB={10}
  allowedTypes={['.torrent']}
/>
```

### 3. Интеграция с Zustand

```tsx
import { useFormSync, useFormAutoSave } from '@/hooks/useFormIntegration'

export const ProfileForm = () => {
  const form = useForm<ProfileData>()
  const { user, updateUser } = useUserStore()

  // Синхронизация с внешним состоянием
  useFormSync(form, user, {
    resetOnDataChange: true,
  })

  // Автосохранение (опционально)
  useFormAutoSave(form, updateUser, {
    debounceMs: 1000,
    enabled: form.formState.isDirty,
  })

  // ... остальной код формы
}
```

## API Компонентов

### FormInput

```tsx
interface FormInputProps<T extends FieldValues> {
  name: Path<T>              // Имя поля (обязательно)
  label?: string             // Подпись поля
  placeholder?: string       // Placeholder
  type?: string             // Тип input (text, email, password, etc.)
  helperText?: string       // Текст подсказки
  isRequired?: boolean      // Обязательное поле
  isDisabled?: boolean      // Отключенное поле
  form: UseFormReturn<T>    // Объект формы из useForm
  rules?: RegisterOptions   // Правила валидации
  inputProps?: Partial<InputProps> // Дополнительные props для Input
}
```

### FormTextarea

```tsx
interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  rows?: number             // Количество строк
  helperText?: string
  isRequired?: boolean
  isDisabled?: boolean
  form: UseFormReturn<T>
  rules?: RegisterOptions
  textareaProps?: Partial<TextareaProps>
}
```

### FormSelect

```tsx
interface FormSelectProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  options: Array<{ value: string; label: string }> // Опции для выбора
  helperText?: string
  isRequired?: boolean
  isDisabled?: boolean
  form: UseFormReturn<T>
  rules?: RegisterOptions
}
```

### FormFile

```tsx
interface FormFileProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  buttonText?: string       // Текст кнопки
  accept?: string          // MIME типы файлов
  multiple?: boolean       // Множественный выбор
  maxSizeMB?: number      // Максимальный размер в MB
  allowedTypes?: string[] // Разрешенные расширения
  helperText?: string
  isRequired?: boolean
  isDisabled?: boolean
  form: UseFormReturn<T>
  rules?: RegisterOptions
}
```

## Правила валидации

### Предустановленные правила

```tsx
import { VALIDATION_RULES } from '@/lib/validation'

// Примеры использования
VALIDATION_RULES.required        // Обязательное поле
VALIDATION_RULES.email          // Email валидация
VALIDATION_RULES.password       // Пароль (мин. 6 символов)
VALIDATION_RULES.gameTitle      // Название игры (2-100 символов)
VALIDATION_RULES.gameDescription // Описание игры (макс. 1000 символов)
VALIDATION_RULES.gameGenre      // Жанр игры (обязательно)
VALIDATION_RULES.gameImageUrl   // URL изображения
VALIDATION_RULES.torrentUrl     // URL торрента
VALIDATION_RULES.username       // Имя пользователя (3-30 символов)
VALIDATION_RULES.bio           // Биография (макс. 500 символов)
```

### Создание кастомных правил

```tsx
import { createMinLengthRule, createMaxLengthRule, createPatternRule } from '@/lib/validation'

// Минимальная длина
const minRule = createMinLengthRule(5)

// Максимальная длина  
const maxRule = createMaxLengthRule(50)

// Паттерн
const phoneRule = createPatternRule(
  /^\\+?[1-9]\\d{1,14}$/,
  'Введите корректный номер телефона'
)

// Комбинированные правила
const customRules = {
  ...VALIDATION_RULES.required,
  ...minRule,
  ...maxRule,
}
```

## Интеграционные хуки

### useFormSync

Синхронизирует форму с внешним состоянием:

```tsx
const { watchedValues, isDirty, isValid } = useFormSync(form, externalData, {
  resetOnDataChange: true,    // Сбрасывать при изменении внешних данных
  watch: ['field1', 'field2'] // Отслеживать конкретные поля
})
```

### useFormAutoSave

Автоматически сохраняет изменения формы:

```tsx
useFormAutoSave(form, saveFunction, {
  debounceMs: 1000,          // Задержка перед сохранением
  watchFields: ['title'],     // Отслеживать только указанные поля
  enabled: isDirty,          // Включить/выключить автосохранение
})
```

### useFormErrorHandler

Обрабатывает ошибки формы с Toast уведомлениями:

```tsx
const { hasErrors, errorCount, firstError } = useFormErrorHandler(form, showError)
```

## Примеры реальных форм

### 1. Форма профиля (EditProfileForm)

```tsx
// Файл: src/components/ui/EditProfileForm.tsx
import { useForm } from 'react-hook-form'
import { FormInput, FormTextarea } from '@/components/forms'
import { VALIDATION_RULES } from '@/lib/validation'
import { useFormSync } from '@/hooks/useFormIntegration'

interface ProfileFormData {
  displayName: string
  email: string
  bio: string
}

export default function EditProfileForm({ onSuccess, onCancel }) {
  const { data: session, update } = useSession()
  
  const form = useForm<ProfileFormData>({
    defaultValues: {
      displayName: '',
      email: '',
      bio: '',
    },
    mode: 'onBlur',
  })

  // Синхронизация с сессией
  useFormSync(form, {
    displayName: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
  })

  const onSubmit = async (data: ProfileFormData) => {
    // Логика сохранения...
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <VStack gap={4}>
        <FormInput
          name="displayName"
          label="Отображаемое имя"
          form={form}
          rules={VALIDATION_RULES.username}
          isRequired
        />
        
        <FormInput
          name="email"
          label="Email адрес"
          type="email"
          form={form}
          rules={VALIDATION_RULES.email}
          isRequired
        />
        
        <FormTextarea
          name="bio"
          label="Описание профиля"
          form={form}
          rules={VALIDATION_RULES.bio}
        />
        
        <Button type="submit" loading={form.formState.isSubmitting}>
          Сохранить
        </Button>
      </VStack>
    </form>
  )
}
```

### 2. Форма добавления игры (GameFormWithHookForm)

```tsx
// Файл: src/components/forms/GameFormWithHookForm.tsx
import { useForm } from 'react-hook-form'
import { FormInput, FormTextarea, FormSelect, FormFile } from '@/components/forms'
import { VALIDATION_RULES } from '@/lib/validation'
import { CompleteGameFormData, GAME_GENRES, TORRENT_METHODS } from '@/types/forms'

export const GameFormWithHookForm = ({ onSuccess, onCancel }) => {
  const form = useForm<CompleteGameFormData>({
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      imageUrl: '',
      torrent: {
        method: 'url',
        url: '',
        file: null,
      },
    },
    mode: 'onBlur',
  })

  const torrentMethod = form.watch('torrent.method')

  const onSubmit = async (data: CompleteGameFormData) => {
    // Логика добавления игры...
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <VStack gap={6}>
        {/* Информация об игре */}
        <FormInput
          name="title"
          label="Название игры"
          form={form}
          rules={VALIDATION_RULES.gameTitle}
          isRequired
        />

        <FormSelect
          name="genre"
          label="Жанр"
          options={GAME_GENRES}
          form={form}
          rules={VALIDATION_RULES.gameGenre}
          isRequired
        />

        <FormTextarea
          name="description"
          label="Описание"
          form={form}
          rules={VALIDATION_RULES.gameDescription}
        />

        <FormInput
          name="imageUrl"
          label="URL изображения"
          form={form}
          rules={VALIDATION_RULES.gameImageUrl}
        />

        {/* Торрент */}
        <FormSelect
          name="torrent.method"
          label="Способ загрузки торрента"
          options={TORRENT_METHODS}
          form={form}
          isRequired
        />

        {torrentMethod === 'url' ? (
          <FormInput
            name="torrent.url"
            label="URL торрент-файла"
            form={form}
            rules={VALIDATION_RULES.torrentUrl}
            isRequired
          />
        ) : (
          <FormFile
            name="torrent.file"
            label="Торрент-файл"
            accept=".torrent"
            form={form}
            isRequired
            maxSizeMB={10}
            allowedTypes={['.torrent']}
          />
        )}

        <Button type="submit" loading={form.formState.isSubmitting}>
          Добавить игру
        </Button>
      </VStack>
    </form>
  )
}
```

## Best Practices

### 1. Структура формы

- Используйте TypeScript интерфейсы для типизации данных формы
- Определяйте defaultValues для всех полей
- Используйте mode: 'onBlur' для валидации при потере фокуса

### 2. Валидация

- Используйте предустановленные правила из VALIDATION_RULES
- Создавайте кастомные правила через хелперы
- Показывайте ошибки через Toast уведомления

### 3. UX

- Отключайте кнопки submit во время отправки
- Показывайте loading состояния
- Используйте isDirty для предотвращения случайных отправок
- Добавляйте helper text для сложных полей

### 4. Производительность

- Используйте useFormSync для синхронизации с внешним состоянием
- Применяйте useFormAutoSave для автосохранения (с осторожностью)
- Избегайте избыточных re-render через правильное использование watch

## Миграция со старых форм

### Шаги миграции:

1. **Установить типы**
   ```tsx
   interface FormData {
     field1: string
     field2: string
   }
   ```

2. **Заменить useState на useForm**
   ```tsx
   // Было
   const [field1, setField1] = useState('')
   const [field2, setField2] = useState('')

   // Стало
   const form = useForm<FormData>({
     defaultValues: { field1: '', field2: '' }
   })
   ```

3. **Заменить Input на FormInput**
   ```tsx
   // Было
   <Input 
     value={field1} 
     onChange={(e) => setField1(e.target.value)} 
   />

   // Стало
   <FormInput 
     name="field1" 
     form={form} 
     rules={VALIDATION_RULES.required}
   />
   ```

4. **Обновить обработчик submit**
   ```tsx
   // Было
   const handleSubmit = (e) => {
     e.preventDefault()
     // валидация вручную
     if (!field1) return
     // отправка
   }

   // Стало
   const onSubmit = (data: FormData) => {
     // data уже валидные
     // отправка
   }
   
   <form onSubmit={form.handleSubmit(onSubmit)}>
   ```

## Поддержка

При возникновении вопросов:
1. Проверьте примеры в этой документации
2. Изучите существующие формы в проекте
3. Обратитесь к официальной документации react-hook-form: https://react-hook-form.com/
