'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Grid, 
  VStack,
  HStack,
  Badge,
  Spinner
} from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'
import { formatFileSize } from '@/lib/api'
import {
  useStatsStore,
  useStatsLoading,
  useStatsData,
  useStatsInitialized,
  useStatsError,
  useFetchStats,
  useClearStats
} from '@/stores/statsStore'
import SignInForm from './SignInForm'

export default function GameCloudApp() {
  const { data: session, status } = useSession()
  
  // Используем отдельные Zustand hooks
  const stats = useStatsData()
  const isLoading = useStatsLoading()
  const isInitialized = useStatsInitialized()
  const error = useStatsError()
  const fetchStats = useFetchStats()
  const clearStats = useClearStats()

  // Единственный useEffect для инициализации/очистки данных при изменении сессии
  useEffect(() => {
    console.log('🎮 [GameCloudApp] Session status changed:', {
      status,
      hasUser: !!session?.user,
      username: session?.user?.username
    })
    
    if (session?.user && status === 'authenticated') {
      console.log('✅ [GameCloudApp] User authenticated, loading stats...')
      fetchStats()
    } else if (status === 'unauthenticated') {
      console.log('❌ [GameCloudApp] User unauthenticated, clearing stats...')
      clearStats()
    }
  }, [session, status, fetchStats, clearStats])

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Загрузка...</Text>
        </VStack>
      </Box>
    )
  }

  if (!session) {
    return <SignInForm />
  }

  return (
    <Box minH="100vh" bg="bg.page">
      {/* Header */}
      <Box bg="bg.surface" shadow="sm" borderBottom="1px" borderColor="border.muted">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Heading size="lg" color="blue.600">
              <Icon name="gamepad" size={28} style={{ marginRight: '8px', display: 'inline' }} />
              GameCloud
            </Heading>
            <Badge colorScheme="blue" variant="subtle">
              v1.0
            </Badge>
          </HStack>
          
          {/* User Info */}
          <Flex align="center" gap={4}>
            <VStack gap={0} align="end">
              <Text fontWeight="bold" fontSize="sm">{session.user?.name}</Text>
              <Text fontSize="xs" color="fg.muted">@{session.user.username}</Text>
            </VStack>
            <Badge size="sm" colorScheme="green">{session.user.role}</Badge>
            <Link href="/profile">
              <Button size="sm" variant="outline">
                Профиль
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
              Выйти
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Welcome Section */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" mb={2}>
                Добро пожаловать, {session.user?.name}!
              </Heading>
              <Text fontSize="lg" color="fg.muted">
                Управляйте своей игровой библиотекой
              </Text>
            </Box>
            <VStack gap={2} align="end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => fetchStats()}
                loading={isLoading}
                disabled={isLoading}
              >
                🔄 Обновить статистику
              </Button>
              {stats && (
                <Text fontSize="xs" color="fg.muted">
                  Кэш действует 5 минут
                </Text>
              )}
            </VStack>
          </Flex>

          {/* Stats Cards */}
          {!isInitialized || isLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={2}>Загрузка статистики...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={8}>
              <Text color="red.500" fontSize="lg">⚠️ Ошибка загрузки статистики</Text>
              <Text color="fg.muted" mt={2}>{error}</Text>
              <Button mt={4} onClick={() => fetchStats()} size="sm" colorScheme="blue">
                Попробовать снова
              </Button>
            </Box>
          ) : (
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
              <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
                <VStack align="start" gap={2}>
                  <Heading size="md" color="blue.600">Библиотека игр</Heading>
                  <Text fontSize="3xl" fontWeight="bold">{stats?.total_games || 0}</Text>
                  <Text color="fg.muted">игр в коллекции</Text>
                </VStack>
              </Box>
              
              <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
                <VStack align="start" gap={2}>
                  <Heading size="md" color="green.600">Активные загрузки</Heading>
                  <Text fontSize="3xl" fontWeight="bold">{stats?.active_downloads || 0}</Text>
                  <Text color="fg.muted">скачивается сейчас</Text>
                </VStack>
              </Box>
              
              <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
                <VStack align="start" gap={2}>
                  <Heading size="md" color="purple.600">Всего загрузок</Heading>
                  <Text fontSize="3xl" fontWeight="bold">{stats?.completed_downloads || 0}</Text>
                  <Text color="fg.muted">загрузок выполнено</Text>
                </VStack>
              </Box>
              
              <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
                <VStack align="start" gap={2}>
                  <Heading size="md" color="orange.600">Объем данных</Heading>
                  <Text fontSize="3xl" fontWeight="bold">
                    {stats?.total_downloaded_size ? formatFileSize(stats.total_downloaded_size) : '0 B'}
                  </Text>
                  <Text color="fg.muted">загружено всего</Text>
                </VStack>
              </Box>
            </Grid>
          )}

          {/* Quick Actions */}
          <Box>
            <Heading size="lg" mb={4}>Быстрые действия</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Link href="/games/add">
                <Button 
                  size="lg" 
                  colorScheme="blue" 
                  h="80px"
                  flexDirection="column"
                  gap={1}
                  w="full"
                >
                  <Icon name="add" size={24} />
                  <Text>Добавить игру</Text>
                  <Text fontSize="sm" opacity={0.8}>Загрузить новую игру</Text>
                </Button>
              </Link>
              
              <Link href="/games/search">
                <Button 
                  size="lg" 
                  colorScheme="green" 
                  h="80px"
                  flexDirection="column"
                  gap={1}
                  w="full"
                >
                  <Icon name="search" size={24} />
                  <Text>Поиск игр</Text>
                  <Text fontSize="sm" opacity={0.8}>Найти в каталоге</Text>
                </Button>
              </Link>
              
              <Link href="/settings">
                <Button 
                  size="lg" 
                  colorScheme="purple" 
                  h="80px"
                  flexDirection="column"
                  gap={1}
                  w="full"
                >
                  <Icon name="settings" size={24} />
                  <Text>Настройки</Text>
                  <Text fontSize="sm" opacity={0.8}>Конфигурация системы</Text>
                </Button>
              </Link>
              
              <Link href="/torrents">
                <Button 
                  size="lg" 
                  colorScheme="orange" 
                  h="80px"
                  flexDirection="column"
                  gap={1}
                  w="full"
                >
                  <Icon name="cloud" size={24} />
                  <Text>Торренты</Text>
                  <Text fontSize="sm" opacity={0.8}>Управление загрузками</Text>
                </Button>
              </Link>
              
              <Link href="/games">
                <Button 
                  size="lg" 
                  colorScheme="teal" 
                  h="80px"
                  flexDirection="column"
                  gap={1}
                  w="full"
                >
                  <Icon name="library" size={24} />
                  <Text>Моя библиотека</Text>
                  <Text fontSize="sm" opacity={0.8}>Управление играми</Text>
                </Button>
              </Link>
            </Grid>
          </Box>

          {/* Recent Activity */}
          <Box>
            <Heading size="lg" mb={4}>Последняя активность</Heading>
            <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
              <Text color="fg.muted" textAlign="center" py={8}>
                Пока нет активности. Добавьте первую игру!
              </Text>
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
