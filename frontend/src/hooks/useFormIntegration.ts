import { useEffect, useCallback } from 'react'
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'

/**
 * Хук для синхронизации формы с внешним состоянием (например, Zustand store)
 */
export function useFormSync<T extends FieldValues>(
  form: UseFormReturn<T>,
  data: Partial<T> | null | undefined,
  options?: {
    resetOnDataChange?: boolean
    watch?: Path<T>[]
  }
) {
  const { reset, watch } = form
  const { resetOnDataChange = true, watch: watchFields } = options || {}

  // Стабилизируем функцию reset
  const stableReset = useCallback((newData: T) => {
    reset(newData)
  }, [reset])

  // Синхронизация при изменении внешних данных
  useEffect(() => {
    if (data && resetOnDataChange) {
      stableReset(data as T)
    }
  }, [data, stableReset, resetOnDataChange])

  // Возвращаем текущие значения если нужно следить за изменениями
  const watchedValues = watchFields ? watch(watchFields) : undefined

  return {
    watchedValues,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
  }
}

/**
 * Хук для автосохранения формы
 */
export function useFormAutoSave<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSave: (data: T) => Promise<void> | void,
  options?: {
    debounceMs?: number
    watchFields?: Path<T>[]
    enabled?: boolean
  }
) {
  const { watch } = form
  const { debounceMs = 1000, watchFields, enabled = true } = options || {}

  useEffect(() => {
    if (!enabled) return

    let timeoutId: NodeJS.Timeout

    const subscription = watch((data, { name }) => {
      // Если указаны конкретные поля для отслеживания, проверяем их
      if (watchFields && name && !watchFields.includes(name as Path<T>)) {
        return
      }

      // Проверяем валидность формы перед сохранением
      form.trigger().then((isValid) => {
        if (isValid) {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            onSave(data as T)
          }, debounceMs)
        }
      })
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [watch, onSave, debounceMs, watchFields, enabled, form])
}

/**
 * Хук для связи формы с Zustand store для игр
 */
export function useGameFormStore<T extends FieldValues>(
  form: UseFormReturn<T>,
  gameId?: string | null
) {
  // Здесь можно добавить специфичную логику для работы с игровым store
  // Например, загрузка данных игры, автосохранение и т.д.
  
  return {
    // Можно добавить методы для работы с игровым store
    loadGame: (id: string) => {
      // Логика загрузки игры и заполнения формы
    },
    saveGame: () => {
      // Логика сохранения игры из формы
    },
    resetGame: () => {
      // Логика сброса формы
      form.reset()
    }
  }
}

/**
 * Хук для связи формы профиля с сессией пользователя
 */
export function useProfileFormSession<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  // Можно добавить интеграцию с NextAuth сессией
  return {
    loadFromSession: () => {
      // Логика загрузки данных из сессии
    },
    updateSession: () => {
      // Логика обновления сессии
    }
  }
}

/**
 * Хук для обработки ошибок формы с интеграцией Toast уведомлений
 */
export function useFormErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  showError: (message: string) => void
) {
  const { formState: { errors } } = form

  useEffect(() => {
    // Показываем первую ошибку валидации как Toast
    const firstError = Object.values(errors)[0]
    if (firstError?.message) {
      showError(firstError.message as string)
    }
  }, [errors, showError])

  return {
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
    firstError: Object.values(errors)[0]?.message as string | undefined,
  }
}