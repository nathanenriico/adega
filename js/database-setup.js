// Script para configurar o banco de dados Supabase
// Execute este script no console do navegador para criar as tabelas necessárias

async function setupDatabase() {
    console.log('🔧 Configurando banco de dados...');
    
    try {
        // Verificar se o cliente Supabase está disponível
        if (!window.supabase) {
            console.error('❌ Supabase não está carregado');
            return;
        }
        
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Testar conexão
        console.log('🔍 Testando conexão...');
        const { data: testData, error: testError } = await supabaseClient
            .from('clientes')
            .select('count')
            .limit(1);
        
        if (testError && testError.code === '42P01') {
            console.log('📋 Tabela clientes não existe, será necessário criar via SQL');
            console.log(`
            Execute os seguintes comandos SQL no painel do Supabase:
            
            -- Criar tabela clientes
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                telefone VARCHAR(20) UNIQUE NOT NULL,
                pontos INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            
            -- Criar tabela pedidos
            CREATE TABLE IF NOT EXISTS pedidos (
                id BIGINT PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id),
                valor_total DECIMAL(10,2) NOT NULL,
                pontos_ganhos INTEGER DEFAULT 0,
                data_pedido TIMESTAMP DEFAULT NOW()
            );
            
            -- Criar tabela cupons
            CREATE TABLE IF NOT EXISTS cupons (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id),
                titulo VARCHAR(255) NOT NULL,
                descricao TEXT,
                desconto VARCHAR(50) NOT NULL,
                usado BOOLEAN DEFAULT FALSE,
                data_criacao TIMESTAMP DEFAULT NOW()
            );
            
            -- Criar tabela produtos
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image TEXT,
                images JSONB DEFAULT '[]',
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            
            -- Habilitar RLS (Row Level Security)
            ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
            ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
            ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;
            ALTER TABLE products ENABLE ROW LEVEL SECURITY;
            
            -- Políticas de acesso (permitir todas as operações para teste)
            CREATE POLICY "Allow all operations on clientes" ON clientes FOR ALL USING (true);
            CREATE POLICY "Allow all operations on pedidos" ON pedidos FOR ALL USING (true);
            CREATE POLICY "Allow all operations on cupons" ON cupons FOR ALL USING (true);
            CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
            `);
        } else if (testError) {
            console.error('❌ Erro ao testar conexão:', testError);
        } else {
            console.log('✅ Conexão com banco de dados estabelecida');
            console.log('📊 Dados de teste:', testData);
        }
        
        // Testar inserção de um cliente de exemplo
        console.log('🧪 Testando inserção...');
        const { data: insertData, error: insertError } = await supabaseClient
            .from('clientes')
            .insert([{ nome: 'Teste', telefone: '11999999999' }])
            .select()
            .single();
        
        if (insertError) {
            if (insertError.code === '23505') {
                console.log('⚠️ Cliente de teste já existe (normal)');
            } else {
                console.error('❌ Erro ao inserir cliente de teste:', insertError);
            }
        } else {
            console.log('✅ Cliente de teste inserido:', insertData);
            
            // Remover cliente de teste
            await supabaseClient
                .from('clientes')
                .delete()
                .eq('id', insertData.id);
            console.log('🗑️ Cliente de teste removido');
        }
        
        console.log('✅ Configuração do banco concluída!');
        
    } catch (error) {
        console.error('❌ Erro na configuração:', error);
    }
}

// Executar automaticamente se estiver no console
if (typeof window !== 'undefined' && window.console) {
    console.log('🚀 Execute setupDatabase() para configurar o banco de dados');
}