import { useState } from 'react'
import {
  usePauseGameDownload,
  useResumeGameDownload,
  useCancelGameDownload,
  useUpdateGame,
  useDeleteGame
} from '@/stores/gamesLibraryStore'
import { showDeleteConfirm } from '@/lib/sweetAlert'
import { showError, showSuccess } from '@/lib/toast'

interface Game {
  id: string
  title: string
  genre: string
  description: string
  image_url?: string
}

export const useGameActions = () => {
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [gameFormData, setGameFormData] = useState({ 
    title: '', 
    genre: '', 
    description: '', 
    image_url: '' 
  })
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Zustand actions
  const pauseGameDownload = usePauseGameDownload()
  const resumeGameDownload = useResumeGameDownload()
  const cancelGameDownload = useCancelGameDownload()
  const updateGame = useUpdateGame()
  const deleteGame = useDeleteGame()

  const openEditModal = (game: Game) => {
    setEditingGame(game)
    setGameFormData({
      title: game.title,
      genre: game.genre,
      description: game.description,
      image_url: game.image_url || ''
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingGame(null)
    setGameFormData({ title: '', genre: '', description: '', image_url: '' })
  }

  const handleSaveGame = async () => {
    if (!editingGame) return

    try {
      await updateGame(editingGame.id, gameFormData)
      showSuccess('Игра обновлена', 'Информация об игре успешно сохранена')
      closeEditModal()
    } catch (error) {
      console.error('Error updating game:', error)
      showError('Ошибка сохранения', 'Не удалось сохранить изменения. Попробуйте еще раз.')
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    const result = await showDeleteConfirm(undefined, 'игру')
    
    if (result.isConfirmed) {
      try {
        setIsDeleting(gameId)
        await deleteGame(gameId)
        showSuccess('Игра удалена', 'Игра и все связанные загрузки успешно удалены')
      } catch (error) {
        console.error('Error deleting game:', error)
        showError('Ошибка удаления', 'Не удалось удалить игру. Попробуйте еще раз.')
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handlePauseDownload = async (downloadId: string) => {
    try {
      await pauseGameDownload(downloadId)
      showSuccess('Загрузка приостановлена')
    } catch (error) {
      console.error('Error pausing download:', error)
      showError('Ошибка', `Ошибка при приостановке загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const handleResumeDownload = async (downloadId: string) => {
    try {
      await resumeGameDownload(downloadId)
      showSuccess('Загрузка возобновлена')
    } catch (error) {
      console.error('Error resuming download:', error)
      showError('Ошибка', `Ошибка при возобновлении загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const handleCancelDownload = async (downloadId: string) => {
    const result = await showDeleteConfirm(undefined, 'загрузку')
    
    if (result.isConfirmed) {
      try {
        await cancelGameDownload(downloadId)
        showSuccess('Загрузка отменена')
      } catch (error) {
        console.error('Error canceling download:', error)
        showError('Ошибка', `Ошибка при отмене загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      }
    }
  }

  return {
    // Modal state
    editingGame,
    isEditModalOpen,
    gameFormData,
    setGameFormData,
    isDeleting,
    
    // Modal actions
    openEditModal,
    closeEditModal,
    handleSaveGame,
    
    // Game actions
    handleDeleteGame,
    
    // Download actions
    handlePauseDownload,
    handleResumeDownload,
    handleCancelDownload
  }
}