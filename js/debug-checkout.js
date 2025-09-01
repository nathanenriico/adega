// Script de debug para verificar se os itens estão sendo salvos corretamente

// Função para testar salvamento de pedido com itens
function testOrderWithItems() {
    console.log('🧪 Testando salvamento de pedido com itens...');
    
    // Simular carrinho com itens
    const testCart = [
        {
            id: 1,
            name: 'Heineken Lata 350ml',
            price: 4.50,
            quantity: 2
        },
        {
            id: 2,
            name: 'Stella Artois',
            price: 5.90,
            quantity: 1
        }
    ];
    
    // Salvar no localStorage como se fosse o checkout
    localStorage.setItem('checkoutCart', JSON.stringify(testCart));
    
    console.log('✅ Carrinho de teste salvo:', testCart);
    
    // Simular dados do pedido
    const testOrderId = Date.now();
    const testOrder = {
        id: testOrderId,
        customer: 'Cliente Teste',
        phone: '5511999999999',
        date: new Date().toISOString(),
        status: 'novo',
        paymentMethod: 'PIX',
        total: 14.90,
        address: 'Rua Teste, 123 - Bairro Teste',
        items: testCart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        }))
    };
    
    // Salvar no localStorage
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    orders.push(testOrder);
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
    
    console.log('✅ Pedido de teste salvo:', testOrder);
    console.log('📋 Itens do pedido:', testOrder.items);
    
    return testOrderId;
}

// Função para verificar se os itens estão sendo recuperados
function checkOrderItems(orderId) {
    console.log('🔍 Verificando itens do pedido:', orderId);
    
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        console.log('✅ Pedido encontrado:', order);
        console.log('📋 Itens encontrados:', order.items);
        
        if (order.items && order.items.length > 0) {
            console.log('✅ Itens estão presentes!');
            order.items.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.name} - Qtd: ${item.quantity} - Preço: R$ ${item.price}`);
            });
        } else {
            console.log('❌ Nenhum item encontrado no pedido!');
        }
    } else {
        console.log('❌ Pedido não encontrado!');
    }
}

// Função para limpar dados de teste
function clearTestData() {
    console.log('🧹 Limpando dados de teste...');
    
    // Manter apenas pedidos que não são de teste
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const filteredOrders = orders.filter(order => !order.customer.includes('Teste'));
    
    localStorage.setItem('adegaOrders', JSON.stringify(filteredOrders));
    localStorage.removeItem('checkoutCart');
    
    console.log('✅ Dados de teste removidos');
}

// Função para executar teste completo
function runFullTest() {
    console.log('🚀 Iniciando teste completo...');
    
    // Limpar dados anteriores
    clearTestData();
    
    // Criar pedido de teste
    const testOrderId = testOrderWithItems();
    
    // Aguardar um pouco e verificar
    setTimeout(() => {
        checkOrderItems(testOrderId);
        
        // Simular carregamento como na gestão
        console.log('🔄 Simulando carregamento da gestão...');
        const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        const testOrder = orders.find(o => o.id === testOrderId);
        
        if (testOrder && testOrder.items && testOrder.items.length > 0) {
            console.log('✅ TESTE PASSOU: Itens estão sendo salvos e recuperados corretamente!');
        } else {
            console.log('❌ TESTE FALHOU: Itens não estão sendo salvos ou recuperados!');
        }
    }, 1000);
}

// Tornar funções disponíveis globalmente para teste manual
window.testOrderWithItems = testOrderWithItems;
window.checkOrderItems = checkOrderItems;
window.clearTestData = clearTestData;
window.runFullTest = runFullTest;

console.log('🧪 Debug do checkout carregado. Use runFullTest() para testar.');