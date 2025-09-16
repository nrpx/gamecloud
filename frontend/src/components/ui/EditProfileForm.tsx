'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { showError, showSuccess } from '@/lib/toast'
import { FormInput, FormTextarea } from '@/components/forms'
import { VALIDATION_RULES } from '@/lib/validation'
import { useFormSync } from '@/hooks/useFormIntegration'

interface ProfileFormData {
  displayName: string
  email: string
  bio: string
}

interface EditProfileFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditProfileForm({ onSuccess, onCancel }: EditProfileFormProps) {
  const { data: session, update } = useSession()
  
  const form = useForm<ProfileFormData>({
    defaultValues: {
      displayName: '',
      email: '',
      bio: '',
    },
    mode: 'onBlur',
  })

  const { handleSubmit, formState: { isSubmitting, isDirty } } = form

  // Мемоизируем данные для синхронизации, чтобы избежать бесконечного цикла
  const syncData = useMemo(() => ({
    displayName: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '', // TODO: добавить поле bio в схему пользователя
  }), [session?.user?.name, session?.user?.email])

  // Синхронизируем форму с данными сессии
  useFormSync(form, syncData)

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Здесь будет API запрос для обновления профиля
      // await userApi.updateProfile(data)
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Обновляем сессию с новыми данными
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.displayName,
          email: data.email,
        }
      })
      
      showSuccess('Профиль обновлен успешно!')
      setTimeout(() => {
        onSuccess?.()
      }, 2000)

    } catch (err) {
      showError('Ошибка при обновлении профиля. Попробуйте снова.')
    }
  }

  const handleCancel = () => {
    // Сбрасываем форму к исходным значениям
    form.reset({
      displayName: session?.user?.name || '',
      email: session?.user?.email || '',
      bio: '',
    })
    onCancel?.()
  }

  return (
    <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          <Icon name="edit" size={20} style={{ marginRight: '8px', display: 'inline' }} />
          Редактировать профиль
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} align="stretch">
            <FormInput
              name="displayName"
              label="Отображаемое имя"
              placeholder="Введите ваше имя"
              helperText="Это имя будет отображаться в интерфейсе"
              form={form}
              rules={VALIDATION_RULES.username}
              isDisabled={isSubmitting}
              isRequired
            />

            <FormInput
              name="email"
              label="Email адрес"
              type="email"
              placeholder="your.email@example.com"
              helperText="Используется для уведомлений и восстановления пароля"
              form={form}
              rules={VALIDATION_RULES.email}
              isDisabled={isSubmitting}
              isRequired
            />

            <FormTextarea
              name="bio"
              label="Описание профиля"
              placeholder="Расскажите немного о себе (необязательно)"
              helperText="Краткое описание, которое будет видно другим пользователям"
              form={form}
              rules={VALIDATION_RULES.bio}
              isDisabled={isSubmitting}
              rows={3}
            />

            <Box p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="sm" color="blue.600">
                💡 Информация о конфиденциальности:
              </Text>
              <Text fontSize="xs" color="blue.600" mt={1}>
                Ваши данные используются только для работы сервиса и не передаются третьим лицам
              </Text>
            </Box>

            <HStack gap={3} pt={2}>
              <Button
                type="submit"
                colorScheme="green"
                loading={isSubmitting}
                disabled={isSubmitting || !isDirty}
                flex="1"
              >
                Сохранить изменения
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                flex="1"
              >
                Отменить
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}