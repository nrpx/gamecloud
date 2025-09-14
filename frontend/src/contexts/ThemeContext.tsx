'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Language = 'ru' | 'en'

interface ThemeContextType {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  effectiveTheme: 'light' | 'dark' // Реальная тема с учетом system
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [language, setLanguage] = useState<Language>('ru')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  // Загружаем настройки из localStorage при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('gamecloud-theme') as Theme
    const savedLanguage = localStorage.getItem('gamecloud-language') as Language
    
    if (savedTheme) setTheme(savedTheme)
    if (savedLanguage) setLanguage(savedLanguage)
  }, [])

  // Определяем эффективную тему с учетом system
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateTheme = () => setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light')
      
      updateTheme()
      mediaQuery.addEventListener('change', updateTheme)
      
      return () => mediaQuery.removeEventListener('change', updateTheme)
    } else {
      setEffectiveTheme(theme)
    }
  }, [theme])

  // Сохраняем настройки в localStorage
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('gamecloud-theme', newTheme)
  }

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('gamecloud-language', newLanguage)
  }

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement
    
    root.setAttribute('data-theme', effectiveTheme)
    root.classList.toggle('dark', effectiveTheme === 'dark')
    root.classList.toggle('light', effectiveTheme === 'light')
  }, [effectiveTheme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        setTheme: handleSetTheme,
        setLanguage: handleSetLanguage,
        effectiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}