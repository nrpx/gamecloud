'use client'

import React from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Icon } from './Icon'

interface ImagePlaceholderProps {
  type: 'grid' | 'hero' | 'logo' | 'icon'
  title?: string
  width?: string | number
  height?: string | number
  className?: string
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  type,
  title = 'Игра',
  width,
  height,
  className
}) => {
  const getPlaceholderContent = () => {
    switch (type) {
      case 'grid':
        return (
          <Flex
            w={width || '200px'}
            h={height || '300px'}
            bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            borderRadius="lg"
            direction="column"
            align="center"
            justify="center"
            color="white"
            className={className}
          >
            <Icon name="gamepad" size={48} />
            <Text fontSize="sm" fontWeight="medium" mt={2} textAlign="center" px={2}>
              {title}
            </Text>
          </Flex>
        )
      
      case 'hero':
        return (
          <Box
            w={width || '100%'}
            h={height || '300px'}
            bg="linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)"
            borderRadius="lg"
            position="relative"
            overflow="hidden"
            className={className}
          >
            <Flex
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              align="center"
              justify="center"
              direction="column"
              bg="blackAlpha.300"
            >
              <Icon name="gamepad" size={64} color="white" />
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="white"
                mt={4}
                textAlign="center"
                px={4}
              >
                {title}
              </Text>
            </Flex>
          </Box>
        )
      
      case 'logo':
        return (
          <Flex
            w={width || '120px'}
            h={height || '60px'}
            bg="linear-gradient(135deg, #ec4899 0%, #f97316 100%)"
            borderRadius="md"
            align="center"
            justify="center"
            color="white"
            className={className}
          >
            <Text fontSize="sm" fontWeight="bold" textAlign="center" px={2}>
              {title}
            </Text>
          </Flex>
        )
      
      case 'icon':
        return (
          <Flex
            w={width || '32px'}
            h={height || '32px'}
            bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            borderRadius="md"
            align="center"
            justify="center"
            color="white"
            className={className}
          >
            <Icon name="gamepad" size={16} />
          </Flex>
        )
      
      default:
        return null
    }
  }

  return getPlaceholderContent()
}