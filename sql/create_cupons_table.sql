-- Criar tabela de cupons (versão simplificada)
CREATE TABLE IF NOT EXISTS cupons (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    desconto VARCHAR(50) NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_uso TIMESTAMP NULL
);

-- Desabilitar RLS temporariamente para testes
ALTER TABLE cupons DISABLE ROW LEVEL SECURITY;