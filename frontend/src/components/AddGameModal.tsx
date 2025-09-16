'use client'

import React, { useState } from 'react'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
  DialogBody
} from '@chakra-ui/react'
import { gamesApi, downloadsApi } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast'
import { useRefreshGames } from '@/stores/gamesLibraryStore'
import UnifiedGameForm from '@/components/forms/UnifiedGameForm'
import { convertFormDataToCreateRequest } from '@/components/forms/UnifiedGameForm'
import type { GameFormData } from '@/types/game-form'

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const refreshGames = useRefreshGames()

  const handleSubmit = async (formData: GameFormData) => {
    setIsLoading(true)
    
    try {
      console.log('🎮 [AddGameModal] Submitting form data:', formData)
      
      // Конвертируем данные формы в запрос API
      const gameData = convertFormDataToCreateRequest(formData)
      
      // Определяем торрент данные
      let torrentUrl = ''
      let torrentFile: File | null = null
      
      if (formData.torrent?.method === 'url' && formData.torrent.url) {
        torrentUrl = formData.torrent.url
      } else if (formData.torrent?.method === 'file' && formData.torrent.file) {
        torrentFile = formData.torrent.file[0] || null
      }
      
      // Добавляем torrent_url в данные игры если есть URL
      if (torrentUrl) {
        gameData.torrent_url = torrentUrl
      }
      
      // Обеспечиваем что torrent_url всегда строка для API
      const apiGameData = {
        ...gameData,
        torrent_url: gameData.torrent_url || ''
      }
      
      console.log('📤 [AddGameModal] Creating game with data:', apiGameData)
      
      // Создаем игру
      const newGame = await gamesApi.create(apiGameData)
      console.log('✅ [AddGameModal] Game created:', newGame)
      
      // Если есть торрент данные - запускаем загрузку
      if (torrentUrl || torrentFile) {
        try {
          if (torrentUrl) {
            await downloadsApi.create({
              game_id: newGame.id,
              torrent_url: torrentUrl
            })
            console.log('🌐 [AddGameModal] Download started with URL')
          } else if (torrentFile) {
            await downloadsApi.createFromFile(newGame.id, torrentFile)
            console.log('📁 [AddGameModal] Download started with file')
          }
        } catch (downloadError) {
          console.error('❌ [AddGameModal] Download start failed:', downloadError)
          showError('Игра добавлена, но загрузка не началась. Попробуйте позже.')
        }
      }
      
      // Обновляем список игр
      refreshGames()
      
      // Показываем успешное сообщение
      showSuccess('Игра успешно добавлена!')
      
      // Закрываем модальное окно
      onClose()
      
    } catch (error) {
      console.error('❌ [AddGameModal] Error creating game:', error)
      showError(
        error instanceof Error 
          ? `Ошибка при добавлении игры: ${error.message}`
          : 'Произошла ошибка при добавлении игры'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => e.open ? undefined : onClose()}
      size="xl"
    >
      <DialogContent maxH="90vh" overflowY="auto">
        <DialogHeader>
          <DialogTitle fontSize="xl" fontWeight="bold" color="blue.600">
            Добавить новую игру
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        
        <DialogBody pb={6}>
          <UnifiedGameForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}