'use client'

import React from 'react'
import Link from 'next/link'
import { Box, VStack, Heading, Badge, Text } from '@chakra-ui/react'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

interface GameCardProps {
  game: {
    id: string
    title: string
    genre: string
    description: string
    image_url?: string
  }
  downloadInfo?: {
    status: string
    progress?: number
  }
}

export const GameCard: React.FC<GameCardProps> = ({ game, downloadInfo }) => {
  return (
    <Link href={`/games/${game.id}`}>
      <Box 
        bg="bg.surface" 
        borderRadius="lg" 
        shadow="sm"
        borderWidth="1px"
        _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        transition="all 0.2s"
        cursor="pointer"
        overflow="hidden"
      >
        {/* Game Image */}
        <Box position="relative" h="200px">
          {game.image_url ? (
            <img 
              src={game.image_url} 
              alt={game.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <ImagePlaceholder 
              type="grid" 
              title={game.title}
              width="100%"
              height="200px"
            />
          )}
          
          {/* Status Overlay */}
          {downloadInfo && (
            <Box
              position="absolute"
              top={2}
              right={2}
              bg="blackAlpha.700"
              borderRadius="md"
              px={2}
              py={1}
            >
              <Badge 
                colorScheme={
                  downloadInfo.status === 'completed' ? 'green' :
                  downloadInfo.status === 'downloading' ? 'blue' :
                  downloadInfo.status === 'seeding' ? 'orange' :
                  'gray'
                }
                size="sm"
              >
                {downloadInfo.status === 'completed' ? 'Готово' :
                 downloadInfo.status === 'downloading' ? `${(downloadInfo.progress || 0).toFixed(0)}%` :
                 downloadInfo.status === 'seeding' ? 'Раздача' :
                 'Ошибка'}
              </Badge>
            </Box>
          )}
        </Box>
        
        {/* Game Info */}
        <VStack align="stretch" p={4} gap={2}>
          <Heading 
            size="sm" 
            color="fg.default" 
            textOverflow="ellipsis" 
            overflow="hidden"
            css={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {game.title}
          </Heading>
          <Badge colorScheme="purple" size="sm" alignSelf="start">
            {game.genre}
          </Badge>
          <Text 
            fontSize="sm" 
            color="fg.muted" 
            textOverflow="ellipsis" 
            overflow="hidden"
            css={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {game.description}
          </Text>
        </VStack>
      </Box>
    </Link>
  )
}