'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { useState } from 'react'

interface NotificationSettingsProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function NotificationSettings({ onSuccess, onCancel }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [downloadNotifications, setDownloadNotifications] = useState(true)
  const [gameUpdateNotifications, setGameUpdateNotifications] = useState(false)
  const [systemNotifications, setSystemNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Реализовать API вызов для сохранения настроек
      // const response = await fetch('/api/user/notification-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     emailNotifications,
      //     downloadNotifications,
      //     gameUpdateNotifications,
      //     systemNotifications
      //   })
      // })
      
      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (err) {
      setError('Ошибка при сохранении настроек')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Text fontSize="lg" fontWeight="semibold">
          Настройки уведомлений
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
              Настройки сохранены!
            </Text>
          </Box>
        )}

        <VStack gap={4} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Email уведомления</Text>
              <Text fontSize="sm" color="gray.600">
                Получать важные уведомления на email
              </Text>
            </Box>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Уведомления о загрузках</Text>
              <Text fontSize="sm" color="gray.600">
                Уведомления о завершении загрузки игр
              </Text>
            </Box>
            <input
              type="checkbox"
              checked={downloadNotifications}
              onChange={(e) => setDownloadNotifications(e.target.checked)}
            />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Обновления игр</Text>
              <Text fontSize="sm" color="gray.600">
                Уведомления о доступных обновлениях игр
              </Text>
            </Box>
            <input
              type="checkbox"
              checked={gameUpdateNotifications}
              onChange={(e) => setGameUpdateNotifications(e.target.checked)}
            />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="medium">Системные уведомления</Text>
              <Text fontSize="sm" color="gray.600">
                Уведомления о работе системы и обновлениях
              </Text>
            </Box>
            <input
              type="checkbox"
              checked={systemNotifications}
              onChange={(e) => setSystemNotifications(e.target.checked)}
            />
          </HStack>
        </VStack>

        <HStack gap={4} justify="flex-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            loading={isLoading}
          >
            <Icon name="notification" />
            Сохранить
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}