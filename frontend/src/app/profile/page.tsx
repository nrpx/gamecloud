'use client'

import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import ChangePasswordForm from '@/components/ui/ChangePasswordForm'
import EditProfileForm from '@/components/ui/EditProfileForm'
import NotificationSettings from '@/components/ui/NotificationSettings'
import { 
  useStatsData, 
  useStatsLoading, 
  useStatsError, 
  useFetchStats 
} from '@/stores/statsStore'
import { showError } from '@/lib/toast'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState(0)

  // Получаем статистику из store
  const stats = useStatsData()
  const isStatsLoading = useStatsLoading()
  const statsError = useStatsError()
  const fetchStats = useFetchStats()

  // Загружаем статистику при монтировании компонента
  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session, fetchStats])

  // Отслеживаем ошибки статистики
  useEffect(() => {
    if (statsError) {
      showError('Ошибка загрузки статистики', statsError)
    }
  }, [statsError])

  if (!session?.user) {
    return (
      <Box>
        <AppHeader />
        <Container maxW="container.lg" py={4}>
          <Text>Пожалуйста, войдите в систему для просмотра профиля</Text>
        </Container>
      </Box>
    )
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <Box>
      <AppHeader />
      
      <Container maxW="container.lg" py={4}>
        <VStack gap={4} align="stretch">
          {/* Заголовок профиля */}
          <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
              <Box
                w="80px"
                h="80px"
                borderRadius="full"
                bg="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="32px"
                fontWeight="bold"
              >
                {session.user.name?.charAt(0) || session.user.username?.charAt(0) || 'U'}
              </Box>
              
              <VStack align={{ base: 'center', md: 'start' }} gap={2} flex="1">
                <Text fontSize="2xl" fontWeight="bold">
                  {session.user.name || 'Пользователь'}
                </Text>
                <Text color="fg.muted" fontSize="md">
                  {session.user.email}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  Роль: {session.user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Text>
              </VStack>

              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleLogout}
                size="sm"
              >
                Выйти из системы
              </Button>
            </Flex>
          </Box>

          {/* Быстрая статистика */}
          {statsError && (
            <Box p={4} bg="red.50" borderRadius="lg" border="1px" borderColor="red.200">
              <Text color="red.600" fontSize="sm">
                ⚠️ Ошибка загрузки статистики: {statsError}
              </Text>
            </Box>
          )}
          
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
              <VStack gap={1}>
                                {isStatsLoading ? (
                  <Spinner size="md" color="blue.600" />
                ) : (
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {stats?.total_games || 0}
                  </Text>
                )}
                <Text fontSize="sm" color="blue.600">Игр в библиотеке</Text>
              </VStack>
            </Box>
            <Box p={4} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
              <VStack gap={1}>
                {isStatsLoading ? (
                  <Spinner size="md" color="green.600" />
                ) : (
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {stats?.completed_downloads || 0}
                  </Text>
                )}
                <Text fontSize="sm" color="green.600">Завершённых загрузок</Text>
              </VStack>
            </Box>
            <Box p={4} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
              <VStack gap={1}>
                {isStatsLoading ? (
                  <Spinner size="md" color="purple.600" />
                ) : (
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {stats?.active_downloads || 0}
                  </Text>
                )}
                <Text fontSize="sm" color="purple.600">Активных загрузки</Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Навигация по секциям */}
          <HStack gap={2} justify="center" flexWrap="wrap">
            <Button
              onClick={() => setActiveTab(0)}
              colorScheme={activeTab === 0 ? 'blue' : 'gray'}
              variant={activeTab === 0 ? 'solid' : 'outline'}
              size="sm"
            >
              <Icon name="user" size={16} style={{ marginRight: '6px' }} />
              Профиль
            </Button>
            <Button
              onClick={() => setActiveTab(1)}
              colorScheme={activeTab === 1 ? 'blue' : 'gray'}
              variant={activeTab === 1 ? 'solid' : 'outline'}
              size="sm"
            >
              <Icon name="settings" size={16} style={{ marginRight: '6px' }} />
              Безопасность
            </Button>
            <Button
              onClick={() => setActiveTab(2)}
              colorScheme={activeTab === 2 ? 'blue' : 'gray'}
              variant={activeTab === 2 ? 'solid' : 'outline'}
              size="sm"
            >
              <Icon name="notification" size={16} style={{ marginRight: '6px' }} />
              Уведомления
            </Button>
          </HStack>

          {/* Содержимое секций */}
          {activeTab === 0 && (
            <EditProfileForm 
              onSuccess={() => {
                // Можно добавить обновление данных
              }}
              onCancel={() => {
                // Можно добавить сброс формы
              }}
            />
          )}

          {activeTab === 1 && (
            <ChangePasswordForm 
              onSuccess={() => {
                // Можно добавить уведомление об успехе
              }}
            />
          )}

          {activeTab === 2 && (
            <NotificationSettings 
              onSuccess={() => {
                // Можно добавить уведомление об успехе
              }}
            />
          )}

          {/* Дополнительная информация */}
          <Box p={4} bg="bg.page" borderRadius="lg">
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              Последний вход: {new Date().toLocaleString('ru-RU')} • 
              Версия приложения: 1.0.0 • 
              <Text as="span" color="blue.500" cursor="pointer" ml={1}>
                Поддержка
              </Text>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
