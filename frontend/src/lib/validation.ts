/**
 * Утилиты валидации для react-hook-form
 */

import { GAME_GENRES } from '@/types/game-form'

// Регулярные выражения для валидации
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  torrentUrl: /^(https?:\/\/|magnet:).*$/,
  torrentFile: /\.torrent$/i,
  imageUrl: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
  steamGridDbId: /^\d+$/,
  magnetLink: /^magnet:\?xt=urn:btih:[a-fA-F0-9]+/,
}

// Сообщения об ошибках
export const VALIDATION_MESSAGES = {
  required: 'Это поле обязательно для заполнения',
  email: 'Введите корректный email адрес',
  minLength: (min: number) => `Минимум ${min} символов`,
  maxLength: (max: number) => `Максимум ${max} символов`,
  url: 'Введите корректный URL адрес',
  torrentUrl: 'Введите корректный URL торрент-файла или magnet-ссылку',
  imageUrl: 'Введите корректную ссылку на изображение (jpg, png, gif, webp)',
  yearRange: 'Год должен быть от 1970 до текущего года + 2',
  steamGridDbId: 'ID должен содержать только цифры',
  gameGenre: 'Выберите жанр из списка',
}

// Правила валидации для часто используемых полей
export const VALIDATION_RULES = {
  required: {
    required: VALIDATION_MESSAGES.required,
  },

  email: {
    required: VALIDATION_MESSAGES.required,
    pattern: {
      value: VALIDATION_PATTERNS.email,
      message: VALIDATION_MESSAGES.email,
    },
  },

  password: {
    required: VALIDATION_MESSAGES.required,
    minLength: {
      value: 6,
      message: VALIDATION_MESSAGES.minLength(6),
    },
  },

  gameTitle: {
    required: VALIDATION_MESSAGES.required,
    minLength: {
      value: 2,
      message: VALIDATION_MESSAGES.minLength(2),
    },
    maxLength: {
      value: 100,
      message: VALIDATION_MESSAGES.maxLength(100),
    },
  },

  gameDescription: {
    maxLength: {
      value: 1000,
      message: VALIDATION_MESSAGES.maxLength(1000),
    },
  },

  gameGenre: {
    required: VALIDATION_MESSAGES.required,
    validate: (value: any) => {
      if (typeof value !== 'string') return VALIDATION_MESSAGES.gameGenre
      return GAME_GENRES.includes(value as any) || VALIDATION_MESSAGES.gameGenre
    }
  },

  gameImageUrl: {
    pattern: {
      value: VALIDATION_PATTERNS.imageUrl,
      message: VALIDATION_MESSAGES.imageUrl,
    },
  },

  gameReleaseYear: {
    min: {
      value: 1970,
      message: VALIDATION_MESSAGES.yearRange,
    },
    max: {
      value: new Date().getFullYear() + 2,
      message: VALIDATION_MESSAGES.yearRange,
    },
  },

  steamGridDbId: {
    pattern: {
      value: VALIDATION_PATTERNS.steamGridDbId,
      message: VALIDATION_MESSAGES.steamGridDbId,
    },
  },

  torrentUrl: {
    required: VALIDATION_MESSAGES.required,
    pattern: {
      value: VALIDATION_PATTERNS.torrentUrl,
      message: VALIDATION_MESSAGES.torrentUrl,
    },
  },

  username: {
    required: VALIDATION_MESSAGES.required,
    minLength: {
      value: 3,
      message: VALIDATION_MESSAGES.minLength(3),
    },
    maxLength: {
      value: 30,
      message: VALIDATION_MESSAGES.maxLength(30),
    },
  },

  bio: {
    maxLength: {
      value: 500,
      message: VALIDATION_MESSAGES.maxLength(500),
    },
  },
}

// Хелперы для создания кастомных правил валидации
export const createMinLengthRule = (min: number) => ({
  minLength: {
    value: min,
    message: VALIDATION_MESSAGES.minLength(min),
  },
})

export const createMaxLengthRule = (max: number) => ({
  maxLength: {
    value: max,
    message: VALIDATION_MESSAGES.maxLength(max),
  },
})

export const createPatternRule = (pattern: RegExp, message: string) => ({
  pattern: {
    value: pattern,
    message,
  },
})

// Хелпер для проверки файлов
export const createFileValidationRule = (
  allowedTypes: string[],
  maxSizeMB?: number
) => ({
  validate: (files: FileList | null) => {
    if (!files || files.length === 0) return true
    
    const file = files[0]
    
    // Проверка типа файла
    const isValidType = allowedTypes.some(type => 
      file.type.includes(type) || file.name.toLowerCase().endsWith(type)
    )
    if (!isValidType) {
      return `Разрешены только файлы: ${allowedTypes.join(', ')}`
    }
    
    // Проверка размера файла
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return `Размер файла не должен превышать ${maxSizeMB}MB`
    }
    
    return true
  }
})

// Предустановленные правила для файлов
export const FILE_VALIDATION_RULES = {
  torrentFile: createFileValidationRule(['.torrent'], 10),
  imageFile: createFileValidationRule(['.jpg', '.jpeg', '.png', '.gif', '.webp'], 5),
}

// Дополнительные валидаторы для игр
export const validateTorrent = (torrentUrl?: string, torrentFile?: File | null): string | true => {
  if (!torrentUrl?.trim() && !torrentFile) {
    return 'Необходимо указать ссылку на торрент или загрузить torrent-файл'
  }
  return true
}

export const validateYear = (year?: number): string | true => {
  if (!year) return true
  
  const currentYear = new Date().getFullYear()
  if (year < 1970 || year > currentYear + 2) {
    return VALIDATION_MESSAGES.yearRange
  }
  
  return true
}

export const validateTorrentFile = (file: File | null): string | true => {
  if (!file) return true
  
  if (!file.name.endsWith('.torrent')) {
    return 'Файл должен иметь расширение .torrent'
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return 'Размер файла не должен превышать 10MB'
  }
  
  return true
}