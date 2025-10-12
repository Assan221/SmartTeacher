import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    let prompt = ''

    switch (type) {
      case 'lesson_plan':
        prompt = `
Создай подробный план урока по следующим параметрам:
- Предмет: ${data.subject}
- Класс: ${data.grade}
- Тема: ${data.topic}
- Продолжительность: ${data.duration} минут
- Цели урока: ${data.objectives?.join(', ') || 'Не указаны'}

Структура плана:
1. Цели урока
2. Оборудование и материалы
3. Ход урока (с временными рамками)
4. Домашнее задание
5. Оценка результатов

Будь конкретным и практичным. Используй современные методы обучения.
        `
        break

      case 'presentation':
        prompt = `
Создай структуру презентации по следующим параметрам:
- Тема: ${data.topic}
- Класс: ${data.grade}
- Количество слайдов: ${data.slides}
- Стиль: ${data.style}

Создай план презентации с описанием каждого слайда:
1. Титульный слайд
2. План презентации
3. Основные слайды с содержанием
4. Заключительный слайд

Для каждого слайда укажи:
- Заголовок
- Основное содержание
- Рекомендации по оформлению
- Интерактивные элементы (если нужны)
        `
        break

      case 'test':
        prompt = `
Создай тест по следующим параметрам:
- Предмет: ${data.subject}
- Класс: ${data.grade}
- Тема: ${data.topic}
- Количество вопросов: ${data.questions}
- Сложность: ${data.difficulty}

Создай тест с разными типами вопросов:
1. Вопросы с выбором ответа (A, B, C, D)
2. Вопросы с кратким ответом
3. Вопросы на соответствие
4. Вопросы с развернутым ответом

Для каждого вопроса укажи:
- Текст вопроса
- Варианты ответов (если применимо)
- Правильный ответ
- Объяснение (если нужно)

Включи критерии оценивания.
        `
        break

      default:
        return NextResponse.json({ error: 'Неизвестный тип материала' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({ 
      content: response.choices[0]?.message?.content || 'Извините, произошла ошибка.' 
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json({ error: 'Не удалось сгенерировать материал' }, { status: 500 })
  }
}
