'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ChatInterface from '@/components/ChatInterface'
import Link from 'next/link'
import { t } from '@/i18n'

export default function AIChatPage() {
  const { user, signOut } = useAuth()

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
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="mr-3">🏠</span>
                Главная
              </Link>
              
              <Link
                href="/dashboard/ai-chat"
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
              >
                <span className="mr-3">🤖</span>
                AI Чат
              </Link>
            </div>
          </nav>

          {/* Пользователь */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 ml-3">
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

        {/* Основной контент */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Заголовок */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">AI Помощник</h2>
              <p className="text-gray-600 mt-1">Задавайте вопросы и создавайте материалы с помощью ИИ</p>
            </div>

            {/* Чат интерфейс */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px]">
              <ChatInterface />
            </div>

            {/* Быстрые действия */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-medium text-gray-900 mb-1">План урока</h3>
                <p className="text-sm text-gray-600">Создайте план урока по любой теме</p>
              </button>
              
              <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium text-gray-900 mb-1">Презентация</h3>
                <p className="text-sm text-gray-600">Создайте презентацию для урока</p>
              </button>
              
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200 transition-colors">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-medium text-gray-900 mb-1">Тест</h3>
                <p className="text-sm text-gray-600">Создайте тест или задания</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
