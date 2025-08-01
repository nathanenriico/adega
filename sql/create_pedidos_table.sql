-- Script para criar tabela pedidos no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT PRIMARY KEY,
    cliente_id INT,
    valor_total DECIMAL(10,2) NOT NULL,
    pontos_ganhos INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'novo',
    forma_pagamento VARCHAR(100),
    endereco TEXT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
CREATE POLICY "Allow all operations on pedidos" ON pedidos FOR ALL USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);