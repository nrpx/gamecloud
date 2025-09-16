'use client'

import React from 'react'
import { VStack, HStack, Input, Text, Button } from '@chakra-ui/react'
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle'

interface GameFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: 'all' | 'downloading' | 'completed' | 'seeding'
  onStatusFilterChange: (value: 'all' | 'downloading' | 'completed' | 'seeding') => void
  genreFilter: string
  onGenreFilterChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isLoading?: boolean
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genreFilter,
  onGenreFilterChange,
  viewMode,
  onViewModeChange,
  isLoading = false
}) => {
  return (
    <VStack gap={3} align="stretch">
      {/* Первая строка: Поиск и переключатель вида */}
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <Input
          placeholder="Поиск по названию или жанру..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          maxW="md"
          bg="bg.surface"
        />
        <ViewToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange}
          disabled={isLoading}
        />
      </HStack>
      
      {/* Вторая строка: Фильтры */}
      <HStack gap={4} flexWrap="wrap">
        {/* Фильтр по статусу загрузки */}
        <HStack gap={2}>
          <Text fontSize="sm" color="fg.muted">Статус:</Text>
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'solid' : 'outline'}
            onClick={() => onStatusFilterChange('all')}
          >
            Все
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'downloading' ? 'solid' : 'outline'}
            onClick={() => onStatusFilterChange('downloading')}
          >
            Загружается
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'completed' ? 'solid' : 'outline'}
            onClick={() => onStatusFilterChange('completed')}
          >
            Завершено
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'seeding' ? 'solid' : 'outline'}
            onClick={() => onStatusFilterChange('seeding')}
          >
            Раздача
          </Button>
        </HStack>
        
        {/* Фильтр по жанру */}
        <HStack gap={2}>
          <Text fontSize="sm" color="fg.muted">Жанр:</Text>
          <Button
            size="sm"
            variant={genreFilter === 'all' ? 'solid' : 'outline'}
            onClick={() => onGenreFilterChange('all')}
          >
            Все
          </Button>
          <Button
            size="sm"
            variant={genreFilter === 'action' ? 'solid' : 'outline'}
            onClick={() => onGenreFilterChange('action')}
          >
            Экшен
          </Button>
          <Button
            size="sm"
            variant={genreFilter === 'rpg' ? 'solid' : 'outline'}
            onClick={() => onGenreFilterChange('rpg')}
          >
            RPG
          </Button>
          <Button
            size="sm"
            variant={genreFilter === 'strategy' ? 'solid' : 'outline'}
            onClick={() => onGenreFilterChange('strategy')}
          >
            Стратегия
          </Button>
        </HStack>
      </HStack>
    </VStack>
  )
}