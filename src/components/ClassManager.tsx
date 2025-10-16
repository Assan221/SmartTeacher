'use client'

import { useState, useEffect } from 'react'
import { classService } from '@/lib/database'
import type { Class } from '@/types/database'

export default function ClassManager() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClassTitle, setNewClassTitle] = useState('')

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassTitle.trim()) return

    try {
      const newClass = await classService.createClass({ title: newClassTitle })
      setClasses(prev => [newClass, ...prev])
      setNewClassTitle('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Ошибка создания класса:', error)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот класс?')) return

    try {
      await classService.deleteClass(id)
      setClasses(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Ошибка удаления класса:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Мои классы</h2>
        <button
          onClick={() => {
            console.log('Кнопка создания класса нажата')
            setShowCreateForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Создать класс
        </button>
      </div>

      {/* Форма создания класса */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Создать новый класс</h3>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label htmlFor="classTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Название класса
              </label>
              <input
                id="classTitle"
                type="text"
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: 5-А класс, Математика 10 класс"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список классов */}
      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">У вас пока нет классов</h3>
          <p className="text-gray-600 mb-4">Создайте свой первый класс, чтобы начать работу</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Создать первый класс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{classItem.title}</h3>
                <button
                  onClick={() => handleDeleteClass(classItem.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Удалить
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Создан: {new Date(classItem.created_at).toLocaleDateString('ru-RU')}
              </p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  📚 Планы уроков
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  📊 Презентации
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  📝 Тесты
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
