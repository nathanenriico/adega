-- Adicionar status 'desistido' à tabela pedido_status
ALTER TABLE pedido_status DROP CONSTRAINT IF EXISTS pedido_status_status_check;
ALTER TABLE pedido_status ADD CONSTRAINT pedido_status_status_check 
CHECK (status IN ('novo', 'aguardando_pagamento', 'pedido_recebido', 'preparando', 'saiu_entrega', 'entregue', 'desistido'));