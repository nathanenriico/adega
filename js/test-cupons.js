// Teste e criação da tabela de cupons
async function testCuponsTable() {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase não disponível');
        return;
    }

    try {
        // Testar se a tabela existe
        const { data, error } = await client
            .from('cupons')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Erro ao acessar tabela cupons:', error);
            alert('Tabela cupons não existe. Execute o SQL no Supabase Dashboard:\n\nCREATE TABLE cupons (\n  id SERIAL PRIMARY KEY,\n  cliente_id INTEGER,\n  titulo VARCHAR(100) NOT NULL,\n  descricao TEXT,\n  desconto VARCHAR(50) NOT NULL,\n  usado BOOLEAN DEFAULT FALSE,\n  data_criacao TIMESTAMP DEFAULT NOW(),\n  data_uso TIMESTAMP NULL\n);\n\nALTER TABLE cupons DISABLE ROW LEVEL SECURITY;');
        } else {
            console.log('✅ Tabela cupons existe');
            alert('Tabela cupons está funcionando!');
        }
    } catch (error) {
        console.error('Erro no teste:', error);
        alert('Erro ao testar tabela: ' + error.message);
    }
}

// Teste de inserção de cupom
async function testInsertCupom() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Usuário não logado');
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert('Supabase não disponível');
        return;
    }

    try {
        const { data, error } = await client
            .from('cupons')
            .insert({
                cliente_id: parseInt(userId),
                titulo: 'Teste 5% OFF',
                descricao: 'Cupom de teste',
                desconto: '5%',
                usado: false
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir cupom:', error);
            alert('Erro ao criar cupom: ' + error.message);
        } else {
            console.log('✅ Cupom criado:', data);
            alert('Cupom de teste criado com sucesso!');
        }
    } catch (error) {
        console.error('Erro no teste de inserção:', error);
        alert('Erro: ' + error.message);
    }
}

window.testCuponsTable = testCuponsTable;
window.testInsertCupom = testInsertCupom;