'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Flex, 
  VStack,
  HStack,
  Text,
  Button, 
  Spinner,
  SimpleGrid,
  Heading,
  Badge,
  Input,
  Textarea
} from '@chakra-ui/react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
import BrandButton from '@/components/ui/BrandButton'
import { formatFileSize, formatSpeed, formatETA } from '@/lib/api'
import { showError } from '@/lib/toast'

// Components
import { GameCard } from '@/components/library/GameCard'
import { GameListItem } from '@/components/library/GameListItem'
import { GameFilters } from '@/components/library/GameFilters'

// Hooks
import { useGameFilters } from '@/hooks/useGameFilters'
import { useGameActions } from '@/hooks/useGameActions'

// Stores
import {
  useGamesLibraryLoading,
  useGamesLibraryData,
  useGamesLibraryInitialized,
  useGamesLibraryError,
  useFetchGames,
  useRefreshGames,
  useClearGames
} from '@/stores/gamesLibraryStore'

interface Game {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
  downloads?: any[]
  created_at: string
}

export default function GamesLibraryPage() {
  const { data: session, status } = useSession()
  
  // WebSocket для real-time обновлений
  const { isConnected, progressUpdates } = useWebSocket()
  
  // Stores
  const games = useGamesLibraryData()
  const isLoading = useGamesLibraryLoading()
  const isInitialized = useGamesLibraryInitialized()
  const error = useGamesLibraryError()
  const fetchGames = useFetchGames()
  const refreshGames = useRefreshGames()
  const clearGames = useClearGames()
  
  // Custom hooks
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    genreFilter,
    setGenreFilter,
    viewMode,
    setViewMode,
    filteredGames
  } = useGameFilters(games)

  const {
    editingGame,
    isEditModalOpen,
    gameFormData,
    setGameFormData,
    isDeleting,
    openEditModal,
    closeEditModal,
    handleSaveGame,
    handleDeleteGame,
    handlePauseDownload,
    handleResumeDownload,
    handleCancelDownload
  } = useGameActions()

  // Инициализация данных при загрузке компонента
  useEffect(() => {
    if (status === 'loading') return
    if (!session) return
    
    if (!isInitialized) {
      console.log('🔄 [GamesLibraryPage] Инициализация: загружаем игры')
      fetchGames()
    }
  }, [session, status, isInitialized, fetchGames, clearGames])

  // Отслеживаем ошибки и показываем уведомления
  useEffect(() => {
    if (error) {
      showError('Ошибка загрузки', error)
    }
  }, [error])

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
          {/* Filters */}
          <GameFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            genreFilter={genreFilter}
            onGenreFilterChange={setGenreFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isLoading={isLoading}
          />

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

          {/* Games Content */}
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
                <BrandButton intent="primary">
                  <Icon name="add" size={16} style={{ marginRight: '6px' }} />
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
            <>
              {viewMode === 'grid' ? (
                // Grid View
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      downloadInfo={game.download || undefined}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                // List View
                <Box overflowX="auto">
                  <Box as="table" w="full" bg="bg.surface" borderRadius="lg" borderWidth="1px">
                    <Box as="thead">
                      <Box as="tr" borderBottom="1px" borderColor="border.muted">
                        <Box as="th" p={3} textAlign="left" fontSize="sm" fontWeight="medium" color="fg.muted">
                          Игра
                        </Box>
                        <Box as="th" p={3} textAlign="left" fontSize="sm" fontWeight="medium" color="fg.muted">
                          Жанр
                        </Box>
                        <Box as="th" p={3} textAlign="left" fontSize="sm" fontWeight="medium" color="fg.muted">
                          Статус
                        </Box>
                        <Box as="th" p={3} textAlign="left" fontSize="sm" fontWeight="medium" color="fg.muted">
                          Прогресс
                        </Box>
                        <Box as="th" p={3} textAlign="left" fontSize="sm" fontWeight="medium" color="fg.muted">
                          Действия
                        </Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {filteredGames.map((game) => {
                        return (
                          <GameListItem
                            key={game.id}
                            game={game}
                            downloadInfo={game.download || undefined}
                            onEdit={() => openEditModal(game)}
                            onDelete={() => handleDeleteGame(game.id)}
                            onPause={game.download ? () => handlePauseDownload(game.download!.id) : undefined}
                            onResume={game.download ? () => handleResumeDownload(game.download!.id) : undefined}
                            onCancel={game.download ? () => handleCancelDownload(game.download!.id) : undefined}
                            isDeleting={isDeleting === game.id}
                          />
                        )
                      })}
                    </Box>
                  </Box>
                </Box>
              )}
            </>
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
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <Box
            bg="bg.surface"
            p={6}
            borderRadius="lg"
            shadow="xl"
            maxW="md"
            w="full"
            mx={4}
          >
            <VStack gap={4} align="stretch">
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
              
              <Input
                placeholder="URL изображения"
                value={gameFormData.image_url}
                onChange={(e) => setGameFormData({...gameFormData, image_url: e.target.value})}
              />
              
              <Textarea
                placeholder="Описание"
                value={gameFormData.description}
                onChange={(e) => setGameFormData({...gameFormData, description: e.target.value})}
                rows={3}
              />
              
              <HStack gap={2} justify="end">
                <Button variant="outline" onClick={closeEditModal}>
                  Отмена
                </Button>
                <Button colorScheme="blue" onClick={handleSaveGame}>
                  Сохранить
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  )
}