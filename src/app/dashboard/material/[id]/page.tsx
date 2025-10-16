'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { materialService } from '@/lib/database'
import PDFExporter from '@/components/PDFExporter'
import { formatTimeAgo } from '@/utils/subjectColors'
import type { Material } from '@/types/database'

export default function MaterialViewPage() {
  const params = useParams()
  const router = useRouter()
  const materialId = params.id as string
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMaterial = useCallback(async () => {
    try {
      const data = await materialService.getMaterial(materialId)
      setMaterial(data)
    } catch (error) {
      console.error('Ошибка загрузки материала:', error)
      setError('Не удалось загрузить материал')
    } finally {
      setLoading(false)
    }
  }, [materialId])

  useEffect(() => {
    if (materialId) {
      fetchMaterial()
    }
  }, [materialId, fetchMaterial])

  const handleDelete = async () => {
    if (!material) return
    
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await materialService.deleteMaterial(material.id)
        router.back()
      } catch (error) {
        console.error('Ошибка при удалении:', error)
        alert('Не удалось удалить материал')
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-gray-400">Загрузка материала...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !material) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 text-gray-100 mb-2">Ошибка</h1>
            <p className="text-gray-600 text-gray-400 mb-4">{error || 'Материал не найден'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-500 text-gray-400 hover:text-gray-700 hover:text-gray-300 transition-colors"
                >
                  ← Назад
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 text-gray-100">{material.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 text-gray-400">
                    <span>{formatTimeAgo(material.created_at)}</span>
                    <span>{material.ai_generated ? '🤖 Создано ИИ' : '✏️ Создано вручную'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PDFExporter
                  content={material.content || ''}
                  title={material.title}
                  className="text-sm"
                />
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 text-gray-100 leading-relaxed">
              {material.content}
            </div>
          </div>
        </div>

        {/* Подвал */}
        <div className="border-t border-gray-200 bg-gray-50 mt-16">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="text-center text-sm text-gray-500 text-gray-400">
              <p>Создано с помощью SmartUstaz AI</p>
              <p>Образовательный помощник для учителей</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
