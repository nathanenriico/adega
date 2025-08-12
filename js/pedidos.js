// Dados dos pedidos
let orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];

// Verificar status da conexão com o banco
async function checkDatabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro de conexão Supabase:', error);
            return false;
        }
        
        console.log('✅ Conexão com Supabase OK');
        return true;
    } catch (error) {
        console.error('❌ Erro ao testar conexão:', error);
        return false;
    }
}

// Carregar pedidos ao inicializar
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar conexão primeiro
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
        console.log('🔄 Carregando pedidos do banco de dados...');
        await loadOrdersFromDB();
        // setInterval(loadOrdersFromDB, 5000); // Removido para evitar loops
    } else {
        console.log('⚠️ Usando dados locais apenas');
        orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        loadOrders();
        updateStats();
    }
});

// Recarregar quando a página ganhar foco
window.addEventListener('focus', function() {
    loadOrdersFromDB();
});

async function loadOrdersFromDB() {
    try {
        const dbOrders = await db.getOrders();
        const localOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        // Usar apenas pedidos do Supabase, ignorar localStorage para evitar duplicatas
        orders = dbOrders.map(dbOrder => {
            console.log('Pedido do Supabase:', dbOrder.id, 'Data:', dbOrder.data_pedido);
            return {
                id: dbOrder.id,
                customer: dbOrder.cliente_nome || 'Cliente WhatsApp',
                total: dbOrder.valor_total,
                paymentMethod: dbOrder.forma_pagamento || 'Não informado',
                address: dbOrder.endereco || 'Endereço não informado',
                endereco: dbOrder.endereco || 'Endereço não informado',
                date: dbOrder.data_pedido || dbOrder.created_at,
                data_pedido: dbOrder.data_pedido || dbOrder.created_at,
                status: dbOrder.status,
                items: dbOrder.itens_json ? JSON.parse(dbOrder.itens_json) : [],
                pontos_ganhos: dbOrder.pontos_ganhos || 0
            };
        });
        loadOrders();
        updateStats();
    } catch (error) {
        console.error('Erro ao carregar pedidos do Supabase:', error);
        orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        loadOrders();
        updateStats();
    }
}

// Variáveis de filtro
let currentFilters = {
    search: '',
    date: '',
    status: ''
};

// Carregar e renderizar pedidos
function loadOrders() {
    console.log('Todos os pedidos:', orders);
    
    let activeOrders = orders.filter(order => order.status !== 'entregue');
    let deliveredOrders = orders.filter(order => order.status === 'entregue');
    
    // Aplicar filtros se existirem
    activeOrders = applyFiltersToOrders(activeOrders);
    
    console.log('Pedidos ativos:', activeOrders.length);
    console.log('Pedidos entregues:', deliveredOrders.length);
    
    renderActiveOrders(activeOrders);
    renderDeliveredOrders(deliveredOrders);
    updateActiveCounter(activeOrders.length);
}

// Aplicar filtros aos pedidos
function applyFiltersToOrders(ordersList) {
    let filtered = [...ordersList];
    
    console.log('Aplicando filtros a', filtered.length, 'pedidos');
    
    // Filtro por busca (cliente, produto, ID)
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(order => {
            const matchCustomer = order.customer && order.customer.toLowerCase().includes(searchTerm);
            const matchId = order.id.toString().includes(searchTerm);
            const matchItems = order.items && order.items.some(item => 
                item.name && item.name.toLowerCase().includes(searchTerm)
            );
            return matchCustomer || matchId || matchItems;
        });
        console.log('Após filtro busca:', filtered.length, 'pedidos');
    }
    
    // Filtro por data
    if (currentFilters.date) {
        const filterDate = currentFilters.date;
        filtered = filtered.filter(order => {
            if (!order.date) return false;
            try {
                // Converter timestamp para data se necessário
                let orderDate;
                if (typeof order.date === 'string' && order.date.includes('T')) {
                    orderDate = order.date.split('T')[0];
                } else {
                    orderDate = new Date(order.date).toISOString().split('T')[0];
                }
                console.log('Data do pedido:', order.date, '-> Convertida:', orderDate, 'Filtro:', filterDate);
                return orderDate === filterDate;
            } catch (error) {
                console.error('Erro ao converter data:', order.date, error);
                return false;
            }
        });
        console.log('Após filtro data:', filtered.length, 'pedidos');
    }
    
    // Filtro por status
    if (currentFilters.status) {
        filtered = filtered.filter(order => order.status === currentFilters.status);
        console.log('Após filtro status:', filtered.length, 'pedidos');
    }
    
    return filtered;
}

