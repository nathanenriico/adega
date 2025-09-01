-- Adicionar coluna para armazenar produtos
ALTER TABLE carrinho_status 
ADD COLUMN IF NOT EXISTS produtos_json TEXT;