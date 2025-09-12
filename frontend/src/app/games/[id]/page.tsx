'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  VStack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useDownloadStore } from '@/stores/downloadStore'
import { Game } from '@/types'
import ProtectedPage from '@/components/ProtectedPage'

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { games, fetchGames, deleteGame } = useGameStore()
  const { downloads, createDownload } = useDownloadStore()
  const [game, setGame] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  useEffect(() => {
    if (games.length > 0 && params.id) {
      const foundGame = games.find(g => g.id === params.id)
      setGame(foundGame || null)
      setIsLoading(false)
    }
  }, [games, params.id])

  const handleDownload = (gameId: string) => {
    createDownload({
      game_id: gameId,
      magnet_url: 'magnet:?xt=urn:btih:example',
      status: 'queued',
      progress: 0
    })
  }

  const handleDeleteGame = async () => {
    if (!game) return
    
    if (confirm('Вы уверены, что хотите удалить эту игру?')) {
      try {
        await deleteGame(game.id)
        router.push('/')
      } catch (error) {
        alert('Ошибка при удалении игры')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green'
      case 'downloading': return 'blue'
      case 'not_available': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Доступно'
      case 'downloading': return 'Загружается'
      case 'not_available': return 'Недоступно'
      default: return 'Неизвестно'
    }
  }

  if (isLoading) {
    return (
      <ProtectedPage>
        <Container maxW="1200px" py={8}>
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Загрузка игры...</Text>
          </VStack>
        </Container>
      </ProtectedPage>
    )
  }

  if (!game) {
    return (
      <ProtectedPage>
        <Container maxW="1200px" py={8}>
          <VStack gap={4}>
            <Heading size="lg">Игра не найдена</Heading>
            <Button onClick={() => router.push('/')}>
              Вернуться к библиотеке
            </Button>
          </VStack>
        </Container>
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage>
      <Container maxW="1200px" py={8}>
        <VStack gap={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              ← Назад к библиотеке
            </Button>
            <HStack>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleDeleteGame}
              >
                Удалить игру
              </Button>
            </HStack>
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
            <GridItem>
              <Box>
                <Image
                  src={game.cover_url || 'https://via.placeholder.com/300x400/333/fff?text=No+Cover'}
                  alt={game.title}
                  w="full"
                  borderRadius="lg"
                  boxShadow="lg"
                />
              </Box>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={4}>
                <Box>
                  <HStack mb={2}>
                    <Heading size="xl">{game.title}</Heading>
                    <Badge colorScheme={getStatusColor(game.status)}>
                      {getStatusText(game.status)}
                    </Badge>
                  </HStack>
                </Box>

                {game.description && (
                  <Box>
                    <Heading size="md" mb={2}>Описание</Heading>
                    <Text>{game.description}</Text>
                  </Box>
                )}

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  {game.genre && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Жанр</Text>
                      <Text>{game.genre}</Text>
                    </Box>
                  )}

                  {game.developer && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Разработчик</Text>
                      <Text>{game.developer}</Text>
                    </Box>
                  )}

                  {game.publisher && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Издатель</Text>
                      <Text>{game.publisher}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="bold" color="gray.600">Дата добавления</Text>
                    <Text>{game.created_at ? new Date(game.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</Text>
                  </Box>
                </Grid>

                <Box w="full">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    onClick={() => handleDownload(game.id)}
                    disabled={game.status === 'available' || game.status === 'downloading'}
                  >
                    {game.status === 'available' ? 'Установлено' : 
                     game.status === 'downloading' ? 'Загружается' : 'Скачать'}
                  </Button>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </ProtectedPage>
  )
}
