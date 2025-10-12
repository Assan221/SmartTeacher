'use client'

import { useState, useRef, useEffect } from 'react'
import { aiService, type ChatMessage } from '@/lib/openai'
import { messageService } from '@/lib/database'
import type { CreateMessage } from '@/types/database'

interface ChatInterfaceProps {
  threadId?: string
  classId?: string
  onNewThread?: (threadId: string) => void
}

export default function ChatInterface({ threadId, classId, onNewThread }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadId) {
      loadMessages()
    }
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!threadId) return

    try {
      const dbMessages = await messageService.getMessages(threadId)
      const chatMessages: ChatMessage[] = dbMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      setMessages(chatMessages)
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
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

      // Сохраняем сообщения в базу данных
      if (threadId) {
        await messageService.createMessage({
          thread_id: threadId,
          role: 'user',
          content: userMessage.content
        })
        
        await messageService.createMessage({
          thread_id: threadId,
          role: 'assistant',
          content: assistantMessage.content
        })
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setError('Не удалось отправить сообщение. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    const quickPrompts: Record<string, string> = {
      lesson: 'Помоги создать план урока. Расскажи с чего начать.',
      presentation: 'Помоги создать презентацию для урока. Какая структура лучше?',
      test: 'Помоги создать тест для учеников. Какие типы вопросов использовать?',
      homework: 'Помоги придумать интересное домашнее задание.',
      activity: 'Предложи интерактивные активности для урока.'
    }

    const prompt = quickPrompts[action]
    if (prompt) {
      setInputMessage(prompt)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Заголовок чата */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">SmartUstaz AI</h3>
        <p className="text-sm text-gray-600">Ваш помощник в создании учебных материалов</p>
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
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🤖</div>
            <p>Привет! Я SmartUstaz AI - ваш помощник в образовании.</p>
            <p className="text-sm mt-2">Задайте вопрос или выберите быструю команду выше.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
