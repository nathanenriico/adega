-- Script SQL para criar a tabela de produtos no Supabase
-- Execute este script no SQL Editor do painel do Supabase

-- Criar tabela produtos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]',
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política de acesso (permitir todas as operações)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    address TEXT,
    status VARCHAR(50) DEFAULT 'novo',
    payment_status VARCHAR(50) DEFAULT 'pendente',
    items JSONB,
    date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS para a tabela de pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política de acesso para pedidos
CREATE POLICY "Allow all operations on pedidos" ON pedidos FOR ALL USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_date ON pedidos(date);

-- Inserir alguns produtos de exemplo (opcional)
INSERT INTO products (name, image, images, price, category, active) VALUES
('Heineken Lata 350ml', 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400', '["https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400"]', 4.50, 'cervejas', true),
('Stella Artois Long Neck', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', '["https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"]', 5.90, 'cervejas', true),
('Vinho Tinto Cabernet', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', '["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400"]', 45.90, 'vinhos', true)
ON CONFLICT DO NOTHING;