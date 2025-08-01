-- Adicionar coluna cliente_nome na tabela pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_nome VARCHAR(255);