import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Проверяем наличие и валидность переменных окружения
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

const isPlaceholder = (value: string | undefined): boolean => {
  return !value || value.includes('your_') || value === ''
}

if (!supabaseUrl || !supabaseAnonKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.warn('Supabase environment variables are missing or contain placeholders.')
  console.warn('Please update your .env.local file with real Supabase credentials.')
  console.warn('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Создаем клиент только если переменные валидны
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
