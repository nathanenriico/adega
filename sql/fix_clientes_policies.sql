-- Corrigir políticas de segurança da tabela clientes

-- Desabilitar RLS para permitir acesso total
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Ou habilitar RLS com políticas permissivas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
CREATE POLICY "Permitir tudo em clientes" ON clientes
    FOR ALL USING (true) WITH CHECK (true);

-- Garantir que a tabela existe com estrutura correta
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL UNIQUE,
    cep VARCHAR(10) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    pontos INT DEFAULT 0,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- Verificar se há registros na tabela
SELECT COUNT(*) as total_clientes FROM clientes;

-- Verificar últimos registros
SELECT id, nome, whatsapp, data_cadastro 
FROM clientes 
ORDER BY data_cadastro DESC 
LIMIT 5;