/**
 * Единый компонент формы для создания и редактирования игр
 * Использует react-hook-form для валидации и управления состоянием
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Separator,
  Button
} from '@chakra-ui/react'

// Наши компоненты форм
import { FormInput } from '@/components/forms/FormInput'
import { FormTextarea } from '@/components/forms/FormTextarea'
import { FormSelect } from '@/components/forms/FormSelect'
import { FormFile } from '@/components/forms/FormFile'

// Типы и валидация
import { 
  GameFormData, 
  GENRE_OPTIONS, 
  CreateGameRequest 
} from '@/types/game-form'
import { 
  VALIDATION_RULES, 
  validateYear,
  validateTorrent,
  validateTorrentFile
} from '@/lib/validation'

interface UnifiedGameFormProps {
  // Режим: создание или редактирование
  mode: 'create' | 'edit'
  
  // Начальные данные (для режима редактирования)
  initialData?: Partial<GameFormData>
  
  // Обработчик отправки формы
  onSubmit: (data: GameFormData) => Promise<void>
  
  // Состояние загрузки
  isLoading?: boolean
  
  // Дополнительные кнопки действий
  actions?: React.ReactNode
}

export default function UnifiedGameForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  actions
}: UnifiedGameFormProps) {
  
  const form = useForm<GameFormData>({
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      genre: initialData?.genre || '',
      description: initialData?.description || '',
      developer: initialData?.developer || '',
      releaseYear: initialData?.releaseYear || undefined,
      steamgridId: initialData?.steamgridId || '',
      images: {
        grid: initialData?.images?.grid || '',
        hero: initialData?.images?.hero || '',
        logo: initialData?.images?.logo || '',
        icon: initialData?.images?.icon || ''
      },
      torrent: {
        method: initialData?.torrent?.method || 'url',
        url: initialData?.torrent?.url || '',
        file: undefined
      }
    }
  })

  const { handleSubmit, watch } = form
  
  // Следим за выбранным методом торрента
  const torrentMethod = watch('torrent.method')

  const onFormSubmit = async (data: GameFormData) => {
    // Преобразуем данные формы
    const processedData: GameFormData = {
      ...data,
      // Конвертируем releaseYear из строки в число если заполнено
      releaseYear: data.releaseYear ? parseInt(data.releaseYear.toString(), 10) : undefined,
      // Очищаем пустые строки в необязательных полях
      description: data.description?.trim() || undefined,
      developer: data.developer?.trim() || undefined,
      steamgridId: data.steamgridId?.trim() || undefined,
      images: {
        grid: data.images?.grid?.trim() || undefined,
        hero: data.images?.hero?.trim() || undefined,
        logo: data.images?.logo?.trim() || undefined,
        icon: data.images?.icon?.trim() || undefined,
      },
      torrent: data.torrent && data.torrent.method && (data.torrent.url || data.torrent.file) 
        ? {
            ...data.torrent,
            url: data.torrent.url?.trim() || undefined
          }
        : undefined
    }
    
    await onSubmit(processedData)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack gap={6} align="stretch">
        
        {/* Основная информация */}
        <Box>
          <Heading size="md" mb={4} color="blue.600">
            Основная информация
          </Heading>
          
          <VStack gap={4} align="stretch">
            <FormInput
              name="title"
              label="Название игры"
              placeholder="Введите название игры"
              form={form}
              rules={VALIDATION_RULES.gameTitle}
              isRequired
            />

            <FormSelect
              name="genre"
              label="Жанр"
              placeholder="Выберите жанр"
              options={GENRE_OPTIONS}
              form={form}
              rules={VALIDATION_RULES.gameGenre}
              isRequired
            />

            <FormTextarea
              name="description"
              label="Описание"
              placeholder="Описание игры (необязательно)"
              form={form}
              rules={VALIDATION_RULES.gameDescription}
              rows={4}
            />
          </VStack>
        </Box>

        <Separator />

        {/* Дополнительная информация */}
        <Box>
          <Heading size="md" mb={4} color="blue.600">
            Дополнительная информация
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormInput
              name="developer"
              label="Разработчик"
              placeholder="Студия-разработчик"
              form={form}
            />

            <FormInput
              name="releaseYear"
              label="Год выпуска"
              placeholder="2024"
              type="number"
              form={form}
              rules={{
                validate: (value) => {
                  if (!value) return true
                  return validateYear(parseInt(value.toString(), 10))
                }
              }}
            />

            <FormInput
              name="steamgridId"
              label="SteamGridDB ID"
              placeholder="ID игры в SteamGridDB"
              form={form}
              rules={VALIDATION_RULES.steamGridDbId}
            />
          </Grid>
        </Box>

        <Separator />

        {/* Изображения */}
        <Box>
          <Heading size="md" mb={4} color="blue.600">
            Изображения SteamGridDB
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormInput
              name="images.grid"
              label="Grid изображение"
              placeholder="URL для grid (460x215 или 920x430)"
              form={form}
              rules={VALIDATION_RULES.gameImageUrl}
            />

            <FormInput
              name="images.hero"
              label="Hero изображение"
              placeholder="URL для hero (1920x620)"
              form={form}
              rules={VALIDATION_RULES.gameImageUrl}
            />

            <FormInput
              name="images.logo"
              label="Logo изображение"
              placeholder="URL для logo (PNG с прозрачностью)"
              form={form}
              rules={VALIDATION_RULES.gameImageUrl}
            />

            <FormInput
              name="images.icon"
              label="Icon изображение"
              placeholder="URL для icon (32x32 или 64x64)"
              form={form}
              rules={VALIDATION_RULES.gameImageUrl}
            />
          </Grid>
        </Box>

        <Separator />

        {/* Торрент */}
        <Box>
          <Heading size="md" mb={4} color="blue.600">
            Торрент
          </Heading>
          
          <VStack gap={4} align="stretch">
            <FormSelect
              name="torrent.method"
              label="Способ загрузки торрента"
              options={[
                { value: 'url', label: 'URL или magnet-ссылка' },
                { value: 'file', label: 'Загрузить .torrent файл' }
              ]}
              form={form}
              rules={VALIDATION_RULES.required}
            />

            {torrentMethod === 'url' && (
              <FormInput
                name="torrent.url"
                label="URL торрента или magnet-ссылка"
                placeholder="https://... или magnet:?xt=urn:btih:..."
                form={form}
                rules={{
                  validate: (value: any) => {
                    const torrentFileValue = watch('torrent.file')
                    if (typeof value === 'string') {
                      return validateTorrent(value, torrentFileValue?.[0] || null)
                    }
                    return true
                  }
                }}
              />
            )}

            {torrentMethod === 'file' && (
              <FormFile
                name="torrent.file"
                label="Торрент-файл"
                accept=".torrent"
                form={form}
                rules={{
                  validate: (value: any) => {
                    const torrentUrl = watch('torrent.url')
                    
                    // Проверяем что значение является FileList
                    if (value && typeof value === 'object' && 'length' in value) {
                      if (!torrentUrl?.trim() && value.length === 0) {
                        return 'Необходимо выбрать torrent-файл'
                      }
                      if (value.length > 0) {
                        return validateTorrentFile(value[0])
                      }
                    }
                    
                    return true
                  }
                }}
              />
            )}
          </VStack>
        </Box>

        {/* Кнопки действий */}
        <Separator />
        <Box>
          {actions || (
            <Button 
              type="submit" 
              colorScheme="blue" 
              loading={isLoading}
              size="lg"
            >
              {mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

// Хелпер для преобразования данных формы в запрос API
export const convertFormDataToCreateRequest = (
  formData: GameFormData
): CreateGameRequest => {
  return {
    title: formData.title,
    description: formData.description,
    genre: formData.genre,
    developer: formData.developer,
    release_year: formData.releaseYear,
    steamgriddb_id: formData.steamgridId,
    grid_image_url: formData.images?.grid,
    hero_image_url: formData.images?.hero,
    logo_image_url: formData.images?.logo,
    icon_image_url: formData.images?.icon,
    torrent_url: formData.torrent?.url
  }
}