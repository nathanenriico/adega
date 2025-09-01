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
        // Sincronizar todos os pedidos existentes
        await syncAllOrdersStatus();
    } else {
        console.log('⚠️ Usando dados locais apenas');
        orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        loadOrders();
        updateStats();
    }
});

async function loadOrdersFromDB() {
    try {
        const { data: dbOrders, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        const localOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        // Combinar dados do Supabase com localStorage
        const savedOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        orders = dbOrders.map(dbOrder => {
            console.log('Pedido do Supabase:', dbOrder.id, 'Data:', dbOrder.data_pedido);
            const localOrder = savedOrders.find(lo => lo.id === dbOrder.id);
            
            // Tentar recuperar itens do banco ou do localStorage
            let items = [];
            if (dbOrder.itens_json) {
                try {
                    items = JSON.parse(dbOrder.itens_json);
                    console.log('Itens recuperados do Supabase para pedido', dbOrder.id, ':', items);
                } catch (error) {
                    console.error('Erro ao parsear itens do Supabase:', error);
                }
            }
            
            // Se não há itens no banco, tentar do localStorage
            if (items.length === 0 && localOrder && localOrder.items) {
                items = localOrder.items;
                console.log('Itens recuperados do localStorage para pedido', dbOrder.id, ':', items);
            }
            
            return {
                id: dbOrder.id,
                customer: dbOrder.cliente_nome || 'Cliente WhatsApp',
                total: dbOrder.valor_total,
                valor_total: dbOrder.valor_total,
                paymentMethod: dbOrder.forma_pagamento || 'Não informado',
                forma_pagamento: dbOrder.forma_pagamento || 'Não informado',
                address: dbOrder.endereco || 'Endereço não informado',
                endereco: dbOrder.endereco || 'Endereço não informado',
                date: dbOrder.data_pedido || dbOrder.created_at,
                data_pedido: dbOrder.data_pedido || dbOrder.created_at,
                status: localOrder ? localOrder.status : dbOrder.status,
                items: items,
                pontos_ganhos: dbOrder.pontos_ganhos || 0
            };
        });
        
        // Adicionar pedidos que existem apenas no localStorage
        savedOrders.forEach(localOrder => {
            if (!orders.find(o => o.id === localOrder.id)) {
                orders.push(localOrder);
            }
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
            </div>
            
            ${order.items && order.items.length > 0 ? `
                <div class="order-items">
                    <strong>Itens do Pedido:</strong>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="item-row">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">x${item.quantity}</span>
                                <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="order-items">
                    <strong>Itens do Pedido:</strong>
                    <div class="items-list">
                        <div class="no-items">Nenhum item encontrado</div>
                    </div>
                </div>
            `}
            
            <div class="order-address">
                <strong>Endereço:</strong> ${order.endereco || order.address || 'Não informado'}
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
                <strong>Produtos:</strong> ${order.items && order.items.length > 0 ? order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ') : 'Nenhum item encontrado'}
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
    
    if (order.status === 'novo' || order.status === 'aguardando_pagamento') {
        buttons += `<button class="action-btn btn-recebido" onclick="updateOrderStatus(${order.id}, 'recebido')">Pedido Recebido</button>`;
        buttons += `<button class="action-btn btn-confirm-pix" onclick="confirmPixPaymentReceived(${order.id})">✅ Confirmar PIX Recebido</button>`;
    } else if (order.status === 'recebido') {
        buttons += `<button class="action-btn btn-preparar" onclick="prepareOrder(${order.id})">Iniciar Atendimento</button>`;
    } else if (order.status === 'preparando') {
        buttons += `<button class="action-btn btn-saindo" onclick="updateOrderStatus(${order.id}, 'saindo')">Saiu para Entrega</button>`;
    } else if (order.status === 'saindo') {
        buttons += `<button class="action-btn btn-entregar" onclick="updateOrderStatus(${order.id}, 'entregue')">Marcar como Entregue</button>`;
    }
    
    // Adicionar botão de cobrança de pagamento para todos os pedidos
    buttons += `<button class="action-btn btn-payment" onclick="requestPayment(${order.id})">Cobrar Pagamento</button>`;
    buttons += `<button class="action-btn btn-notes" onclick="editNotes(${order.id})">Notas</button>`;
    
    return buttons;
}

// Função específica para iniciar atendimento
function prepareOrder(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Atualizar status diretamente
    updateOrderStatus(orderId, 'preparando');
}

// Salvar pedidos
function saveOrders() {
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
}

// Atualizar status do pedido
async function updateOrderStatus(orderId, newStatus) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const oldStatus = order.status;
        order.status = newStatus;
        
        if (newStatus === 'entregue') {
            order.deliveredAt = new Date().toISOString();
            
            // Registrar pedido na tabela pedidos
            const pontosGanhos = order.pontos_ganhos || Math.floor((order.valor_total || order.total || 0) / 10);
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            try {
                // Inserir pedido na tabela
                await supabase.from('pedidos').insert({
                    id: orderId,
                    cliente_id: 1,
                    valor_total: parseFloat(order.valor_total || order.total || 0),
                    pontos_ganhos: pontosGanhos,
                    status: 'entregue',
                    forma_pagamento: order.paymentMethod || order.forma_pagamento || 'Não informado',
                    endereco: order.endereco || order.address || 'Não informado',
                    data_pedido: order.date || order.data_pedido || new Date().toISOString(),
                    cliente_nome: userData.nome || 'Cliente WhatsApp',
                    cliente_telefone: userData.whatsapp || '551193394-9002',
                    itens_json: JSON.stringify(order.items || [])
                });
                
                // Registrar pontos no histórico
                await supabase.from('pontos_historico').insert({
                    cliente_id: 1,
                    pontos: pontosGanhos,
                    tipo: 'ganho',
                    descricao: `Pontos ganhos na compra #${orderId}`,
                    pedido_id: orderId,
                    cliente_nome: userData.nome || 'Cliente WhatsApp',
                    cliente_telefone: userData.whatsapp || '551193394-9002',
                    cliente_endereco: order.endereco || order.address || 'Não informado'
                });
                
                console.log(`✅ Pedido #${orderId} registrado na tabela pedidos`);
                console.log(`✅ ${pontosGanhos} pontos registrados no histórico`);
            } catch (error) {
                console.error('Erro ao registrar pedido/pontos:', error);
            }
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
        'recebido': `🍷 *Adega do Tio Pancho*\n\n✅ Pedido #${order.id} recebido com sucesso!\n\nEstamos preparando tudo para você.\n\nTotal: R$ ${order.total.toFixed(2)}\nPagamento: ${order.paymentMethod}\n\nEm breve enviaremos mais atualizações! 🍻`,
        'preparando': `🍷 *Adega do Tio Pancho*\n\n👨🍳 Seu pedido #${order.id} está sendo preparado!\n\nTempo estimado: 30-40 minutos\n\nTotal: R$ ${order.total.toFixed(2)}\n\nObrigado pela preferência! 🍻`,
        'saindo': `🍷 *Adega do Tio Pancho*\n\n🚚 Seu pedido #${order.id} está a caminho!\n\nO entregador já saiu e chegará em breve.\n\nPrepare o pagamento: ${order.paymentMethod}\n\nAté já! 🚀`,
        'entregue': `🍷 *Adega do Tio Pancho*\n\n🎉 Pedido #${order.id} entregue com sucesso!\n\nObrigado pela preferência!\n\n⭐ Que tal avaliar nosso atendimento?\n\nVolte sempre! 🍻`
    };
    
    const message = statusMessages[newStatus];
    if (!message) return;
    
    const phone = '551193394-9002';
    const encodedMessage = encodeURIComponent(message);
    
    setTimeout(() => {
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
    }, 1000);
}

// Função para cobrar pagamento
function requestPayment(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const paymentMethod = order.paymentMethod || 'PIX';
    const customerName = order.customer || 'Cliente';
    const pixKey = '11933949002';
    const pixAmount = order.total.toFixed(2);
    
    let paymentData = '';
    
    if (paymentMethod.toLowerCase().includes('pix')) {
        paymentData = `PIX: ${pixKey} (Adega do Tio Pancho)\nBanco: NuBank\nValor: R$ ${pixAmount}\n\nFaça o PIX com a chave: ${pixKey}\n\nFavor enviar o comprovante por aqui após o pagamento.`;
    } else {
        paymentData = `Pagamento na entrega via ${paymentMethod}.\n\nSe preferir pagar agora via PIX: ${pixKey}\n\nPor favor, confirme que está de acordo.`;
    }
    
    const message = `Olá, ${customerName}! 👋

Recebemos seu pedido #${orderId} com o total de R$${order.total.toFixed(2)}.  
Forma de pagamento escolhida: ${paymentMethod}

Para prosseguir, aqui estão os dados para pagamento:

${paymentData}

Assim que o pagamento for realizado, favor enviar o comprovante por aqui mesmo.  
Qualquer dúvida, estamos à disposição. 💬

Obrigado por comprar com a gente!`;
    
    const phone = '551193394-9002';
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
    
    saveOrders();
}

// Confirmar recebimento de pagamento PIX
async function confirmPixPaymentReceived(orderId) {
    event.stopPropagation();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const confirmPayment = confirm(`Confirmar que o pagamento PIX do pedido #${orderId} foi recebido?\n\nValor: R$ ${order.total.toFixed(2)}\nCliente: ${order.customer}`);
    
    if (confirmPayment) {
        order.status = 'recebido';
        order.payment_status = 'confirmado';
        order.paymentStatus = 'confirmado';
        order.pixPaymentConfirmed = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        
        saveOrders();
        loadOrders();
        updateStats();
        
        sendPixConfirmationNotification(order);
        
        alert(`Pagamento PIX confirmado!\nPedido #${orderId} liberado para preparo.`);
    }
}

// Enviar notificação de confirmação PIX
function sendPixConfirmationNotification(order) {
    const message = `🍷 *Adega do Tio Pancho*\n\n✅ Pagamento PIX confirmado!\n\nPedido #${order.id} recebido e liberado para preparo.\n\nValor: R$ ${order.total.toFixed(2)}\nStatus: Pedido confirmado\n\nEstamos preparando tudo para você!\n\nTempo estimado: 45-55 minutos\n\nObrigado pela preferência! 🍻`;
    
    const phone = '551193394-9002';
    const encodedMessage = encodeURIComponent(message);
    
    setTimeout(() => {
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
    }, 1000);
    
    saveOrders();
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
    
    console.log('Itens do pedido no modal:', order.items);
    
    const itemsHtml = order.items && order.items.length > 0 ? 
        order.items.map(item => `
            <div class="modal-item-row">
                <span class="modal-item-name">${item.name}</span>
                <span class="modal-item-quantity">x${item.quantity}</span>
                <span class="modal-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('') : 
        '<div class="no-items">Nenhum item encontrado - Verifique se os itens foram salvos corretamente</div>';
    
    details.innerHTML = `
        <h3>Pedido #${order.id}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
            <div><strong>Cliente:</strong> ${order.customer || 'Cliente WhatsApp'}</div>
            <div><strong>Status:</strong> <span class="order-status status-${order.status}">${getStatusText(order.status)}</span></div>
            <div><strong>Data:</strong> ${formatDate(order.date || order.data_pedido)}</div>
            <div><strong>Total:</strong> R$ ${(order.valor_total || order.total || 0).toFixed(2)}</div>
            <div><strong>Pagamento:</strong> ${order.paymentMethod || order.forma_pagamento || 'Não informado'}</div>
        </div>
        
        <h4>Itens do Pedido:</h4>
        <div class="modal-items-container">
            ${itemsHtml}
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
        
        if (status === 'aguardando_pagamento') {
            stats.novo++;
        } else if (status === 'recebido') {
            stats.recebido++;
        } else if (stats.hasOwnProperty(status)) {
            stats[status]++;
        } else {
            stats.novo++;
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

async function syncAllOrdersStatus() {
    console.log('✅ Sincronização de status concluída');
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
            .gte('id', 0);
        
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