'use client'

import { useState, useEffect, useCallback } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import ChatInterface from '@/components/ChatInterface'
import ChatSidebar from '@/components/ChatSidebar'
import Link from 'next/link'
import { classService } from '@/lib/database'
import type { Class } from '@/types/database'

export default function AIChatPage() {
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>()
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>()
  const [classes, setClasses] = useState<Class[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  const loadClasses = useCallback(async () => {
    try {
      const data = await classService.getClasses()
      setClasses(data)
      // Автоматически выбираем первый класс, если есть
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id)
      }
    } catch (error) {
      console.error('Ошибка загрузки классов:', error)
    }
  }, [selectedClassId])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const handleNewChat = () => {
    setCurrentThreadId(undefined)
    setMessageCount(0) // Очищаем счетчик сообщений
  }

  const handleThreadSelect = (threadId: string) => {
    setCurrentThreadId(threadId)
  }

  const handleNewThread = (threadId: string) => {
    setCurrentThreadId(threadId)
    // Обновляем список чатов
    setRefreshTrigger(prev => prev + 1)
  }

  const handleThreadDelete = (threadId: string) => {
    // Если удаляем текущий чат, очищаем его
    if (currentThreadId === threadId) {
      setCurrentThreadId(undefined)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        {/* Оверлей для мобильного меню */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Боковая панель с чатами */}
        <ChatSidebar
          classId={selectedClassId}
          currentThreadId={currentThreadId}
          onNewChat={handleNewChat}
          onThreadSelect={handleThreadSelect}
          onThreadDelete={handleThreadDelete}
          sidebarOpen={sidebarOpen}
          refreshTrigger={refreshTrigger}
        />

        {/* Основная область чата в стиле ChatGPT */}
        <div className="flex-1 ml-0 md:ml-64 bg-white">
          {/* Верхняя панель */}
          <div className="border-b border-neutral-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Мобильное меню */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">ST</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-neutral-900">
                    Smart Teacher
                    {currentThreadId && (
                      <span className="text-sm font-normal text-violet-600 ml-2">
                        • Чат сохранен ({messageCount} сообщений)
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-neutral-500 hidden md:block">Ваш ИИ-помощник для образования</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Селектор класса */}
                {classes.length > 0 && (
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white hover:border-neutral-400 transition-colors"
                  >
                    <option value="">Выберите класс</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.title}
                      </option>
                    ))}
                  </select>
                )}
                
                <Link
                  href="/dashboard"
                  className="bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                >
                  Назад к дашборду
                </Link>
              </div>
            </div>
          </div>

          {/* Чат интерфейс */}
          <div className="flex-1 h-[calc(100vh-80px)]">
            <ChatInterface 
              threadId={currentThreadId}
              classId={selectedClassId}
              onNewThread={handleNewThread}
              onMessageCountChange={setMessageCount}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
