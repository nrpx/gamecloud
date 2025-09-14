'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  Input,
  Grid,
  Badge,
  Spinner
} from '@chakra-ui/react'
import { AppHeader } from '@/components/ui/AppHeader'
import { searchApi, Game } from '@/lib/api'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Обрабатываем параметр поиска из URL
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setError(null)
    setHasSearched(true)
    
    try {
      const results = await searchApi.searchGames(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Ошибка поиска:', err)
      setError('Ошибка при выполнении поиска. Попробуйте снова.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = () => {
    performSearch(searchQuery)
  }

  return (
    <Box minH="100vh" bg="bg.page">
      <AppHeader />
      
      {/* Main Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Page Header */}
          <Heading size="lg" color="green.600" textAlign="center">
            <Icon name="search" size={24} style={{ marginRight: '8px' }} />
            Поиск игр
          </Heading>
          
          {/* Search Bar */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <VStack gap={4}>
              <Heading size="md" textAlign="center">Найти игры в каталоге</Heading>
              <HStack gap={4} w="full" maxW="2xl">
                <Input
                  placeholder="Введите название игры..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  size="lg"
                />
                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={handleSearch}
                  loading={isSearching}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  Поиск
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Search Results */}
          <Box>
            {isSearching && (
              <VStack py={8}>
                <Spinner size="lg" />
                <Text>Поиск игр...</Text>
              </VStack>
            )}

            {!isSearching && hasSearched && (
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">
                  Результаты поиска ({searchResults.length})
                </Heading>
                <Text color="fg.muted">
                  {searchQuery ? `По запросу "${searchQuery}"` : 'Все игры'}
                </Text>
              </Flex>
            )}

            {error && (
              <Box p={4} bg="red.50" borderRadius="lg" mb={4}>
                <Text color="red.600">{error}</Text>
              </Box>
            )}

            {!isSearching && !error && searchResults.length > 0 && (
              <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
                {searchResults.map((game) => (
                  <Box key={game.id} p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1} flex="1">
                          <Heading size="md">{game.title}</Heading>
                          <Text color="fg.muted" fontSize="sm">
                            {game.description}
                          </Text>
                        </VStack>
                        <Badge colorScheme="blue" variant="subtle">
                          {game.genre || 'Unknown'}
                        </Badge>
                      </HStack>

                      <HStack justify="space-between" fontSize="sm" color="fg.muted">
                        <Text>
                          Размер: {game.file_size ? 
                            `${(game.file_size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 
                            'Unknown'}
                        </Text>
                        <Text color="fg.muted">
                          {game.developer && `${game.developer}`}
                        </Text>
                      </HStack>

                      <HStack gap={3}>
                        <Button colorScheme="green" flex="1">
                          Добавить в библиотеку
                        </Button>
                        <Button variant="outline" flex="1">
                          Подробнее
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </Grid>
            )}

            {!isSearching && !error && hasSearched && searchResults.length === 0 && (
              <Box p={8} bg="bg.surface" borderRadius="lg" shadow="sm" textAlign="center">
                <Text color="fg.muted" fontSize="lg">
                  Игры не найдены по запросу "{searchQuery}"
                </Text>
                <Text color="fg.muted" fontSize="sm" mt={2}>
                  Попробуйте изменить поисковый запрос
                </Text>
              </Box>
            )}

            {!hasSearched && !isSearching && (
              <Box p={8} bg="bg.surface" borderRadius="lg" shadow="sm" textAlign="center">
                <Text color="fg.muted" fontSize="lg">
                  Введите запрос для поиска игр
                </Text>
                <Text color="fg.muted" fontSize="sm" mt={2}>
                  Используйте глобальную поисковую строку или поле выше
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}