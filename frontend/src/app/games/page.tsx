'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  Badge,
  Spinner,
  Input,
  Grid,
  SimpleGrid
} from '@chakra-ui/react'
import { formatFileSize, formatSpeed, formatETA } from '@/lib/api'
import {
  useGamesLibraryLoading,
  useGamesLibraryData,
  useGamesLibraryInitialized,
  useGamesLibraryError,
  useFetchGames,
  useRefreshGames,
  usePauseGameDownload,
  useResumeGameDownload,
  useCancelGameDownload,
  useClearGames
} from '@/stores/gamesLibraryStore'

// Тип для игры
interface Game {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
  download?: {
    id: string
    status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
    progress: number
    total_size: number
    downloaded_size: number
  }
  created_at: string
}

export default function GamesLibraryPage() {
  const { data: session, status } = useSession()
  
  // Используем Zustand hooks
  const games = useGamesLibraryData()
  const isLoading = useGamesLibraryLoading()
  const isInitialized = useGamesLibraryInitialized()
  const error = useGamesLibraryError()
  const fetchGames = useFetchGames()
  const refreshGames = useRefreshGames()
  const pauseGameDownload = usePauseGameDownload()
  const resumeGameDownload = useResumeGameDownload()
  const cancelGameDownload = useCancelGameDownload()
  const clearGames = useClearGames()
  
  // Локальное состояние для поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed' | 'seeding'>('all')

  // Единственный useEffect для инициализации/очистки данных при изменении сессии
  useEffect(() => {
    console.log('🎮 [GamesLibraryPage] Session status changed:', {
      status,
      hasUser: !!session?.user,
      username: session?.user?.username
    })
    
    if (session?.user && status === 'authenticated') {
      console.log('✅ [GamesLibraryPage] User authenticated, loading games...')
      fetchGames()
    } else if (status === 'unauthenticated') {
      console.log('❌ [GamesLibraryPage] User unauthenticated, clearing games...')
      clearGames()
    }
  }, [session, status, fetchGames, clearGames])

  const handleAction = async (gameId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await pauseGameDownload(gameId)
          break
        case 'resume':
          await resumeGameDownload(gameId)
          break
        case 'cancel':
          await cancelGameDownload(gameId)
          break
      }
    } catch (error) {
      console.error(`Ошибка выполнения действия ${action}:`, error)
      alert(`Ошибка: ${error}`)
    }
  }

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.genre.toLowerCase().includes(searchTerm.toLowerCase())
    const gameStatus = game.download?.status || 'completed'
    const matchesFilter = filter === 'all' || gameStatus === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading': return 'blue'
      case 'completed': return 'green'
      case 'seeding': return 'orange'
      case 'paused': return 'yellow'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'downloading': return 'Загружается'
      case 'completed': return 'Загружено'
      case 'seeding': return 'Раздается'
      case 'paused': return 'Пауза'
      case 'error': return 'Ошибка'
      default: return 'Готово'
    }
  }

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

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Главная
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              🎮 Библиотека игр
            </Heading>
          </HStack>
          <HStack gap={4}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refreshGames()}
              loading={isLoading}
              disabled={isLoading}
            >
              🔄 Обновить
            </Button>
            <Link href="/games/add">
              <Button colorScheme="blue" size="sm">
                + Добавить игру
              </Button>
            </Link>
            <Badge colorScheme="green">{session?.user.role}</Badge>
            <Text fontSize="sm">@{session?.user.username}</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Filters */}
          <HStack gap={4} wrap="wrap">
            <Input
              placeholder="Поиск игр..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="md"
            />
            <HStack gap={2}>
              {[
                { key: 'all', label: 'Все' },
                { key: 'downloading', label: 'Загружаются' },
                { key: 'downloaded', label: 'Загружены' },
                { key: 'seeding', label: 'Раздаются' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setFilter(key as any)}
                >
                  {label}
                </Button>
              ))}
            </HStack>
          </HStack>

          {/* Games Grid */}
          {!isInitialized || isLoading ? (
            <Box textAlign="center" py={12}>
              <Spinner size="xl" />
              <Text mt={4}>Загрузка библиотеки...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="lg" color="red.500">⚠️ Ошибка загрузки библиотеки</Text>
              <Text color="gray.500" mt={2}>{error}</Text>
              <Button mt={4} onClick={() => fetchGames()} size="sm" colorScheme="blue">
                Попробовать снова
              </Button>
            </Box>
          ) : filteredGames.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500">
                {searchTerm || filter !== 'all' ? 'Игры не найдены' : 'Библиотека пуста'}
              </Text>
              <Link href="/games/add">
                <Button colorScheme="blue" mt={4}>
                  Добавить первую игру
                </Button>
              </Link>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
              {filteredGames.map((game) => (
                <Box
                  key={game.id}
                  bg="white"
                  borderRadius="lg"
                  shadow="sm"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                >
                  {/* Game Image */}
                  <Box
                    h="200px"
                    bg={game.image_url ? undefined : 'gray.200'}
                    backgroundImage={game.image_url}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    position="relative"
                  >
                    {!game.image_url && (
                      <Flex h="full" align="center" justify="center">
                        <Text color="gray.500" fontSize="3xl">🎮</Text>
                      </Flex>
                    )}
                    <Box position="absolute" top={2} right={2}>
                      <Badge colorScheme={getStatusColor(game.download?.status || 'completed')} variant="solid">
                        {getStatusText(game.download?.status || 'completed')}
                      </Badge>
                    </Box>
                  </Box>

                  {/* Game Info */}
                  <VStack p={4} align="stretch" gap={3}>
                    <VStack align="stretch" gap={1}>
                      <Heading size="sm" css={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{game.title}</Heading>
                      <HStack justify="space-between">
                        <Badge colorScheme="gray" size="sm">{game.genre}</Badge>
                        <Text fontSize="xs" color="gray.500">
                          {game.download?.total_size ? formatFileSize(game.download.total_size) : 'Неизвестно'}
                        </Text>
                      </HStack>
                    </VStack>

                    <Text fontSize="sm" color="gray.600" css={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {game.description}
                    </Text>

                    {/* Progress Bar */}
                    {game.download?.status === 'downloading' && game.download?.progress !== undefined && (
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.600">Прогресс</Text>
                          <Text fontSize="xs" color="gray.600">{game.download.progress}%</Text>
                        </HStack>
                        <Box bg="gray.200" borderRadius="full" h={2}>
                          <Box
                            bg="blue.500"
                            h={2}
                            borderRadius="full"
                            width={`${game.download.progress}%`}
                            transition="width 0.3s"
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <HStack gap={2}>
                      {game.download?.status === 'completed' && (
                        <Button size="sm" colorScheme="green" flex={1}>
                          ▶ Запустить
                        </Button>
                      )}
                      {game.download?.status === 'downloading' && (
                        <Button size="sm" colorScheme="red" flex={1} onClick={() => handleAction(game.id, 'pause')}>
                          ⏸ Пауза
                        </Button>
                      )}
                      {game.download?.status === 'paused' && (
                        <Button size="sm" colorScheme="blue" flex={1} onClick={() => handleAction(game.id, 'resume')}>
                          ⏵ Возобновить
                        </Button>
                      )}
                      <Button size="sm" variant="outline" flex={1}>
                        ⚙ Управление
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Box>
    </Box>
  )
}
