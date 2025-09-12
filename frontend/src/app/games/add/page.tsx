'use client'

import { useSession } from 'next-auth/react'
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
  Textarea
} from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { gamesApi, downloadsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AddGamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    genre: '',
    torrentUrl: '',
    imageUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Создаем игру
      const newGame = await gamesApi.create({
        title: gameData.title,
        description: gameData.description,
        genre: gameData.genre,
        torrent_url: gameData.torrentUrl,
        image_url: gameData.imageUrl || undefined,
      })

      // Создаем загрузку
      await downloadsApi.create({
        game_id: newGame.id,
        torrent_url: gameData.torrentUrl
      })
      
      alert('Игра успешно добавлена и запущена загрузка!')
      router.push('/games')
    } catch (error) {
      console.error('Ошибка добавления игры:', error)
      alert(`Ошибка при добавлении игры: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
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
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              📁 Добавить игру
            </Heading>
          </HStack>
          <HStack gap={4}>
            <Badge colorScheme="green">{session?.user.role}</Badge>
            <Text fontSize="sm">@{session?.user.username}</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box maxW="4xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          <Box p={8} bg="white" borderRadius="lg" shadow="sm">
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Название игры *</Text>
                  <Input
                    value={gameData.title}
                    onChange={(e) => setGameData({...gameData, title: e.target.value})}
                    placeholder="Введите название игры"
                    required
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Жанр *</Text>
                  <select
                    value={gameData.genre}
                    onChange={(e) => setGameData({...gameData, genre: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Выберите жанр</option>
                    <option value="action">Экшен</option>
                    <option value="adventure">Приключения</option>
                    <option value="rpg">RPG</option>
                    <option value="strategy">Стратегия</option>
                    <option value="simulation">Симулятор</option>
                    <option value="racing">Гонки</option>
                    <option value="sports">Спорт</option>
                    <option value="puzzle">Головоломка</option>
                  </select>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Описание</Text>
                  <Textarea
                    value={gameData.description}
                    onChange={(e) => setGameData({...gameData, description: e.target.value})}
                    placeholder="Описание игры..."
                    rows={4}
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Торрент-ссылка *</Text>
                  <Input
                    value={gameData.torrentUrl}
                    onChange={(e) => setGameData({...gameData, torrentUrl: e.target.value})}
                    placeholder="magnet:?xt=urn:btih:... или ссылка на .torrent файл"
                    required
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Ссылка на изображение</Text>
                  <Input
                    value={gameData.imageUrl}
                    onChange={(e) => setGameData({...gameData, imageUrl: e.target.value})}
                    placeholder="https://example.com/cover.jpg"
                  />
                </Box>

                <HStack justify="space-between" pt={4}>
                  <Link href="/">
                    <Button variant="ghost" size="lg">
                      Отмена
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    loading={isLoading}
                    disabled={!gameData.title || !gameData.genre || !gameData.torrentUrl}
                  >
                    Добавить игру
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
