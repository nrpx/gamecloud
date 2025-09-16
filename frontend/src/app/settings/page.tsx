'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  Separator,
  Spinner
} from '@chakra-ui/react'
import { settingsApi, UserSettings } from '@/lib/api'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import ThemeLanguageSettings from '@/components/ui/ThemeLanguageSettings'
import { showSuccess, showError } from '@/lib/toast'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загружаем настройки при загрузке страницы
  useEffect(() => {
    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const userSettings = await settingsApi.getSettings()
      setSettings(userSettings)
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      setError('Не удалось загрузить настройки')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    try {
      setIsSaving(true)
      setError(null)
      const updatedSettings = await settingsApi.updateSettings(settings)
      setSettings(updatedSettings)
      showSuccess('Настройки сохранены!', 'Настройки успешно сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error)
      setError('Не удалось сохранить настройки')
      showError('Ошибка сохранения', 'Не удалось сохранить настройки')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (!settings) return
    
    setSettings({
      ...settings,
      download_path: '/home/user/Downloads/Games',
      max_downloads: 3,
      upload_limit: 1000,
      auto_start: true,
      notifications: true,
      theme: 'system',
      language: 'ru'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Загрузка настроек...</Text>
        </VStack>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Text>Необходимо войти в систему</Text>
          <Link href="/auth/signin">
            <Button colorScheme="blue">Войти</Button>
          </Link>
        </VStack>
      </Box>
    )
  }

  if (error && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Text color="red.500">Ошибка: {error}</Text>
          <Button onClick={loadSettings}>Попробовать снова</Button>
        </VStack>
      </Box>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <Box minH="100vh" bg="bg.page">
      <AppHeader />
      
      {/* Main Content */}
      <Box maxW="4xl" mx="auto" px={4} py={4}>
        <VStack gap={4} align="stretch">
          {/* Page Header */}
          <Heading size="lg" color="green.600" textAlign="center">
            <Icon name="settings" size={28} style={{ marginRight: '8px', display: 'inline' }} />
            Настройки
          </Heading>
          
          {/* Theme and Language Settings */}
          <ThemeLanguageSettings />
          
          {/* Download Settings */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <VStack gap={6} align="stretch">
              <Heading size="md" color="green.600">
                📥 Настройки загрузки
              </Heading>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Папка для загрузок</Text>
                <Input
                  value={settings.download_path}
                  onChange={(e) => setSettings({...settings, download_path: e.target.value})}
                  placeholder="/path/to/downloads"
                />
                <Text fontSize="sm" color="fg.muted">
                  Укажите путь где будут сохраняться загруженные игры
                </Text>
              </VStack>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Максимальное количество одновременных загрузок</Text>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.max_downloads}
                  onChange={(e) => setSettings({...settings, max_downloads: parseInt(e.target.value) || 1})}
                />
              </VStack>

              <VStack align="stretch" gap={2}>
                <Text fontWeight="medium">Ограничение скорости отдачи (КБ/с)</Text>
                <Input
                  type="number"
                  value={settings.upload_limit}
                  onChange={(e) => setSettings({...settings, upload_limit: parseInt(e.target.value) || 0})}
                  placeholder="1000"
                />
                <Text fontSize="sm" color="fg.muted">
                  0 = без ограничений
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Application Settings */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <VStack gap={6} align="stretch">
              <Heading size="md" color="green.600">
                🎛️ Настройки приложения
              </Heading>

              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">Автоматически начинать загрузки</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Торренты будут запускаться сразу после добавления
                  </Text>
                </VStack>
                <input
                  type="checkbox"
                  checked={settings.auto_start}
                  onChange={(e) => setSettings({...settings, auto_start: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: '#38a169' }}
                />
              </HStack>

              <Separator />

              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">Уведомления</Text>
                  <Text fontSize="sm" color="fg.muted">
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
            <Button variant="outline" onClick={handleResetSettings} disabled={isSaving}>
              Сбросить
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleSaveSettings}
              loading={isSaving}
              disabled={isSaving}
            >
              Сохранить настройки
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
