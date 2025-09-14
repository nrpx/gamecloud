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
  Textarea
} from '@chakra-ui/react'

export default function AddGamePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    torrentFile: null as File | null,
    magnetLink: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, torrentFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Здесь будет вызов API для добавления игры
    console.log('Submitting game:', formData)
    
    // Имитация API вызова
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    alert('Игра успешно добавлена!')
  }

  return (
    <Box minH="100vh" bg="bg.page">
      {/* Header */}
      <Box bg="bg.surface" shadow="sm" borderBottom="1px" borderColor="border.muted">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              📁 Добавить игру
            </Heading>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box maxW="4xl" mx="auto" px={6} py={8}>
        <form onSubmit={handleSubmit}>
          <VStack gap={8} align="stretch">
            {/* Game Info Card */}
            <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
              <Heading size="md" mb={6}>Информация об игре</Heading>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Название игры *</Text>
                  <Input
                    placeholder="Введите название игры"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Описание</Text>
                  <Textarea
                    placeholder="Краткое описание игры, жанр, год выпуска и т.д."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </Box>
              </VStack>
            </Box>

            {/* Torrent Upload Card */}
            <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
              <Heading size="md" mb={6}>Загрузка торрента</Heading>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Файл торрента</Text>
                  <Input
                    type="file"
                    accept=".torrent"
                    onChange={handleFileChange}
                    p={1}
                  />
                  <Text fontSize="sm" color="fg.muted" mt={1}>
                    Поддерживаются файлы .torrent
                  </Text>
                </Box>
                
                <Box textAlign="center" py={4}>
                  <Text color="fg.muted">или</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Magnet-ссылка</Text>
                  <Input
                    placeholder="magnet:?xt=urn:btih:..."
                    value={formData.magnetLink}
                    onChange={(e) => handleInputChange('magnetLink', e.target.value)}
                  />
                  <Text fontSize="sm" color="fg.muted" mt={1}>
                    Вставьте magnet-ссылку для скачивания
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Submit Actions */}
            <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
              <HStack gap={4} justify="end">
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Отмена
                  </Button>
                </Link>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  loading={isSubmitting}
                  disabled={!formData.title || (!formData.torrentFile && !formData.magnetLink)}
                >
                  {isSubmitting ? 'Добавляется...' : 'Добавить игру'}
                </Button>
              </HStack>
            </Box>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}
