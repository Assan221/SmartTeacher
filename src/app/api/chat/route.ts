import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Ты - SmartUstaz, образовательный помощник для учителей. Ты помогаешь создавать планы уроков, презентации, тесты и другие учебные материалы. Отвечай на русском языке, будь дружелюбным и профессиональным.`
        },
        ...messages
      ],
      max_tokens: 2000,
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
