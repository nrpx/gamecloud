/**
 * Тесты для валидационных правил игр
 */

import {
  validateYear,
  validateTorrent,
  validateTorrentFile,
  VALIDATION_RULES,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES
} from '../validation'

describe('Game Validation Rules', () => {
  describe('validateYear', () => {
    it('принимает валидные годы', () => {
      expect(validateYear(2024)).toBe(true)
      expect(validateYear(1970)).toBe(true)
      expect(validateYear(new Date().getFullYear() + 1)).toBe(true)
    })

    it('отклоняет невалидные годы', () => {
      expect(validateYear(1969)).toBe('Год должен быть от 1970 до текущего года + 2')
      expect(validateYear(new Date().getFullYear() + 3)).toBe('Год должен быть от 1970 до текущего года + 2')
    })

    it('принимает undefined (необязательное поле)', () => {
      expect(validateYear(undefined)).toBe(true)
    })
  })

  describe('validateTorrent', () => {
    it('принимает магнет-ссылку', () => {
      expect(validateTorrent('magnet:?xt=urn:btih:test123', null)).toBe(true)
    })

    it('принимает HTTP URL', () => {
      expect(validateTorrent('https://example.com/file.torrent', null)).toBe(true)
    })

    it('принимает торрент-файл', () => {
      const mockFile = new File(['test'], 'test.torrent', { type: 'application/x-bittorrent' })
      expect(validateTorrent('', mockFile)).toBe(true)
    })

    it('требует либо URL либо файл', () => {
      expect(validateTorrent('', null)).toBe('Необходимо указать ссылку на торрент или загрузить torrent-файл')
      expect(validateTorrent('   ', null)).toBe('Необходимо указать ссылку на торрент или загрузить torrent-файл')
    })
  })

  describe('validateTorrentFile', () => {
    it('принимает .torrent файлы', () => {
      const mockFile = new File(['test'], 'test.torrent', { type: 'application/x-bittorrent' })
      expect(validateTorrentFile(mockFile)).toBe(true)
    })

    it('отклоняет файлы без .torrent расширения', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(validateTorrentFile(mockFile)).toBe('Файл должен иметь расширение .torrent')
    })

    it('отклоняет слишком большие файлы', () => {
      const largeContent = 'a'.repeat(11 * 1024 * 1024) // 11MB
      const mockFile = new File([largeContent], 'test.torrent', { type: 'application/x-bittorrent' })
      expect(validateTorrentFile(mockFile)).toBe('Размер файла не должен превышать 10MB')
    })

    it('принимает null (необязательное поле)', () => {
      expect(validateTorrentFile(null)).toBe(true)
    })
  })

  describe('VALIDATION_RULES', () => {
    describe('gameTitle', () => {
      const rule = VALIDATION_RULES.gameTitle

      it('требует заполнения', () => {
        expect(rule.required).toBe('Это поле обязательно для заполнения')
      })

      it('проверяет минимальную длину', () => {
        expect(rule.minLength?.value).toBe(2)
        expect(rule.minLength?.message).toBe('Минимум 2 символов')
      })

      it('проверяет максимальную длину', () => {
        expect(rule.maxLength?.value).toBe(100)
        expect(rule.maxLength?.message).toBe('Максимум 100 символов')
      })
    })

    describe('gameGenre', () => {
      const rule = VALIDATION_RULES.gameGenre

      it('требует заполнения', () => {
        expect(rule.required).toBe('Это поле обязательно для заполнения')
      })

      it('валидирует корректные жанры', () => {
        expect(rule.validate('Action')).toBe(true)
        expect(rule.validate('RPG')).toBe(true)
        expect(rule.validate('Strategy')).toBe(true)
      })

      it('отклоняет некорректные жанры', () => {
        expect(rule.validate('InvalidGenre')).toBe('Выберите жанр из списка')
        expect(rule.validate('')).toBe('Выберите жанр из списка')
      })

      it('обрабатывает нестроковые значения', () => {
        expect(rule.validate(123 as any)).toBe('Выберите жанр из списка')
        expect(rule.validate(null as any)).toBe('Выберите жанр из списка')
      })
    })

    describe('gameDescription', () => {
      const rule = VALIDATION_RULES.gameDescription

      it('проверяет максимальную длину', () => {
        expect(rule.maxLength?.value).toBe(1000)
        expect(rule.maxLength?.message).toBe('Максимум 1000 символов')
      })
    })

    describe('gameImageUrl', () => {
      const rule = VALIDATION_RULES.gameImageUrl

      it('валидирует корректные URL изображений', () => {
        expect(VALIDATION_PATTERNS.imageUrl.test('https://example.com/image.jpg')).toBe(true)
        expect(VALIDATION_PATTERNS.imageUrl.test('http://example.com/image.png')).toBe(true)
        expect(VALIDATION_PATTERNS.imageUrl.test('https://example.com/image.gif')).toBe(true)
        expect(VALIDATION_PATTERNS.imageUrl.test('https://example.com/image.webp')).toBe(true)
      })

      it('отклоняет некорректные URL', () => {
        expect(VALIDATION_PATTERNS.imageUrl.test('not-a-url')).toBe(false)
        expect(VALIDATION_PATTERNS.imageUrl.test('https://example.com/file.txt')).toBe(false)
        expect(VALIDATION_PATTERNS.imageUrl.test('ftp://example.com/image.jpg')).toBe(false)
      })
    })

    describe('steamGridDbId', () => {
      const rule = VALIDATION_RULES.steamGridDbId

      it('валидирует числовые ID', () => {
        expect(VALIDATION_PATTERNS.steamGridDbId.test('123456')).toBe(true)
        expect(VALIDATION_PATTERNS.steamGridDbId.test('0')).toBe(true)
      })

      it('отклоняет нечисловые ID', () => {
        expect(VALIDATION_PATTERNS.steamGridDbId.test('abc123')).toBe(false)
        expect(VALIDATION_PATTERNS.steamGridDbId.test('123-456')).toBe(false)
        expect(VALIDATION_PATTERNS.steamGridDbId.test('')).toBe(false)
      })
    })

    describe('torrentUrl', () => {
      const rule = VALIDATION_RULES.torrentUrl

      it('валидирует магнет-ссылки', () => {
        expect(VALIDATION_PATTERNS.magnetLink.test('magnet:?xt=urn:btih:abcdef123456')).toBe(true)
      })

      it('валидирует HTTP URL', () => {
        expect(VALIDATION_PATTERNS.torrentUrl.test('https://example.com/file.torrent')).toBe(true)
        expect(VALIDATION_PATTERNS.torrentUrl.test('http://example.com/file.torrent')).toBe(true)
      })

      it('отклоняет некорректные URL', () => {
        expect(VALIDATION_PATTERNS.torrentUrl.test('ftp://example.com/file.torrent')).toBe(false)
        expect(VALIDATION_PATTERNS.torrentUrl.test('not-a-url')).toBe(false)
      })
    })
  })

  describe('VALIDATION_PATTERNS', () => {
    it('корректно определяет email', () => {
      expect(VALIDATION_PATTERNS.email.test('test@example.com')).toBe(true)
      expect(VALIDATION_PATTERNS.email.test('user.name+tag@domain.co.uk')).toBe(true)
      expect(VALIDATION_PATTERNS.email.test('invalid-email')).toBe(false)
      expect(VALIDATION_PATTERNS.email.test('test@')).toBe(false)
    })

    it('корректно определяет URL', () => {
      expect(VALIDATION_PATTERNS.url.test('https://example.com')).toBe(true)
      expect(VALIDATION_PATTERNS.url.test('http://www.example.com/path')).toBe(true)
      expect(VALIDATION_PATTERNS.url.test('not-a-url')).toBe(false)
      expect(VALIDATION_PATTERNS.url.test('ftp://example.com')).toBe(false)
    })

    it('корректно определяет торрент файлы', () => {
      expect(VALIDATION_PATTERNS.torrentFile.test('file.torrent')).toBe(true)
      expect(VALIDATION_PATTERNS.torrentFile.test('FILE.TORRENT')).toBe(true)
      expect(VALIDATION_PATTERNS.torrentFile.test('file.txt')).toBe(false)
    })
  })

  describe('VALIDATION_MESSAGES', () => {
    it('содержит все необходимые сообщения', () => {
      expect(VALIDATION_MESSAGES.required).toBeDefined()
      expect(VALIDATION_MESSAGES.email).toBeDefined()
      expect(VALIDATION_MESSAGES.torrentUrl).toBeDefined()
      expect(VALIDATION_MESSAGES.imageUrl).toBeDefined()
      expect(VALIDATION_MESSAGES.yearRange).toBeDefined()
      expect(VALIDATION_MESSAGES.steamGridDbId).toBeDefined()
      expect(VALIDATION_MESSAGES.gameGenre).toBeDefined()
    })

    it('генерирует сообщения с параметрами', () => {
      expect(VALIDATION_MESSAGES.minLength(5)).toBe('Минимум 5 символов')
      expect(VALIDATION_MESSAGES.maxLength(100)).toBe('Максимум 100 символов')
    })
  })
})