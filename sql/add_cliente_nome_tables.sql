-- Adicionar campo cliente_nome nas tabelas existentes
ALTER TABLE cupons ADD COLUMN cliente_nome VARCHAR(255);
ALTER TABLE pontos_historico ADD COLUMN cliente_nome VARCHAR(255);