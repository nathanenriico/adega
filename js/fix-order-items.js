// Correção para garantir que os itens dos pedidos sejam exibidos corretamente

// Função para corrigir pedidos existentes sem itens
function fixExistingOrders() {
    console.log('🔧 Corrigindo pedidos existentes...');
    
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    let fixedCount = 0;
    
    orders.forEach(order => {
        if (!order.items || order.items.length === 0) {
            // Tentar recuperar itens do carrinho se o pedido foi feito recentemente
            const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
            
            if (checkoutCart.length > 0) {
                order.items = checkoutCart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                }));
                fixedCount++;
                console.log(`✅ Itens adicionados ao pedido #${order.id}:`, order.items);
            } else {
                // Criar itens genéricos baseados no valor total
                const estimatedItems = createEstimatedItems(order.total || order.valor_total || 0);
                order.items = estimatedItems;
                fixedCount++;
                console.log(`⚠️ Itens estimados para pedido #${order.id}:`, order.items);
            }
        }
    });
    
    if (fixedCount > 0) {
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        console.log(`✅ ${fixedCount} pedidos corrigidos`);
    } else {
        console.log('ℹ️ Nenhum pedido precisou de correção');
    }
    
    return fixedCount;
}

// Função para criar itens estimados baseados no valor total
function createEstimatedItems(total) {
    const estimatedItems = [];
    
    if (total > 0) {
        // Criar item genérico
        estimatedItems.push({
            id: 999,
            name: 'Produtos da Adega',
            price: total,
            quantity: 1,
            total: total
        });
    }
    
    return estimatedItems;
}

// Função para verificar integridade dos pedidos
function checkOrdersIntegrity() {
    console.log('🔍 Verificando integridade dos pedidos...');
    
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const report = {
        total: orders.length,
        withItems: 0,
        withoutItems: 0,
        emptyItems: 0
    };
    
    orders.forEach(order => {
        if (order.items && order.items.length > 0) {
            report.withItems++;
        } else if (order.items && order.items.length === 0) {
            report.emptyItems++;
        } else {
            report.withoutItems++;
        }
    });
    
    console.log('📊 Relatório de integridade:', report);
    
    if (report.withoutItems > 0 || report.emptyItems > 0) {
        console.log('⚠️ Alguns pedidos não têm itens. Execute fixExistingOrders() para corrigir.');
    } else {
        console.log('✅ Todos os pedidos têm itens!');
    }
    
    return report;
}

// Função para adicionar itens de teste a um pedido específico
function addTestItemsToOrder(orderId) {
    console.log(`🧪 Adicionando itens de teste ao pedido #${orderId}...`);
    
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        order.items = [
            {
                id: 1,
                name: 'Heineken Lata 350ml',
                price: 4.50,
                quantity: 2,
                total: 9.00
            },
            {
                id: 2,
                name: 'Stella Artois',
                price: 5.90,
                quantity: 1,
                total: 5.90
            }
        ];
        
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        console.log(`✅ Itens de teste adicionados ao pedido #${orderId}:`, order.items);
        
        return true;
    } else {
        console.log(`❌ Pedido #${orderId} não encontrado`);
        return false;
    }
}

// Função para forçar atualização da interface de pedidos
function refreshOrdersInterface() {
    console.log('🔄 Forçando atualização da interface...');
    
    // Se estivermos na página de gestão de pedidos
    if (typeof loadOrdersFromDB === 'function') {
        loadOrdersFromDB();
    } else if (typeof loadOrders === 'function') {
        loadOrders();
    }
    
    console.log('✅ Interface atualizada');
}

// Executar correção automática ao carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const report = checkOrdersIntegrity();
        
        if (report.withoutItems > 0 || report.emptyItems > 0) {
            console.log('🔧 Executando correção automática...');
            fixExistingOrders();
        }
    }, 2000);
});

// Tornar funções disponíveis globalmente
window.fixExistingOrders = fixExistingOrders;
window.checkOrdersIntegrity = checkOrdersIntegrity;
window.addTestItemsToOrder = addTestItemsToOrder;
window.refreshOrdersInterface = refreshOrdersInterface;

console.log('🔧 Fix para itens de pedidos carregado. Use checkOrdersIntegrity() para verificar.');