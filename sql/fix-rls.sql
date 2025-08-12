-- Desabilitar RLS na tabela clientes para permitir inserções
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'clientes';