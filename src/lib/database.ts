import { supabase } from './supabaseClient'
import type { 
  Class, 
  Thread, 
  Message, 
  Material, 
  CreateClass, 
  CreateThread, 
  CreateMessage, 
  CreateMaterial,
  UpdateClass,
  UpdateThread,
  UpdateMaterial
} from '@/types/database'

// Демо-данные для работы без Supabase
const demoClasses: Class[] = [
  {
    id: 'demo-class-1',
    title: '9-й класс "Е"',
    created_at: new Date().toISOString(),
    user_id: 'demo-user'
  },
  {
    id: 'demo-class-2',
    title: '10-й класс "А"',
    created_at: new Date().toISOString(),
    user_id: 'demo-user'
  },
  {
    id: 'demo-class-3',
    title: '11-й класс "Б"',
    created_at: new Date().toISOString(),
    user_id: 'demo-user'
  }
]

const demoMaterials: Material[] = [
  {
    id: 'demo-material-1',
    class_id: 'demo-class-1',
    thread_id: null,
    title: 'Квадратные уравнения',
    type: 'lesson_plan',
    content: 'План урока по решению квадратных уравнений',
    file_url: null,
    ai_generated: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-material-2',
    class_id: 'demo-class-1',
    thread_id: null,
    title: 'Геометрические фигуры',
    type: 'presentation',
    content: 'Презентация о треугольниках и четырехугольниках',
    file_url: null,
    ai_generated: false,
    created_at: new Date().toISOString()
  }
]

// Проверка доступности Supabase
const isSupabaseAvailable = () => supabase !== null

// ===== CLASSES =====
export const classService = {
  // Получить все классы пользователя
  async getClasses(): Promise<Class[]> {
    if (!isSupabaseAvailable()) {
      console.log('Используем демо-данные для классов')
      return demoClasses
    }

    const { data, error } = await supabase!
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Создать новый класс
  async createClass(classData: CreateClass): Promise<Class> {
    if (!isSupabaseAvailable()) {
      const newClass: Class = {
        id: `demo-class-${Date.now()}`,
        ...classData,
        created_at: new Date().toISOString(),
        user_id: 'demo-user'
      }
      demoClasses.unshift(newClass)
      console.log('Создан демо-класс:', newClass.title)
      return newClass
    }

    if (!supabase) {
      throw new Error('Supabase не настроен')
    }

    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить класс
  async updateClass(id: string, updates: UpdateClass): Promise<Class> {
    if (!isSupabaseAvailable()) {
      const classIndex = demoClasses.findIndex(c => c.id === id)
      if (classIndex === -1) throw new Error('Класс не найден')
      
      demoClasses[classIndex] = {
        ...demoClasses[classIndex],
        ...updates
      }
      console.log('Обновлен демо-класс:', demoClasses[classIndex].title)
      return demoClasses[classIndex]
    }

    if (!supabase) {
      throw new Error('Supabase не настроен')
    }

    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить класс
  async deleteClass(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      const classIndex = demoClasses.findIndex(c => c.id === id)
      if (classIndex !== -1) {
        demoClasses.splice(classIndex, 1)
        console.log('Удален демо-класс с ID:', id)
      }
      return
    }

    if (!supabase) {
      throw new Error('Supabase не настроен')
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===== THREADS =====
export const threadService = {
  // Получить все треды класса
  async getThreads(classId: string): Promise<Thread[]> {
    if (!isSupabaseAvailable()) {
      console.log('Используем демо-данные для тредов')
      return [] // Пока пустой массив для тредов
    }

    if (!supabase) {
      throw new Error('Supabase не настроен')
    }

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Создать новый тред
  async createThread(threadData: CreateThread): Promise<Thread> {
    if (!isSupabaseAvailable()) {
      const newThread: Thread = {
        id: `demo-thread-${Date.now()}`,
        ...threadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }
      console.log('Создан демо-тред:', newThread.title)
      return newThread
    }

    const { data, error } = await supabase
      .from('threads')
      .insert(threadData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить тред
  async updateThread(id: string, updates: UpdateThread): Promise<Thread> {
    if (!isSupabaseAvailable()) {
      throw new Error('Обновление тредов в демо-режиме не поддерживается')
    }

    const { data, error } = await supabase
      .from('threads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить тред
  async deleteThread(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.log('Удален демо-тред с ID:', id)
      return
    }

    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===== MESSAGES =====
export const messageService = {
  // Получить все сообщения треда
  async getMessages(threadId: string): Promise<Message[]> {
    if (!isSupabaseAvailable()) {
      console.log('Используем демо-данные для сообщений')
      return [] // Пока пустой массив для сообщений
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Создать новое сообщение
  async createMessage(messageData: CreateMessage): Promise<Message> {
    if (!isSupabaseAvailable()) {
      const newMessage: Message = {
        id: `demo-message-${Date.now()}`,
        ...messageData,
        created_at: new Date().toISOString(),
        user_id: 'demo-user'
      }
      console.log('Создано демо-сообщение:', newMessage.content.substring(0, 50))
      return newMessage
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить сообщение
  async deleteMessage(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.log('Удалено демо-сообщение с ID:', id)
      return
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===== MATERIALS =====
export const materialService = {
  // Получить все материалы класса
  async getMaterials(classId: string): Promise<Material[]> {
    if (!isSupabaseAvailable()) {
      console.log('Используем демо-данные для материалов')
      return demoMaterials.filter(m => m.class_id === classId)
    }

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Получить материалы по типу
  async getMaterialsByType(classId: string, type: Material['type']): Promise<Material[]> {
    if (!isSupabaseAvailable()) {
      return demoMaterials.filter(m => m.class_id === classId && m.type === type)
    }

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', classId)
      .eq('type', type)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Получить материал по ID
  async getMaterial(id: string): Promise<Material> {
    if (!isSupabaseAvailable()) {
      const material = demoMaterials.find(m => m.id === id)
      if (!material) throw new Error('Материал не найден')
      return material
    }

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Создать новый материал
  async createMaterial(materialData: CreateMaterial): Promise<Material> {
    if (!isSupabaseAvailable()) {
      const newMaterial: Material = {
        id: `demo-material-${Date.now()}`,
        ...materialData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }
      demoMaterials.unshift(newMaterial)
      console.log('Создан демо-материал:', newMaterial.title)
      return newMaterial
    }

    const { data, error } = await supabase
      .from('materials')
      .insert(materialData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Обновить материал
  async updateMaterial(id: string, updates: UpdateMaterial): Promise<Material> {
    if (!isSupabaseAvailable()) {
      const materialIndex = demoMaterials.findIndex(m => m.id === id)
      if (materialIndex === -1) throw new Error('Материал не найден')
      
      demoMaterials[materialIndex] = {
        ...demoMaterials[materialIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      console.log('Обновлен демо-материал:', demoMaterials[materialIndex].title)
      return demoMaterials[materialIndex]
    }

    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Удалить материал
  async deleteMaterial(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      const materialIndex = demoMaterials.findIndex(m => m.id === id)
      if (materialIndex !== -1) {
        demoMaterials.splice(materialIndex, 1)
        console.log('Удален демо-материал с ID:', id)
      }
      return
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
