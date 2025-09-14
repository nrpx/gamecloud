'use client'

import {
  Box,
  Input,
  VStack,
  Text,
  Button,
  HStack,
  Image,
  Badge,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { Game } from '@/types'

interface SearchGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameSelect: (game: Game) => void
}

export default function SearchGameModal({ isOpen, onClose, onGameSelect }: SearchGameModalProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { searchGames } = useGameStore()

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const results = await searchGames(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGameSelect = (game: Game) => {
    onGameSelect(game)
    setQuery('')
    setSearchResults([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
      p={4}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Box
        bg="bg.surface"
        borderRadius="lg"
        boxShadow="xl"
        maxW="2xl"
        w="full"
        maxH="90vh"
        overflow="auto"
        p={6}
      >
        <VStack gap={4} align="stretch">
          <Text fontWeight="bold" fontSize="lg">
            Поиск игр
          </Text>

          <HStack>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите название игры"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              colorScheme="blue"
              onClick={handleSearch}
              loading={isSearching}
              loadingText="Поиск..."
            >
              Найти
            </Button>
          </HStack>

          {searchResults.length > 0 && (
            <VStack gap={3} align="stretch" maxH="400px" overflow="auto">
              {searchResults.map((game) => (
                <Box
                  key={game.id}
                  p={3}
                  border="1px"
                  borderColor="border.muted"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleGameSelect(game)}
                >
                  <HStack gap={3}>
                    {game.cover_url && (
                      <Image
                        src={game.cover_url}
                        alt={game.title}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    )}
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold">{game.title}</Text>
                      <Text fontSize="sm" color="fg.muted" lineClamp={2}>
                        {game.description}
                      </Text>
                      <HStack gap={2}>
                        {game.genre && <Badge size="sm">{game.genre}</Badge>}
                        {game.developer && (
                          <Text fontSize="xs" color="fg.muted">
                            {game.developer}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          <HStack justify="end">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
