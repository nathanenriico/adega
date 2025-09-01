-- Script para remover duplicatas na tabela pedido_status
-- Mantém apenas o registro mais recente de cada status por pedido

-- 1. Criar tabela temporária com registros únicos (mais recentes)
CREATE TEMP TABLE pedido_status_unique AS
SELECT DISTINCT ON (pedido_id, status) 
    id,
    pedido_id,
    cliente_nome,
    cliente_telefone,
    status,
    valor_total,
    data_alteracao
FROM pedido_status
ORDER BY pedido_id, status, data_alteracao DESC;

-- 2. Deletar todos os registros da tabela original
DELETE FROM pedido_status;

-- 3. Inserir apenas os registros únicos de volta
INSERT INTO pedido_status (id, pedido_id, cliente_nome, cliente_telefone, status, valor_total, data_alteracao)
SELECT id, pedido_id, cliente_nome, cliente_telefone, status, valor_total, data_alteracao
FROM pedido_status_unique;

-- 4. Resetar a sequência do ID para o próximo valor
SELECT setval('pedido_status_id_seq', (SELECT MAX(id) FROM pedido_status));

-- 5. Verificar resultado
SELECT 
    pedido_id,
    status,
    COUNT(*) as quantidade,
    MAX(data_alteracao) as ultima_alteracao
FROM pedido_status 
GROUP BY pedido_id, status 
HAVING COUNT(*) > 1
ORDER BY pedido_id, status;

-- Se a query acima retornar 0 linhas, significa que não há mais duplicatas