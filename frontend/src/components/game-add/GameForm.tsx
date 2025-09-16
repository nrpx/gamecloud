'use client'

import React from 'react'
import {
  VStack,
  Input,
  Textarea,
  Box,
  Text
} from '@chakra-ui/react'

interface GameData {
  title: string
  description: string
  genre: string
  imageUrl: string
}

interface GameFormProps {
  gameData: GameData
  onGameDataChange: (data: GameData) => void
  errors?: {
    title?: string
    description?: string
    genre?: string
    imageUrl?: string
  }
}

export const GameForm: React.FC<GameFormProps> = ({
  gameData,
  onGameDataChange,
  errors = {}
}) => {
  const handleInputChange = (field: keyof GameData, value: string) => {
    onGameDataChange({
      ...gameData,
      [field]: value
    })
  }

  return (
    <VStack gap={4} align="stretch">
      <Box>
        <Text mb={2} fontWeight="semibold">Название игры</Text>
        <Input
          placeholder="Введите название игры"
          value={gameData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          bg="bg"
          border="1px solid"
          borderColor={errors.title ? "red" : "border"}
          _focus={{
            borderColor: errors.title ? "red" : "gamecloud.primary",
            boxShadow: `0 0 0 1px var(--chakra-colors-${errors.title ? "red" : "gamecloud-primary"})`
          }}
        />
        {errors.title && <Text color="red" fontSize="sm" mt={1}>{errors.title}</Text>}
      </Box>

      <Box>
        <Text mb={2} fontWeight="semibold">Жанр</Text>
        <Input
          placeholder="Например: RPG, Action, Strategy"
          value={gameData.genre}
          onChange={(e) => handleInputChange('genre', e.target.value)}
          bg="bg"
          border="1px solid"
          borderColor={errors.genre ? "red" : "border"}
          _focus={{
            borderColor: errors.genre ? "red" : "gamecloud.primary",
            boxShadow: `0 0 0 1px var(--chakra-colors-${errors.genre ? "red" : "gamecloud-primary"})`
          }}
        />
        {errors.genre && <Text color="red" fontSize="sm" mt={1}>{errors.genre}</Text>}
      </Box>

      <Box>
        <Text mb={2} fontWeight="semibold">Описание</Text>
        <Textarea
          placeholder="Описание игры..."
          value={gameData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          bg="bg"
          border="1px solid"
          borderColor={errors.description ? "red" : "border"}
          _focus={{
            borderColor: errors.description ? "red" : "gamecloud.primary",
            boxShadow: `0 0 0 1px var(--chakra-colors-${errors.description ? "red" : "gamecloud-primary"})`
          }}
        />
        {errors.description && <Text color="red" fontSize="sm" mt={1}>{errors.description}</Text>}
      </Box>

      <Box>
        <Text mb={2} fontWeight="semibold">URL изображения (необязательно)</Text>
        <Input
          placeholder="https://example.com/image.jpg"
          value={gameData.imageUrl}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          bg="bg"
          border="1px solid"
          borderColor={errors.imageUrl ? "red" : "border"}
          _focus={{
            borderColor: errors.imageUrl ? "red" : "gamecloud.primary",
            boxShadow: `0 0 0 1px var(--chakra-colors-${errors.imageUrl ? "red" : "gamecloud-primary"})`
          }}
        />
        {errors.imageUrl && <Text color="red" fontSize="sm" mt={1}>{errors.imageUrl}</Text>}
      </Box>
    </VStack>
  )
}