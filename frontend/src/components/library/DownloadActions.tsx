'use client'

import React from 'react'
import { HStack, Button } from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'

interface DownloadActionsProps {
  downloadInfo: {
    id: string
    status: string
  }
  onPause: (downloadId: string) => void
  onResume: (downloadId: string) => void
  onCancel: (downloadId: string) => void
  onDelete: () => void
  isDeleting?: boolean
}

export const DownloadActions: React.FC<DownloadActionsProps> = ({
  downloadInfo,
  onPause,
  onResume,
  onCancel,
  onDelete,
  isDeleting = false
}) => {
  return (
    <HStack gap={2}>
      {/* Кнопки управления загрузкой */}
      {downloadInfo.status === 'downloading' && (
        <Button 
          size="sm" 
          variant="solid"
          colorScheme="yellow" 
          onClick={() => onPause(downloadInfo.id)}
          title="Пауза"
        >
          <Icon name="pause" size={16} style={{ marginRight: '4px' }} />
          Пауза
        </Button>
      )}
      
      {downloadInfo.status === 'paused' && (
        <Button 
          size="sm" 
          variant="solid"
          colorScheme="green" 
          onClick={() => onResume(downloadInfo.id)}
          title="Продолжить"
        >
          <Icon name="play" size={16} style={{ marginRight: '4px' }} />
          Продолжить
        </Button>
      )}
      
      <Button 
        size="sm" 
        variant="solid"
        colorScheme="red" 
        onClick={() => onCancel(downloadInfo.id)}
        title="Отменить загрузку"
      >
        <Icon name="stop" size={16} style={{ marginRight: '4px' }} />
        Отменить
      </Button>
      
      {/* Кнопка удаления игры */}
      <Button 
        size="sm" 
        variant="outline" 
        colorScheme="red"
        onClick={onDelete}
        loading={isDeleting}
        title="Удалить игру"
      >
        <Icon name="delete" size={16} style={{ marginRight: '4px' }} />
        Удалить
      </Button>
    </HStack>
  )
}