// Estados do carrinho
const CART_STATES = {
    ATIVO: 'ativo',
    EDITADO: 'editado',
    INCOMPLETO: 'incompleto',
    CONFIRMADO: 'confirmado',
    PREPARANDO: 'preparando',
    EM_ENTREGA: 'em_entrega',
    ENTREGUE: 'entregue',
    CANCELADO: 'cancelado',
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
                loadAnalyticsData();
                updateCharts();
                loadActivityLog();
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
        
        // 9. Cancelamento Manual
        onOrderCancelled: (orderId, reason) => {
            CartAnalytics.trackEvent(CART_STATES.CANCELADO, {
                orderId,
                reason
            });
        }
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

// 2. Verificar carrinhos abandonados (a cada 5 minutos)
function startAbandonmentCheck() {
    setInterval(checkAbandonedCarts, 300000); // 5 minutos
}

function checkAbandonedCarts() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const now = Date.now();
    const abandonThreshold = 30 * 60 * 1000; // 30 minutos
    
    Object.keys(activeCarts).forEach(sessionId => {
        const cart = activeCarts[sessionId];
        if (now - cart.lastActivity > abandonThreshold && cart.state === CART_STATES.ATIVO) {
            // Marcar como abandonado
            cart.state = CART_STATES.INCOMPLETO;
            
            CartAnalytics.trackEvent(CART_STATES.INCOMPLETO, {
                items: cart.items?.length || 0,
                total: cart.total || 0,
                timeActive: Math.round((now - cart.created) / 60000)
            });
            
            // Tentar recuperação
            attemptCartRecovery(sessionId, cart);
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
    
    // Atualizar contadores
    const states = ['ativo', 'editado', 'incompleto', 'confirmado', 'preparando', 'em_entrega', 'entregue', 'cancelado', 'desistido'];
    
    states.forEach(state => {
        const el = document.getElementById(`stat-${state}`);
        if (el) el.textContent = analytics[state] || 0;
    });
    
    // Atualizar fluxo
    const flowStates = ['ativo', 'editado', 'confirmado', 'preparando', 'entregue'];
    flowStates.forEach(state => {
        const el = document.getElementById(`flow-${state}`);
        if (el) el.textContent = analytics[state] || 0;
    });
    
    // Calcular taxas
    const totalCarts = (analytics.ativo || 0) + (analytics.editado || 0);
    const confirmedOrders = analytics.confirmado || 0;
    const deliveredOrders = analytics.entregue || 0;
    const abandonedCarts = analytics.incompleto || 0;
    
    const conversionRate = totalCarts > 0 ? ((confirmedOrders / totalCarts) * 100).toFixed(1) : 0;
    const completionRate = confirmedOrders > 0 ? ((deliveredOrders / confirmedOrders) * 100).toFixed(1) : 0;
    const abandonmentRate = totalCarts > 0 ? ((abandonedCarts / totalCarts) * 100).toFixed(1) : 0;
    
    document.getElementById('conversion-percentage').textContent = `${conversionRate}%`;
    document.getElementById('completion-percentage').textContent = `${completionRate}%`;
    document.getElementById('abandonment-percentage').textContent = `${abandonmentRate}%`;
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

// Carregar log de atividades
function loadActivityLog() {
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    const list = document.getElementById('activity-list');
    
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
        'em_entrega': '🛵 Saiu para entrega',
        'entregue': '🎉 Pedido entregue',
        'cancelado': '❌ Pedido cancelado',
        'desistido': '🚫 Compra desistida'
    };
    
    const recent = events.slice(-15).reverse();
    
    list.innerHTML = recent.map(event => {
        const time = new Date(event.timestamp).toLocaleString('pt-BR');
        const details = [];
        
        if (event.items) details.push(`${event.items} itens`);
        if (event.total) details.push(`R$ ${event.total.toFixed(2)}`);
        if (event.orderId) details.push(`#${event.orderId}`);
        
        return `
            <div class="activity-item">
                <strong>${statusText[event.state] || event.state}</strong>
                ${details.length > 0 ? `<span>(${details.join(', ')})</span>` : ''}
                <br><small>${time}</small>
            </div>
        `;
    }).join('');
}

// Resetar analytics
function resetAnalytics() {
    if (confirm('Tem certeza que deseja resetar todos os dados de analytics?')) {
        localStorage.removeItem('cartAnalytics');
        localStorage.removeItem('cartEvents');
        localStorage.removeItem('activeCarts');
        
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

// Exportar dados
function exportData() {
    const data = {
        analytics: JSON.parse(localStorage.getItem('cartAnalytics') || '{}'),
        events: JSON.parse(localStorage.getItem('cartEvents') || '[]'),
        activeCarts: JSON.parse(localStorage.getItem('activeCarts') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-carrinho-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Dados exportados com sucesso!');
}

// Testar fluxo completo
function testCartFlow() {
    console.log('🧪 Iniciando teste do fluxo completo...');
    
    // Simular fluxo completo
    setTimeout(() => {
        CartAnalytics.onCartActivated([{name: 'Vinho Tinto'}], 89.90);
        console.log('1. Carrinho ativado');
    }, 500);
    
    setTimeout(() => {
        CartAnalytics.onCartEdited([{name: 'Vinho Tinto'}, {name: 'Cerveja'}], 135.80);
        console.log('2. Carrinho editado');
    }, 1500);
    
    setTimeout(() => {
        CartAnalytics.onOrderConfirmed('12345', [{name: 'Vinho'}, {name: 'Cerveja'}], 135.80, 'PIX');
        console.log('3. Pedido confirmado');
    }, 2500);
    
    setTimeout(() => {
        CartAnalytics.onOrderStatusChanged('12345', CART_STATES.PREPARANDO, CART_STATES.CONFIRMADO);
        console.log('4. Pedido em preparo');
    }, 3500);
    
    setTimeout(() => {
        CartAnalytics.onOrderStatusChanged('12345', CART_STATES.EM_ENTREGA, CART_STATES.PREPARANDO);
        console.log('5. Pedido saiu para entrega');
    }, 4500);
    
    setTimeout(() => {
        CartAnalytics.onOrderStatusChanged('12345', CART_STATES.ENTREGUE, CART_STATES.EM_ENTREGA);
        console.log('6. Pedido entregue');
    }, 5500);
    
    setTimeout(() => {
        console.log('✅ Teste do fluxo completo finalizado!');
        alert('Teste concluído! Verifique os dados atualizados.');
    }, 6000);
}

// Atualizar dados automaticamente a cada 30 segundos
setInterval(() => {
    loadAnalyticsData();
    updateCharts();
    loadActivityLog();
}, 30000);