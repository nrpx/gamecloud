'use client'

import React from 'react'
import { HStack, Button } from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'

interface GameActionsProps {
  downloadInfo?: {
    id: string
    status: string
  }
  onEdit: () => void
  onDelete: () => void
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  isDeleting: boolean
}

export const GameActions: React.FC<GameActionsProps> = ({
  downloadInfo,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onCancel,
  isDeleting
}) => {
  return (
    <HStack gap={1}>
      {/* Кнопки управления загрузкой */}
      {downloadInfo && downloadInfo.status === 'downloading' && onPause && (
        <Button 
          size="xs" 
          variant="solid"
          colorScheme="yellow" 
          onClick={(e) => {
            e.preventDefault()
            onPause()
          }}
          title="Пауза"
        >
          <Icon name="pause" size={14} />
        </Button>
      )}
      {downloadInfo && downloadInfo.status === 'paused' && onResume && (
        <Button 
          size="xs" 
          variant="solid"
          colorScheme="green" 
          onClick={(e) => {
            e.preventDefault()
            onResume()
          }}
          title="Продолжить"
        >
          <Icon name="play" size={14} />
        </Button>
      )}
      {downloadInfo && onCancel && (
        <Button 
          size="xs" 
          variant="solid"
          colorScheme="red" 
          onClick={(e) => {
            e.preventDefault()
            onCancel()
          }}
          title="Отменить"
        >
          <Icon name="stop" size={14} />
        </Button>
      )}
      
      {/* Кнопки управления игрой */}
      <Button 
        size="xs" 
        variant="ghost" 
        onClick={(e) => {
          e.preventDefault()
          onEdit()
        }}
        title="Редактировать"
      >
        <Icon name="edit" size={14} />
      </Button>
      <Button 
        size="xs" 
        variant="ghost" 
        color="red.500"
        onClick={(e) => {
          e.preventDefault()
          onDelete()
        }}
        loading={isDeleting}
        title="Удалить"
      >
        <Icon name="delete" size={14} />
      </Button>
    </HStack>
  )
}