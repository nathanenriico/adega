// Configuração do Supabase
const SUPABASE_URL = 'https://vtrgtorablofhmhizrjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Testar conexão
supabase.from('pedidos').select('count').then(result => {
    if (result.error) {
        console.error('❌ Erro de conexão Supabase:', result.error);
    } else {
        console.log('✅ Supabase conectado com sucesso');
    }
});

// Funções do banco de dados
const db = {
    // Salvar pedido
    async saveOrder(orderData) {
        console.log('Salvando pedido no Supabase:', orderData);
        
        const { data: order, error: orderError } = await supabase
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
        const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('data_pedido', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    // Atualizar status do pedido
    async updateOrderStatus(orderId, status) {
        const { error } = await supabase
            .from('pedidos')
            .update({ status })
            .eq('id', orderId);
        
        if (error) throw error;
    },
    
    // Buscar produtos
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true);
        
        if (error) throw error;
        return data;
    },
    
    // Salvar produto
    async saveProduct(productData) {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // Atualizar produto
    async updateProduct(id, productData) {
        const { data, error } = await supabase
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
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};