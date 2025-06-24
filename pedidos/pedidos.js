// Dados dos pedidos
let orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];

// Carregar pedidos ao inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Recarregar dados do localStorage sempre que a página for aberta
    orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];
    loadOrders();
    updateStats();
    
    // Atualizar a cada 5 segundos para pegar novos pedidos
    setInterval(() => {
        const newOrders = JSON.parse(localStorage.getItem('adegaOrders')) || [];
        if (newOrders.length !== orders.length) {
            orders = newOrders;
            loadOrders();
            updateStats();
        }
    }, 5000);
});

// Carregar e renderizar pedidos
function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 40px;">Nenhum pedido encontrado.</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="showOrderDetails(${order.id})">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            
            <div class="order-info">
                <div class="order-detail">
                    <strong>Cliente:</strong> ${order.customer}
                </div>
                <div class="order-detail">
                    <strong>Data:</strong> ${formatDate(order.date)}
                </div>
                <div class="order-detail">
                    <strong>Total:</strong> R$ ${order.total.toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Pagamento:</strong> ${order.paymentMethod || 'Não informado'}
                </div>
                <div class="order-detail">
                    <strong>Itens:</strong> ${order.items.length} produto(s)
                </div>
            </div>
            
            <div class="order-items">
                <strong>Produtos:</strong> ${order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
            </div>
            
            <div class="order-actions">
                ${getActionButtons(order)}
            </div>
            
            ${order.notes ? `<div class="order-notes"><strong>Notas:</strong> ${order.notes}</div>` : ''}
        </div>
    `).join('');
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'novo': 'Novo',
        'preparando': 'Preparando',
        'saindo': 'Saindo para Entrega',
        'entregue': 'Entregue'
    };
    return statusMap[status] || status;
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Obter botões de ação baseados no status
function getActionButtons(order) {
    let buttons = '';
    
    if (order.status === 'novo') {
        buttons += `<button class="action-btn btn-preparar" onclick="updateOrderStatus(${order.id}, 'preparando')">Preparar</button>`;
    } else if (order.status === 'preparando') {
        buttons += `<button class="action-btn btn-saindo" onclick="updateOrderStatus(${order.id}, 'saindo')">Saiu para Entrega</button>`;
    } else if (order.status === 'saindo') {
        buttons += `<button class="action-btn btn-entregar" onclick="updateOrderStatus(${order.id}, 'entregue')">Marcar como Entregue</button>`;
    }
    
    buttons += `<button class="action-btn btn-notes" onclick="editNotes(${order.id})">Notas</button>`;
    
    return buttons;
}

// Atualizar status do pedido
function updateOrderStatus(orderId, newStatus) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        saveOrders();
        loadOrders();
        updateStats();
    }
}

// Editar notas do pedido
function editNotes(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const notes = prompt('Notas internas sobre o pedido:', order.notes || '');
        if (notes !== null) {
            order.notes = notes;
            saveOrders();
            loadOrders();
        }
    }
}

// Mostrar detalhes do pedido
function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('order-modal');
    const details = document.getElementById('order-details');
    
    details.innerHTML = `
        <h3>Pedido #${order.id}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
            <div><strong>Cliente:</strong> ${order.customer}</div>
            <div><strong>Status:</strong> <span class="order-status status-${order.status}">${getStatusText(order.status)}</span></div>
            <div><strong>Data:</strong> ${formatDate(order.date)}</div>
            <div><strong>Total:</strong> R$ ${order.total.toFixed(2)}</div>
            <div><strong>Pagamento:</strong> ${order.paymentMethod || 'Não informado'}</div>
        </div>
        
        <h4>Itens do Pedido:</h4>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>${item.name} x${item.quantity}</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        
        ${order.notes ? `
            <h4>Notas Internas:</h4>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
                ${order.notes}
            </div>
        ` : ''}
        
        <div style="margin-top: 20px;">
            ${getActionButtons(order)}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Fechar modal
function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Filtrar pedidos
function filterOrders() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredOrders = orders;
    
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.customer.toLowerCase().includes(searchTerm) ||
            order.id.toString().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }
    
    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => 
            order.date.startsWith(dateFilter)
        );
    }
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => 
            order.status === statusFilter
        );
    }
    
    renderFilteredOrders(filteredOrders);
}

// Renderizar pedidos filtrados
function renderFilteredOrders(filteredOrders) {
    const ordersList = document.getElementById('orders-list');
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 40px;">Nenhum pedido encontrado com os filtros aplicados.</p>';
        return;
    }
    
    // Usar a mesma lógica de renderização
    orders = filteredOrders;
    loadOrders();
    orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];
}

// Atualizar estatísticas
function updateStats() {
    const stats = {
        novo: 0,
        preparando: 0,
        saindo: 0,
        entregue: 0
    };
    
    orders.forEach(order => {
        if (stats.hasOwnProperty(order.status)) {
            stats[order.status]++;
        }
    });
    
    Object.keys(stats).forEach(status => {
        const element = document.getElementById(`stat-${status}`);
        if (element) {
            element.textContent = stats[status];
        }
    });
}

// Salvar pedidos
function saveOrders() {
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
}

// Adicionar pedido de exemplo (para teste)
function addSampleOrder() {
    const sampleOrder = {
        id: Date.now(),
        customer: 'João Silva',
        date: new Date().toISOString(),
        status: 'novo',
        total: 89.90,
        items: [
            { name: 'Vinho Tinto Premium', quantity: 1, price: 89.90 }
        ],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    orders.push(sampleOrder);
    saveOrders();
    loadOrders();
    updateStats();
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) {
        closeOrderModal();
    }
}