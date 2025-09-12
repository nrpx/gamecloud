'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  Input,
  Separator
} from '@chakra-ui/react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    downloadPath: '/home/user/Downloads/Games',
    maxDownloads: 3,
    uploadLimit: 1000,
    autoStart: true,
    notifications: true,
    theme: 'system',
    language: 'ru'
  })

  const handleSaveSettings = async () => {
    // Здесь будет отправка настроек на backend
    console.log('Сохранение настроек:', settings)
    // Временная имитация сохранения
    alert('Настройки сохранены!')
  }

  const handleResetSettings = () => {
    setSettings({
      downloadPath: '/home/user/Downloads/Games',
      maxDownloads: 3,
      uploadLimit: 1000,
      autoStart: true,
      notifications: true,
      theme: 'system',
      language: 'ru'
    })
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="green.600">
              ⚙️ Настройки
            </Heading>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box maxW="4xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Download Settings */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <VStack gap={6} align="stretch">
              <Heading size="md" color="green.600">
                📥 Настройки загрузки
              </Heading>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Папка для загрузок</Text>
                <Input
                  value={settings.downloadPath}
                  onChange={(e) => setSettings({...settings, downloadPath: e.target.value})}
                  placeholder="/path/to/downloads"
                />
                <Text fontSize="sm" color="gray.500">
                  Укажите путь где будут сохраняться загруженные игры
                </Text>
              </VStack>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Максимальное количество одновременных загрузок</Text>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxDownloads}
                  onChange={(e) => setSettings({...settings, maxDownloads: parseInt(e.target.value) || 1})}
                />
              </VStack>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Ограничение скорости отдачи (КБ/с)</Text>
                <Input
                  type="number"
                  value={settings.uploadLimit}
                  onChange={(e) => setSettings({...settings, uploadLimit: parseInt(e.target.value) || 0})}
                  placeholder="1000"
                />
                <Text fontSize="sm" color="gray.500">
                  0 = без ограничений
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Application Settings */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <VStack gap={6} align="stretch">
              <Heading size="md" color="green.600">
                🎛️ Настройки приложения
              </Heading>

              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">Автоматически начинать загрузки</Text>
                  <Text fontSize="sm" color="gray.500">
                    Торренты будут запускаться сразу после добавления
                  </Text>
                </VStack>
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => setSettings({...settings, autoStart: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: '#38a169' }}
                />
              </HStack>

              <Separator />

              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">Уведомления</Text>
                  <Text fontSize="sm" color="gray.500">
                    Показывать уведомления о завершении загрузок
                  </Text>
                </VStack>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: '#38a169' }}
                />
              </HStack>

              <Separator />

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Тема оформления</Text>
                <HStack gap={4}>
                  <Button
                    variant={settings.theme === 'system' ? 'solid' : 'outline'}
                    colorScheme={settings.theme === 'system' ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => setSettings({...settings, theme: 'system'})}
                  >
                    Системная
                  </Button>
                  <Button
                    variant={settings.theme === 'light' ? 'solid' : 'outline'}
                    colorScheme={settings.theme === 'light' ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => setSettings({...settings, theme: 'light'})}
                  >
                    Светлая
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'solid' : 'outline'}
                    colorScheme={settings.theme === 'dark' ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => setSettings({...settings, theme: 'dark'})}
                  >
                    Тёмная
                  </Button>
                </HStack>
              </VStack>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Язык интерфейса</Text>
                <HStack gap={4}>
                  <Button
                    variant={settings.language === 'ru' ? 'solid' : 'outline'}
                    colorScheme={settings.language === 'ru' ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => setSettings({...settings, language: 'ru'})}
                  >
                    Русский
                  </Button>
                  <Button
                    variant={settings.language === 'en' ? 'solid' : 'outline'}
                    colorScheme={settings.language === 'en' ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => setSettings({...settings, language: 'en'})}
                  >
                    English
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <HStack gap={4} justify="end">
            <Button variant="outline" onClick={handleResetSettings}>
              Сбросить
            </Button>
            <Button colorScheme="green" onClick={handleSaveSettings}>
              Сохранить настройки
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
