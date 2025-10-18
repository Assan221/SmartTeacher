'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { classService } from '@/lib/database'
import { getSubjectColor, formatTimeAgo } from '@/utils/subjectColors'
import type { Class } from '@/types/database'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await classService.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Ошибка загрузки классов:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        {/* Оверлей для мобильного меню */}
        {sidebarOpen && (
          <div 
            className="mobile-only fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Боковая панель в стиле ChatGPT */}
        <div className={`w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col fixed left-0 top-0 h-full z-50 md:translate-x-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
              {/* Кнопки Новый чат и Добавить класс */}
              <div className="p-4 border-b border-neutral-200">
                <Link
                  href="/dashboard/ai-chat"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-900">Новый чат</span>
                </Link>
                <button 
                  onClick={() => {
                    const title = prompt('Введите название класса (например: 5-А, 10-К):')
                    if (title && title.trim()) {
                      classService.createClass({ title: title.trim() }).then(() => {
                        loadClasses()
                      }).catch(console.error)
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 transition-all duration-200 shadow-sm hover:shadow-md mt-2"
                >
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-violet-600">Добавить класс</span>
                </button>
              </div>

              {/* Список классов */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-neutral-500">Загрузка классов...</div>
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-sm text-neutral-500">Нет созданных классов</div>
                      <div className="text-xs text-neutral-400 mt-1">Добавьте первый класс</div>
                    </div>
                  ) : (
                    classes.map((classItem) => {
                      const subjectInfo = getSubjectColor(classItem.title)
                      return (
                        <Link
                          key={classItem.id}
                          href={`/dashboard/class/${classItem.id}`}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-neutral-100 transition-colors group block"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{subjectInfo.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-neutral-700 truncate font-medium">{classItem.title}</div>
                              <div className="text-xs text-neutral-500">Создан {formatTimeAgo(classItem.created_at)}</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  )}
            </div>
          </div>

          {/* Профиль пользователя */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">{user?.email}</div>
                <div className="text-xs text-neutral-500">Учитель</div>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
                title="Выйти"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Основная область в стиле ChatGPT */}
        <div className="flex-1 ml-64 chatgpt-main">
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
                  <h1 className="text-lg font-semibold text-neutral-900">Smart Teacher</h1>
                  <p className="text-sm text-neutral-500 hidden md:block">Ваш ИИ-помощник для образования</p>
                </div>
              </div>
              <Link
                href="/dashboard/ai-chat"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Открыть чат
              </Link>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1 p-6 bg-neutral-50">
            <div className="max-w-4xl mx-auto">
              {/* Приветственный экран */}
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <span className="text-3xl">🎓</span>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Добро пожаловать в Smart Teacher</h2>
                <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Создавайте образовательные материалы с помощью ИИ. Презентации, домашние задания и другие материалы — все в одном современном интерфейсе.
                </p>
              </div>

              {/* Быстрые действия */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/ai-chat"
                  className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Презентация</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">Интерактивная презентация для урока</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/ai-chat"
                  className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Домашнее задание</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">Разнообразные задания для проверки знаний</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/ai-chat"
                  className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">ИИ Помощник</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">Создание материалов с помощью ИИ</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}