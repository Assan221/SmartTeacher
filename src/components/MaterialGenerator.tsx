'use client'

import { useState } from 'react'
import { aiService } from '@/lib/openai'
import { materialService } from '@/lib/database'

interface MaterialGeneratorProps {
  classId: string
  onMaterialCreated?: () => void
}

export default function MaterialGenerator({ classId, onMaterialCreated }: MaterialGeneratorProps) {
  const [activeType, setActiveType] = useState<'lesson_plan' | 'presentation' | 'test'>('lesson_plan')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')

  // Формы для разных типов материалов
  const [lessonForm, setLessonForm] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: 45,
    objectives: ['']
  })

  const [presentationForm, setPresentationForm] = useState({
    topic: '',
    grade: '',
    slides: 10,
    style: 'academic' as 'academic' | 'creative' | 'minimal'
  })

  const [testForm, setTestForm] = useState({
    subject: '',
    grade: '',
    topic: '',
    questions: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  })

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    setGeneratedContent('')

    try {
      let content = ''
      
      if (activeType === 'lesson_plan') {
        content = await aiService.generateLessonPlan({
          subject: lessonForm.subject,
          grade: lessonForm.grade,
          topic: lessonForm.topic,
          duration: lessonForm.duration,
          objectives: lessonForm.objectives.filter(obj => obj.trim())
        })
      } else if (activeType === 'presentation') {
        content = await aiService.generatePresentation({
          topic: presentationForm.topic,
          grade: presentationForm.grade,
          slides: presentationForm.slides,
          style: presentationForm.style
        })
      } else if (activeType === 'test') {
        content = await aiService.generateTest({
          subject: testForm.subject,
          grade: testForm.grade,
          topic: testForm.topic,
          questions: testForm.questions,
          difficulty: testForm.difficulty
        })
      }

      setGeneratedContent(content)
    } catch (error) {
      console.error('Ошибка генерации:', error)
      setError('Не удалось сгенерировать материал. Проверьте подключение к интернету.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveMaterial = async () => {
    if (!generatedContent.trim()) return

    try {
      const title = activeType === 'lesson_plan' 
        ? `План урока: ${lessonForm.topic}`
        : activeType === 'presentation'
        ? `Презентация: ${presentationForm.topic}`
        : `Тест: ${testForm.topic}`

      await materialService.createMaterial({
        class_id: classId,
        type: activeType,
        title,
        content: generatedContent,
        ai_generated: true
      })

      setGeneratedContent('')
      onMaterialCreated?.()
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      setError('Не удалось сохранить материал')
    }
  }

  const addObjective = () => {
    setLessonForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }))
  }

  const updateObjective = (index: number, value: string) => {
    setLessonForm(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }))
  }

  const removeObjective = (index: number) => {
    setLessonForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Выбор типа материала */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Выберите тип материала</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setActiveType('lesson_plan')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeType === 'lesson_plan'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">План урока</div>
          </button>
          <button
            onClick={() => setActiveType('presentation')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeType === 'presentation'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Презентация</div>
          </button>
          <button
            onClick={() => setActiveType('test')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeType === 'test'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Тест</div>
          </button>
        </div>
      </div>

      {/* Форма для плана урока */}
      {activeType === 'lesson_plan' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Параметры плана урока</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
              <input
                type="text"
                value={lessonForm.subject}
                onChange={(e) => setLessonForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: Математика"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
              <input
                type="text"
                value={lessonForm.grade}
                onChange={(e) => setLessonForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: 5-А"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Тема урока</label>
              <input
                type="text"
                value={lessonForm.topic}
                onChange={(e) => setLessonForm(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: Сложение дробей"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность (мин)</label>
              <input
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="15"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Цели урока</label>
              <div className="space-y-2">
                {lessonForm.objectives.map((objective, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Цель урока"
                    />
                    <button
                      onClick={() => removeObjective(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addObjective}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Добавить цель
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Форма для презентации */}
      {activeType === 'presentation' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Параметры презентации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тема</label>
              <input
                type="text"
                value={presentationForm.topic}
                onChange={(e) => setPresentationForm(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Тема презентации"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
              <input
                type="text"
                value={presentationForm.grade}
                onChange={(e) => setPresentationForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: 5-А"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Количество слайдов</label>
              <input
                type="number"
                value={presentationForm.slides}
                onChange={(e) => setPresentationForm(prev => ({ ...prev, slides: parseInt(e.target.value) || 10 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="5"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Стиль</label>
              <select
                value={presentationForm.style}
                onChange={(e) => setPresentationForm(prev => ({ ...prev, style: e.target.value as 'academic' | 'creative' | 'minimal' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="academic">Академический</option>
                <option value="creative">Креативный</option>
                <option value="minimal">Минималистичный</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Форма для теста */}
      {activeType === 'test' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Параметры теста</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
              <input
                type="text"
                value={testForm.subject}
                onChange={(e) => setTestForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: Математика"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Класс</label>
              <input
                type="text"
                value={testForm.grade}
                onChange={(e) => setTestForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Например: 5-А"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тема</label>
              <input
                type="text"
                value={testForm.topic}
                onChange={(e) => setTestForm(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Тема теста"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Количество вопросов</label>
              <input
                type="number"
                value={testForm.questions}
                onChange={(e) => setTestForm(prev => ({ ...prev, questions: parseInt(e.target.value) || 10 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="5"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сложность</label>
              <select
                value={testForm.difficulty}
                onChange={(e) => setTestForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="easy">Легкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка генерации */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Генерирую...</span>
            </div>
          ) : (
            'Сгенерировать материал'
          )}
        </button>
      </div>

      {/* Результат генерации */}
      {generatedContent && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Сгенерированный материал</h3>
            <button
              onClick={handleSaveMaterial}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-900 bg-gray-50 p-4 rounded-lg">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
