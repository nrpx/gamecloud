'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  VStack,
  HStack,
  Grid,
  Heading,
  Text,
  Button,
  Input,
} from '@chakra-ui/react'
import { FormInput, FormTextarea, FormFile } from '@/components/forms'
import { GameFormData, GameFormProps, GAME_GENRES } from '@/types/game'
import { VALIDATION_RULES, validateTorrent, validateYear, validateTorrentFile } from '@/lib/validation'
import { Icon } from '@/components/ui/Icon'

export default function GameForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: GameFormProps) {
  const form = useForm<GameFormData>({
    defaultValues: {
      title: initialData?.title || '',
      genre: initialData?.genre || '',
      description: initialData?.description || '',
      developer: initialData?.developer || '',
      publisher: initialData?.publisher || '',
      release_year: initialData?.release_year || undefined,
      grid_image_url: initialData?.grid_image_url || '',
      hero_image_url: initialData?.hero_image_url || '',
      logo_image_url: initialData?.logo_image_url || '',
      icon_image_url: initialData?.icon_image_url || '',
      steamgriddb_id: initialData?.steamgriddb_id || '',
      torrent_url: initialData?.torrent_url || '',
      torrent_file: null,
    },
    mode: 'onBlur',
  })

  const { handleSubmit, control, watch, formState: { errors, isSubmitting, isDirty }, register } = form
  
  const watchedTorrentUrl = watch('torrent_url')
  const watchedTorrentFile = watch('torrent_file')
  
  const handleFormSubmit = async (data: GameFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack gap={6} align="stretch">
          {/* Заголовок */}
          <Box>
            <Heading size="lg" mb={2}>
              <HStack>
                <Icon name={mode === 'create' ? 'add' : 'edit'} size={24} />
                <Text>{mode === 'create' ? 'Добавить игру' : 'Редактировать игру'}</Text>
              </HStack>
            </Heading>
            <Text color="fg.muted">
              {mode === 'create' 
                ? 'Заполните информацию о новой игре' 
                : 'Измените информацию об игре'
              }
            </Text>
          </Box>

          {/* Основная информация */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>
              <HStack>
                <Icon name="library" size={20} />
                <Text>Основная информация</Text>
              </HStack>
            </Heading>
            
            <VStack gap={4} align="stretch">
              <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
                <FormInput
                  name="title"
                  label="Название игры"
                  placeholder="Введите название игры"
                  form={form}
                  rules={VALIDATION_RULES.gameTitle}
                  isRequired
                  isDisabled={isFormLoading}
                />
                
                <Box>
                  <Text fontWeight="bold" mb={2} color={errors.genre ? 'red.500' : undefined}>
                    Жанр <Text as="span" color="red.500">*</Text>
                  </Text>
                  <select
                    {...register('genre', VALIDATION_RULES.gameGenre)}
                    disabled={isFormLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${errors.genre ? '#E53E3E' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'var(--chakra-colors-bg-page)',
                    }}
                  >
                    <option value="">Выберите жанр</option>
                    {GAME_GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  {errors.genre && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.genre.message}
                    </Text>
                  )}
                </Box>
              </Grid>

              <FormTextarea
                name="description"
                label="Описание"
                placeholder="Краткое описание игры..."
                form={form}
                rules={VALIDATION_RULES.gameDescription}
                isDisabled={isFormLoading}
                rows={4}
              />

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormInput
                  name="developer"
                  label="Разработчик"
                  placeholder="Название студии-разработчика"
                  form={form}
                  isDisabled={isFormLoading}
                />
                
                <FormInput
                  name="publisher"
                  label="Издатель"
                  placeholder="Название издателя"
                  form={form}
                  isDisabled={isFormLoading}
                />
              </Grid>

              <Box>
                <Text fontWeight="bold" mb={2} color={errors.release_year ? 'red.500' : undefined}>
                  Год выпуска
                </Text>
                <Input
                  type="number"
                  min={1970}
                  max={new Date().getFullYear() + 2}
                  placeholder="2024"
                  {...register('release_year', {
                    valueAsNumber: true,
                    validate: validateYear
                  })}
                  disabled={isFormLoading}
                />
                {errors.release_year && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.release_year.message}
                  </Text>
                )}
              </Box>
            </VStack>
          </Box>

          {/* SteamGridDB изображения */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>
              <HStack>
                <Icon name="image" size={20} />
                <Text>Изображения (SteamGridDB)</Text>
              </HStack>
            </Heading>
            
            <Box p={3} bg="blue.50" borderRadius="md" mb={4}>
              <Text fontSize="sm" color="blue.700">
                <Text fontWeight="bold">Форматы изображений SteamGridDB:</Text>
                <br />
                Grid: 460x215 • Hero: 1920x620 • Logo: прозрачный PNG • Icon: 32x32
              </Text>
            </Box>

            <VStack gap={4} align="stretch">
              <FormInput
                name="steamgriddb_id"
                label="ID игры в SteamGridDB"
                placeholder="123456"
                form={form}
                rules={VALIDATION_RULES.steamGridDbId}
                isDisabled={isFormLoading}
                helperText="Найдите игру на steamgriddb.com и скопируйте ID из URL"
              />

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormInput
                  name="grid_image_url"
                  label="Grid изображение (460x215)"
                  placeholder="https://cdn2.steamgriddb.com/file/..."
                  form={form}
                  rules={VALIDATION_RULES.gameImageUrl}
                  isDisabled={isFormLoading}
                />
                
                <FormInput
                  name="hero_image_url"
                  label="Hero изображение (1920x620)"
                  placeholder="https://cdn2.steamgriddb.com/file/..."
                  form={form}
                  rules={VALIDATION_RULES.gameImageUrl}
                  isDisabled={isFormLoading}
                />
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormInput
                  name="logo_image_url"
                  label="Логотип (прозрачный PNG)"
                  placeholder="https://cdn2.steamgriddb.com/file/..."
                  form={form}
                  rules={VALIDATION_RULES.gameImageUrl}
                  isDisabled={isFormLoading}
                />
                
                <FormInput
                  name="icon_image_url"
                  label="Иконка (32x32)"
                  placeholder="https://cdn2.steamgriddb.com/file/..."
                  form={form}
                  rules={VALIDATION_RULES.gameImageUrl}
                  isDisabled={isFormLoading}
                />
              </Grid>
            </VStack>
          </Box>

          {/* Торрент */}
          <Box p={6} bg="bg.surface" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>
              <HStack>
                <Icon name="download" size={20} />
                <Text>Торрент</Text>
              </HStack>
            </Heading>

            <Box p={3} bg="orange.50" borderRadius="md" mb={4}>
              <Text fontSize="sm" color="orange.700">
                Необходимо указать либо ссылку на торрент/магнет-ссылку, либо загрузить torrent-файл
              </Text>
            </Box>

            <VStack gap={4} align="stretch">
              <FormInput
                name="torrent_url"
                label="Ссылка на торрент или магнет-ссылка"
                placeholder="https://example.com/file.torrent или magnet:?xt=urn:btih:..."
                form={form}
                rules={{
                  ...VALIDATION_RULES.torrentUrl,
                  validate: () => validateTorrent(watchedTorrentUrl, watchedTorrentFile)
                }}
                isDisabled={isFormLoading}
              />

              <Box textAlign="center" py={2}>
                <Text color="fg.muted" fontSize="sm">
                  или
                </Text>
              </Box>

              <FormFile
                name="torrent_file"
                label="Torrent файл"
                form={form}
                rules={{
                  validate: (value: any) => {
                    const file = value as File | null | undefined
                    const normalizedFile = file || null
                    const fileResult = validateTorrentFile(normalizedFile)
                    if (fileResult !== true) return fileResult
                    return validateTorrent(watchedTorrentUrl, normalizedFile)
                  }
                }}
                accept=".torrent"
                isDisabled={isFormLoading}
                helperText="Файл должен иметь расширение .torrent (максимум 10MB)"
              />
            </VStack>
          </Box>

          {/* Кнопки */}
          <HStack justify="space-between" pt={4}>
            {onCancel && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={onCancel}
                disabled={isFormLoading}
              >
                <Icon name="arrow-left" size={16} />
                <Text ml={2}>Отмена</Text>
              </Button>
            )}
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              loading={isFormLoading}
              disabled={isFormLoading || (mode === 'edit' && !isDirty)}
            >
              <Icon name={mode === 'create' ? 'add' : 'edit'} size={16} />
              <Text ml={2}>
                {isFormLoading 
                  ? (mode === 'create' ? 'Добавление...' : 'Сохранение...') 
                  : (mode === 'create' ? 'Добавить игру' : 'Сохранить изменения')
                }
              </Text>
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  )
}