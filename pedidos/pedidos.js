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
    const activeOrders = orders.filter(order => order.status !== 'entregue');
    const deliveredOrders = orders.filter(order => order.status === 'entregue');
    
    renderActiveOrders(activeOrders);
    renderDeliveredOrders(deliveredOrders);
    updateActiveCounter(activeOrders.length);
}

// Renderizar pedidos ativos
function renderActiveOrders(activeOrders) {
    const ordersList = document.getElementById('orders-list');
    
    if (activeOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 40px;">Nenhum pedido ativo.</p>';
        return;
    }
    
    ordersList.innerHTML = activeOrders.map(order => `
        <div class="order-item active-order" onclick="showOrderDetails(${order.id})">
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

// Renderizar histórico de entregas
function renderDeliveredOrders(deliveredOrders) {
    const historyList = document.getElementById('history-list');
    
    if (deliveredOrders.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Nenhuma entrega no histórico.</p>';
        return;
    }
    
    historyList.innerHTML = deliveredOrders.map(order => `
        <div class="order-item delivered-order">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-status delivered">✅ Entregue</span>
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
            </div>
            
            <div class="order-items">
                <strong>Produtos:</strong> ${order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
            </div>
            
            <div class="order-actions">
                <button class="action-btn btn-restore" onclick="restoreOrder(${order.id})">Restaurar</button>
            </div>
        </div>
    `).join('');
}

// Atualizar contador de pedidos ativos
function updateActiveCounter(count) {
    const counter = document.getElementById('active-counter');
    if (counter) {
        counter.textContent = count;
    }
}

// Restaurar pedido do histórico
function restoreOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'saindo';
        order.updatedAt = new Date().toISOString();
        saveOrders();
        loadOrders();
        updateStats();
    }
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
        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        
        if (newStatus === 'entregue') {
            order.deliveredAt = new Date().toISOString();
        }
        
        saveOrders();
        loadOrders();
        updateStats();
        
        // Enviar notificação WhatsApp automática
        if (oldStatus !== newStatus) {
            sendAutomaticWhatsAppNotification(order, newStatus);
        }
    }
}

// Enviar notificação WhatsApp automática
function sendAutomaticWhatsAppNotification(order, newStatus) {
    const statusMessages = {
        'preparando': `🍷 *Adega do Tio Pancho*\n\n✅ Olá! Seu pedido #${order.id} está sendo preparado!\n\nTempo estimado: 30-40 minutos\n\nTotal: R$ ${order.total.toFixed(2)}\n\nObrigado pela preferência! 🍻`,
        'saindo': `🍷 *Adega do Tio Pancho*\n\n🚚 Seu pedido #${order.id} está a caminho!\n\nO entregador já saiu e chegará em breve.\n\nPrepare o pagamento: ${order.paymentMethod}\n\nAté já! 🚀`,
        'entregue': `🍷 *Adega do Tio Pancho*\n\n🎉 Pedido #${order.id} entregue com sucesso!\n\nObrigado pela preferência!\n\n⭐ Que tal avaliar nosso atendimento?\n\nVolte sempre! 🍻`
    };
    
    const message = statusMessages[newStatus];
    if (!message) return;
    
    // Mostrar notificação no painel admin
    showNotificationSent(order.id, newStatus);
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const phone = '5511941716617';
    const encodedMessage = encodeURIComponent(message);
    
    // Pequeno delay para não conflitar com a atualização da tela
    setTimeout(() => {
        if (isMobile) {
            // Mobile: Abrir app WhatsApp
            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        } else {
            // Desktop: Abrir WhatsApp Web
            window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
        }
    }, 1000);
    
    // Registrar notificação no pedido
    if (!order.whatsappNotifications) {
        order.whatsappNotifications = [];
    }
    
    order.whatsappNotifications.push({
        status: newStatus,
        message: message,
        sentAt: new Date().toISOString()
    });
    
    saveOrders();
}

// Mostrar notificação de envio
function showNotificationSent(orderId, status) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    const statusText = {
        'preparando': 'Preparando',
        'saindo': 'Saindo para Entrega', 
        'entregue': 'Entregue'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">📱</span>
            <div>
                <div style="font-weight: bold;">WhatsApp Enviado!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Pedido #${orderId} - ${statusText[status]}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
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