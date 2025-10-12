-- SmartUstaz Database Setup
-- Выполните этот скрипт в SQL Editor Supabase

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица классов
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Таблица тредов (для чатов с ИИ)
CREATE TABLE IF NOT EXISTS threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Таблица материалов
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('lesson_plan', 'presentation', 'test', 'document', 'homework', 'activity')),
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_class_id ON threads(class_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_materials_class_id ON materials(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);

-- Создаем функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настраиваем Row Level Security (RLS)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для классов
CREATE POLICY "Users can view their own classes" ON classes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON classes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON classes
    FOR DELETE USING (auth.uid() = user_id);

-- Политики безопасности для тредов
CREATE POLICY "Users can view their own threads" ON threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own threads" ON threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads" ON threads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads" ON threads
    FOR DELETE USING (auth.uid() = user_id);

-- Политики безопасности для сообщений
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- Политики безопасности для материалов
CREATE POLICY "Users can view their own materials" ON materials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" ON materials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" ON materials
    FOR DELETE USING (auth.uid() = user_id);

-- Вставляем демо-данные (только для тестирования)
-- Эти данные будут доступны всем пользователям
INSERT INTO classes (id, name, subject, description, color, user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '9-й класс "Е"', 'Математика', 'Основы алгебры и геометрии', '#3B82F6', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440002', '10-й класс "А"', 'Физика', 'Механика и термодинамика', '#10B981', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440003', '11-й класс "Б"', 'Химия', 'Органическая и неорганическая химия', '#F59E0B', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO materials (id, class_id, title, type, content, ai_generated, user_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Квадратные уравнения', 'lesson_plan', 'План урока по решению квадратных уравнений', true, '00000000-0000-0000-0000-000000000000'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Геометрические фигуры', 'presentation', 'Презентация о треугольниках и четырехугольниках', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Создаем политики для демо-данных (доступны всем)
CREATE POLICY "Demo data accessible to all users" ON classes
    FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo materials accessible to all users" ON materials
    FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000000');



COMMENT ON TABLE classes IS 'Таблица классов пользователей';
COMMENT ON TABLE threads IS 'Таблица тредов для чатов с ИИ';
COMMENT ON TABLE messages IS 'Таблица сообщений в тредах';
COMMENT ON TABLE materials IS 'Таблица образовательных материалов';
