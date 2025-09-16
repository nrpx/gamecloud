'use client'

import React from 'react'
import { HStack, Button, Text } from '@chakra-ui/react'
import { Icon } from './Icon'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  disabled?: boolean
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  disabled = false
}) => {
  return (
    <HStack gap={1} bg="bg.surface" borderRadius="md" p={1}>
      <Button
        size="sm"
        variant={viewMode === 'grid' ? 'solid' : 'ghost'}
        colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
        onClick={() => onViewModeChange('grid')}
        disabled={disabled}
        title="Сетка"
      >
        <Icon name="grid" size={16} />
        <Text fontSize="sm" ml={2}>Сетка</Text>
      </Button>
      
      <Button
        size="sm"
        variant={viewMode === 'list' ? 'solid' : 'ghost'}
        colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
        onClick={() => onViewModeChange('list')}
        disabled={disabled}
        title="Список"
      >
        <Icon name="list" size={16} />
        <Text fontSize="sm" ml={2}>Список</Text>
      </Button>
    </HStack>
  )
}