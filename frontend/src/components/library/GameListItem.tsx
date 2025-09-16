'use client'

import React from 'react'
import Link from 'next/link'
import { Box, HStack, VStack, Text, Badge } from '@chakra-ui/react'
import { Progress } from '@chakra-ui/react'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { GameActions } from '@/components/library/GameActions'

interface GameListItemProps {
  game: {
    id: string
    title: string
    genre: string
    description: string
    image_url?: string
  }
  downloadInfo?: {
    id: string
    status: string
    progress?: number
    download_speed?: number
  }
  onEdit: () => void
  onDelete: () => void
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  isDeleting: boolean
}

export const GameListItem: React.FC<GameListItemProps> = ({ 
  game, 
  downloadInfo, 
  onEdit,
  onDelete,
  onPause,
  onResume,
  onCancel,
  isDeleting
}) => {
  const formatSpeed = (speed: number) => {
    if (speed < 1024) return `${speed.toFixed(0)} B`
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB`
    if (speed < 1024 * 1024 * 1024) return `${(speed / (1024 * 1024)).toFixed(1)} MB`
    return `${(speed / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <Box 
      as="tr" 
      borderBottom="1px" 
      borderColor="border.subtle"
      _hover={{ bg: "bg.muted" }}
      transition="background 0.2s"
    >
      <Box as="td" p={3}>
        <HStack gap={3}>
          <Box w="40px" h="40px">
            {game.image_url ? (
              <img 
                src={game.image_url} 
                alt={game.title}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
            ) : (
              <ImagePlaceholder 
                type="icon" 
                title={game.title}
                width="40px"
                height="40px"
              />
            )}
          </Box>
          <VStack align="start" gap={0} flex={1}>
            <Link href={`/games/${game.id}`}>
              <Text fontWeight="medium" color="fg.default" _hover={{ color: "blue.500" }}>
                {game.title}
              </Text>
            </Link>
            <Text 
              fontSize="sm" 
              color="fg.muted" 
              textOverflow="ellipsis" 
              overflow="hidden" 
              whiteSpace="nowrap"
            >
              {game.description}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <Box as="td" p={3}>
        <Badge colorScheme="purple" size="sm">
          {game.genre}
        </Badge>
      </Box>
      <Box as="td" p={3}>
        {downloadInfo ? (
          <Badge 
            colorScheme={
              downloadInfo.status === 'completed' ? 'green' :
              downloadInfo.status === 'downloading' ? 'blue' :
              downloadInfo.status === 'seeding' ? 'orange' :
              downloadInfo.status === 'paused' ? 'yellow' :
              'gray'
            }
            size="sm"
          >
            {downloadInfo.status === 'completed' ? 'Готово' :
             downloadInfo.status === 'downloading' ? 'Загружается' :
             downloadInfo.status === 'seeding' ? 'Раздача' :
             downloadInfo.status === 'paused' ? 'Пауза' :
             'Ошибка'}
          </Badge>
        ) : (
          <Text fontSize="sm" color="fg.muted">Нет загрузки</Text>
        )}
      </Box>
      <Box as="td" p={3}>
        {downloadInfo?.status === 'downloading' ? (
          <VStack align="start" gap={1} minW="150px">
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">{(downloadInfo.progress || 0).toFixed(1)}%</Text>
              <Text fontSize="xs" color="fg.muted">
                {formatSpeed(downloadInfo.download_speed || 0)}/с
              </Text>
            </HStack>
            <Progress.Root value={downloadInfo.progress || 0} size="sm" w="full" colorPalette="blue">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        ) : downloadInfo?.status === 'completed' ? (
          <Text fontSize="sm" color="green.500">100%</Text>
        ) : (
          <Text fontSize="sm" color="fg.muted">—</Text>
        )}
      </Box>
      <Box as="td" p={3}>
        <GameActions
          downloadInfo={downloadInfo}
          onEdit={onEdit}
          onDelete={onDelete}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          isDeleting={isDeleting}
        />
      </Box>
    </Box>
  )
}