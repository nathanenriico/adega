-- Script para corrigir a tabela pedidos para aceitar IDs customizados
-- Execute este script no SQL Editor do Supabase

-- Remover a sequência automática da coluna id
ALTER TABLE pedidos ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS pedidos_id_seq;

-- Alterar o tipo da coluna para BIGINT (se necessário)
ALTER TABLE pedidos ALTER COLUMN id TYPE BIGINT;

-- Verificar se a alteração foi aplicada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pedidos' AND column_name = 'id';