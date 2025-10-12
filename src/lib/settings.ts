'use client'

import { useState, useEffect } from 'react'
import { Language, setLanguage } from '@/i18n'

// Типы настроек
export type Theme = 'light' | 'dark'

export interface Settings {
  theme: Theme
  language: Language
}

// Значения по умолчанию
const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  language: 'ru'
}

// Ключ для localStorage
const STORAGE_KEY = 'app.settings.v1'

// Слушатели изменений настроек
type SettingsListener = (settings: Settings) => void
const listeners: SettingsListener[] = []

// Текущие настройки
let currentSettings: Settings = { ...DEFAULT_SETTINGS }

// Загрузить настройки из localStorage
export function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>
      currentSettings = {
        theme: parsed.theme || DEFAULT_SETTINGS.theme,
        language: parsed.language || DEFAULT_SETTINGS.language
      }
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
    currentSettings = { ...DEFAULT_SETTINGS }
  }

  return currentSettings
}

// Сохранить настройки в localStorage
export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    currentSettings = { ...settings }
    
    // Применить настройки
    applySettings(settings)
    
    // Уведомить слушателей
    listeners.forEach(listener => listener(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

// Получить текущие настройки
export function getSettings(): Settings {
  return { ...currentSettings }
}

// Применить настройки к приложению
export function applySettings(settings: Settings): void {
  // Применить тему
  applyTheme(settings.theme)
  
  // Применить язык
  setLanguage(settings.language)
}

// Применить тему
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return
  }

  const html = document.documentElement
  
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

// Переключить тему
export function toggleTheme(): void {
  const settings = getSettings()
  const newTheme: Theme = settings.theme === 'light' ? 'dark' : 'light'
  
  saveSettings({
    ...settings,
    theme: newTheme
  })
}

// Установить язык
export function setAppLanguage(language: Language): void {
  const settings = getSettings()
  saveSettings({
    ...settings,
    language
  })
}

// Подписаться на изменения настроек
export function subscribeToSettings(listener: SettingsListener): () => void {
  listeners.push(listener)
  
  // Возвращаем функцию отписки
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

// Хук для React компонентов
export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(getSettings())

  useEffect(() => {
    // Подписываемся на изменения
    const unsubscribe = subscribeToSettings((newSettings) => {
      setSettingsState(newSettings)
    })

    // Загружаем актуальные настройки
    setSettingsState(getSettings())

    return unsubscribe
  }, [])

  return settings
}

// Инициализация настроек при загрузке приложения
export function initializeSettings(): void {
  const settings = loadSettings()
  applySettings(settings)
}
