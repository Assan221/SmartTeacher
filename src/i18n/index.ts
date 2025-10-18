// Типы для языков и переводов
export type Language = 'ru' | 'kk' | 'en'
export type TranslationKey = string

// Тип для объекта переводов с индексной сигнатурой
type TranslationObject = {
  [key: string]: string
}

// Словари переводов
export const translations: Record<Language, TranslationObject> = {
  ru: {
    // Общие
    'app.title': 'SmartUstaz',
    'app.subtitle': 'Образовательный помощник для учителей',
    
    // Навигация
    'nav.dashboard': 'Главная',
    'nav.classes': 'Классы',
    'nav.analytics': 'Аналитика',
    'nav.profile': 'Профиль',
    'nav.settings': 'Настройки',
    
    // Настройки
    'settings.title': 'Настройки',
    'settings.theme': 'Тема',
    'settings.theme_light': 'Светлая',
    'settings.theme_dark': 'Тёмная',
    'settings.language': 'Язык интерфейса',
    'settings.language_ru': 'Русский',
    'settings.language_kk': 'Қазақ тілі',
    'settings.language_en': 'English',
    
    // Действия
    'actions.close': 'Закрыть',
    'actions.save': 'Сохранить',
    'actions.cancel': 'Отмена',
    'actions.delete': 'Удалить',
    'actions.edit': 'Редактировать',
    'actions.create': 'Создать',
    'actions.open': 'Открыть',
    'actions.back': 'Назад',
    
    // Классы
    'classes.title': 'Ваши классы',
    'classes.create': 'Создать класс',
    'classes.empty': 'Нет классов',
    'classes.recent': 'Недавние классы',
    
    // Материалы
    'materials.lesson_plans': 'Планы уроков',
    'materials.presentations': 'Презентации',
    'materials.tests': 'Тесты и задания',
    'materials.schedule': 'Расписание',
    'materials.documents': 'Документация',
    'materials.create': 'Создать материал',
    'materials.ai_generated': 'Создано ИИ',
    'materials.manual': 'Создано вручную',
    'materials.empty': 'Материалов пока нет',
    
    // ИИ чат
    'chat.title': 'AI Чат',
    'chat.placeholder': 'Задайте вопрос или опишите задачу...',
    'chat.send': 'Отправить',
    'chat.thinking': 'ИИ думает...',
    'chat.welcome': 'Привет! Я SmartUstaz AI.',
    'chat.welcome_subtitle': 'Задайте вопрос или выберите быструю команду выше.',
    
    // Быстрые действия
    'quick.lesson_plan': 'План урока',
    'quick.presentation': 'Презентация',
    'quick.test': 'Тест',
    'quick.homework': 'Домашнее задание',
    'quick.activity': 'Активности',
    
    // Время
    'time.just_now': 'только что',
    'time.minutes_ago': 'мин назад',
    'time.hours_ago': 'ч назад',
    'time.days_ago': 'дн назад',
    'time.created': 'Создан',
    'time.updated': 'Обновлен',
    
    // Ошибки
    'error.general': 'Произошла ошибка',
    'error.network': 'Проблемы с сетью',
    'error.not_found': 'Не найдено',
    'error.loading': 'Ошибка загрузки',
    
    // Успех
    'success.saved': 'Сохранено',
    'success.deleted': 'Удалено',
    'success.created': 'Создано',
    
    // Авторизация
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.logout': 'Выход',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
  },
  
  kk: {
    // Общие
    'app.title': 'SmartUstaz',
    'app.subtitle': 'Мұғалімдерге арналған білім беру көмекшісі',
    
    // Навигация
    'nav.dashboard': 'Басты бет',
    'nav.classes': 'Сыныптар',
    'nav.analytics': 'Аналитика',
    'nav.profile': 'Профиль',
    'nav.settings': 'Баптаулар',
    
    // Настройки
    'settings.title': 'Баптаулар',
    'settings.theme': 'Тақырып',
    'settings.theme_light': 'Ашық',
    'settings.theme_dark': 'Қараңғы',
    'settings.language': 'Интерфейс тілі',
    'settings.language_ru': 'Русский',
    'settings.language_kk': 'Қазақ тілі',
    'settings.language_en': 'English',
    
    // Действия
    'actions.close': 'Жабу',
    'actions.save': 'Сақтау',
    'actions.cancel': 'Болдырмау',
    'actions.delete': 'Жою',
    'actions.edit': 'Өзгерту',
    'actions.create': 'Жасау',
    'actions.open': 'Ашу',
    'actions.back': 'Артқа',
    
    // Классы
    'classes.title': 'Сіздің сыныптарыңыз',
    'classes.create': 'Сынып жасау',
    'classes.empty': 'Сыныптар жоқ',
    'classes.recent': 'Соңғы сыныптар',
    
    // Материалы
    'materials.lesson_plans': 'Сабақ жоспарлары',
    'materials.presentations': 'Презентациялар',
    'materials.tests': 'Тесттер мен тапсырмalar',
    'materials.schedule': 'Кесте',
    'materials.documents': 'Құжаттар',
    'materials.create': 'Материал жасау',
    'materials.ai_generated': 'AI жасаған',
    'materials.manual': 'Қолмен жасалған',
    'materials.empty': 'Материалдар жоқ',
    
    // ИИ чат
    'chat.title': 'AI Чат',
    'chat.placeholder': 'Сұрақ қойыңыз немесе тапсырманы сипаттаңыз...',
    'chat.send': 'Жіберу',
    'chat.thinking': 'AI ойлануда...',
    'chat.welcome': 'Сәлем! Мен SmartUstaz AI-мын.',
    'chat.welcome_subtitle': 'Сұрақ қойыңыз немесе жоғарыдан жылдам команда таңдаңыз.',
    
    // Время
    'time.just_now': 'дәл қазір',
    'time.minutes_ago': 'мин бұрын',
    'time.hours_ago': 'сағ бұрын',
    'time.days_ago': 'күн бұрын',
    'time.created': 'Жасалған',
    'time.updated': 'Жаңартылған',
  },
  
  en: {
    // Общие
    'app.title': 'SmartUstaz',
    'app.subtitle': 'Educational assistant for teachers',
    
    // Навигация
    'nav.dashboard': 'Dashboard',
    'nav.classes': 'Classes',
    'nav.analytics': 'Analytics',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Настройки
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme_light': 'Light',
    'settings.theme_dark': 'Dark',
    'settings.language': 'Interface Language',
    'settings.language_ru': 'Русский',
    'settings.language_kk': 'Қазақ тілі',
    'settings.language_en': 'English',
    
    // Действия
    'actions.close': 'Close',
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.delete': 'Delete',
    'actions.edit': 'Edit',
    'actions.create': 'Create',
    'actions.open': 'Open',
    'actions.back': 'Back',
    
    // Классы
    'classes.title': 'Your Classes',
    'classes.create': 'Create Class',
    'classes.empty': 'No classes',
    'classes.recent': 'Recent Classes',
    
    // Материалы
    'materials.lesson_plans': 'Lesson Plans',
    'materials.presentations': 'Presentations',
    'materials.tests': 'Tests & Assignments',
    'materials.schedule': 'Schedule',
    'materials.documents': 'Documents',
    'materials.create': 'Create Material',
    'materials.ai_generated': 'AI Generated',
    'materials.manual': 'Manually Created',
    'materials.empty': 'No materials yet',
    
    // ИИ чат
    'chat.title': 'AI Chat',
    'chat.placeholder': 'Ask a question or describe a task...',
    'chat.send': 'Send',
    'chat.thinking': 'AI is thinking...',
    'chat.welcome': 'Hello! I am SmartUstaz AI.',
    'chat.welcome_subtitle': 'Ask a question or select a quick command above.',
    
    // Время
    'time.just_now': 'just now',
    'time.minutes_ago': 'min ago',
    'time.hours_ago': 'h ago',
    'time.days_ago': 'd ago',
    'time.created': 'Created',
    'time.updated': 'Updated',
  }
}

// Текущий язык (по умолчанию русский)
let currentLanguage: Language = 'ru'

// Функция перевода с fallback на русский
export function t(key: TranslationKey): string {
  const translation = translations[currentLanguage]?.[key] || translations.ru[key] || key
  return translation
}

// Установить язык
export function setLanguage(language: Language): void {
  currentLanguage = language
}

// Получить текущий язык
export function getCurrentLanguage(): Language {
  return currentLanguage
}

// Получить список доступных языков
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'ru', name: 'Русский' },
    { code: 'kk', name: 'Қазақ тілі' },
    { code: 'en', name: 'English' }
  ]
}