// Aplicar filtros
function applyFilters() {
    currentFilters.search = document.getElementById('search-input').value.trim();
    currentFilters.date = document.getElementById('date-filter').value;
    currentFilters.status = document.getElementById('status-filter').value;
    
    console.log('Filtros aplicados:', currentFilters);
    
    // Aplicar filtros aos dados já carregados
    loadOrders();
    updateStats();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('date-filter').value = '';
    document.getElementById('status-filter').value = '';
    
    currentFilters = { search: '', date: '', status: '' };
    loadOrders();
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
                    <strong>Cliente:</strong> Cliente WhatsApp
                </div>
                <div class="order-detail">
                    <strong>Data:</strong> ${formatDate(order.date || order.data_pedido)}
                </div>
                <div class="order-detail">
                    <strong>Total:</strong> R$ ${(order.valor_total || order.total || 0).toFixed(2)}
                </div>
                <div class="order-detail">
                    <strong>Pagamento:</strong> ${order.paymentMethod || order.forma_pagamento || 'Não informado'}
                </div>
                <div class="order-detail">
                    <strong>Pontos:</strong> ${order.pontos_ganhos || 0} pts
                </div>
            </div>
            
            <div class="order-address">
                <strong>Endereço:</strong> ${order.endereco || 'Não informado'}
            </div>
            
            <div class="order-actions">
                ${getActionButtons(order)}
            </div>
        </div>
    `).join('');
}

// Renderizar histórico de entregas
function renderDeliveredOrders(deliveredOrders) {
    const deliveredList = document.getElementById('delivered-list');
    
    if (deliveredOrders.length === 0) {
        deliveredList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Nenhuma entrega no histórico.</p>';
        return;
    }
    
    deliveredList.innerHTML = deliveredOrders.map(order => `
        <div class="order-item delivered-order" onclick="showOrderDetails(${order.id})">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-status delivered">✅ Entregue</span>
            </div>
            
            <div class="order-info">
                <div class="order-detail">
                    <strong>Cliente:</strong> ${order.customer}
                </div>
                <div class="order-detail">
                    <strong>Data Entrega:</strong> ${formatDate(order.deliveredAt || order.date)}
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
                <button class="action-btn btn-restore" onclick="restoreOrder(${order.id})">Restaurar</button>
            </div>
            
            ${order.notes ? `<div class="order-notes"><strong>Notas:</strong> ${order.notes}</div>` : ''}
        </div>
    `).join('');
}

// Navegação entre páginas
function showMainPage() {
    document.getElementById('main-page').classList.add('active');
    document.getElementById('delivered-page').classList.remove('active');
}

function showDeliveredPage() {
    document.getElementById('main-page').classList.remove('active');
    document.getElementById('delivered-page').classList.add('active');
    loadOrders(); // Recarregar para garantir dados atualizados
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
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'saindo';
        order.updatedAt = new Date().toISOString();
        saveOrders();
        loadOrders();
        updateStats();
        alert('Pedido restaurado para "Saindo para Entrega"');
    }
}

// Função para criar pedido de teste entregue
function createTestDeliveredOrder() {
    const testOrder = {
        id: Date.now(),
        customer: 'Cliente Teste',
        phone: '11999999999',
        date: new Date().toISOString(),
        status: 'entregue',
        total: 89.90,
        paymentMethod: 'PIX',
        address: 'Endereço Teste',
        items: [{
            name: 'Vinho Teste',
            quantity: 1,
            price: 89.90
        }],
        deliveredAt: new Date().toISOString(),
        notes: 'Pedido de teste'
    };
    
    orders.push(testOrder);
    saveOrders();
    loadOrders();
    updateStats();
    console.log('Pedido de teste criado:', testOrder);
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'novo': 'Novo',
        'aguardando_pagamento': 'Aguardando Pagamento PIX',
        'recebido': 'Pedido Recebido',
        'preparando': 'Preparando',
        'saindo': 'Saindo para Entrega',
        'entregue': 'Entregue'
    };
    return statusMap[status] || status;
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Obter botões de ação baseados no status
function getActionButtons(order) {
    let buttons = '';
    
    if (order.status === 'novo') {
        buttons += `<button class="action-btn btn-recebido" onclick="updateOrderStatus(${order.id}, 'recebido')">Pedido Recebido</button>`;
    } else if (order.status === 'recebido') {
        buttons += `<button class="action-btn btn-preparar" onclick="updateOrderStatus(${order.id}, 'preparando')">Preparar</button>`;
    } else if (order.status === 'preparando') {
        buttons += `<button class="action-btn btn-saindo" onclick="updateOrderStatus(${order.id}, 'saindo')">Saiu para Entrega</button>`;
    } else if (order.status === 'saindo') {
        buttons += `<button class="action-btn btn-entregar" onclick="updateOrderStatus(${order.id}, 'entregue')">Marcar como Entregue</button>`;
    }
    
    // Botão para confirmar pagamento PIX em todos os pedidos
    buttons += `<button class="action-btn btn-confirm-pix" onclick="confirmPixPaymentReceived(${order.id})">✅ Confirmar PIX Recebido</button>`;
    
    // Adicionar botão de cobrança de pagamento para todos os pedidos
    buttons += `<button class="action-btn btn-payment" onclick="requestPayment(${order.id})">Cobrar Pagamento</button>`;
    buttons += `<button class="action-btn btn-notes" onclick="editNotes(${order.id})">Notas</button>`;
    
    return buttons;
}

// Atualizar status do pedido
async function updateOrderStatus(orderId, newStatus) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const oldStatus = order.status;
        order.status = newStatus;
        
        // Atualizar no Supabase
        try {
            await db.updateOrderStatus(orderId, newStatus);
            console.log('✅ Status atualizado no Supabase:', orderId, newStatus);
        } catch (error) {
            console.error('Erro ao atualizar no Supabase:', error);
        }
        
        if (newStatus === 'entregue') {
            order.deliveredAt = new Date().toISOString();
        }
        
        saveOrders();
        loadOrders();
        updateStats();
        
        // Analytics em tempo real - mapear status para analytics
        const statusMapping = {
            'recebido': 'confirmado',  // Pedido recebido = Pedido confirmado no analytics
            'preparando': 'preparando',
            'saindo': 'em_entrega',
            'entregue': 'entregue'
        };
        
        const analyticsStatus = statusMapping[newStatus] || newStatus;
        const oldAnalyticsStatus = statusMapping[oldStatus] || oldStatus;
        
        const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
        analytics[analyticsStatus] = (analytics[analyticsStatus] || 0) + 1;
        if (oldStatus && oldAnalyticsStatus && analytics[oldAnalyticsStatus] && analytics[oldAnalyticsStatus] > 0) {
            analytics[oldAnalyticsStatus] = analytics[oldAnalyticsStatus] - 1;
        }
        analytics.lastUpdate = new Date().toISOString();
        localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
        
        const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
        events.push({
            state: analyticsStatus,
            timestamp: new Date().toISOString(),
            orderId: orderId,
            previousStatus: oldAnalyticsStatus,
            orderTotal: order.total,
            customerName: order.customer
        });
        if (events.length > 100) events.splice(0, events.length - 100);
        localStorage.setItem('cartEvents', JSON.stringify(events));
        
        // Disparar evento customizado para atualização imediata
        window.dispatchEvent(new CustomEvent('cartAnalyticsUpdate', {
            detail: {
                status: analyticsStatus,
                orderId: orderId,
                previousStatus: oldAnalyticsStatus
            }
        }));
        
        console.log(`📊 Status atualizado: ${oldStatus} → ${newStatus} (Analytics: ${oldAnalyticsStatus} → ${analyticsStatus})`);
        
        // Mostrar notificação de atualização
        showAnalyticsUpdateNotification(newStatus, orderId);
        
        // Enviar notificação WhatsApp automática
        if (oldStatus !== newStatus) {
            sendAutomaticWhatsAppNotification(order, newStatus);
        }
    }
}

// Enviar notificação WhatsApp automática
function sendAutomaticWhatsAppNotification(order, newStatus) {
    const statusMessages = {
        'recebido': `🍷 *Adega do Tio Pancho*\n\n✅ Pedido #${order.id} recebido com sucesso!\n\nEstamos preparando tudo para você.\n\nTotal: R$ ${order.total.toFixed(2)}\nPagamento: ${order.paymentMethod}\n\nEm breve enviaremos mais atualizações! 🍻`,
        'preparando': `🍷 *Adega do Tio Pancho*\n\n👨‍🍳 Seu pedido #${order.id} está sendo preparado!\n\nTempo estimado: 30-40 minutos\n\nTotal: R$ ${order.total.toFixed(2)}\n\nObrigado pela preferência! 🍻`,
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
        // Sempre usar WhatsApp Web no analytics
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
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
        'recebido': 'Pedido Recebido',
        'preparando': 'Preparando',
        'saindo': 'Saindo para Entrega', 
        'entregue': 'Entregue',
        'confirmado': 'Pedido Confirmado',
        'cobranca': 'Cobrança de Pagamento',
        'pix_confirmado': 'PIX Confirmado'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">📱</span>
            <div>
                <div style="font-weight: bold;">WhatsApp Enviado!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Pedido #${orderId} - ${statusText[status] || status}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Mostrar notificação de atualização do analytics
function showAnalyticsUpdateNotification(status, orderId) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        z-index: 9998;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-size: 0.9rem;
        animation: slideIn 0.3s ease;
    `;
    
    const analyticsText = {
        'recebido': '✅ Pedido Confirmado',
        'preparando': '👨‍🍳 Em Preparo',
        'saindo': '🛵 Em Entrega',
        'entregue': '🎉 Entregue'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1rem;">📊</span>
            <div>
                <div style="font-weight: 600;">Analytics Atualizado!</div>
                <div style="font-size: 0.8rem; opacity: 0.9;">#${orderId} → ${analyticsText[status]}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
        recebido: 0,
        preparando: 0,
        saindo: 0,
        entregue: 0
    };
    
    orders.forEach(order => {
        const status = order.status || 'novo';
        
        // Mapear status do banco para status da interface
        if (status === 'aguardando_pagamento') {
            stats.novo++;
        } else if (stats.hasOwnProperty(status)) {
            stats[status]++;
        } else {
            stats.novo++; // Status desconhecido vai para "novo"
        }
    });
    
    console.log('Estatísticas calculadas:', stats);
    
    Object.keys(stats).forEach(status => {
        const element = document.getElementById(`stat-${status}`);
        if (element) {
            element.textContent = stats[status];
        }
    });
}



// Confirmar recebimento de pagamento PIX
async function confirmPixPaymentReceived(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const confirmPayment = confirm(`Confirmar que o pagamento PIX do pedido #${orderId} foi recebido?\n\nValor: R$ ${order.total.toFixed(2)}\nCliente: ${order.customer}`);
    
    if (confirmPayment) {
        // Atualizar status do pedido
        order.status = 'novo';
        order.payment_status = 'confirmado';
        order.paymentStatus = 'confirmado';
        order.pixPaymentConfirmed = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        
        // Salvar no banco
        try {
            await db.updateOrderStatus(orderId, 'novo', 'confirmado');
        } catch (error) {
            console.error('Erro ao atualizar no banco:', error);
        }
        
        saveOrders();
        loadOrders();
        updateStats();
        
        // Enviar notificação automática de confirmação
        sendPixConfirmationNotification(order);
        
        alert(`Pagamento PIX confirmado!\nPedido #${orderId} liberado para preparo.`);
    }
}

