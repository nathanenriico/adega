-- Tabela para status em tempo real (registra cada alteração)
CREATE TABLE IF NOT EXISTS carrinho_status (
    id BIGSERIAL PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('adicionado', 'editado', 'confirmado', 'em_preparo', 'em_entrega', 'entregue', 'desistido')),
    valor_total DECIMAL(10,2) DEFAULT 0,
    desistido BOOLEAN DEFAULT FALSE,
    pedido_id TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE carrinho_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON carrinho_status FOR ALL USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_carrinho_status ON carrinho_status(status);
CREATE INDEX IF NOT EXISTS idx_carrinho_cliente ON carrinho_status(cliente_nome);
CREATE INDEX IF NOT EXISTS idx_carrinho_telefone ON carrinho_status(cliente_telefone);
CREATE INDEX IF NOT EXISTS idx_carrinho_desistido ON carrinho_status(desistido);
CREATE INDEX IF NOT EXISTS idx_pedido_id ON carrinho_status(pedido_id);