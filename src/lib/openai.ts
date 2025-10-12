// Клиентский сервис для работы с OpenAI через API роуты

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LessonPlanRequest {
  subject: string
  grade: string
  topic: string
  duration: number
  objectives: string[]
}

export interface PresentationRequest {
  topic: string
  grade: string
  slides: number
  style: 'academic' | 'creative' | 'minimal'
}

export interface TestRequest {
  subject: string
  grade: string
  topic: string
  questions: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export const aiService = {
  // Общий чат с ИИ
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        throw new Error('Ошибка API')
      }

      const data = await response.json()
      return data.content || 'Извините, произошла ошибка.'
    } catch (error) {
      console.error('Ошибка OpenAI:', error)
      throw new Error('Не удалось получить ответ от ИИ')
    }
  },

  // Генерация плана урока
  async generateLessonPlan(request: LessonPlanRequest): Promise<string> {
    try {
      const response = await fetch('/api/generate-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'lesson_plan',
          data: request 
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка API')
      }

      const data = await response.json()
      return data.content || 'Извините, произошла ошибка.'
    } catch (error) {
      console.error('Ошибка генерации плана урока:', error)
      throw new Error('Не удалось сгенерировать план урока')
    }
  },

  // Генерация презентации
  async generatePresentation(request: PresentationRequest): Promise<string> {
    try {
      const response = await fetch('/api/generate-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'presentation',
          data: request 
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка API')
      }

      const data = await response.json()
      return data.content || 'Извините, произошла ошибка.'
    } catch (error) {
      console.error('Ошибка генерации презентации:', error)
      throw new Error('Не удалось сгенерировать презентацию')
    }
  },

  // Генерация теста
  async generateTest(request: TestRequest): Promise<string> {
    try {
      const response = await fetch('/api/generate-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'test',
          data: request 
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка API')
      }

      const data = await response.json()
      return data.content || 'Извините, произошла ошибка.'
    } catch (error) {
      console.error('Ошибка генерации теста:', error)
      throw new Error('Не удалось сгенерировать тест')
    }
  }
}
