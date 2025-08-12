-- Adicionar campos completos do cliente nas tabelas
ALTER TABLE cupons ADD COLUMN cliente_nome VARCHAR(255);
ALTER TABLE cupons ADD COLUMN cliente_telefone VARCHAR(20);
ALTER TABLE cupons ADD COLUMN cliente_endereco TEXT;

ALTER TABLE pontos_historico ADD COLUMN cliente_nome VARCHAR(255);
ALTER TABLE pontos_historico ADD COLUMN cliente_telefone VARCHAR(20);
ALTER TABLE pontos_historico ADD COLUMN cliente_endereco TEXT;