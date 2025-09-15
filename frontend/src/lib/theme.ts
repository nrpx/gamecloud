import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Цвета, вдохновленные темой Dracula и более мягкими светлыми тонами
const customConfig = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        // Основные фоновые цвета
        bg: {
          DEFAULT: {
            value: { 
              _light: "#fefefe", // Очень мягкий белый (не абсолютно белый)
              _dark: "#282a36"   // Dracula background
            }
          },
          surface: {
            value: { 
              _light: "#ffffff", // Чистый белый для карточек на светлом фоне
              _dark: "#44475a"   // Dracula current line/selection
            }
          },
          subtle: {
            value: { 
              _light: "#f8f9fa", // Очень светло-серый
              _dark: "#383a47"   // Между основным фоном и surface
            }
          },
          muted: {
            value: { 
              _light: "#f1f3f4", // Приглушенный светло-серый
              _dark: "#21222c"   // Более темный оттенок Dracula
            }
          },
          emphasized: {
            value: { 
              _light: "#e8eaed", // Подчеркнутый серый
              _dark: "#6272a4"   // Dracula comment color (мягкий синий)
            }
          }
        },
        
        // Цвета текста
        fg: {
          DEFAULT: {
            value: { 
              _light: "#1f2937", // Мягкий черный (не абсолютно черный)
              _dark: "#f8f8f2"   // Dracula foreground
            }
          },
          muted: {
            value: { 
              _light: "#6b7280", // Приглушенный серый
              _dark: "#6272a4"   // Dracula comment
            }
          },
          subtle: {
            value: { 
              _light: "#9ca3af", // Очень приглушенный серый
              _dark: "#8d95a3"   // Между muted и default
            }
          },
          emphasized: {
            value: { 
              _light: "#111827", // Подчеркнутый темный
              _dark: "#ffffff"   // Чистый белый для акцентов
            }
          }
        },
        
        // Цвета границ
        border: {
          DEFAULT: {
            value: { 
              _light: "#e5e7eb", // Мягкие границы
              _dark: "#44475a"   // Dracula selection
            }
          },
          muted: {
            value: { 
              _light: "#f3f4f6", // Очень мягкие границы
              _dark: "#383a47"   
            }
          },
          emphasized: {
            value: { 
              _light: "#d1d5db", // Подчеркнутые границы
              _dark: "#6272a4"   
            }
          }
        },
        
        // Цвета состояний с Dracula palette
        red: {
          solid: {
            value: { _light: "#dc2626", _dark: "#ff5555" } // Dracula red
          },
          subtle: {
            value: { _light: "#fef2f2", _dark: "#3d1a1a" }
          }
        },
        green: {
          solid: {
            value: { _light: "#16a34a", _dark: "#50fa7b" } // Dracula green
          },
          subtle: {
            value: { _light: "#f0fdf4", _dark: "#1a3d20" }
          }
        },
        blue: {
          solid: {
            value: { _light: "#2563eb", _dark: "#8be9fd" } // Dracula cyan
          },
          subtle: {
            value: { _light: "#eff6ff", _dark: "#1a2e3d" }
          }
        },
        yellow: {
          solid: {
            value: { _light: "#ca8a04", _dark: "#f1fa8c" } // Dracula yellow
          },
          subtle: {
            value: { _light: "#fefce8", _dark: "#3d3a1a" }
          }
        },
        purple: {
          solid: {
            value: { _light: "#9333ea", _dark: "#bd93f9" } // Dracula purple
          },
          subtle: {
            value: { _light: "#faf5ff", _dark: "#2d1a3d" }
          }
        },
        pink: {
          solid: {
            value: { _light: "#ec4899", _dark: "#ff79c6" } // Dracula pink
          },
          subtle: {
            value: { _light: "#fdf2f8", _dark: "#3d1a2e" }
          }
        },
        orange: {
          solid: {
            value: { _light: "#ea580c", _dark: "#ffb86c" } // Dracula orange
          },
          subtle: {
            value: { _light: "#fff7ed", _dark: "#3d2a1a" }
          }
        }
      }
    },
    
    // Добавляем кастомные токены для специфичных элементов GameCloud
    tokens: {
      colors: {
        gamecloud: {
          primary: { value: "#6366f1" },      // Indigo как основной цвет
          secondary: { value: "#8b5cf6" },    // Purple как вторичный
          accent: { value: "#06b6d4" },       // Cyan как акцент
          success: { value: "#10b981" },      // Emerald для успеха
          warning: { value: "#f59e0b" },      // Amber для предупреждений
          danger: { value: "#ef4444" },       // Red для ошибок
        }
      }
    }
  }
})

// Создаем кастомную систему тем
export const system = createSystem(defaultConfig, customConfig)

// Экспортируем типы для TypeScript
export type CustomTheme = typeof system