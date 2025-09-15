'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { useColorMode } from './color-mode'
import { useTheme } from 'next-themes'

const themeOptions = [
  { value: 'light', label: 'Светлая', icon: '☀️' },
  { value: 'dark', label: 'Темная', icon: '🌙' },
  { value: 'system', label: 'Системная', icon: '🖥️' },
] as const

const languageOptions = [
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
] as const

export default function ThemeLanguageSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  // Пока просто используем localStorage для языка
  const getCurrentLanguage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gamecloud-language') || 'ru'
    }
    return 'ru'
  }
  
  const setLanguage = (lang: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gamecloud-language', lang)
      // Можно добавить перезагрузку страницы или обновление интерфейса
    }
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Тема оформления */}
      <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
        <VStack gap={4} align="stretch">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">
              🎨 Тема оформления
            </Text>
            <Text fontSize="sm" color="fg.muted">
              (Текущая: {resolvedTheme === 'light' ? 'светлая' : 'темная'})
            </Text>
          </HStack>
          
          <VStack align="start" gap={3}>
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                variant={theme === option.value ? "solid" : "outline"}
                colorScheme={theme === option.value ? "blue" : "gray"}
                onClick={() => setTheme(option.value)}
                size="sm"
                justifyContent="flex-start"
                w="200px"
              >
                <HStack gap={2}>
                  <Text>{option.icon}</Text>
                  <Text>{option.label}</Text>
                </HStack>
              </Button>
            ))}
          </VStack>

          <Box p={3} bg="bg.muted" borderRadius="md">
            <Text fontSize="sm" color="fg.muted">
              💡 Предварительный просмотр: Этот блок показывает, как будет выглядеть интерфейс в выбранной теме
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Язык интерфейса */}
      <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
        <VStack gap={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            <Icon name="cloud" size={20} style={{ marginRight: '8px', display: 'inline' }} />
            Язык интерфейса
          </Text>
          
          <VStack align="start" gap={3}>
            <Text fontSize="sm" color="fg.muted">Выберите язык:</Text>
            {languageOptions.map((option) => (
              <Button
                key={option.value}
                variant={getCurrentLanguage() === option.value ? "solid" : "outline"}
                colorScheme={getCurrentLanguage() === option.value ? "green" : "gray"}
                onClick={() => setLanguage(option.value)}
                size="sm"
                justifyContent="flex-start"
                w="150px"
              >
                <HStack gap={2}>
                  <Text>{option.flag}</Text>
                  <Text>{option.label}</Text>
                </HStack>
              </Button>
            ))}
          </VStack>

          <Box p={3} bg="blue.subtle" borderRadius="md">
            <Text fontSize="sm" color="blue.fg">
              ℹ️ Изменение языка будет применено после перезагрузки страницы
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Дополнительные настройки */}
      <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
        <VStack gap={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            <Icon name="settings" size={20} style={{ marginRight: '8px', display: 'inline' }} />
            Дополнительные настройки
          </Text>
          
          <VStack gap={3} align="start">
            <HStack justify="space-between" w="full">
              <Text>Анимации интерфейса</Text>
              <Button size="sm" variant="outline" colorScheme="green">
                Включены
              </Button>
            </HStack>
            
            <HStack justify="space-between" w="full">
              <Text>Компактный режим</Text>
              <Button size="sm" variant="outline">
                Выключен
              </Button>
            </HStack>
            
            <HStack justify="space-between" w="full">
              <Text>Автосохранение настроек</Text>
              <Button size="sm" colorScheme="green">
                Включено
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  )
}