// Estados do carrinho
const CART_STATES = {
    ATIVO: 'ativo',
    EDITADO: 'editado',
    INCOMPLETO: 'incompleto',
    CONFIRMADO: 'confirmado',
    PREPARANDO: 'preparando',
    EM_ENTREGA: 'em_entrega',
    ENTREGUE: 'entregue',
    DESISTIDO: 'desistido'
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', function() {
    setupCartTracking();
    loadAnalyticsData();
    updateCharts();
    loadActivityLog();
    startAbandonmentCheck();
});

// Configurar sistema de rastreamento
function setupCartTracking() {
    window.CartAnalytics = {
        // Registrar evento
        trackEvent: (state, data = {}) => {
            const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
            const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
            
            // Incrementar contador
            analytics[state] = (analytics[state] || 0) + 1;
            analytics.lastUpdate = new Date().toISOString();
            
            // Adicionar evento detalhado
            events.push({
                state,
                timestamp: new Date().toISOString(),
                sessionId: getSessionId(),
                ...data
            });
            
            // Manter apenas últimos 100 eventos
            if (events.length > 100) events.splice(0, events.length - 100);
            
            // Salvar dados
            localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
            localStorage.setItem('cartEvents', JSON.stringify(events));
            
            console.log(`📊 Cart Event: ${state}`, data);
            
            // Atualizar interface se estiver aberta
            if (document.getElementById('stat-ativo')) {
                setTimeout(() => {
                    loadAnalyticsData();
                    updateCharts();
                    loadActivityLog();
                }, 100);
            }
        },
        
        // 1. Início da Compra - Carrinho Ativo
        onCartActivated: (items, total) => {
            const sessionId = getSessionId();
            const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
            
            activeCarts[sessionId] = {
                state: CART_STATES.ATIVO,
                created: Date.now(),
                lastActivity: Date.now(),
                items,
                total
            };
            
            localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
            CartAnalytics.trackEvent(CART_STATES.ATIVO, { items: items.length, total });
        },
        
        // 3. Atualização do Carrinho - Carrinho Editado
        onCartEdited: (items, total) => {
            const sessionId = getSessionId();
            const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
            
            if (activeCarts[sessionId]) {
                activeCarts[sessionId].items = items;
                activeCarts[sessionId].total = total;
                activeCarts[sessionId].lastActivity = Date.now();
                localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
            }
            
            CartAnalytics.trackEvent(CART_STATES.EDITADO, { items: items.length, total });
        },
        
        // 4. Finalização do Pedido - Pedido Confirmado
        onOrderConfirmed: (orderId, items, total, paymentMethod) => {
            const sessionId = getSessionId();
            const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
            
            if (activeCarts[sessionId]) {
                activeCarts[sessionId].state = CART_STATES.CONFIRMADO;
                activeCarts[sessionId].orderId = orderId;
                localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
            }
            
            CartAnalytics.trackEvent(CART_STATES.CONFIRMADO, {
                orderId,
                items: items.length,
                total,
                paymentMethod
            });
        },
        
        // 5. Desistência da Compra - Compra Desistida
        onCartAbandoned: (reason = 'manual') => {
            const sessionId = getSessionId();
            const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
            
            if (activeCarts[sessionId]) {
                const cart = activeCarts[sessionId];
                CartAnalytics.trackEvent(CART_STATES.DESISTIDO, {
                    reason,
                    items: cart.items?.length || 0,
                    total: cart.total || 0
                });
                
                delete activeCarts[sessionId];
                localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
            }
        },
        
        // 6-8. Mudanças de Status do Pedido
        onOrderStatusChanged: (orderId, newStatus, oldStatus) => {
            CartAnalytics.trackEvent(newStatus, {
                orderId,
                previousStatus: oldStatus
            });
            

            
            // Enviar notificação automática via WhatsApp
            sendWhatsAppNotification(newStatus, orderId);
        },
        

    };
}

// Obter ID da sessão
function getSessionId() {
    let sessionId = sessionStorage.getItem('cartSessionId');
    if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
}

// 2. Verificar carrinhos abandonados (a cada 10 segundos)
function startAbandonmentCheck() {
    checkAbandonedCarts();
    setInterval(checkAbandonedCarts, 10000); // 10 segundos
}

