'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  SimpleGrid,
  Progress,
  Button,
  Spinner,
  Badge
} from '@chakra-ui/react'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import { useGamesLibraryData, useFetchGames } from '@/stores/gamesLibraryStore'
import { useTorrentsData, useFetchDownloads } from '@/stores/torrentsStore'
import { formatFileSize, formatSpeed } from '@/lib/api'
import SignInForm from '@/components/SignInForm'

interface Stats {
  totalGames: number
  activeDownloads: number
  completedDownloads: number
  totalDownloaded: number
  totalSize: number
  downloadSpeed: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected')
  
  const games = useGamesLibraryData()
  const torrents = useTorrentsData()
  const fetchGames = useFetchGames()
  const fetchDownloads = useFetchDownloads()

  // Long-poll для статистики
  const fetchStats = async () => {
    if (!session?.user) return
    
    try {
      setConnectionStatus('connected')
      const response = await fetch('/api/token')
      const { token } = await response.json()
      
      const statsResponse = await fetch('http://localhost:8080/api/v1/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setConnectionStatus('disconnected')
    }
  }

  // Запускаем long-poll каждые 5 секунд
  useEffect(() => {
    if (session?.user) {
      fetchStats()
      fetchGames()
      fetchDownloads()
      
      const interval = setInterval(fetchStats, 5000)
      return () => clearInterval(interval)
    }
  }, [session, fetchGames, fetchDownloads])

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

  // Берём последние игры с активными загрузками
  const recentGames = games?.slice(0, 6) || []
  const activeTorrents = torrents?.filter(t => t.status === 'downloading' || t.status === 'completed') || []

  return (
    <Box>
      <AppHeader />
      
      <Container maxW="7xl" py={6}>
        <VStack gap={6} align="stretch">
          {/* Заголовок со статусом подключения */}
          <HStack justify="space-between" align="center">
            <Heading size="lg">
              Панель управления
            </Heading>
            <HStack gap={2}>
              <Box 
                className={`connection-indicator ${connectionStatus}`} 
                title={connectionStatus === 'connected' ? 'Подключено' : 'Отключено'}
              />
              <Text fontSize="sm" color="fg.muted">
                {connectionStatus === 'connected' ? 'В сети' : 'Автономно'}
              </Text>
            </HStack>
          </HStack>

          {/* Компактная статистика */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <VStack gap={1} align="start">
                <HStack>
                  <Icon name="library" size={24} />
                  <Text fontSize="sm" color="fg.muted">Игры</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats?.totalGames || games?.length || 0}
                </Text>
              </VStack>
            </Box>

            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <VStack gap={1} align="start">
                <HStack>
                  <Icon name="download" size={24} />
                  <Text fontSize="sm" color="fg.muted">Активных</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {stats?.activeDownloads || activeTorrents.length}
                </Text>
              </VStack>
            </Box>

            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <VStack gap={1} align="start">
                <HStack>
                  <Icon name="stats" size={24} />
                  <Text fontSize="sm" color="fg.muted">Скорость</Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {stats?.downloadSpeed ? formatSpeed(stats.downloadSpeed) : '0 KB/s'}
                </Text>
              </VStack>
            </Box>

            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <VStack gap={1} align="start">
                <HStack>
                  <Icon name="download" size={24} />
                  <Text fontSize="sm" color="fg.muted">Загружено</Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold">
                  {stats?.totalDownloaded ? formatFileSize(stats.totalDownloaded) : '0 GB'}
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Недавние игры и активные загрузки */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
            {/* Библиотека */}
            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Недавние игры</Heading>
                <Link href="/games" passHref>
                  <Button size="sm" variant="outline">
                    Все игры
                  </Button>
                </Link>
              </HStack>
              
              {recentGames.length > 0 ? (
                <VStack gap={3} align="stretch">
                  {recentGames.map((game) => (
                    <Box key={game.id} p={3} borderRadius="md" border="1px" borderColor="border.subtle">
                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text fontWeight="medium" fontSize="sm">{game.title}</Text>
                          <Text fontSize="xs" color="fg.muted">{game.genre}</Text>
                        </VStack>
                        <Badge 
                          size="sm" 
                          colorScheme={game.download?.status === 'completed' ? 'green' : 'blue'}
                        >
                          {game.download?.status === 'completed' ? 'Готова' : 'Загрузка'}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="fg.muted" textAlign="center" py={4}>
                  Игры не найдены
                </Text>
              )}
            </Box>

            {/* Активные загрузки */}
            <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.muted">
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Активные загрузки</Heading>
                <Link href="/torrents" passHref>
                  <Button size="sm" variant="outline">
                    Все торренты
                  </Button>
                </Link>
              </HStack>
              
              {activeTorrents.length > 0 ? (
                <VStack gap={3} align="stretch">
                  {activeTorrents.slice(0, 6).map((torrent) => (
                    <Box key={torrent.id} p={3} borderRadius="md" border="1px" borderColor="border.subtle">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {`Загрузка ${torrent.id}`}
                        </Text>
                        <Badge 
                          size="sm" 
                          colorScheme={torrent.status === 'completed' ? 'green' : 'blue'}
                        >
                          {torrent.status === 'completed' ? 'Завершено' : 'Загрузка'}
                        </Badge>
                      </HStack>
                      <Progress.Root value={torrent.progress || 0} size="sm" colorPalette="blue">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="fg.muted">
                          {(torrent.progress || 0).toFixed(1)}%
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          0 KB/s
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="fg.muted" textAlign="center" py={4}>
                  Нет активных загрузок
                </Text>
              )}
            </Box>
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
}
