'use client'

import { Icon } from '@/components/ui/Icon'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/stores/gameStore'
import { useDownloadStore } from '@/stores/downloadStore'
import { AppHeader } from '@/components/ui/AppHeader'

export default function StatsPage() {
  const router = useRouter()
  const { games, fetchGames } = useGameStore()
  const { downloads, fetchDownloads } = useDownloadStore()

  useEffect(() => {
    fetchGames()
    fetchDownloads()
  }, [fetchGames, fetchDownloads])

  const stats = {
    totalGames: games.length,
    availableGames: games.filter(g => g.status === 'available').length,
    downloadingGames: games.filter(g => g.status === 'downloading').length,
    activeDownloads: downloads.filter(d => d.status === 'downloading').length,
    completedDownloads: downloads.filter(d => d.status === 'completed').length,
    totalDownloads: downloads.length,
  }

  const genres = games.reduce((acc, game) => {
    if (game.genre) {
      acc[game.genre] = (acc[game.genre] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <Box minH="100vh" bg="bg.page">
      <AppHeader />
      
      <Container maxW="1200px" py={4}>
        <VStack gap={4} align="stretch">
          <Heading size="xl" textAlign="center" color="purple.600">
            <Icon name="stats" size={24} style={{ marginRight: '8px' }} />
            Статистика библиотеки
          </Heading>

          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Всего игр</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">{stats.totalGames}</Text>
              </VStack>
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Доступных игр</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">{stats.availableGames}</Text>
              </VStack>
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Загружается</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">{stats.downloadingGames}</Text>
              </VStack>
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Активные загрузки</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">{stats.activeDownloads}</Text>
              </VStack>
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Завершенные загрузки</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">{stats.completedDownloads}</Text>
              </VStack>
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <VStack align="start">
                <Text fontSize="sm" color="fg.muted">Всего загрузок</Text>
                <Text fontSize="2xl" fontWeight="bold" color="fg.muted">{stats.totalDownloads}</Text>
              </VStack>
            </Box>
          </Grid>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>
            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Жанры игр</Heading>
              {Object.keys(genres).length > 0 ? (
                <VStack align="stretch" gap={2}>
                  {Object.entries(genres)
                    .sort(([,a], [,b]) => b - a)
                    .map(([genre, count]) => (
                      <HStack key={genre} justify="space-between">
                        <Text>{genre}</Text>
                        <Badge colorScheme="blue">{count}</Badge>
                      </HStack>
                    ))}
                </VStack>
              ) : (
                <Text color="fg.muted">Нет данных о жанрах</Text>
              )}
            </Box>

            <Box bg="bg.surface" p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Последние загрузки</Heading>
              {downloads.length > 0 ? (
                <VStack align="stretch" gap={2}>
                  {downloads
                    .slice(-5)
                    .reverse()
                    .map((download: any) => (
                      <HStack key={download.id} justify="space-between">
                        <Text fontSize="sm" truncate>
                          {download.game?.title || 'Неизвестная игра'}
                        </Text>
                        <Badge colorScheme={
                          download.status === 'completed' ? 'green' :
                          download.status === 'downloading' ? 'blue' :
                          download.status === 'failed' ? 'red' : 'gray'
                        }>
                          {download.status}
                        </Badge>
                      </HStack>
                    ))}
                </VStack>
              ) : (
                <Text color="fg.muted">Нет загрузок</Text>
              )}
            </Box>
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
}
