'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'
import ChatSidebar from './ChatSidebar'

interface ClassChatInterfaceProps {
  classId: string
  className: string
}

export default function ClassChatInterface({ classId, className }: ClassChatInterfaceProps) {
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  const handleNewChat = () => {
    setCurrentThreadId(undefined)
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
    <div className="min-h-screen flex bg-white">
      {/* Оверлей для мобильного меню */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Боковая панель с чатами */}
      <ChatSidebar
        classId={classId}
        currentThreadId={currentThreadId}
        onNewChat={handleNewChat}
        onThreadSelect={handleThreadSelect}
        onThreadDelete={handleThreadDelete}
        sidebarOpen={sidebarOpen}
        refreshTrigger={refreshTrigger}
      />

      {/* Основная область чата */}
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
                  AI Чат для {className}
                  {currentThreadId && (
                    <span className="text-sm font-normal text-violet-600 ml-2">
                      • Чат сохранен ({messageCount} сообщений)
                    </span>
                  )}
                </h1>
                <p className="text-sm text-neutral-500 hidden md:block">Общайтесь с ИИ для создания материалов</p>
              </div>
            </div>
          </div>
        </div>

        {/* Чат интерфейс */}
        <div className="flex-1 h-[calc(100vh-80px)]">
          <ChatInterface 
            threadId={currentThreadId}
            classId={classId}
            onNewThread={handleNewThread}
            onMessageCountChange={setMessageCount}
          />
        </div>
      </div>
    </div>
  )
}
