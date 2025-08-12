-- Tabela para histórico de pontos
CREATE TABLE pontos_historico (
    id BIGSERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    cliente_nome VARCHAR(255),
    pontos INT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'ganho', 'usado', 'bonus'
    descricao TEXT,
    pedido_id BIGINT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Índices para performance
CREATE INDEX idx_pontos_cliente ON pontos_historico(cliente_id);
CREATE INDEX idx_pontos_data ON pontos_historico(data_criacao);