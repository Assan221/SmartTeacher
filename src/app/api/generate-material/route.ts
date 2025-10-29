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

КРИТИЧЕСКИ ВАЖНО: Создай ТОЧНО ${data.slides} слайдов, не больше и не меньше!

СТРУКТУРА ПРЕЗЕНТАЦИИ (${data.slides} слайдов):
- Слайд 1: Титульный слайд (тема, класс, дата)
- Слайд 2: План презентации или введение
- Слайды 3-${data.slides - 1}: Основное содержание
- Слайд ${data.slides}: Заключение или домашнее задание

ДЛЯ КАЖДОГО СЛАЙДА СОЗДАЙ:
1. Номер слайда: "Слайд 1:", "Слайд 2:", и т.д.
2. Заголовок слайда
3. Подробное содержание слайда
4. Рекомендации по оформлению

ПРИМЕР ФОРМАТА:
Слайд 1: [Заголовок]
[Содержание]

Слайд 2: [Заголовок]
[Содержание]

...и так далее до Слайда ${data.slides}

ОБЯЗАТЕЛЬНО СОЗДАЙ ВСЕ ${data.slides} СЛАЙДОВ ПОЛНОСТЬЮ!
НЕ ОСТАНАВЛИВАЙСЯ НА СЕРЕДИНЕ!
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
      max_tokens: 4000,
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
