// Função simplificada para sincronização sem erros
async function syncOrdersSimple() {
    try {
        const localOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        if (localOrders.length === 0) {
            alert('Nenhum pedido para sincronizar.');
            return;
        }
        
        console.log(`🔄 Sincronizando ${localOrders.length} pedidos...`);
        
        let savedCount = 0;
        let errorCount = 0;
        
        // Processar pedidos em lotes pequenos para evitar sobrecarga
        for (let i = 0; i < localOrders.length; i += 5) {
            const batch = localOrders.slice(i, i + 5);
            
            for (const order of batch) {
                try {
                    const orderData = {
                        valor_total: parseFloat(order.total || 0),
                        pontos_ganhos: Math.floor((order.total || 0) / 10),
                        status: order.status || 'novo',
                        forma_pagamento: order.paymentMethod || 'Não informado',
                        endereco: order.address || 'Endereço não informado',
                        data_pedido: order.date || new Date().toISOString()
                    };
                    
                    const { error } = await supabase
                        .from('pedidos')
                        .insert(orderData);
                    
                    if (error) {
                        if (error.code !== '23505') { // Ignorar duplicatas
                            throw error;
                        }
                    } else {
                        savedCount++;
                        console.log(`✅ Pedido #${order.id} sincronizado`);
                    }
                    
                } catch (error) {
                    errorCount++;
                    console.error(`❌ Erro pedido #${order.id}:`, error.message);
                }
            }
            
            // Pequena pausa entre lotes
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        alert(`🎉 Sincronização concluída!\n✅ Salvos: ${savedCount}\n❌ Erros: ${errorCount}`);
        
        if (savedCount > 0) {
            await loadOrdersFromDB();
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// Adicionar ao escopo global
window.syncOrdersSimple = syncOrdersSimple;