import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Улучшаем последнее сообщение пользователя если это запрос на презентацию
    const enhancedMessages = enhancePresentationRequest(messages)

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Ты - SmartUstaz, образовательный помощник для учителей. Ты помогаешь создавать планы уроков, презентации, тесты и другие учебные материалы. 

ВАЖНЫЕ ПРАВИЛА:
- Когда создаешь презентацию, ОБЯЗАТЕЛЬНО создавай ТОЧНО указанное количество слайдов
- Каждый слайд должен быть пронумерован (Слайд 1, Слайд 2, и т.д.)
- Для каждого слайда указывай заголовок и подробное содержание
- Если просят 5 слайдов - создавай все 5, если 10 - то все 10
- Отвечай на русском языке, будь дружелюбным и профессиональным`
        },
        ...enhancedMessages
      ],
      max_tokens: 4000,
      temperature: 0.7,
    })

    return NextResponse.json({ 
      content: response.choices[0]?.message?.content || 'Извините, произошла ошибка.' 
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json({ error: 'Не удалось получить ответ от ИИ' }, { status: 500 })
  }
}

// Функция для улучшения запросов на презентации
function enhancePresentationRequest(messages: ChatMessage[]): ChatMessage[] {
  const lastMessage = messages[messages.length - 1]
  
  if (lastMessage?.role === 'user' && lastMessage?.content) {
    const content = lastMessage.content.toLowerCase()
    
    // Проверяем, является ли это запросом на презентацию
    if (content.includes('презентация') || content.includes('слайд')) {
      // Извлекаем количество слайдов
      const slideMatch = content.match(/(\d+)\s*слайд/)
      const slideCount = slideMatch ? slideMatch[1] : '5'
      
      // Улучшаем запрос
      const enhancedContent = `${lastMessage.content}

ВАЖНО: Создай ТОЧНО ${slideCount} слайдов для этой презентации. Каждый слайд должен быть пронумерован и содержать:
- Заголовок слайда
- Подробное содержание
- Практические примеры или задания (где уместно)

Не останавливайся на середине - создай все ${slideCount} слайдов полностью!`
      
      return [
        ...messages.slice(0, -1),
        { ...lastMessage, content: enhancedContent }
      ]
    }
  }
  
  return messages
}
