'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { useState } from 'react'

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Заполните все поля')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают')
      return
    }

    if (newPassword.length < 8) {
      setError('Новый пароль должен содержать минимум 8 символов')
      return
    }

    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500)
      }
    } catch (err) {
      setError('Ошибка при смене пароля')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={6} align="stretch">
        <Text fontSize="lg" fontWeight="semibold">
          Изменить пароль
        </Text>

        {error && (
          <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.600" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {success && (
          <Box p={3} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="md">
            <Text color="green.600" fontSize="sm">
              Пароль успешно изменён!
            </Text>
          </Box>
        )}

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Текущий пароль *
          </Text>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Введите текущий пароль"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Новый пароль *
          </Text>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Введите новый пароль"
            required
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Подтвердите новый пароль *
          </Text>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Подтвердите новый пароль"
            required
          />
        </Box>

        <HStack gap={4} justify="flex-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            loading={isLoading}
          >
            Сохранить
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}