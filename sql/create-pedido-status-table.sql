-- Tabela para acompanhar status dos pedidos
CREATE TABLE IF NOT EXISTS pedido_status (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('novo', 'aguardando_pagamento', 'pedido_recebido', 'preparando', 'saindo_entrega', 'entregue')),
    valor_total DECIMAL(10,2) DEFAULT 0,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE pedido_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON pedido_status FOR ALL USING (true);

-- Índices
CREATE INDEX idx_pedido_status_pedido_id ON pedido_status(pedido_id);
CREATE INDEX idx_pedido_status_status ON pedido_status(status);
CREATE INDEX idx_pedido_status_cliente ON pedido_status(cliente_nome);
CREATE INDEX idx_pedido_status_data ON pedido_status(data_alteracao);

-- Cada registro é uma nova entrada, sem updates