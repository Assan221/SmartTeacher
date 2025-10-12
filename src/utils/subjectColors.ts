// Цвета и иконки для разных предметов
export const subjectColors: Record<string, { color: string; bgColor: string; icon: string }> = {
  'математика': { color: 'text-green-700', bgColor: 'bg-green-100', icon: '🔢' },
  'история': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '📜' },
  'биология': { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: '🧬' },
  'физика': { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '⚛️' },
  'химия': { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '🧪' },
  'литература': { color: 'text-pink-700', bgColor: 'bg-pink-100', icon: '📚' },
  'русский': { color: 'text-red-700', bgColor: 'bg-red-100', icon: '📝' },
  'английский': { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: '🇬🇧' },
  'география': { color: 'text-teal-700', bgColor: 'bg-teal-100', icon: '🌍' },
  'информатика': { color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: '💻' },
  'физкультура': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⚽' },
  'искусство': { color: 'text-rose-700', bgColor: 'bg-rose-100', icon: '🎨' },
  'музыка': { color: 'text-violet-700', bgColor: 'bg-violet-100', icon: '🎵' },
  'обществознание': { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '🏛️' },
  'экономика': { color: 'text-lime-700', bgColor: 'bg-lime-100', icon: '💰' },
}

// Функция для получения цвета предмета
export function getSubjectColor(subject: string | undefined | null) {
  // Проверяем, что subject является валидной строкой
  if (!subject || typeof subject !== 'string') {
    return { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '📖' }
  }

  const normalizedSubject = subject.toLowerCase().trim()
  
  // Ищем точное совпадение
  if (subjectColors[normalizedSubject]) {
    return subjectColors[normalizedSubject]
  }
  
  // Ищем частичное совпадение
  for (const [key, value] of Object.entries(subjectColors)) {
    if (normalizedSubject.includes(key) || key.includes(normalizedSubject)) {
      return value
    }
  }
  
  // Возвращаем дефолтный цвет
  return { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '📖' }
}

// Функция для форматирования времени
export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'только что'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} мин назад`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ч назад`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} дн назад`
  } else {
    return past.toLocaleDateString('ru-RU')
  }
}
