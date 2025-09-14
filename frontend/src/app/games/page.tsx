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
  SimpleGrid,
  Textarea,
  Progress
} from '@chakra-ui/react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import BrandButton from '@/components/ui/BrandButton'
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
  useClearGames,
  useUpdateGame,
  useDeleteGame
} from '@/stores/gamesLibraryStore'

import {
  useTorrentsData,
  useFetchDownloads
} from '@/stores/torrentsStore'

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
  downloads?: any[]
  created_at: string
}

export default function GamesLibraryPage() {
  const { data: session, status } = useSession()
  
  // WebSocket для real-time обновлений
  const { isConnected, progressUpdates } = useWebSocket()
  
  // Используем Zustand hooks для игр
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
  const updateGame = useUpdateGame()
  const deleteGame = useDeleteGame()
  
  // Используем Zustand hooks для торрентов
  const downloads = useTorrentsData()
  const fetchDownloads = useFetchDownloads()
  
  // Локальное состояние для поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed' | 'seeding'>('all')
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [gameFormData, setGameFormData] = useState({ title: '', genre: '', description: '', image_url: '' })
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Загружаем данные при инициализации
  useEffect(() => {
    if (session && status === 'authenticated') {
      if (!isInitialized) {
        fetchGames()
      }
      fetchDownloads() // Получаем данные о загрузках
    } else if (status === 'unauthenticated') {
      clearGames()
    }
  }, [session, status, isInitialized, fetchGames, fetchDownloads, clearGames])

  // Функция для получения данных о загрузке игры
  const getGameDownloadInfo = (gameId: string) => {
    // Сначала ищем в downloads по game_id (предполагаем что есть связь)
    const gameDownloads = downloads?.filter(d => 
      // Если есть связь с игрой, используем её
      (d as any).game_id === gameId
    ) || []
    
    if (gameDownloads.length === 0) return null
    
    // Берем последнюю активную загрузку
    const activeDownload = gameDownloads.find(d => 
      ['downloading', 'queued', 'seeding'].includes(d.status)
    ) || gameDownloads[gameDownloads.length - 1]
    
    // Обогащаем данными WebSocket если есть
    const progressUpdate = progressUpdates.get(activeDownload.id)
    if (progressUpdate) {
      return {
        ...activeDownload,
        ...progressUpdate
      }
    }
    
    return activeDownload
  }

  // Функции для управления играми
  const openEditModal = (game: Game) => {
    setEditingGame(game)
    setGameFormData({
      title: game.title,
      genre: game.genre,
      description: game.description,
      image_url: game.image_url || ''
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingGame(null)
    setGameFormData({ title: '', genre: '', description: '', image_url: '' })
  }

  const handleUpdateGame = async () => {
    if (!editingGame) return
    
    try {
      await updateGame(editingGame.id, gameFormData)
      closeEditModal()
      refreshGames()
    } catch (error) {
      console.error('Ошибка обновления игры:', error)
      alert('Ошибка при обновлении игры')
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту игру?')) return
    
    try {
      setIsDeleting(gameId)
      await deleteGame(gameId)
      refreshGames()
    } catch (error) {
      console.error('Ошибка удаления игры:', error)
      alert('Ошибка при удалении игры')
    } finally {
      setIsDeleting(null)
    }
  }

  // Фильтрация игр
  const filteredGames = games ? games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.genre.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (filter === 'all') return true
    
    const downloadInfo = getGameDownloadInfo(game.id)
    if (!downloadInfo) return false
    
    switch (filter) {
      case 'downloading':
        return ['downloading', 'queued'].includes(downloadInfo.status)
      case 'completed':
        return downloadInfo.status === 'completed'
      case 'seeding':
        return downloadInfo.status === 'seeding'
      default:
        return true
    }
  }) : []

  if (status === 'loading' || !isInitialized) {
    return (
      <Box minH="100vh" bg="bg.page">
        <AppHeader title="Библиотека игр" />
        <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Загрузка библиотеки...</Text>
          </VStack>
        </Box>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Box minH="100vh" bg="bg.page">
        <AppHeader title="Библиотека игр" />
        <Box maxW="md" mx="auto" mt={8} p={6} textAlign="center">
          <Text>Вы не авторизованы. Пожалуйста, войдите в систему.</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="bg.page">
      <AppHeader title="Библиотека игр">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => refreshGames()}
          loading={isLoading}
          disabled={isLoading}
        >
          <Icon name="refresh" size={16} style={{ marginRight: '6px' }} />
          Обновить
        </Button>
        <Link href="/games/add">
          <BrandButton intent="primary" size="sm">
            <Icon name="add" size={16} style={{ marginRight: '6px' }} />
            Добавить игру
          </BrandButton>
        </Link>
      </AppHeader>

      {/* Main Content */}
      <Box maxW="7xl" mx="auto" px={4} py={4}>
        <VStack gap={4} align="stretch">
          {/* Search and Filters */}
          <HStack gap={4} flexWrap="wrap">
            <Input
              placeholder="Поиск по названию или жанру..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="md"
              bg="bg.surface"
            />
            <HStack gap={2}>
              <Button
                size="sm"
                variant={filter === 'all' ? 'solid' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Все
              </Button>
              <Button
                size="sm"
                variant={filter === 'downloading' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setFilter('downloading')}
              >
                Загружаются
              </Button>
              <Button
                size="sm"
                variant={filter === 'completed' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => setFilter('completed')}
              >
                Готовые
              </Button>
              <Button
                size="sm"
                variant={filter === 'seeding' ? 'solid' : 'outline'}
                colorScheme="orange"
                onClick={() => setFilter('seeding')}
              >
                Раздают
              </Button>
            </HStack>
          </HStack>

          {/* WebSocket Status */}
          {isConnected && (
            <Box p={3} bg="green.subtle" borderRadius="md" border="1px" borderColor="green.muted">
              <HStack>
                <Box w={2} h={2} bg="green.solid" borderRadius="full" />
                <Text fontSize="sm" color="green.fg">
                  Подключено к real-time обновлениям
                </Text>
              </HStack>
            </Box>
          )}

          {/* Games Grid */}
          {error ? (
            <Box textAlign="center" py={4}>
              <HStack justify="center" mb={2}>
                <Icon name="warning" size={20} color="red.500" />
                <Text color="red.500" fontSize="md">Ошибка загрузки библиотеки</Text>
              </HStack>
              <Text color="fg.muted" mt={2}>{error}</Text>
              <BrandButton mt={4} onClick={() => refreshGames()} size="sm" intent="secondary">
                Попробовать снова
              </BrandButton>
            </Box>
          ) : !games || games.length === 0 ? (
            <Box textAlign="center" py={16}>
              <Text fontSize="xl" color="fg.muted" mb={4}>
                Ваша библиотека пуста
              </Text>
              <Text color="fg.muted" mb={6}>
                Добавьте первую игру, чтобы начать управление коллекцией
              </Text>
              <Link href="/games/add">
                <BrandButton intent="primary" size="lg">
                  Добавить игру
                </BrandButton>
              </Link>
            </Box>
          ) : filteredGames.length === 0 ? (
            <Box textAlign="center" py={16}>
              <Text fontSize="xl" color="fg.muted" mb={4}>
                Ничего не найдено
              </Text>
              <Text color="fg.muted">
                Попробуйте изменить поисковый запрос или фильтры
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {filteredGames.map((game) => {
                const downloadInfo = getGameDownloadInfo(game.id)
                
                return (
                  <Box 
                    key={game.id} 
                    bg="bg.surface" 
                    p={4} 
                    borderRadius="lg" 
                    shadow="sm"
                    borderWidth="1px"
                    _hover={{ shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" gap={3}>
                      {/* Game Header */}
                      <Flex justify="space-between" align="start">
                        <VStack align="start" gap={1} flex={1}>
                          <Heading size="md" color="fg.default">
                            {game.title}
                          </Heading>
                          <Badge colorScheme="purple" size="sm">
                            {game.genre}
                          </Badge>
                        </VStack>
                        <HStack gap={1}>
                          <Button size="xs" variant="ghost" onClick={() => openEditModal(game)}>
                            <Icon name="edit" size={16} />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="red.500"
                            onClick={() => handleDeleteGame(game.id)}
                            loading={isDeleting === game.id}
                          >
                            <Icon name="delete" size={16} />
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Download Status */}
                      {downloadInfo && (
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <HStack gap={2}>
                              <Badge 
                                colorScheme={
                                  downloadInfo.status === 'completed' ? 'green' :
                                  downloadInfo.status === 'downloading' ? 'blue' :
                                  downloadInfo.status === 'seeding' ? 'orange' :
                                  downloadInfo.status === 'paused' ? 'yellow' :
                                  'gray'
                                }
                                size="sm"
                              >
                                {downloadInfo.status === 'completed' ? (
                                  <HStack gap={1}>
                                    <Icon name="settings" size={12} color="green.500" />
                                    <Text color="green.500">Готово</Text>
                                  </HStack>
                                ) : downloadInfo.status === 'downloading' ? (
                                  <HStack gap={1}>
                                    <Icon name="download" size={12} color="blue.500" />
                                    <Text color="blue.500">Загружается</Text>
                                  </HStack>
                                ) : downloadInfo.status === 'seeding' ? (
                                  <HStack gap={1}>
                                    <Icon name="upload" size={12} color="orange.500" />
                                    <Text color="orange.500">Раздача</Text>
                                  </HStack>
                                ) : downloadInfo.status === 'paused' ? (
                                  <HStack gap={1}>
                                    <Icon name="pause" size={12} color="yellow.500" />
                                    <Text color="yellow.500">Пауза</Text>
                                  </HStack>
                                ) : downloadInfo.status === 'queued' ? (
                                  <HStack gap={1}>
                                    <Icon name="settings" size={12} color="gray.500" />
                                    <Text color="gray.500">В очереди</Text>
                                  </HStack>
                                ) : (
                                  <HStack gap={1}>
                                    <Icon name="close" size={12} color="red.500" />
                                    <Text color="red.500">Ошибка</Text>
                                  </HStack>
                                )}
                              </Badge>
                              {downloadInfo.status === 'downloading' && (
                                <Text fontSize="xs" color="fg.muted">
                                  {(downloadInfo.progress || 0).toFixed(1)}%
                                </Text>
                              )}
                            </HStack>
                            
                            {downloadInfo.status === 'downloading' && (
                              <Text fontSize="xs" color="fg.muted">
                                {formatSpeed((downloadInfo as any).download_speed || downloadInfo.download_speed || 0)}/с
                              </Text>
                            )}
                          </HStack>
                          
                          {downloadInfo.status === 'downloading' && (
                            <Box w="full" bg="gray.100" borderRadius="md" h="2">
                              <Box 
                                w={`${downloadInfo.progress || 0}%`}
                                bg="blue.400"
                                borderRadius="md"
                                h="full"
                                transition="width 0.3s"
                              />
                            </Box>
                          )}
                          
                          {downloadInfo.status === 'downloading' && (
                            <HStack justify="space-between" mt={2}>
                              <Text fontSize="xs" color="fg.muted">
                                {formatFileSize((downloadInfo as any).downloaded_bytes || downloadInfo.downloaded_size || 0)} / {formatFileSize((downloadInfo as any).total_bytes || downloadInfo.total_size || 0)}
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                ETA: {formatETA((downloadInfo as any).eta || 0)}
                              </Text>
                            </HStack>
                          )}
                        </Box>
                      )}

                      {/* Game Description */}
                      <Text 
                        fontSize="sm" 
                        color="fg.muted"
                        css={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {game.description}
                      </Text>

                      {/* Actions */}
                      <HStack gap={2} pt={2}>
                        {downloadInfo && downloadInfo.status === 'downloading' && (
                          <>
                            <Button size="xs" colorScheme="orange" variant="solid" onClick={() => pauseGameDownload(downloadInfo.id)}>
                              <Icon name="pause" size={14} style={{ marginRight: '4px' }} />
                              Пауза
                            </Button>
                            <Button size="xs" colorScheme="red" variant="solid" onClick={() => cancelGameDownload(downloadInfo.id)}>
                              <Icon name="close" size={14} style={{ marginRight: '4px' }} />
                              Отмена
                            </Button>
                          </>
                        )}
                        {downloadInfo && downloadInfo.status === 'paused' && (
                          <Button size="xs" colorScheme="green" onClick={() => resumeGameDownload(downloadInfo.id)}>
                            <Icon name="play" size={14} style={{ marginRight: '4px' }} />
                            Продолжить
                          </Button>
                        )}
                        {downloadInfo && downloadInfo.status === 'completed' && (
                          <Button size="xs" colorScheme="blue">
                            <Icon name="gamepad" size={14} style={{ marginRight: '4px' }} />
                            Играть
                          </Button>
                        )}
                        {!downloadInfo && (
                          <Text fontSize="xs" color="fg.muted">
                            Игра добавлена в библиотеку
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                )
              })}
            </SimpleGrid>
          )}
        </VStack>
      </Box>

      {/* Edit Modal */}
      {isEditModalOpen && editingGame && (
        <Box 
          position="fixed" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          bg="blackAlpha.50" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          zIndex={20}
        >
          <Box bg="bg.surface" p={4} borderRadius="lg" maxW="md" w="full" mx={4}>
            <VStack gap={3} align="stretch">
              <Heading size="md">Редактировать игру</Heading>
              
              <Input
                placeholder="Название игры"
                value={gameFormData.title}
                onChange={(e) => setGameFormData({...gameFormData, title: e.target.value})}
              />
              
              <Input
                placeholder="Жанр"
                value={gameFormData.genre}
                onChange={(e) => setGameFormData({...gameFormData, genre: e.target.value})}
              />
              
              <Textarea
                placeholder="Описание"
                value={gameFormData.description}
                onChange={(e) => setGameFormData({...gameFormData, description: e.target.value})}
                rows={3}
              />
              
              <Input
                placeholder="URL изображения"
                value={gameFormData.image_url}
                onChange={(e) => setGameFormData({...gameFormData, image_url: e.target.value})}
              />
              
              <HStack gap={3}>
                <BrandButton intent="primary" onClick={handleUpdateGame} flex={1}>
                  Сохранить
                </BrandButton>
                <BrandButton intent="secondary" onClick={closeEditModal} flex={1}>
                  Отмена
                </BrandButton>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  )
}