'use client'

import { useState, useRef, useEffect } from 'react'
import { aiService, type ChatMessage } from '@/lib/openai'
import { materialService } from '@/lib/database'
import PDFExporter from './PDFExporter'

interface ClassChatProps {
  classId: string
  className: string
}

export default function ClassChat({ classId, className }: ClassChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError('')

    try {
      // Получаем ответ от ИИ
      const aiResponse = await aiService.chat([...messages, userMessage])
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse
      }

      setMessages(prev => [...prev, assistantMessage])

      // Автоматически сохраняем материалы если ИИ создал их
      await handleAutoSaveMaterials(userMessage.content, aiResponse)

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setError('Не удалось отправить сообщение. Проверьте подключение к интернету.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoSaveMaterials = async (userPrompt: string, aiResponse: string) => {
    try {
      // Определяем тип материала по ключевым словам
      const prompt = userPrompt.toLowerCase()
      const response = aiResponse.toLowerCase()

      let materialType: &apos;lesson_plan&apos; | &apos;presentation&apos; | &apos;test&apos; | &apos;document&apos; | null = null
      let title = ''

      if (prompt.includes(&apos;план урока&apos;) || prompt.includes(&apos;урок&apos;) || response.includes(&apos;план урока&apos;)) {
        materialType = &apos;lesson_plan&apos;
        title = `План урока для ${className}`
      } else if (prompt.includes(&apos;презентация&apos;) || prompt.includes(&apos;презентация&apos;) || response.includes(&apos;презентация&apos;) || response.includes(&apos;слайд&apos;)) {
        materialType = &apos;presentation&apos;
        title = `Презентация для ${className}`
      } else if (prompt.includes(&apos;тест&apos;) || prompt.includes(&apos;задание&apos;) || response.includes(&apos;тест&apos;) || response.includes(&apos;вопрос&apos;)) {
        materialType = &apos;test&apos;
        title = `Тест для ${className}`
      } else if (prompt.includes(&apos;документ&apos;) || prompt.includes(&apos;файл&apos;) || response.includes(&apos;документ&apos;)) {
        materialType = &apos;document&apos;
        title = `Документ для ${className}`
      }

      // Если определили тип материала, сохраняем его
      if (materialType) {
        await materialService.createMaterial({
          class_id: classId,
          type: materialType,
          title,
          content: aiResponse,
          ai_generated: true
        })
      }
    } catch (error) {
      console.error('Ошибка автосохранения:', error)
    }
  }

  const handleQuickAction = async (action: string) => {
    const quickPrompts: Record<string, string> = {
      lesson: `Создай план урока для класса ${className}. Укажи предмет, тему и цели урока.`,
      presentation: `Создай презентацию для класса ${className}. Укажи тему и количество слайдов.`,
      test: `Создай тест для класса ${className}. Укажи предмет, тему и количество вопросов.`,
      homework: `Придумай интересное домашнее задание для класса ${className}.`,
      activity: `Предложи интерактивные активности для урока в классе ${className}.`
    }

    const prompt = quickPrompts[action]
    if (prompt && !isLoading) {
      // Устанавливаем сообщение в поле ввода
      setInputMessage(prompt)
      
      // Создаем сообщение пользователя
      const userMessage: ChatMessage = {
        role: 'user',
        content: prompt
      }

      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
      setIsLoading(true)
      setError('')

      try {
        // Получаем ответ от ИИ
        const aiResponse = await aiService.chat([...messages, userMessage])
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // Автоматически сохраняем материал
        await handleAutoSaveMaterials(prompt, aiResponse)
      } catch (error) {
        console.error('Ошибка при обращении к ИИ:', error)
        setError('Не удалось получить ответ от ИИ. Попробуйте еще раз.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Заголовок чата */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">AI Чат для {className}</h3>
        <p className="text-sm text-gray-600">Создавайте материалы с помощью ИИ</p>
      </div>

      {/* Быстрые действия */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction('lesson')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            📚 План урока
          </button>
          <button
            onClick={() => handleQuickAction('presentation')}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            📊 Презентация
          </button>
          <button
            onClick={() => handleQuickAction('test')}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            📝 Тест
          </button>
          <button
            onClick={() => handleQuickAction('homework')}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
          >
            🏠 Домашнее задание
          </button>
          <button
            onClick={() => handleQuickAction('activity')}
            className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
          >
            🎯 Активности
          </button>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-gray-400">
            <div className="text-4xl mb-4">🤖</div>
            <p>Привет! Я SmartUstaz AI для класса {className}.</p>
            <p className="text-sm mt-2">Задайте вопрос или выберите быструю команду выше.</p>
            <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-gray-900">Примеры запросов:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• "Создай план урока по математике"</li>
                <li>• "Сделай презентацию по биологии"</li>
                <li>• "Создай тест по истории"</li>
                <li>• "Придумай домашнее задание"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === &apos;user&apos; ? &apos;justify-end&apos; : &apos;justify-start&apos;}`}
          >
            <div className="max-w-3xl">
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              
              {/* Кнопка экспорта в PDF для ответов ИИ */}
              {message.role === 'assistant' && (
                <div className="mt-2 flex justify-start">
                  <PDFExporter
                    content={message.content}
                    title={`Материал для ${className}`}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 border-gray-400"></div>
                <span>ИИ думает...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Форма ввода */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Задайте вопрос или опишите задачу..."
            className="flex-1 px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white bg-gray-700 placeholder-gray-500 placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  )
}
