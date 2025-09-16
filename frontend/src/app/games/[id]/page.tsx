'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Flex,
  Spinner,
  Progress,
  Grid,
  GridItem,
  Input,
  Textarea,
  Image
} from '@chakra-ui/react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { DownloadActions } from '@/components/library/DownloadActions'
import { useGameActions } from '@/hooks/useGameActions'
import { formatFileSize, formatSpeed, formatETA } from '@/lib/api'
import { showDeleteConfirm } from '@/lib/sweetAlert'
import { showError, showSuccess } from '@/lib/toast'

// Stores
import {
  useGamesLibraryData,
  useFetchGames,
  useGamesLibraryLoading,
  useUpdateGame,
  useDeleteGame
} from '@/stores/gamesLibraryStore'

interface GameDownload {
  id: string
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'seeding'
  progress: number
  total_size: number
  downloaded_size: number
  // Торрент-специфичная информация
  download_speed?: number
  upload_speed?: number
  seeders?: number
  leechers?: number
  peers?: number
  eta?: number
  ratio?: number
}

interface GameWithDownload {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
  download?: GameDownload
  created_at: string
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // States
  const [game, setGame] = useState<GameWithDownload | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    genre: '',
    description: '',
    image_url: '',
    developer: '',
    publisher: '',
    release_date: ''
  })

  // WebSocket для real-time обновлений
  const { isConnected, progressUpdates } = useWebSocket()
  
  // Stores
  const games = useGamesLibraryData()
  const isLoading = useGamesLibraryLoading()
  const fetchGames = useFetchGames()
  const updateGame = useUpdateGame()
  const deleteGame = useDeleteGame()

  // Game actions hook
  const {
    handlePauseDownload,
    handleResumeDownload,
    handleCancelDownload
  } = useGameActions()

  // Получение информации о загрузке игры
  const getGameDownloadInfo = () => {
    if (!game?.download) return null
    
    const progressUpdate = progressUpdates.get(game.download.id)
    
    if (progressUpdate) {
      return { 
        ...game.download, 
        // Маппинг полей из WebSocket ProgressUpdate в наш интерфейс
        id: progressUpdate.id,
        status: progressUpdate.status,
        progress: progressUpdate.progress,
        downloaded_size: progressUpdate.downloaded,
        total_size: progressUpdate.size,
        download_speed: progressUpdate.download_rate,
        upload_speed: progressUpdate.upload_rate,
        eta: progressUpdate.eta,
        peers_connected: progressUpdate.peers,
        seeds_connected: progressUpdate.seeds
      }
    }
    
    return game.download
  }

  const downloadInfo = getGameDownloadInfo()

  // Загрузка данных
  useEffect(() => {
    if (session && status === 'authenticated') {
      fetchGames()
    }
  }, [session, status, fetchGames])

  // Поиск игры по ID
  useEffect(() => {
    if (games && params.id) {
      const foundGame = games.find(g => g.id === params.id)
      if (foundGame) {
        setGame(foundGame)
        setEditForm({
          title: foundGame.title,
          genre: foundGame.genre,
          description: foundGame.description,
          image_url: foundGame.image_url || '',
          developer: '',
          publisher: '',
          release_date: ''
        })
      }
    }
  }, [games, params.id])

  const handleSave = async () => {
    if (!game) return
    
    try {
      await updateGame(game.id, editForm)
      setGame({ ...game, ...editForm })
      setIsEditing(false)
      showSuccess('Игра обновлена', 'Информация об игре успешно сохранена')
    } catch (error) {
      console.error('Error updating game:', error)
      showError('Ошибка сохранения', 'Не удалось сохранить изменения. Попробуйте еще раз.')
    }
  }

  const handleDelete = async () => {
    if (!game) return
    
    const result = await showDeleteConfirm(game.title, 'игру')
    
    if (result.isConfirmed) {
      try {
        await deleteGame(game.id)
        showSuccess('Игра удалена', 'Игра и все связанные загрузки успешно удалены')
        router.push('/games')
      } catch (error) {
        console.error('Error deleting game:', error)
        showError('Ошибка удаления', 'Не удалось удалить игру. Попробуйте еще раз.')
      }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <Box minH="100vh" bg="bg.page">
        <AppHeader />
        <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Загрузка...</Text>
          </VStack>
        </Box>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Box minH="100vh" bg="bg.page">
        <AppHeader />
        <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
          <VStack gap={4}>
            <Text>Необходимо войти в систему</Text>
            <Link href="/auth/signin">
              <Button colorScheme="blue">Войти</Button>
            </Link>
          </VStack>
        </Box>
      </Box>
    )
  }

  if (!game) {
    return (
      <Box minH="100vh" bg="bg.page">
        <AppHeader />
        <Container maxW="7xl" py={8}>
          <VStack gap={4}>
            <Text fontSize="xl" color="fg.muted">Игра не найдена</Text>
            <Link href="/games">
              <Button colorScheme="blue">Вернуться к библиотеке</Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="bg.page">
      <AppHeader />
      
      {/* Hero Section */}
      <Box position="relative" h="400px" overflow="hidden">
        {game.image_url ? (
          <Image
            src={game.image_url}
            alt={game.title}
            w="100%"
            h="100%"
            objectFit="cover"
            filter="blur(8px)"
            transform="scale(1.1)"
          />
        ) : (
          <ImagePlaceholder
            type="hero"
            title={game.title}
            width="100%"
            height="400px"
          />
        )}
        
        {/* Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, blackAlpha.800 0%, blackAlpha.400 50%, blackAlpha.800 100%)"
        />
        
        {/* Content */}
        <Container maxW="7xl" position="relative" h="100%">
          <Flex align="end" h="100%" pb={8}>
            <HStack gap={6} align="end">
              {/* Game Cover */}
              <Box
                w="200px"
                h="300px"
                borderRadius="lg"
                overflow="hidden"
                shadow="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                {game.image_url ? (
                  <Image
                    src={game.image_url}
                    alt={game.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <ImagePlaceholder
                    type="grid"
                    title={game.title}
                    width="200px"
                    height="300px"
                  />
                )}
              </Box>
              
              {/* Game Info */}
              <VStack align="start" gap={3} color="white">
                <Heading size="2xl" textShadow="2px 2px 4px rgba(0,0,0,0.8)">
                  {game.title}
                </Heading>
                
                <HStack gap={3}>
                  <Badge colorScheme="purple" size="lg">
                    {game.genre}
                  </Badge>
                  {downloadInfo && (
                    <Badge 
                      colorScheme={
                        downloadInfo.status === 'completed' ? 'green' :
                        downloadInfo.status === 'downloading' ? 'blue' :
                        downloadInfo.status === 'seeding' ? 'orange' :
                        'gray'
                      }
                      size="lg"
                    >
                      {downloadInfo.status === 'completed' ? 'Готово к игре' :
                       downloadInfo.status === 'downloading' ? `Загружается ${(downloadInfo.progress || 0).toFixed(0)}%` :
                       downloadInfo.status === 'seeding' ? 'Раздаётся' :
                       'Ошибка загрузки'}
                    </Badge>
                  )}
                </HStack>
                
                {/* Detailed Download Info */}
                {downloadInfo && (
                  <Box 
                    p={4} 
                    bg="whiteAlpha.200" 
                    borderRadius="lg" 
                    border="1px solid" 
                    borderColor="whiteAlpha.300"
                  >
                    <VStack align="stretch" gap={3}>
                      <Heading size="md" color="white">
                        Информация о загрузке
                      </Heading>
                      
                      {downloadInfo.status === 'downloading' && (
                        <>
                          <Progress.Root 
                            value={downloadInfo.progress || 0} 
                            size="lg" 
                            colorPalette="blue"
                          >
                            <Progress.Track bg="whiteAlpha.300">
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                          
                          <HStack justify="space-between">
                            <Text color="white" fontSize="sm">
                              {(downloadInfo.progress || 0).toFixed(1)}%
                            </Text>
                            <Text color="whiteAlpha.800" fontSize="sm">
                              {formatFileSize(downloadInfo.downloaded_size || 0)} / {formatFileSize(downloadInfo.total_size || 0)}
                            </Text>
                          </HStack>
                        </>
                      )}
                      
                      <Grid templateColumns="1fr 1fr 1fr" gap={4}>
                        <VStack align="start" gap={1}>
                          <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                            Статус
                          </Text>
                          <Text color="white" fontSize="sm" fontWeight="medium">
                            {downloadInfo.status === 'completed' ? 'Завершено' :
                             downloadInfo.status === 'downloading' ? 'Загружается' :
                             downloadInfo.status === 'seeding' ? 'Раздача' :
                             downloadInfo.status === 'paused' ? 'Пауза' :
                             downloadInfo.status === 'pending' ? 'Ожидание' :
                             'Ошибка'}
                          </Text>
                        </VStack>
                        
                        <VStack align="start" gap={1}>
                          <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                            Размер файла
                          </Text>
                          <Text color="white" fontSize="sm" fontWeight="medium">
                            {formatFileSize(downloadInfo.total_size || 0)}
                          </Text>
                        </VStack>
                        
                        {downloadInfo.status === 'downloading' && downloadInfo.download_speed && (
                          <VStack align="start" gap={1}>
                            <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                              Скорость ⬇
                            </Text>
                            <Text color="white" fontSize="sm" fontWeight="medium">
                              {formatSpeed(downloadInfo.download_speed)}
                            </Text>
                          </VStack>
                        )}
                        
                        {downloadInfo.status === 'downloading' && (
                          <>
                            <VStack align="start" gap={1}>
                              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                Скачано
                              </Text>
                              <Text color="white" fontSize="sm" fontWeight="medium">
                                {formatFileSize(downloadInfo.downloaded_size || 0)}
                              </Text>
                            </VStack>
                            
                            <VStack align="start" gap={1}>
                              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                Осталось
                              </Text>
                              <Text color="white" fontSize="sm" fontWeight="medium">
                                {formatFileSize((downloadInfo.total_size || 0) - (downloadInfo.downloaded_size || 0))}
                              </Text>
                            </VStack>
                            
                            {downloadInfo.eta && (
                              <VStack align="start" gap={1}>
                                <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                  Время до завершения
                                </Text>
                                <Text color="white" fontSize="sm" fontWeight="medium">
                                  {formatETA(downloadInfo.eta)}
                                </Text>
                              </VStack>
                            )}
                          </>
                        )}
                        
                        {(downloadInfo.seeders !== undefined || downloadInfo.peers !== undefined) && (
                          <>
                            <VStack align="start" gap={1}>
                              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                Сиды
                              </Text>
                              <Text color="white" fontSize="sm" fontWeight="medium">
                                {downloadInfo.seeders || 0}
                              </Text>
                            </VStack>
                            
                            <VStack align="start" gap={1}>
                              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                Пиры
                              </Text>
                              <Text color="white" fontSize="sm" fontWeight="medium">
                                {downloadInfo.peers || 0}
                              </Text>
                            </VStack>
                          </>
                        )}
                        
                        {downloadInfo.status === 'seeding' && (
                          <>
                            {downloadInfo.upload_speed && (
                              <VStack align="start" gap={1}>
                                <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                  Скорость ⬆
                                </Text>
                                <Text color="white" fontSize="sm" fontWeight="medium">
                                  {formatSpeed(downloadInfo.upload_speed)}
                                </Text>
                              </VStack>
                            )}
                            
                            {downloadInfo.ratio !== undefined && (
                              <VStack align="start" gap={1}>
                                <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">
                                  Рейтинг
                                </Text>
                                <Text color="white" fontSize="sm" fontWeight="medium">
                                  {downloadInfo.ratio.toFixed(2)}
                                </Text>
                              </VStack>
                            )}
                          </>
                        )}
                      </Grid>
                    </VStack>
                  </Box>
                )}
                
                {editForm.developer && (
                  <Text fontSize="lg" opacity={0.9}>
                    Разработчик: {editForm.developer}
                  </Text>
                )}
                
                {editForm.publisher && (
                  <Text fontSize="lg" opacity={0.9}>
                    Издатель: {editForm.publisher}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <Grid templateColumns="2fr 1fr" gap={8}>
          {/* Left Column - Description and Details */}
          <GridItem>
            <VStack align="stretch" gap={6}>
              {/* Action Buttons */}
              <HStack gap={3}>
                {downloadInfo?.status === 'completed' && (
                  <Button size="lg" colorScheme="green">
                    <Icon name="play" size={20} style={{ marginRight: '8px' }} />
                    Играть
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Icon name="edit" size={20} style={{ marginRight: '8px' }} />
                  {isEditing ? 'Отмена' : 'Редактировать'}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="red"
                  onClick={handleDelete}
                >
                  <Icon name="delete" size={20} style={{ marginRight: '8px' }} />
                  Удалить
                </Button>
                
                <Link href="/games">
                  <Button size="lg" variant="ghost">
                    <Icon name="library" size={20} style={{ marginRight: '8px' }} />
                    К библиотеке
                  </Button>
                </Link>
              </HStack>

              {/* Description */}
              <Box>
                <Heading size="lg" mb={4}>Описание</Heading>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Описание игры"
                    rows={5}
                  />
                ) : (
                  <Text fontSize="md" lineHeight="tall" color="fg.muted">
                    {game.description || 'Описание отсутствует'}
                  </Text>
                )}
              </Box>

              {/* Edit Form */}
              {isEditing && (
                <VStack align="stretch" gap={4}>
                  <Heading size="md">Редактирование</Heading>
                  
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Input
                      placeholder="Название"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                    <Input
                      placeholder="Жанр"
                      value={editForm.genre}
                      onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                    />
                    <Input
                      placeholder="Разработчик"
                      value={editForm.developer}
                      onChange={(e) => setEditForm({...editForm, developer: e.target.value})}
                    />
                    <Input
                      placeholder="Издатель"
                      value={editForm.publisher}
                      onChange={(e) => setEditForm({...editForm, publisher: e.target.value})}
                    />
                  </Grid>
                  
                  <Input
                    placeholder="URL изображения"
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({...editForm, image_url: e.target.value})}
                  />
                  
                  <Input
                    type="date"
                    placeholder="Дата выхода"
                    value={editForm.release_date}
                    onChange={(e) => setEditForm({...editForm, release_date: e.target.value})}
                  />
                  
                  <HStack gap={3}>
                    <Button colorScheme="blue" onClick={handleSave}>
                      Сохранить
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </GridItem>

          {/* Right Column - Download Info and Stats */}
          <GridItem>
            <VStack align="stretch" gap={6}>
              {/* Download Status */}
              {downloadInfo && (
                <Box p={6} bg="bg.surface" borderRadius="lg" borderWidth="1px">
                  <VStack align="stretch" gap={4}>
                    <Heading size="md">Загрузка</Heading>
                    
                    {downloadInfo.status === 'downloading' && (
                      <>
                        <Progress.Root 
                          value={downloadInfo.progress || 0} 
                          size="lg" 
                          colorPalette="blue"
                        >
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                        
                        <HStack justify="space-between">
                          <Text fontSize="lg" fontWeight="bold">
                            {(downloadInfo.progress || 0).toFixed(1)}%
                          </Text>
                          <Text color="fg.muted">
                            {formatSpeed(downloadInfo.download_speed || 0)}/с
                          </Text>
                        </HStack>
                        
                        <VStack align="stretch" gap={2} fontSize="sm" color="fg.muted">
                          <HStack justify="space-between">
                            <Text>Скачано:</Text>
                            <Text>{formatFileSize(downloadInfo.downloaded_size || 0)}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Размер:</Text>
                            <Text>{formatFileSize(downloadInfo.total_size || 0)}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Осталось:</Text>
                            <Text>{formatETA(downloadInfo.eta || 0)}</Text>
                          </HStack>
                        </VStack>
                      </>
                    )}
                    
                    <DownloadActions
                      downloadInfo={downloadInfo}
                      onPause={handlePauseDownload}
                      onResume={handleResumeDownload}
                      onCancel={handleCancelDownload}
                      onDelete={handleDelete}
                      isDeleting={false}
                    />
                  </VStack>
                </Box>
              )}

              {/* Game Stats */}
              <Box p={6} bg="bg.surface" borderRadius="lg" borderWidth="1px">
                <VStack align="stretch" gap={4}>
                  <Heading size="md">Информация</Heading>
                  
                  <VStack align="stretch" gap={2} fontSize="sm">
                    <HStack justify="space-between">
                      <Text color="fg.muted">Добавлена:</Text>
                      <Text>{new Date(game.created_at).toLocaleDateString('ru-RU')}</Text>
                    </HStack>
                    
                    {editForm.release_date && (
                      <HStack justify="space-between">
                        <Text color="fg.muted">Дата выхода:</Text>
                        <Text>{new Date(editForm.release_date).toLocaleDateString('ru-RU')}</Text>
                      </HStack>
                    )}
                    
                    <HStack justify="space-between">
                      <Text color="fg.muted">Статус:</Text>
                      <Badge colorScheme="blue">
                        В библиотеке
                      </Badge>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}