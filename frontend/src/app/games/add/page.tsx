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
import BrandButton from '@/components/ui/BrandButton'
import { Icon } from '@/components/ui/Icon'
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
  const [torrentFile, setTorrentFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
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
        torrent_url: uploadMethod === 'url' ? gameData.torrentUrl : '',
        image_url: gameData.imageUrl || undefined,
      })

      // Создаем загрузку в зависимости от метода
      if (uploadMethod === 'url') {
        await downloadsApi.create({
          game_id: newGame.id,
          torrent_url: gameData.torrentUrl
        })
      } else if (uploadMethod === 'file' && torrentFile) {
        // Загружаем torrent файл
        await uploadTorrentFile(newGame.id, torrentFile)
      }
      
      alert('Игра успешно добавлена и запущена загрузка!')
      router.push('/games')
    } catch (error) {
      console.error('Ошибка добавления игры:', error)
      alert(`Ошибка при добавлении игры: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для загрузки торрент файла
  const uploadTorrentFile = async (gameId: string, file: File) => {
    const formData = new FormData()
    formData.append('torrent', file)
    formData.append('game_id', gameId)

    const response = await fetch('/api/v1/downloads/torrent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await response.json()
  }

  // Функция для получения токена
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/token')
      if (!response.ok) {
        throw new Error('Failed to get auth token')
      }
      const data = await response.json()
      return data.token
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
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
              <Icon name="add" size={28} style={{ marginRight: '8px', display: 'inline' }} />
              Добавить игру
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
          <Box p={8} bg="bg.surface" borderRadius="lg" shadow="sm">
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
                  <Text fontWeight="bold" mb={4}>Метод добавления торрента *</Text>
                  <HStack gap={4} mb={4}>
                    <Button
                      variant={uploadMethod === 'url' ? 'solid' : 'outline'}
                      colorScheme="blue"
                      onClick={() => setUploadMethod('url')}
                      size="sm"
                    >
                      По ссылке
                    </Button>
                    <Button
                      variant={uploadMethod === 'file' ? 'solid' : 'outline'}
                      colorScheme="blue"
                      onClick={() => setUploadMethod('file')}
                      size="sm"
                    >
                      Загрузить файл
                    </Button>
                  </HStack>

                  {uploadMethod === 'url' ? (
                    <Input
                      value={gameData.torrentUrl}
                      onChange={(e) => setGameData({...gameData, torrentUrl: e.target.value})}
                      placeholder="magnet:?xt=urn:btih:... или ссылка на .torrent файл"
                      required
                    />
                  ) : (
                    <Input
                      type="file"
                      accept=".torrent"
                      onChange={(e) => setTorrentFile(e.target.files?.[0] || null)}
                      required
                    />
                  )}
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
                    <BrandButton intent="secondary" size="lg">
                      Отмена
                    </BrandButton>
                  </Link>
                  <BrandButton
                    type="submit"
                    intent="primary"
                    size="lg"
                    loading={isLoading}
                    disabled={
                      !gameData.title || 
                      !gameData.genre || 
                      (uploadMethod === 'url' && !gameData.torrentUrl) ||
                      (uploadMethod === 'file' && !torrentFile)
                    }
                  >
                    Добавить игру
                  </BrandButton>
                </HStack>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