// Enviar notificação de confirmação PIX
function sendPixConfirmationNotification(order) {
    const message = `🍷 *Adega do Tio Pancho*\n\n✅ Pagamento PIX confirmado!\n\nPedido #${order.id} recebido e liberado para preparo.\n\nValor: R$ ${order.total.toFixed(2)}\nStatus: Pedido confirmado\n\nEstamos preparando tudo para você!\n\nTempo estimado: 45-55 minutos\n\nObrigado pela preferência! 🍻`;
    
    // Mostrar notificação no painel admin
    showNotificationSent(order.id, 'pix_confirmado');
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const phone = order.phone || '5511941716617';
    const encodedMessage = encodeURIComponent(message);
    
    // Pequeno delay para não conflitar com a atualização da tela
    setTimeout(() => {
        // Sempre usar WhatsApp Web no analytics
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
    }, 1000);
    
    // Registrar notificação no pedido
    if (!order.whatsappNotifications) {
        order.whatsappNotifications = [];
    }
    
    order.whatsappNotifications.push({
        status: 'pix_confirmado',
        message: message,
        sentAt: new Date().toISOString()
    });
    
    saveOrders();
}

// Função para cobrar pagamento
function requestPayment(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Gerar mensagem personalizada com base na forma de pagamento
    const paymentMethod = order.paymentMethod || 'PIX';
    const customerName = order.customer || 'Cliente';
    
    // Dados PIX simples
    const pixKey = '11941716617';
    const pixAmount = order.total.toFixed(2);
    
    // Dados de pagamento com base no método
    let paymentData = '';
    
    if (paymentMethod.toLowerCase().includes('pix')) {
        paymentData = `PIX: ${pixKey} (Adega do Tio Pancho)\nBanco: NuBank\nValor: R$ ${pixAmount}\n\nFaça o PIX com a chave: ${pixKey}\n\nFavor enviar o comprovante por aqui após o pagamento.`;
    } else if (paymentMethod.toLowerCase().includes('transfer')) {
        paymentData = `Banco: NuBank\nAgência: 0001\nConta: 12345-6\nCPF: 123.456.789-00\nNome: Adega do Tio Pancho\n\nOu PIX: ${pixKey}\n\nFavor enviar o comprovante.`;
    } else {
        paymentData = `Pagamento na entrega via ${paymentMethod}.\n\nSe preferir pagar agora via PIX: ${pixKey}\n\nPor favor, confirme que está de acordo.`;
    }
    
    // Mensagem completa
    const message = `Olá, ${customerName}! 👋

Recebemos seu pedido #${orderId} com o total de R$${order.total.toFixed(2)}.  
Forma de pagamento escolhida: ${paymentMethod}

Para prosseguir, aqui estão os dados para pagamento:

${paymentData}

Assim que o pagamento for realizado, favor enviar o comprovante por aqui mesmo.  
Qualquer dúvida, estamos à disposição. 💬

Obrigado por comprar com a gente!`;
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const phone = order.phone || '5511941716617';
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp Web com a mensagem
    window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
    
    // Registrar que a cobrança foi enviada
    if (!order.paymentRequests) {
        order.paymentRequests = [];
    }
    
    order.paymentRequests.push({
        requestedAt: new Date().toISOString(),
        message: message,
        pixKey: pixKey,
        amount: pixAmount
    });
    
    saveOrders();
    showNotificationSent(order.id, 'cobranca');
}



