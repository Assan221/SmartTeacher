'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { aiService, type ChatMessage } from '@/lib/openai'
import { messageService, threadService } from '@/lib/database'

interface ChatInterfaceProps {
  threadId?: string
  classId?: string
  onNewThread?: (threadId: string) => void
  onMessageCountChange?: (count: number) => void
}

export default function ChatInterface({ threadId, classId, onNewThread, onMessageCountChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
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
  }, [threadId])

  useEffect(() => {
    if (threadId) {
      loadMessages()
    } else {
      // Очищаем сообщения при создании нового чата
      setMessages([])
    }
  }, [threadId, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Уведомляем о изменении количества сообщений
  useEffect(() => {
    if (onMessageCountChange) {
      onMessageCountChange(messages.length)
    }
  }, [messages.length, onMessageCountChange])

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
      let currentThreadId = threadId

      // Если нет активного треда, создаем новый
      if (!currentThreadId && classId) {
        const newThread = await threadService.createThread({
          class_id: classId,
          title: userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? '...' : '')
        })
        currentThreadId = newThread.id
        
        // Уведомляем родительский компонент о новом треде
        if (onNewThread) {
          onNewThread(currentThreadId)
        }
      }

      const messagesToSend = [...messages, userMessage]
      const assistantContent = await aiService.chat(messagesToSend)
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantContent
      }
      
      setMessages(prev => [...prev, assistantMessage])

      // Сохраняем сообщения в базу данных
      if (currentThreadId) {
        await messageService.createMessage({
          thread_id: currentThreadId,
          role: userMessage.role,
          content: userMessage.content
        })
        
        await messageService.createMessage({
          thread_id: currentThreadId,
          role: assistantMessage.role,
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-3xl">🎓</span>
              </div>
              <h4 className="text-2xl font-bold text-neutral-900 mb-4">Добро пожаловать в Smart Teacher!</h4>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Я ваш ИИ-помощник для создания образовательных материалов. Задавайте вопросы или просите создать материалы для уроков.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm max-w-3xl mx-auto">
                <button 
                  onClick={() => setInputMessage('Создай презентацию по математике для 5 класса')}
                  className="p-4 text-left border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span className="font-medium text-neutral-900">Презентация по математике</span>
                  </div>
                </button>
                <button 
                  onClick={() => setInputMessage('Создай домашнее задание по физике на тему "Электричество"')}
                  className="p-4 text-left border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📝</span>
                    <span className="font-medium text-neutral-900">Домашнее задание по физике</span>
                  </div>
                </button>
                <button 
                  onClick={() => setInputMessage('Помоги создать интерактивные задания по истории России 19 века')}
                  className="p-4 text-left border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <span className="font-medium text-neutral-900">Интерактивные задания</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <span className="text-white text-sm font-semibold">ST</span>
                </div>
              )}
              
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm'
                    : 'bg-neutral-100 text-neutral-900 rounded-2xl rounded-bl-md px-4 py-3 border border-neutral-200'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-neutral-600 text-sm font-medium">Вы</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <span className="text-white text-sm font-semibold">ST</span>
              </div>
              <div className="bg-neutral-100 text-neutral-900 rounded-2xl rounded-bl-md px-4 py-3 border border-neutral-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-neutral-500">Думаю...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Поле ввода */}
      <div className="border-t border-neutral-200 p-4 bg-white">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-4xl mx-auto">
            {error}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Сообщение Smart Teacher..."
                  className="w-full px-4 py-3 pr-12 rounded-2xl resize-none min-h-[44px] max-h-32 border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 text-neutral-900 placeholder-neutral-500"
                  disabled={isLoading}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute right-2 bottom-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">
              Smart Teacher может делать ошибки. Проверяйте важную информацию.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}