/**
 * Тесты для типов и констант игровых форм
 */

import {
  GameFormData,
  CreateGameRequest,
  UpdateGameRequest,
  GameGenre,
  GAME_GENRES,
  GENRE_OPTIONS
} from '../game-form'

describe('Game Form Types', () => {
  describe('GAME_GENRES', () => {
    it('содержит все ожидаемые жанры', () => {
      const expectedGenres = [
        'Action',
        'Adventure',
        'RPG',
        'Strategy',
        'Simulation',
        'Sports',
        'Racing',
        'Shooter',
        'Fighting',
        'Puzzle',
        'Platformer',
        'Horror',
        'Survival',
        'MMORPG',
        'Indie',
        'Casual',
        'Educational',
        'Music',
        'Other'
      ]

      expect(GAME_GENRES).toEqual(expectedGenres)
      expect(GAME_GENRES).toHaveLength(19)
    })

    it('содержит только строковые значения', () => {
      GAME_GENRES.forEach(genre => {
        expect(typeof genre).toBe('string')
        expect(genre.length).toBeGreaterThan(0)
      })
    })

    it('не содержит дубликатов', () => {
      const uniqueGenres = new Set(GAME_GENRES)
      expect(uniqueGenres.size).toBe(GAME_GENRES.length)
    })
  })

  describe('GENRE_OPTIONS', () => {
    it('корректно создает опции для select', () => {
      expect(GENRE_OPTIONS).toHaveLength(GAME_GENRES.length)
      
      GENRE_OPTIONS.forEach((option, index) => {
        expect(option.value).toBe(GAME_GENRES[index])
        expect(option.label).toBe(GAME_GENRES[index])
        expect(option).toEqual({
          value: GAME_GENRES[index],
          label: GAME_GENRES[index]
        })
      })
    })

    it('содержит все жанры', () => {
      const optionValues = GENRE_OPTIONS.map(option => option.value)
      expect(optionValues).toEqual(GAME_GENRES)
    })
  })

  describe('GameGenre type', () => {
    it('ограничивает значения списком GAME_GENRES', () => {
      const validGenre: GameGenre = 'Action'
      expect(GAME_GENRES).toContain(validGenre)

      // TypeScript должен предотвратить недопустимые значения
      // const invalidGenre: GameGenre = 'InvalidGenre' // ошибка компиляции
    })
  })

  describe('GameFormData interface', () => {
    it('имеет корректную структуру для всех полей', () => {
      const mockFormData: GameFormData = {
        title: 'Test Game',
        genre: 'Action',
        description: 'Test description',
        developer: 'Test Developer',
        releaseYear: 2024,
        steamgridId: '123456',
        images: {
          grid: 'https://example.com/grid.jpg',
          hero: 'https://example.com/hero.jpg',
          logo: 'https://example.com/logo.png',
          icon: 'https://example.com/icon.ico'
        },
        torrent: {
          method: 'url',
          url: 'magnet:?xt=urn:btih:test'
        }
      }

      // Проверяем обязательные поля
      expect(typeof mockFormData.title).toBe('string')
      expect(typeof mockFormData.genre).toBe('string')
      expect(GAME_GENRES).toContain(mockFormData.genre as GameGenre)

      // Проверяем необязательные поля
      expect(typeof mockFormData.description).toBe('string')
      expect(typeof mockFormData.developer).toBe('string')
      expect(typeof mockFormData.releaseYear).toBe('number')
      expect(typeof mockFormData.steamgridId).toBe('string')
      expect(typeof mockFormData.images).toBe('object')

      // Проверяем торрент поля
      expect(mockFormData.torrent?.method).toBe('url')
      expect(typeof mockFormData.torrent?.url).toBe('string')
    })

    it('позволяет минимальную конфигурацию', () => {
      const minimalFormData: GameFormData = {
        title: 'Minimal Game',
        genre: 'Indie'
      }

      expect(minimalFormData.title).toBeDefined()
      expect(minimalFormData.genre).toBeDefined()
      expect(minimalFormData.description).toBeUndefined()
      expect(minimalFormData.torrent).toBeUndefined()
    })

    it('корректно обрабатывает различные методы торрентов', () => {
      const urlMethod: GameFormData = {
        title: 'Test Game',
        genre: 'Action',
        torrent: {
          method: 'url',
          url: 'https://example.com/game.torrent'
        }
      }

      const fileMethod: GameFormData = {
        title: 'Test Game',
        genre: 'Action',
        torrent: {
          method: 'file',
          file: Object.assign([], {
            0: new File(['test'], 'test.torrent'),
            length: 1,
            item: (index: number) => index === 0 ? new File(['test'], 'test.torrent') : null
          }) as unknown as FileList
        }
      }

      expect(urlMethod.torrent?.method).toBe('url')
      expect(urlMethod.torrent?.url).toBeTruthy()

      expect(fileMethod.torrent?.method).toBe('file')
      expect(fileMethod.torrent?.file).toBeDefined()
      expect(fileMethod.torrent?.file?.length).toBe(1)
    })

    it('поддерживает все типы изображений SteamGridDB', () => {
      const formWithImages: GameFormData = {
        title: 'Game with Images',
        genre: 'RPG',
        images: {
          grid: 'https://example.com/grid.jpg',
          hero: 'https://example.com/hero.jpg',
          logo: 'https://example.com/logo.png',
          icon: 'https://example.com/icon.ico'
        }
      }

      expect(formWithImages.images?.grid).toBeDefined()
      expect(formWithImages.images?.hero).toBeDefined()
      expect(formWithImages.images?.logo).toBeDefined()
      expect(formWithImages.images?.icon).toBeDefined()
    })

    it('позволяет частичные изображения', () => {
      const partialImages: GameFormData = {
        title: 'Game with Grid Only',
        genre: 'Strategy',
        images: {
          grid: 'https://example.com/grid.jpg'
        }
      }

      expect(partialImages.images?.grid).toBeDefined()
      expect(partialImages.images?.hero).toBeUndefined()
      expect(partialImages.images?.logo).toBeUndefined()
      expect(partialImages.images?.icon).toBeUndefined()
    })
  })

  describe('CreateGameRequest interface', () => {
    it('имеет корректную структуру для API запроса', () => {
      const mockRequest: CreateGameRequest = {
        title: 'Test Game',
        genre: 'Action',
        description: 'Test description',
        developer: 'Test Developer',
        release_year: 2024,
        steamgriddb_id: '123456',
        grid_image_url: 'https://example.com/grid.jpg',
        hero_image_url: 'https://example.com/hero.jpg',
        logo_image_url: 'https://example.com/logo.png',
        icon_image_url: 'https://example.com/icon.ico',
        torrent_url: 'magnet:?xt=urn:btih:test'
      }

      // Проверяем snake_case поля для API
      expect(typeof mockRequest.release_year).toBe('number')
      expect(typeof mockRequest.steamgriddb_id).toBe('string')
      expect(typeof mockRequest.grid_image_url).toBe('string')
      expect(typeof mockRequest.hero_image_url).toBe('string')
      expect(typeof mockRequest.logo_image_url).toBe('string')
      expect(typeof mockRequest.icon_image_url).toBe('string')
      expect(typeof mockRequest.torrent_url).toBe('string')

      // Проверяем обязательные поля
      expect(mockRequest.title).toBeTruthy()
      expect(mockRequest.genre).toBeTruthy()
      expect(GAME_GENRES).toContain(mockRequest.genre as GameGenre)
    })

    it('позволяет минимальную конфигурацию для API', () => {
      const minimalRequest: CreateGameRequest = {
        title: 'Minimal Game',
        genre: 'Indie'
      }

      expect(minimalRequest.title).toBeDefined()
      expect(minimalRequest.genre).toBeDefined()
      expect(minimalRequest.description).toBeUndefined()
      expect(minimalRequest.torrent_url).toBeUndefined()
    })

    it('совместим с backend API полями', () => {
      // Проверяем что все snake_case поля соответствуют ожидаемым в backend
      const apiFields: (keyof CreateGameRequest)[] = [
        'title',
        'genre', 
        'description',
        'developer',
        'release_year',
        'steamgriddb_id',
        'grid_image_url',
        'hero_image_url', 
        'logo_image_url',
        'icon_image_url',
        'torrent_url'
      ]

      const mockRequest: CreateGameRequest = {
        title: 'Test',
        genre: 'Action'
      }

      apiFields.forEach(field => {
        // Проверяем что поле может быть присвоено (TypeScript совместимость)
        expect(() => {
          const testObj = { ...mockRequest }
          if (field === 'release_year') {
            testObj[field] = 2024
          } else {
            testObj[field] = 'test'
          }
        }).not.toThrow()
      })
    })
  })

  describe('UpdateGameRequest interface', () => {
    it('расширяет CreateGameRequest с ID', () => {
      const updateRequest: UpdateGameRequest = {
        id: 'game-123',
        title: 'Updated Game',
        genre: 'Adventure'
      }

      expect(updateRequest.id).toBeDefined()
      expect(updateRequest.title).toBeDefined()
      expect(updateRequest.genre).toBeDefined()
    })

    it('позволяет частичные обновления', () => {
      const partialUpdate: UpdateGameRequest = {
        id: 'game-123',
        title: 'New Title Only'
      }

      expect(partialUpdate.id).toBeDefined()
      expect(partialUpdate.title).toBeDefined()
      expect(partialUpdate.genre).toBeUndefined()
      expect(partialUpdate.description).toBeUndefined()
    })
  })

  describe('Type Guards and Validation', () => {
    it('различает валидные жанры', () => {
      const isValidGenre = (genre: string): genre is GameGenre => {
        return GAME_GENRES.includes(genre as GameGenre)
      }

      expect(isValidGenre('Action')).toBe(true)
      expect(isValidGenre('RPG')).toBe(true)
      expect(isValidGenre('InvalidGenre')).toBe(false)
      expect(isValidGenre('')).toBe(false)
    })

    it('различает методы торрентов', () => {
      const isValidTorrentMethod = (method: string): method is 'url' | 'file' => {
        return method === 'url' || method === 'file'
      }

      expect(isValidTorrentMethod('url')).toBe(true)
      expect(isValidTorrentMethod('file')).toBe(true)
      expect(isValidTorrentMethod('invalid')).toBe(false)
    })

    it('проверяет структуру торрент данных', () => {
      const isValidTorrentData = (torrent: GameFormData['torrent']): boolean => {
        if (!torrent) return true // необязательное поле
        
        if (torrent.method === 'url') {
          return Boolean(torrent.url && torrent.url.trim().length > 0)
        }
        
        if (torrent.method === 'file') {
          return Boolean(torrent.file && torrent.file.length > 0)
        }
        
        return false
      }

      expect(isValidTorrentData(undefined)).toBe(true)
      expect(isValidTorrentData({
        method: 'url',
        url: 'magnet:?xt=urn:btih:test'
      })).toBe(true)
      expect(isValidTorrentData({
        method: 'file',
        file: Object.assign([], {
          0: new File(['test'], 'test.torrent'),
          length: 1,
          item: (index: number) => index === 0 ? new File(['test'], 'test.torrent') : null
        }) as unknown as FileList
      })).toBe(true)
      expect(isValidTorrentData({
        method: 'url',
        url: ''
      })).toBe(false)
    })
  })
})