// Configuração do Supabase
const SUPABASE_URL = 'https://vtrgtorablofhmhizrjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4';

// Inicializar cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções do banco de dados
const db = {
    // Salvar pedido
    async saveOrder(orderData) {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // Salvar itens do pedido
        const items = orderData.items.map(item => ({
            order_id: order.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(items);
        
        if (itemsError) throw itemsError;
        return order;
    },
    
    // Buscar pedidos
    async getOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .order('date', { ascending: false });
        
        if (error) throw error;
        
        // Converter para formato do sistema atual
        return data.map(order => ({
            ...order,
            items: order.order_items
        }));
    },
    
    // Atualizar status do pedido
    async updateOrderStatus(orderId, status, paymentStatus = null) {
        const updateData = { 
            status,
            updated_at: new Date().toISOString()
        };
        
        if (paymentStatus) {
            updateData.payment_status = paymentStatus;
        }
        
        const { error } = await supabase
            .from('orders')
            .update(updateData)
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
    }
};