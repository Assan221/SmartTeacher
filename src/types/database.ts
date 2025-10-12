export interface Class {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface Thread {
  id: string
  class_id: string
  title: string
  created_at: string
}

export interface Message {
  id: string
  thread_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Material {
  id: string
  class_id: string
  thread_id: string | null
  type: 'lesson_plan' | 'presentation' | 'test' | 'document'
  title: string
  content: string | null
  file_url: string | null
  ai_generated: boolean
  created_at: string
}

// Типы для создания новых записей
export interface CreateClass {
  title: string
}

export interface CreateThread {
  class_id: string
  title?: string
}

export interface CreateMessage {
  thread_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CreateMaterial {
  class_id: string
  thread_id?: string | null
  type: 'lesson_plan' | 'presentation' | 'test' | 'document'
  title: string
  content?: string | null
  file_url?: string | null
  ai_generated?: boolean
}

// Типы для обновления записей
export interface UpdateClass {
  title?: string
}

export interface UpdateThread {
  title?: string
}

export interface UpdateMaterial {
  title?: string
  content?: string | null
  file_url?: string | null
}
