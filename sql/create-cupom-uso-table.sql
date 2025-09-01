-- Tabela para registrar uso de cupons
CREATE TABLE IF NOT EXISTS cupom_uso (
    id BIGSERIAL PRIMARY KEY,
    cupom_id BIGINT NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    endereco TEXT,
    desconto_aplicado TEXT,
    data_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE cupom_uso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON cupom_uso FOR ALL USING (true);

-- Índices
CREATE INDEX idx_cupom_uso_cupom_id ON cupom_uso(cupom_id);
CREATE INDEX idx_cupom_uso_cliente ON cupom_uso(cliente_nome);
CREATE INDEX idx_cupom_uso_data ON cupom_uso(data_uso);