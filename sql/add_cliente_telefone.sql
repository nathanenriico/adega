-- Adicionar colunas para cliente e telefone na tabela pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_telefone VARCHAR(20);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS itens_json TEXT;