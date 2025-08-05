// Configuração do Supabase
const SUPABASE_URL = 'https://vtrgtorablofhmhizrjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4';

// Inicializar cliente Supabase - usar instância única
let supabase;

// Função para obter cliente Supabase
function getSupabaseClient() {
    // Usar função global se disponível
    if (window.getSupabaseClient && window.getSupabaseClient !== getSupabaseClient) {
        return window.getSupabaseClient();
    }
    
    if (!supabase && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase criado');
    }
    return supabase;
}

// Tornar função global
window.getSupabaseClient = getSupabaseClient;

// Aguardar o Supabase estar disponível
if (typeof window !== 'undefined' && window.supabase) {
    supabase = getSupabaseClient();
} else {
    // Aguardar carregamento
    document.addEventListener('DOMContentLoaded', function() {
        if (window.supabase) {
            supabase = getSupabaseClient();
        }
    });
}

// Função para testar conexão
function testSupabaseConnection() {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase ainda não inicializado');
        return;
    }
    
    // Testar conexão
    client.from('clientes').select('count').then(result => {
        if (result.error) {
            console.error('❌ Erro de conexão Supabase (tabela clientes):', result.error);
        } else {
            console.log('✅ Supabase conectado - tabela clientes acessível');
        }
    });
    
    // Testar estrutura da tabela clientes
    client.from('clientes').select('*').limit(1).then(result => {
        if (result.error) {
            console.error('❌ Erro ao acessar estrutura da tabela clientes:', result.error);
        } else {
            console.log('✅ Estrutura da tabela clientes:', result.data);
        }
    });
}

// Testar conexão após inicialização
setTimeout(testSupabaseConnection, 1000);

// Funções do banco de dados
const db = {
    // Salvar pedido
    async saveOrder(orderData) {
        console.log('Salvando pedido no Supabase:', orderData);
        
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { data: order, error: orderError } = await client
            .from('pedidos')
            .insert(orderData)
            .select()
            .single();
        
        if (orderError) {
            console.error('Erro detalhado:', orderError);
            throw new Error(`Erro ao salvar: ${orderError.message}`);
        }
        
        console.log('Pedido salvo:', order);
        return order;
    },
    
    // Buscar pedidos
    async getOrders() {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { data, error } = await client
            .from('pedidos')
            .select('*')
            .order('data_pedido', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    // Atualizar status do pedido
    async updateOrderStatus(orderId, status) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { error } = await client
            .from('pedidos')
            .update({ status })
            .eq('id', orderId);
        
        if (error) throw error;
    },
    
    // Buscar produtos
    async getProducts() {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { data, error } = await client
            .from('products')
            .select('*')
            .eq('active', true);
        
        if (error) throw error;
        return data;
    },
    
    // Salvar produto
    async saveProduct(productData) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { data, error } = await client
            .from('products')
            .insert([productData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // Atualizar produto
    async updateProduct(id, productData) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { data, error } = await client
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // Deletar produto (delete permanente)
    async deleteProduct(id) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        const { error } = await client
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};