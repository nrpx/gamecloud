'use client'

import {
  Button,
  Input,
  Textarea,
  VStack,
  Text,
  Box,
  HStack,
  Flex,
  CloseButton,
  Heading,
  Portal,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CreateGame } from '@/types'

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    developer: '',
    publisher: '',
    magnetLink: '',
    torrentFile: null as File | null,
    cover_url: ''
  })
  
  const { addGame } = useGameStore()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.torrent')) {
      setFormData(prev => ({ ...prev, torrentFile: file }))
    } else {
      alert('Пожалуйста, выберите .torrent файл')
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Название игры обязательно')
      return
    }

    if (!formData.magnetLink.trim() && !formData.torrentFile) {
      alert('Укажите magnet-ссылку или загрузите .torrent файл')
      return
    }

    setIsLoading(true)
    
    try {
      const gameData: CreateGame = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre.trim(),
        developer: formData.developer.trim(),
        publisher: formData.publisher.trim(),
        status: 'not_available',
        cover_url: formData.cover_url.trim() || 'https://via.placeholder.com/300x400/333/fff?text=' + encodeURIComponent(formData.title)
      }

      // Сначала добавляем игру
      const newGame = await addGame(gameData)
      console.log('Игра добавлена:', newGame)
      
      // Затем начинаем загрузку торрента
      if (formData.magnetLink || formData.torrentFile) {
        try {
          if (formData.magnetLink) {
            // Добавляем магнет-ссылку через API
            const response = await fetch('http://localhost:8080/api/v1/downloads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                game_id: newGame?.id || 'temp-id', // Используем ID новой игры
                magnet_url: formData.magnetLink,
                status: 'queued',
                progress: 0
              })
            })
            
            if (!response.ok) {
              throw new Error('Ошибка при создании загрузки')
            }
            
            console.log('Загрузка по magnet-ссылке начата')
          } else if (formData.torrentFile) {
            // Загружаем .torrent файл
            const formDataFile = new FormData()
            formDataFile.append('torrent', formData.torrentFile)
            formDataFile.append('game_id', newGame?.id || 'temp-id')
            
            const response = await fetch('http://localhost:8080/api/v1/downloads/torrent', {
              method: 'POST',
              body: formDataFile
            })
            
            if (!response.ok) {
              throw new Error('Ошибка при загрузке торрент-файла')
            }
            
            console.log('Загрузка по .torrent файлу начата')
          }
        } catch (torrentError) {
          console.error('Ошибка при добавлении торрента:', torrentError)
          alert('Игра добавлена, но не удалось начать загрузку торрента')
        }
      }

      alert('Игра успешно добавлена!')
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        genre: '',
        developer: '',
        publisher: '',
        magnetLink: '',
        torrentFile: null,
        cover_url: ''
      })
      
      onClose()
    } catch (error) {
      console.error('Ошибка при добавлении игры:', error)
      alert('Не удалось добавить игру')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      developer: '',
      publisher: '',
      magnetLink: '',
      torrentFile: null,
      cover_url: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <Portal>
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
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          maxW="2xl"
          w="full"
          maxH="90vh"
          overflow="auto"
          p={6}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md">Добавить игру</Heading>
            <CloseButton onClick={handleClose} />
          </Flex>
          
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Название игры *</Text>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введите название игры"
              />
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Описание</Text>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Описание игры"
                rows={3}
              />
            </Box>

            <HStack>
              <Box flex={1}>
                <Text fontWeight="bold" mb={2}>Жанр</Text>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                >
                  <option value="">Выберите жанр</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="RPG">RPG</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Sports">Sports</option>
                  <option value="Racing">Racing</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Horror">Horror</option>
                </select>
              </Box>

              <Box flex={1}>
                <Text fontWeight="bold" mb={2}>Разработчик</Text>
                <Input
                  value={formData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  placeholder="Разработчик"
                />
              </Box>
            </HStack>

            <Box>
              <Text fontWeight="bold" mb={2}>Издатель</Text>
              <Input
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
                placeholder="Издатель"
              />
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>URL обложки</Text>
              <Input
                value={formData.cover_url}
                onChange={(e) => handleInputChange('cover_url', e.target.value)}
                placeholder="https://example.com/cover.jpg (необязательно)"
              />
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Источник торрента</Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Укажите magnet-ссылку или загрузите .torrent файл
              </Text>
              
              <VStack gap={3} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Magnet-ссылка</Text>
                  <Input
                    value={formData.magnetLink}
                    onChange={(e) => handleInputChange('magnetLink', e.target.value)}
                    placeholder="magnet:?xt=urn:btih:..."
                  />
                </Box>

                <Text textAlign="center" color="gray.500">или</Text>

                <Box>
                  <Text fontWeight="bold" mb={2}>.torrent файл</Text>
                  <Input
                    type="file"
                    accept=".torrent"
                    onChange={handleFileChange}
                    pt={1}
                  />
                  {formData.torrentFile && (
                    <Text fontSize="sm" color="green.500" mt={1}>
                      Выбран файл: {formData.torrentFile.name}
                    </Text>
                  )}
                </Box>
              </VStack>
            </Box>

            <HStack pt={4} justify="end">
              <Button variant="ghost" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                loading={isLoading}
                loadingText="Добавление..."
              >
                Добавить игру
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Portal>
  )
}