// Salvar pedidos
function saveOrders() {
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
}

// Função para salvar todos os pedidos no banco de dados Supabase
async function saveAllOrdersToDatabase() {
    try {
        const localOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        if (localOrders.length === 0) {
            alert('Nenhum pedido encontrado no localStorage para salvar.');
            return;
        }
        
        console.log(`🔄 Iniciando salvamento de ${localOrders.length} pedidos no Supabase...`);
        
        let savedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const order of localOrders) {
            try {
                // Preparar dados do pedido para o Supabase (sem ID)
                const orderData = {
                    valor_total: parseFloat(order.total || order.valor_total || 0),
                    pontos_ganhos: order.pontos_ganhos || Math.floor((order.total || 0) / 10),
                    status: order.status || 'novo',
                    forma_pagamento: order.paymentMethod || order.forma_pagamento || 'Não informado',
                    endereco: order.address || order.endereco || 'Endereço não informado',
                    data_pedido: order.date || order.data_pedido || new Date().toISOString()
                };
                
                // Tentar inserir (deixar o banco gerar o ID)
                const { data: savedOrder, error } = await supabase
                    .from('pedidos')
                    .insert(orderData)
                    .select('id')
                    .single();
                
                if (error) {
                    // Se for erro de duplicata, pular
                    if (error.code === '23505') {
                        skippedCount++;
                        continue;
                    }
                    throw error;
                }
                
                savedCount++;
                console.log(`✅ Pedido local #${order.id} salvo no Supabase com ID #${savedOrder.id}`);
                
            } catch (error) {
                errorCount++;
                const errorMsg = error.message || 'Erro desconhecido';
                errors.push(`Pedido #${order.id}: ${errorMsg}`);
                console.error(`❌ Erro ao salvar pedido #${order.id}:`, errorMsg);
            }
        }
        
        // Mostrar resultado
        let message = `🎉 Sincronização concluída!\n\n`;
        message += `✅ Pedidos salvos: ${savedCount}\n`;
        message += `⏭️ Pedidos pulados: ${skippedCount}\n`;
        message += `❌ Erros: ${errorCount}`;
        
        if (errors.length > 0 && errors.length <= 3) {
            message += `\n\n⚠️ Erros:\n${errors.join('\n')}`;
        } else if (errors.length > 3) {
            message += `\n\n⚠️ Primeiros 3 erros:\n${errors.slice(0, 3).join('\n')}\n... e mais ${errors.length - 3}`;
        }
        
        alert(message);
        
        // Recarregar pedidos
        if (savedCount > 0) {
            await loadOrdersFromDB();
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// Função para limpar todos os pedidos
async function clearAllOrders() {
    if (!confirm('⚠️ ATENÇÃO: Isso irá deletar TODOS os pedidos!\n\nLocalStorage + Supabase\n\nTem certeza?')) {
        return;
    }
    
    if (!confirm('ÚLTIMA CONFIRMAÇÃO: Deletar todos os pedidos?')) {
        return;
    }
    
    try {
        // Limpar localStorage
        localStorage.removeItem('adegaOrders');
        console.log('✅ localStorage limpo');
        
        // Limpar Supabase
        const { error } = await supabase
            .from('pedidos')
            .delete()
            .neq('id', 0);
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase limpo');
        
        // Recarregar interface
        orders = [];
        loadOrders();
        updateStats();
        
        alert('🗑️ Todos os pedidos foram deletados!\n\nPronto para novos testes.');
        
    } catch (error) {
        console.error('❌ Erro ao limpar:', error);
        alert('❌ Erro: ' + error.message);
    }
}

// Função de sincronização simples
function syncOrdersSimple() {
    console.log('🚀 Sincronização rápida iniciada...');
    loadOrdersFromDB();
    alert('Sincronização concluída!');
}

// Função de teste para demonstrar sincronização em tempo real
function createTestOrder() {
    const testOrder = {
        id: Date.now(),
        customer: 'Cliente Teste ' + Math.floor(Math.random() * 100),
        phone: '11999999999',
        date: new Date().toISOString(),
        status: 'novo',
        total: Math.floor(Math.random() * 200) + 50,
        paymentMethod: ['PIX', 'Cartão', 'Dinheiro'][Math.floor(Math.random() * 3)],
        address: 'Endereço Teste',
        items: [{
            name: 'Vinho Teste',
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 100) + 30
        }],
        notes: 'Pedido de teste para demonstração'
    };
    
    orders.push(testOrder);
    saveOrders();
    loadOrders();
    updateStats();
    
    console.log('🍷 Pedido de teste criado:', testOrder);
    alert(`Pedido de teste #${testOrder.id} criado! Agora clique em "Pedido Recebido" para ver a atualização no Analytics.`);
}

