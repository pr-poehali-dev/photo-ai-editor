-- Users table with phone authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_child BOOLEAN DEFAULT FALSE,
    theme VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family connections
CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    child_id INTEGER REFERENCES users(id),
    family_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, child_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    thumbnail_url TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stickers library
CREATE TABLE IF NOT EXISTS stickers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default stickers
INSERT INTO stickers (name, emoji, category) VALUES
('Смайлик', '😊', 'emotions'),
('Сердце', '❤️', 'emotions'),
('Звезда', '⭐', 'shapes'),
('Огонь', '🔥', 'effects'),
('Радуга', '🌈', 'nature'),
('Облако', '☁️', 'nature'),
('Солнце', '☀️', 'nature'),
('Луна', '🌙', 'nature'),
('Цветок', '🌸', 'nature'),
('Бабочка', '🦋', 'animals'),
('Единорог', '🦄', 'animals'),
('Кот', '🐱', 'animals'),
('Собака', '🐶', 'animals'),
('Ракета', '🚀', 'objects'),
('Корона', '👑', 'objects'),
('Музыка', '🎵', 'objects'),
('Камера', '📷', 'objects'),
('Палитра', '🎨', 'objects'),
('Магия', '✨', 'effects'),
('Молния', '⚡', 'effects');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_families_parent ON families(parent_id);
CREATE INDEX IF NOT EXISTS idx_families_child ON families(child_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_stickers_category ON stickers(category);