'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface EditProfileFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditProfileForm({ onSuccess, onCancel }: EditProfileFormProps) {
  const { data: session, update } = useSession()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Загружаем текущие данные пользователя
  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || '')
      setEmail(session.user.email || '')
      setBio('') // TODO: добавить поле bio в схему пользователя
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Базовая валидация
    if (!displayName.trim()) {
      setError('Имя не может быть пустым')
      return
    }

    if (!email.trim()) {
      setError('Email не может быть пустым')
      return
    }

    // Простая проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Введите корректный email адрес')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Здесь будет API запрос для обновления профиля
      // await userApi.updateProfile({ displayName, email, bio })
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Обновляем сессию с новыми данными
      await update({
        ...session,
        user: {
          ...session?.user,
          name: displayName,
          email: email,
        }
      })
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        setSuccess(false)
      }, 2000)

    } catch (err) {
      setError('Ошибка при обновлении профиля. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Восстанавливаем исходные значения
    if (session?.user) {
      setDisplayName(session.user.name || '')
      setEmail(session.user.email || '')
      setBio('')
    }
    setError(null)
    setSuccess(false)
    onCancel?.()
  }

  return (
    <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          <Icon name="edit" size={20} style={{ marginRight: '8px', display: 'inline' }} />
          Редактировать профиль
        </Text>

        {error && (
          <Box p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
            <Text color="red.600" fontSize="sm">
              ❌ {error}
            </Text>
          </Box>
        )}

        {success && (
          <Box p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
            <Text color="green.600" fontSize="sm">
              ✅ Профиль успешно обновлен!
            </Text>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <VStack align="stretch" gap={2}>
              <Text fontWeight="medium">Отображаемое имя</Text>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите ваше имя"
                disabled={isLoading}
              />
              <Text fontSize="xs" color="fg.muted">
                Это имя будет отображаться в интерфейсе
              </Text>
            </VStack>

            <VStack align="stretch" gap={2}>
              <Text fontWeight="medium">Email адрес</Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              <Text fontSize="xs" color="fg.muted">
                Используется для уведомлений и восстановления пароля
              </Text>
            </VStack>

            <VStack align="stretch" gap={2}>
              <Text fontWeight="medium">Описание профиля</Text>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите немного о себе (необязательно)"
                disabled={isLoading}
                rows={3}
              />
              <Text fontSize="xs" color="fg.muted">
                Краткое описание, которое будет видно другим пользователям
              </Text>
            </VStack>

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
                loading={isLoading}
                disabled={isLoading || success}
                flex="1"
              >
                Сохранить изменения
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
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