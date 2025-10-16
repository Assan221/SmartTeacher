'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { classService, materialService } from '@/lib/database'
import ClassChat from '@/components/ClassChat'
import PDFExporter from '@/components/PDFExporter'
import { getSubjectColor, formatTimeAgo } from '@/utils/subjectColors'
import type { Class, Material } from '@/types/database'

export default function ClassDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const classId = params.id as string
  
  const [classData, setClassData] = useState<Class | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [activeSection, setActiveSection] = useState('chat')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (classId) {
      loadClassData()
      loadMaterials()
    }
  }, [classId, loadClassData, loadMaterials])

  const loadClassData = useCallback(async () => {
    try {
      const classes = await classService.getClasses()
      const classItem = classes.find(c => c.id === classId)
      setClassData(classItem || null)
    } catch (error) {
      console.error('Ошибка загрузки класса:', error)
    }
  }, [classId])

  const loadMaterials = useCallback(async () => {
    try {
      const data = await materialService.getMaterials(classId)
      setMaterials(data)
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error)
    } finally {
      setLoading(false)
    }
  }, [classId])

  const getMaterialsByType = (type: Material['type']) => {
    return materials.filter(m => m.type === type)
  }


  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-gray-400">Загрузка...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!classData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 text-gray-100 mb-2">Класс не найден</h2>
            <p className="text-gray-600 text-gray-400 mb-4">Возможно, класс был удален или у вас нет доступа к нему</p>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к классам
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Боковая панель с подразделами */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          {/* Заголовок класса */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              {(() => {
                const subjectInfo = getSubjectColor(classData.title)
                return (
                  <div className={`w-12 h-12 rounded-lg ${subjectInfo.bgColor} flex items-center justify-center`}>
                    <span className="text-2xl">{subjectInfo.icon}</span>
                  </div>
                )
              })()}
              <div>
                <h1 className="text-xl font-bold text-gray-900 text-gray-100">{classData.title}</h1>
                <p className="text-sm text-gray-600 text-gray-400">Класс</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-blue-600 text-blue-400 hover:text-blue-800 hover:text-blue-300 text-sm"
            >
              ← Назад к классам
            </Link>
          </div>

          {/* Подразделы */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveSection('chat')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'chat'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700'
                }`}
              >
                🤖 AI Чат
              </button>
              <button
                onClick={() => setActiveSection('lessons')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'lessons'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700'
                }`}
              >
                📄 Планы уроков ({getMaterialsByType('lesson_plan').length})
              </button>
              <button
                onClick={() => setActiveSection('presentations')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'presentations'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700'
                }`}
              >
                📊 Презентации ({getMaterialsByType('presentation').length})
              </button>
              <button
                onClick={() => setActiveSection('tests')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'tests'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700'
                }`}
              >
                📝 Тесты и задания ({getMaterialsByType('test').length})
              </button>
              <button
                onClick={() => setActiveSection('documents')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'documents'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700'
                }`}
              >
                📂 Документы ({getMaterialsByType('document').length})
              </button>
            </div>
          </nav>

          {/* Профиль пользователя */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Основная рабочая область */}
        <div className="flex-1 flex flex-col">
          {/* Заголовок раздела */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 text-gray-100">
                  {activeSection === 'chat' && 'AI Чат'}
                  {activeSection === 'lessons' && 'Планы уроков'}
                  {activeSection === 'presentations' && 'Презентации'}
                  {activeSection === 'tests' && 'Тесты и задания'}
                  {activeSection === 'documents' && 'Документы'}
                </h2>
                <p className="text-gray-600 text-gray-400 mt-1">
                  {activeSection === 'chat' && 'Общайтесь с ИИ для создания материалов'}
                  {activeSection === 'lessons' && 'Планы уроков для этого класса'}
                  {activeSection === 'presentations' && 'Презентации для этого класса'}
                  {activeSection === 'tests' && 'Тесты и задания для этого класса'}
                  {activeSection === 'documents' && 'Документы и файлы класса'}
                </p>
              </div>
              {activeSection !== 'chat' && (
                <button
                  onClick={() => setActiveSection('chat')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  + Создать материал
                </button>
              )}
            </div>
          </div>

          {/* Контент раздела */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {activeSection === 'chat' && (
                <div className="h-full">
                  <ClassChat classId={classId} className={classData.title} />
                </div>
              )}

              {activeSection === 'lessons' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Планы уроков</h3>
                  </div>
                  {getMaterialsByType('lesson_plan').length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="text-4xl mb-4">📚</div>
                      <p className="text-gray-600">Планов уроков пока нет</p>
                      <p className="text-sm text-gray-500">Создайте первый план с помощью ИИ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getMaterialsByType('lesson_plan').map((material) => (
                        <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {formatTimeAgo(material.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {material.ai_generated ? '🤖 Создано ИИ' : '✏️ Создано вручную'}
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/material/${material.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Открыть
                            </Link>
                            <PDFExporter
                              content={material.content || ''}
                              title={material.title}
                              className="text-xs px-2 py-1"
                            />
                            <button 
                              onClick={async () => {
                                if (confirm('Вы уверены, что хотите удалить этот материал?')) {
                                  try {
                                    await materialService.deleteMaterial(material.id)
                                    // Обновляем список материалов
                                    const updatedMaterials = materials.filter(m => m.id !== material.id)
                                    setMaterials(updatedMaterials)
                                  } catch (error) {
                                    console.error('Ошибка при удалении:', error)
                                    alert('Не удалось удалить материал')
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'presentations' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Презентации</h3>
                  </div>
                  {getMaterialsByType('presentation').length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-600">Презентаций пока нет</p>
                      <p className="text-sm text-gray-500">Создайте первую презентацию с помощью ИИ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getMaterialsByType('presentation').map((material) => (
                        <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {formatTimeAgo(material.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {material.ai_generated ? '🤖 Создано ИИ' : '✏️ Создано вручную'}
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/material/${material.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Открыть
                            </Link>
                            <PDFExporter
                              content={material.content || ''}
                              title={material.title}
                              className="text-xs px-2 py-1"
                            />
                            <button 
                              onClick={async () => {
                                if (confirm('Вы уверены, что хотите удалить этот материал?')) {
                                  try {
                                    await materialService.deleteMaterial(material.id)
                                    // Обновляем список материалов
                                    const updatedMaterials = materials.filter(m => m.id !== material.id)
                                    setMaterials(updatedMaterials)
                                  } catch (error) {
                                    console.error('Ошибка при удалении:', error)
                                    alert('Не удалось удалить материал')
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'tests' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Тесты и задания</h3>
                  </div>
                  {getMaterialsByType('test').length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="text-gray-600">Тестов пока нет</p>
                      <p className="text-sm text-gray-500">Создайте первый тест с помощью ИИ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getMaterialsByType('test').map((material) => (
                        <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {formatTimeAgo(material.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {material.ai_generated ? '🤖 Создано ИИ' : '✏️ Создано вручную'}
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/material/${material.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Открыть
                            </Link>
                            <PDFExporter
                              content={material.content || ''}
                              title={material.title}
                              className="text-xs px-2 py-1"
                            />
                            <button 
                              onClick={async () => {
                                if (confirm('Вы уверены, что хотите удалить этот материал?')) {
                                  try {
                                    await materialService.deleteMaterial(material.id)
                                    // Обновляем список материалов
                                    const updatedMaterials = materials.filter(m => m.id !== material.id)
                                    setMaterials(updatedMaterials)
                                  } catch (error) {
                                    console.error('Ошибка при удалении:', error)
                                    alert('Не удалось удалить материал')
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}


              {activeSection === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Документы</h3>
                  </div>
                  {getMaterialsByType('document').length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="text-4xl mb-4">📂</div>
                      <p className="text-gray-600">Документов пока нет</p>
                      <p className="text-sm text-gray-500">Создайте первый документ с помощью ИИ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getMaterialsByType('document').map((material) => (
                        <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {formatTimeAgo(material.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {material.ai_generated ? '🤖 Создано ИИ' : '✏️ Создано вручную'}
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/material/${material.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Открыть
                            </Link>
                            <PDFExporter
                              content={material.content || ''}
                              title={material.title}
                              className="text-xs px-2 py-1"
                            />
                            <button 
                              onClick={async () => {
                                if (confirm('Вы уверены, что хотите удалить этот материал?')) {
                                  try {
                                    await materialService.deleteMaterial(material.id)
                                    // Обновляем список материалов
                                    const updatedMaterials = materials.filter(m => m.id !== material.id)
                                    setMaterials(updatedMaterials)
                                  } catch (error) {
                                    console.error('Ошибка при удалении:', error)
                                    alert('Не удалось удалить материал')
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
