'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Input, 
  VStack,
  HStack,
  Grid,
  Flex
} from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'

export default function SearchGamesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults] = useState([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Реализовать поиск игр
    console.log('Поиск игр:', searchQuery)
  }

  return (
    <Box minH="100vh" bg="bg.page">
      {/* Header */}
      <Box bg="bg.surface" shadow="sm" borderBottom="1px" borderColor="border.muted">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              <Icon name="search" size={28} style={{ marginRight: '8px', display: 'inline' }} />
              Поиск игр
            </Heading>
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box maxW="6xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Search Form */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <VStack gap={4} align="stretch">
              <Heading size="md">Найти игры</Heading>
              <form onSubmit={handleSearch}>
                <VStack gap={4} align="stretch">
                  <Input
                    placeholder="Введите название игры..."
                    size="lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    size="lg"
                    disabled={!searchQuery.trim()}
                  >
                    Искать
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>

          {/* Search Filters */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Фильтры</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <VStack align="start">
                <Text fontWeight="bold">Жанр</Text>
                <Button variant="outline" size="sm">Все жанры</Button>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Год выпуска</Text>
                <Button variant="outline" size="sm">Любой год</Button>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Рейтинг</Text>
                <Button variant="outline" size="sm">Любой рейтинг</Button>
              </VStack>
            </Grid>
          </Box>

          {/* Search Results */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Результаты поиска</Heading>
            {searchResults.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="fg.muted" mb={4}>
                  Введите запрос для поиска игр
                </Text>
                <Text color="fg.muted">
                  Используйте поисковую строку выше
                </Text>
              </Box>
            ) : (
              <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                {/* Здесь будут результаты поиска */}
              </Grid>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