function checkAbandonedCarts() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const now = Date.now();
    const abandonThreshold = 5 * 60 * 1000; // 5 minutos
    
    Object.keys(activeCarts).forEach(sessionId => {
        const cart = activeCarts[sessionId];
        if (now - cart.lastActivity > abandonThreshold && cart.state === 'ativo') {
            cart.state = 'incompleto';
            
            const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
            analytics.incompleto = (analytics.incompleto || 0) + 1;
            if (analytics.ativo > 0) analytics.ativo = analytics.ativo - 1;
            analytics.lastUpdate = new Date().toISOString();
            localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
            
            const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
            events.push({
                state: 'incompleto',
                timestamp: new Date().toISOString(),
                sessionId,
                items: cart.items?.length || 0,
                total: cart.total || 0,
                timeInactive: Math.round((now - cart.lastActivity) / 60000)
            });
            localStorage.setItem('cartEvents', JSON.stringify(events));
            
            console.log('🛒 Carrinho abandonado:', sessionId);
        }
    });
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
}

// Tentativa de recuperação do carrinho
function attemptCartRecovery(sessionId, cart) {
    console.log('🔔 Recuperação de carrinho:', {
        sessionId,
        items: cart.items?.length || 0,
        total: cart.total || 0,
        message: 'Você esqueceu alguns itens no seu carrinho! Finalize sua compra.'
    });
    
    // Em produção: enviar WhatsApp/email de recuperação
}

// Enviar notificação automática via WhatsApp
function sendWhatsAppNotification(status, orderId) {
    const messages = {
        [CART_STATES.PREPARANDO]: 'Seu pedido está sendo preparado 🍷',
        [CART_STATES.EM_ENTREGA]: 'Seu pedido está a caminho 🛵',
        [CART_STATES.ENTREGUE]: 'Pedido entregue com sucesso! Aproveite 🍷'
    };
    
    if (messages[status]) {
        console.log(`📱 WhatsApp Auto para pedido #${orderId}: ${messages[status]}`);
        // Em produção: integrar com API do WhatsApp
    }
}

// Carregar dados de analytics
function loadAnalyticsData() {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    
    // Atualizar contadores - incluindo mapeamento dos status da gestão
    const states = ['ativo', 'editado', 'incompleto', 'confirmado', 'preparando', 'em_entrega', 'entregue', 'desistido'];
    
    states.forEach(state => {
        const el = document.getElementById(`stat-${state}`);
        if (el) {
            el.textContent = analytics[state] || 0;
            // Adicionar animação quando o valor muda
            if (el.dataset.lastValue !== el.textContent) {
                el.style.transform = 'scale(1.2)';
                el.style.color = '#28a745';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.color = '';
                }, 300);
                el.dataset.lastValue = el.textContent;
            }
        }
    });
    
    // Atualizar fluxo
    const flowStates = ['ativo', 'editado', 'confirmado', 'preparando', 'entregue'];
    flowStates.forEach(state => {
        const el = document.getElementById(`flow-${state}`);
        if (el) {
            el.textContent = analytics[state] || 0;
            // Adicionar animação no fluxo também
            if (el.dataset.lastValue !== el.textContent) {
                el.style.background = '#28a745';
                el.style.color = 'white';
                setTimeout(() => {
                    el.style.background = '';
                    el.style.color = '';
                }, 500);
                el.dataset.lastValue = el.textContent;
            }
        }
    });
    
    // Calcular taxas
    const totalCarts = (analytics.ativo || 0) + (analytics.editado || 0) + (analytics.incompleto || 0) + (analytics.confirmado || 0);
    const confirmedOrders = analytics.confirmado || 0;
    const deliveredOrders = analytics.entregue || 0;
    const abandonedCarts = analytics.incompleto || 0;
    
    const conversionRate = totalCarts > 0 ? ((confirmedOrders / totalCarts) * 100).toFixed(1) : 0;
    const completionRate = confirmedOrders > 0 ? ((deliveredOrders / confirmedOrders) * 100).toFixed(1) : 0;
    const abandonmentRate = totalCarts > 0 ? ((abandonedCarts / totalCarts) * 100).toFixed(1) : 0;
    
    document.getElementById('conversion-percentage').textContent = `${conversionRate}%`;
    document.getElementById('completion-percentage').textContent = `${completionRate}%`;
    document.getElementById('abandonment-percentage').textContent = `${abandonmentRate}%`;
    
    // Forçar atualização dos gráficos circulares
    updateCharts();
}

