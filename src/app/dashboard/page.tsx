'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ClassManager from '@/components/ClassManager'
import Link from 'next/link'
import { classService } from '@/lib/database'
import { getSubjectColor, formatTimeAgo } from '@/utils/subjectColors'
import { t } from '@/i18n'
import type { Class } from '@/types/database'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await classService.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Ошибка загрузки классов:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Боковое меню */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          {/* Заголовок */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">SmartUstaz</h1>
            <p className="text-sm text-gray-600 mt-1">Помощник учителя</p>
          </div>

          {/* Меню */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Link
                href="/dashboard/ai-chat"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="mr-3">🤖</span>
                AI Чат
              </Link>
              {/* Классы */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Классы</h3>
                  <button 
                    onClick={() => {
                      const title = prompt('Введите название класса (например: 5-А, 10-К):')
                      if (title && title.trim()) {
                        classService.createClass({ title: title.trim() }).then(() => {
                          loadClasses()
                        }).catch(console.error)
                      }
                    }}
                    className="text-gray-400 text-gray-500 hover:text-gray-600 hover:text-gray-300"
                    title="Создать новый класс"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-1">
                  {loading ? (
                    <div className="text-sm text-gray-500">Загрузка...</div>
                  ) : classes.length === 0 ? (
                    <div className="text-sm text-gray-500">Нет классов</div>
                  ) : (
                    classes.map((classItem) => {
                      const subjectInfo = getSubjectColor(classItem.title)
                      return (
                        <Link
                          key={classItem.id}
                          href={`/dashboard/class/${classItem.id}`}
                          className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{subjectInfo.icon}</span>
                            <span className="font-medium">{classItem.title}</span>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>

            </div>
          </nav>

          {/* Профиль пользователя */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>

        {/* Основная рабочая область */}
        <div className="flex-1 flex flex-col">
          {/* Заголовок рабочей области */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900">{t('app.title')}</h2>
            <p className="text-gray-600 mt-1">{t('app.subtitle')}</p>
          </div>

          {/* Контент */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {/* Приветствие */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
                <h3 className="text-2xl font-bold mb-2">Добро пожаловать в SmartUstaz!</h3>
                <p className="text-blue-100">
                  Создавайте планы уроков, презентации и тесты с помощью ИИ. 
                  Выберите класс в меню слева или создайте новый.
                </p>
              </div>

              {/* Быстрые действия */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-4">🏫</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Создать класс</h4>
                  <p className="text-gray-600 text-sm">Добавьте новый класс для организации материалов</p>
                </div>

                <Link
                  href="/dashboard/ai-chat"
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer block"
                >
                  <div className="text-3xl mb-4">📚</div>
                  <h4 className="font-semibold text-gray-900 mb-2">План урока</h4>
                  <p className="text-gray-600 text-sm">Создайте план урока с помощью ИИ</p>
                </Link>

                <Link
                  href="/dashboard/ai-chat"
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer block"
                >
                  <div className="text-3xl mb-4">📊</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Презентация</h4>
                  <p className="text-gray-600 text-sm">Создайте презентацию для урока</p>
                </Link>
              </div>

              {/* Недавние классы */}
              {classes.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Ваши классы</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.slice(0, 6).map((classItem) => {
                      const subjectInfo = getSubjectColor(classItem.title)
                      return (
                        <Link
                          key={classItem.id}
                          href={`/dashboard/class/${classItem.id}`}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg ${subjectInfo.bgColor} flex items-center justify-center`}>
                              <span className="text-2xl">{subjectInfo.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{classItem.title}</h5>
                              <p className="text-sm text-gray-500">
                                Создан {formatTimeAgo(classItem.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Если нет классов */}
              {classes.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="text-6xl mb-4">🏫</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">У вас пока нет классов</h3>
                  <p className="text-gray-600 mb-4">Создайте свой первый класс, чтобы начать работу</p>
                  <ClassManager />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}