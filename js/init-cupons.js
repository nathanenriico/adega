// Inicialização da tabela de cupons
async function initCuponsTable() {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase não disponível');
        return;
    }

    try {
        // Verificar se a tabela existe fazendo uma consulta simples
        const { data, error } = await client
            .from('cupons')
            .select('id')
            .limit(1);

        if (error && error.code === '42P01') {
            console.log('Tabela cupons não existe, criando...');
            
            // A tabela será criada via SQL no Supabase Dashboard
            console.log('Execute o arquivo sql/create_cupons_table.sql no Supabase Dashboard');
        } else {
            console.log('✅ Tabela cupons já existe');
        }
    } catch (error) {
        console.error('Erro ao verificar tabela cupons:', error);
    }
}

// Executar na inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initCuponsTable, 1000);
});

window.initCuponsTable = initCuponsTable;