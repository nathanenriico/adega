-- Tabela para registrar carrinhos abandonados para recuperação
CREATE TABLE IF NOT EXISTS carrinho_abandonado (
    id BIGSERIAL PRIMARY KEY,
    cliente_nome VARCHAR(255),
    cliente_telefone VARCHAR(20) NOT NULL,
    produtos_json TEXT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_abandono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recuperado BOOLEAN DEFAULT FALSE,
    data_recuperacao TIMESTAMP NULL
);

-- Desabilitar RLS
ALTER TABLE carrinho_abandonado DISABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX IF NOT EXISTS idx_carrinho_abandonado_telefone ON carrinho_abandonado(cliente_telefone);
CREATE INDEX IF NOT EXISTS idx_carrinho_abandonado_data ON carrinho_abandonado(data_abandono);
CREATE INDEX IF NOT EXISTS idx_carrinho_abandonado_recuperado ON carrinho_abandonado(recuperado);