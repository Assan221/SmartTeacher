'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { threadService } from '@/lib/database'
import { formatTimeAgo } from '@/utils/subjectColors'
import type { Thread } from '@/types/database'

interface ChatSidebarProps {
  classId?: string
  currentThreadId?: string
  onNewChat: () => void
  onThreadSelect: (threadId: string) => void
  sidebarOpen?: boolean
}

export default function ChatSidebar({ classId, currentThreadId, onNewChat, onThreadSelect, sidebarOpen }: ChatSidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true)
      const data = await threadService.getThreads(classId!)
      setThreads(data)
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (classId) {
      loadThreads()
    } else {
      setThreads([])
    }
  }, [classId, loadThreads])

  // Обновляем список чатов при создании нового треда
  useEffect(() => {
    if (currentThreadId && classId) {
      loadThreads()
    }
  }, [currentThreadId, classId, loadThreads])

  const handleNewChat = () => {
    onNewChat()
  }

  const handleThreadClick = (threadId: string) => {
    onThreadSelect(threadId)
  }

  return (
    <div className={`w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col fixed left-0 top-0 h-full z-50 md:translate-x-0 transition-transform duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      {/* Логотип и кнопка нового чата */}
      <div className="p-4 border-b border-neutral-200">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm font-medium text-neutral-900">Новый чат</span>
        </button>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {loading ? (
            <div className="text-center py-4">
              <div className="text-sm text-neutral-500">Загрузка чатов...</div>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-neutral-500">Нет сохраненных чатов</div>
              <div className="text-xs text-neutral-400 mt-1">Начните новый диалог</div>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleThreadClick(thread.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors group ${
                  currentThreadId === thread.id 
                    ? 'bg-violet-100 text-violet-900 border border-violet-200' 
                    : 'hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{thread.title}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatTimeAgo(thread.created_at)}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