// Atualizar gráficos circulares
function updateCharts() {
    const charts = [
        { id: 'conversion-percentage', class: 'conversion', color: '#28a745' },
        { id: 'completion-percentage', class: 'completion', color: '#17a2b8' },
        { id: 'abandonment-percentage', class: 'abandonment', color: '#dc3545' }
    ];
    
    charts.forEach(chart => {
        const el = document.getElementById(chart.id);
        const circle = document.querySelector(`.rate-circle.${chart.class}`);
        
        if (el && circle) {
            const percentage = parseFloat(el.textContent);
            const degrees = (percentage / 100) * 360;
            circle.style.background = `conic-gradient(${chart.color} 0deg, ${chart.color} ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg)`;
        }
    });
}

// Variável para controlar última atualização das atividades
let lastActivityUpdate = '';

// Carregar log de atividades
function loadActivityLog() {
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    const list = document.getElementById('activity-list');
    
    // Verificar se houve mudanças
    const currentHash = JSON.stringify(events.slice(-20));
    if (currentHash === lastActivityUpdate) {
        return; // Não atualizar se não houve mudanças
    }
    lastActivityUpdate = currentHash;
    
    if (events.length === 0) {
        list.innerHTML = '<p>Nenhuma atividade registrada</p>';
        return;
    }
    
    const statusText = {
        'ativo': '🟢 Carrinho ativado',
        'editado': '✏️ Carrinho editado',
        'incompleto': '⚠️ Carrinho abandonado',
        'confirmado': '✅ Pedido confirmado',
        'preparando': '👨‍🍳 Em preparo',
        'em_entrega': '🛵 Em entrega',
        'entregue': '🎉 Pedido entregue',
        'desistido': '🚫 Compra desistida'
    };
    
    const recent = events.slice(-20).reverse();
    
    list.innerHTML = recent.map((event, index) => {
        const time = new Date(event.timestamp).toLocaleString('pt-BR');
        const details = [];
        
        if (event.items) details.push(`${event.items} itens`);
        if (event.orderTotal) details.push(`R$ ${event.orderTotal.toFixed(2)}`);
        if (event.total) details.push(`R$ ${event.total.toFixed(2)}`);
        if (event.orderId) details.push(`#${event.orderId}`);
        if (event.customerName) details.push(event.customerName);
        
        // Mostrar produtos abandonados
        let productsInfo = '';
        if (event.state === 'incompleto' && event.products && event.products.length > 0) {
            productsInfo = `<div style="color: #fd7e14; font-size: 0.85rem; margin-top: 5px;">📦 Produtos: ${event.products.map(p => p.name).join(', ')}</div>`;
        }
        
        // Destacar eventos recentes (últimos 3)
        const isRecent = index < 3;
        const itemClass = isRecent ? 'activity-item recent-activity' : 'activity-item';
        
        return `
            <div class="${itemClass}" ${isRecent ? 'style="border-left: 3px solid #28a745; background: rgba(40, 167, 69, 0.1);"' : ''}>
                <strong>${statusText[event.state] || event.state}</strong>
                ${details.length > 0 ? `<span>(${details.join(', ')})</span>` : ''}
                ${event.previousStatus ? `<div style="font-size: 0.8rem; color: #6c757d; margin-top: 2px;">↗️ De: ${statusText[event.previousStatus] || event.previousStatus}</div>` : ''}
                ${productsInfo}
                <br><small>${time}</small>
            </div>
        `;
    }).join('');
    
    loadAbandonedCarts();
}

