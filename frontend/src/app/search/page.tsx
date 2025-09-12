'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  Badge
} from '@chakra-ui/react'

// Временные данные для демонстрации
const mockGames = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Футуристическая RPG в открытом мире',
    size: '70 GB',
    seeders: 245,
    leechers: 12,
    category: 'RPG'
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    description: 'Эпическая фэнтези RPG от CD Projekt RED',
    size: '35 GB',
    seeders: 180,
    leechers: 8,
    category: 'RPG'
  },
  {
    id: 3,
    title: 'Red Dead Redemption 2',
    description: 'Приключения на Диком Западе',
    size: '120 GB',
    seeders: 320,
    leechers: 25,
    category: 'Action'
  }
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredGames, setFilteredGames] = useState(mockGames)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    
    // Имитация поиска
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (searchQuery.trim()) {
      const filtered = mockGames.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredGames(filtered)
    } else {
      setFilteredGames(mockGames)
    }
    
    setIsSearching(false)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="green.600">
              🔍 Поиск игр
            </Heading>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Search Bar */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
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
                  disabled={isSearching}
                >
                  Поиск
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Search Results */}
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md">
                Результаты поиска ({filteredGames.length})
              </Heading>
              <Text color="gray.500">
                {searchQuery ? `По запросу "${searchQuery}"` : 'Все игры'}
              </Text>
            </Flex>

            <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
              {filteredGames.map((game) => (
                <Box key={game.id} p={6} bg="white" borderRadius="lg" shadow="sm">
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1} flex="1">
                        <Heading size="md">{game.title}</Heading>
                        <Text color="gray.600" fontSize="sm">
                          {game.description}
                        </Text>
                      </VStack>
                      <Badge colorScheme="blue" variant="subtle">
                        {game.category}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between" fontSize="sm" color="gray.500">
                      <Text>Размер: {game.size}</Text>
                      <HStack gap={4}>
                        <Text color="green.600">↑ {game.seeders}</Text>
                        <Text color="red.500">↓ {game.leechers}</Text>
                      </HStack>
                    </HStack>

                    <HStack gap={3}>
                      <Button colorScheme="green" flex="1">
                        Скачать
                      </Button>
                      <Button variant="outline" flex="1">
                        Подробнее
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </Grid>

            {filteredGames.length === 0 && (
              <Box p={8} bg="white" borderRadius="lg" shadow="sm" textAlign="center">
                <Text color="gray.500" fontSize="lg">
                  {searchQuery ? 'Игры не найдены' : 'Каталог пуст'}
                </Text>
                <Text color="gray.400" mt={2}>
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Добавьте игры в систему'
                  }
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