// Carregar carrinhos abandonados
function loadAbandonedCarts() {
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    const list = document.getElementById('abandoned-carts-list');
    
    const abandonedCarts = events.filter(event => 
        event.state === 'incompleto' && 
        event.products && 
        event.products.length > 0
    ).slice(-10).reverse();
    
    if (abandonedCarts.length === 0) {
        list.innerHTML = '<p>Nenhum carrinho abandonado</p>';
        return;
    }
    
    list.innerHTML = abandonedCarts.map(cart => {
        const time = new Date(cart.timestamp).toLocaleString('pt-BR');
        const products = cart.products.map(p => p.name).join(', ');
        const total = cart.total ? `R$ ${cart.total.toFixed(2)}` : 'N/A';
        
        return `
            <div class="abandoned-cart-item">
                <div class="cart-info">
                    <div class="cart-header">
                        <strong>🛒 Carrinho Abandonado</strong>
                        <span class="cart-time">${time}</span>
                    </div>
                    <div class="cart-details">
                        <div>📦 Produtos: ${products}</div>
                        <div>💰 Total: ${total}</div>
                        ${cart.timeInactive ? `<div>⏱️ Inativo: ${cart.timeInactive} min</div>` : ''}
                    </div>
                </div>
                <div class="cart-actions">
                    <button class="recovery-btn" onclick="sendRecoveryMessage('${cart.sessionId}', '${products}', '${total}')">
                        💬 Enviar Recuperação
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Enviar mensagem de recuperação
function sendRecoveryMessage(sessionId, products, total) {
    const message = `🍷 *Adega do Tio Pancho*\n\n😢 Notamos que você esqueceu alguns itens no seu carrinho!\n\n📦 Produtos: ${products}\n💰 Total: ${total}\n\n🎁 Que tal finalizar sua compra? Temos uma oferta especial esperando por você!\n\n👉 Clique aqui para continuar: [Link do Site]`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Marcar como recuperação enviada
    const recoveries = JSON.parse(localStorage.getItem('cartRecoveries') || '[]');
    recoveries.push({
        sessionId,
        sentAt: new Date().toISOString(),
        products,
        total
    });
    localStorage.setItem('cartRecoveries', JSON.stringify(recoveries));
    
    // Mostrar notificação
    showRecoveryNotification();
}

// Mostrar notificação de recuperação enviada
function showRecoveryNotification() {
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
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">💬</span>
            <div>
                <div style="font-weight: bold;">Mensagem de Recuperação Enviada!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">WhatsApp aberto para envio</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Simular carrinho abandonado para teste
function simulateAbandonedCart() {
    const sessionId = 'test_' + Date.now();
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    
    activeCarts[sessionId] = {
        state: 'ativo',
        created: Date.now() - (3 * 60 * 1000), // 3 minutos atrás
        lastActivity: Date.now() - (3 * 60 * 1000),
        items: [{name: 'Produto Teste', price: 50}],
        total: 50
    };
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
    checkAbandonedCarts();
    console.log('🛒 Carrinho abandonado simulado');
}

// Resetar analytics
function resetAnalytics() {
    if (confirm('Tem certeza que deseja resetar todos os dados de analytics?')) {
        localStorage.removeItem('cartAnalytics');
        localStorage.removeItem('cartEvents');
        localStorage.removeItem('activeCarts');
        localStorage.removeItem('analyticsOrders');
        
        // Resetar interface
        document.querySelectorAll('[id^="stat-"]').forEach(el => el.textContent = '0');
        document.querySelectorAll('[id^="flow-"]').forEach(el => el.textContent = '0');
        
        ['conversion-percentage', 'completion-percentage', 'abandonment-percentage'].forEach(id => {
            document.getElementById(id).textContent = '0%';
        });
        
        document.getElementById('activity-list').innerHTML = '<p>Nenhuma atividade registrada</p>';
        
        document.querySelectorAll('.rate-circle').forEach(circle => {
            circle.style.background = 'conic-gradient(#28a745 0deg, #28a745 0deg, rgba(255,255,255,0.1) 0deg)';
        });
        
        alert('Dados resetados com sucesso!');
    }
}



// Simular dados para testar taxas
function createTestData() {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    
    // Simular dados realistas
    analytics.ativo = 5;
    analytics.editado = 8;
    analytics.incompleto = 3;
    analytics.confirmado = 12;
    analytics.preparando = 4;
    analytics.em_entrega = 2;
    analytics.entregue = 6;
    analytics.desistido = 2;
    analytics.lastUpdate = new Date().toISOString();
    
    localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
    
    // Criar eventos correspondentes
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    events.push({
        state: 'confirmado',
        timestamp: new Date().toISOString(),
        orderId: Date.now(),
        total: 89.90
    });
    localStorage.setItem('cartEvents', JSON.stringify(events));
    
    console.log('📊 Dados de teste criados');
    loadAnalyticsData();
    updateCharts();
}

// Simular carrinho ativo para teste de abandono
function createActiveCart() {
    const sessionId = 'test_' + Date.now();
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    
    activeCarts[sessionId] = {
        state: 'ativo',
        created: Date.now(),
        lastActivity: Date.now() - (6 * 60 * 1000),
        items: [{name: 'Vinho Teste', price: 89.90}],
        total: 89.90
    };
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
    
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    analytics.ativo = (analytics.ativo || 0) + 1;
    localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
    
    setTimeout(checkAbandonedCarts, 1000);
}

// Exportar dados para Excel
function exportData() {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    
    // Calcular taxas
    const totalCarts = (analytics.ativo || 0) + (analytics.editado || 0) + (analytics.incompleto || 0) + (analytics.confirmado || 0);
    const conversionRate = totalCarts > 0 ? ((analytics.confirmado || 0) / totalCarts * 100).toFixed(1) : 0;
    const completionRate = (analytics.confirmado || 0) > 0 ? ((analytics.entregue || 0) / (analytics.confirmado || 0) * 100).toFixed(1) : 0;
    const abandonmentRate = totalCarts > 0 ? ((analytics.incompleto || 0) / totalCarts * 100).toFixed(1) : 0;
    
    // Criar dados CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Cabeçalho do resumo
    csvContent += 'RESUMO ANALYTICS - ADEGA DO TIO PANCHO\n';
    csvContent += `Data de Exportação,${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    // Contadores
    csvContent += 'CONTADORES\n';
    csvContent += 'Status,Quantidade\n';
    csvContent += `Carrinho Ativo,${analytics.ativo || 0}\n`;
    csvContent += `Carrinho Editado,${analytics.editado || 0}\n`;
    csvContent += `Carrinho Abandonado,${analytics.incompleto || 0}\n`;
    csvContent += `Pedido Confirmado,${analytics.confirmado || 0}\n`;
    csvContent += `Em Preparo,${analytics.preparando || 0}\n`;
    csvContent += `Em Entrega,${analytics.em_entrega || 0}\n`;
    csvContent += `Entregue,${analytics.entregue || 0}\n`;
    csvContent += `Desistido,${analytics.desistido || 0}\n\n`;
    
    // Taxas
    csvContent += 'TAXAS\n';
    csvContent += 'Métrica,Valor\n';
    csvContent += `Taxa de Conversão,${conversionRate}%\n`;
    csvContent += `Taxa de Conclusão,${completionRate}%\n`;
    csvContent += `Taxa de Abandono,${abandonmentRate}%\n\n`;
    
    // Eventos recentes
    csvContent += 'ATIVIDADES RECENTES\n';
    csvContent += 'Data/Hora,Status,ID Pedido,Valor,Cliente\n';
    
    events.slice(-20).reverse().forEach(event => {
        const date = new Date(event.timestamp).toLocaleString('pt-BR');
        const status = event.state || '';
        const orderId = event.orderId || '';
        const total = event.orderTotal ? `R$ ${event.orderTotal.toFixed(2)}` : (event.total ? `R$ ${event.total.toFixed(2)}` : '');
        const customer = event.customerName || '';
        
        csvContent += `"${date}","${status}","${orderId}","${total}","${customer}"\n`;
    });
    
    // Criar e baixar arquivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics-adega-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    
    alert('Planilha Excel exportada com sucesso!');
}



// Atualizar dados automaticamente a cada 500ms para tempo real mais rápido
setInterval(() => {
    loadAnalyticsData();
    updateCharts();
    loadActivityLog();
}, 500);

// Escutar mudanças no localStorage para atualização instantânea
window.addEventListener('storage', function(e) {
    if (e.key === 'cartAnalytics' || e.key === 'cartEvents') {
        loadAnalyticsData();
        updateCharts();
        loadActivityLog();
    }
});

// Escutar eventos customizados para atualização imediata na mesma aba
window.addEventListener('cartAnalyticsUpdate', function(e) {
    console.log('🔄 Atualizando analytics em tempo real:', e.detail);
    loadAnalyticsData();
    updateCharts();
    loadActivityLog();
});