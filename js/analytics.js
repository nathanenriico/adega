// Estados do carrinho
const CART_STATES = {
    ADICIONADO: 'adicionado',
    EDITADO: 'editado',
    INCOMPLETO: 'incompleto',
    CONFIRMADO: 'confirmado',
    PREPARANDO: 'preparando',
    EM_ENTREGA: 'em_entrega',
    ENTREGUE: 'entregue',
    DESISTIDO: 'desistido'
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', async function() {
    // Carregar Supabase se não estiver disponível
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);
    }
    
    setupCartTracking();
    await loadAnalyticsData();
    startAbandonmentCheck();
    await loadDesistedCarts();
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
            if (document.getElementById('stat-editado')) {
                setTimeout(() => {
                    loadAnalyticsData();
                    updateCharts();
                    loadActivityLog();
                }, 100);
            }
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
        }
    };
}

// Instância única do Supabase
let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
    }
    return supabaseClient;
}

// Carregar dados da tabela carrinho_status
async function loadCarrinhoStatusData() {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { data, error } = await client
            .from('carrinho_status')
            .select('*')
            .order('data_criacao', { ascending: false })
            .limit(100);
        
        if (error) {
            console.error('Erro ao carregar carrinho_status:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // Remover duplicatas por cliente_telefone + status
            const uniqueData = data.filter((item, index, self) => 
                index === self.findIndex(t => 
                    t.cliente_telefone === item.cliente_telefone && 
                    t.status === item.status
                )
            );
            
            // Contar por status usando dados únicos
            const statusCount = {};
            uniqueData.forEach(item => {
                statusCount[item.status] = (statusCount[item.status] || 0) + 1;
            });
            
            // Atualizar analytics com dados do banco
            const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
            
            // Sobrescrever com dados do banco
            analytics.adicionado = statusCount.adicionado || 0;
            analytics.editado = statusCount.editado || 0;
            analytics.confirmado = statusCount.confirmado || 0;
            analytics.preparando = statusCount.preparando || 0;
            analytics.em_entrega = statusCount.em_entrega || 0;
            analytics.entregue = statusCount.entregue || 0;
            analytics.desistido = statusCount.desistido || 0;
            
            analytics.lastUpdate = new Date().toISOString();
            localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
            
            console.log('✅ Dados únicos do carrinho_status:', statusCount);
        }
    } catch (error) {
        console.error('Erro ao conectar com carrinho_status:', error);
    }
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
        if (now - cart.lastActivity > abandonThreshold && cart.state === 'editado') {
            cart.state = 'incompleto';
            
            const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
            analytics.incompleto = (analytics.incompleto || 0) + 1;
            if (analytics.editado > 0) analytics.editado = analytics.editado - 1;
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
async function loadAnalyticsData() {
    // Carregar dados do banco carrinho_status
    await loadCarrinhoStatusData();
    
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    
    // Atualizar contadores - incluindo mapeamento dos status da gestão
    const states = ['adicionado', 'editado', 'incompleto', 'confirmado', 'preparando', 'em_entrega', 'entregue', 'desistido'];
    
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
    const flowStates = ['adicionado', 'editado', 'confirmado', 'preparando', 'entregue'];
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
    
    // Elementos removidos - não calcular taxas
}

// Função removida - gráficos não existem mais
function updateCharts() {
    // Elementos removidos
}

// Variável para controlar última atualização das atividades
let lastActivityUpdate = '';

// Carregar log de atividades
function loadActivityLog() {
    // Elemento removido do HTML
    return;
    return; // Elemento removido
    
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

        'adicionado': '🛒 Carrinho adicionado',
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

let currentTab = 'desisted';

// Alternar entre abas
async function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    const description = document.getElementById('section-description');
    description.textContent = 'Clientes que desistiram da compra após confirmação. Envie mensagens para reconquistar esses clientes!';
    await loadDesistedCarts();
}

// Carregar carrinhos abandonados
async function loadAbandonedCarts() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    const list = document.getElementById('abandoned-carts-list');
    
    // Buscar carrinhos abandonados dos dados ativos e eventos
    const abandonedFromActive = Object.entries(activeCarts)
        .filter(([sessionId, cart]) => cart.state === 'incompleto')
        .map(([sessionId, cart]) => ({
            sessionId,
            timestamp: new Date(cart.lastActivity || cart.created).toISOString(),
            products: cart.items || [],
            total: cart.total || 0,
            customerPhone: cart.customerPhone || null,
            customerName: cart.customerName || null,
            timeInactive: Math.round((Date.now() - (cart.lastActivity || cart.created)) / 60000)
        }));
    
    const abandonedFromEvents = events.filter(event => 
        event.state === 'incompleto'
    ).map(event => ({
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        products: event.products || [],
        total: event.total || 0,
        customerPhone: event.customerPhone || null,
        customerName: event.customerName || null,
        timeInactive: event.timeInactive || 0
    }));
    
    // Combinar e remover duplicatas
    const allAbandoned = [...abandonedFromActive, ...abandonedFromEvents];
    const uniqueAbandoned = allAbandoned.filter((cart, index, self) => 
        index === self.findIndex(c => c.sessionId === cart.sessionId)
    ).slice(-15).reverse();
    
    // Buscar WhatsApp do banco de dados para clientes sem telefone
    for (let cart of uniqueAbandoned) {
        if (!cart.customerPhone && cart.customerName && cart.customerName !== 'Cliente não identificado') {
            try {
                const client = window.supabase?.createClient(
                    'https://vtrgtorablofhmhizrjr.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
                );
                
                if (client) {
                    const { data } = await client
                        .from('clientes')
                        .select('whatsapp')
                        .ilike('nome', `%${cart.customerName}%`)
                        .single();
                    
                    if (data?.whatsapp) {
                        cart.customerPhone = data.whatsapp;
                    }
                }
            } catch (error) {
                console.log('Erro ao buscar WhatsApp:', error);
            }
        }
    }
    
    if (uniqueAbandoned.length === 0) {
        list.innerHTML = '<p>Nenhum carrinho abandonado encontrado</p>';
        return;
    }
    
    const withPhone = uniqueAbandoned.filter(c => c.customerPhone).length;
    const header = withPhone > 0 ? `
        <div class="bulk-actions">
            <button class="bulk-recovery-btn" onclick="sendBulkRecovery()">
                📢 Enviar para Todos com WhatsApp (${withPhone})
            </button>
        </div>
    ` : '';
    
    list.innerHTML = header + uniqueAbandoned.map(cart => {
        const time = new Date(cart.timestamp).toLocaleString('pt-BR');
        const products = Array.isArray(cart.products) ? 
            cart.products.map(p => typeof p === 'object' ? p.name : p).join(', ') : 
            'Produtos não especificados';
        const total = cart.total ? `R$ ${cart.total.toFixed(2)}` : 'N/A';
        const hasPhone = cart.customerPhone;
        const customerName = cart.customerName || 'Cliente não identificado';
        
        return `
            <div class="abandoned-cart-item ${hasPhone ? 'has-phone' : 'no-phone'}">
                <div class="cart-info">
                    <div class="cart-header">
                        <strong>🛒 ${customerName}</strong>
                        <span class="cart-time">${time}</span>
                    </div>
                    <div class="cart-details">
                        <div>📦 Produtos: ${products}</div>
                        <div>💰 Total: ${total}</div>
                        ${hasPhone ? `<div>📱 Tel: ${cart.customerPhone}</div>` : '<div style="color: #fd7e14;">⚠️ Sem telefone cadastrado</div>'}
                        ${cart.timeInactive ? `<div>⏱️ Abandonado há: ${cart.timeInactive} min</div>` : ''}
                    </div>
                </div>
                <div class="cart-actions">
                    ${hasPhone ? `
                        <button class="recovery-btn web-btn" 
                                onclick="sendRecoveryMessage('${cart.sessionId}', '${products.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${total}', '${cart.customerPhone || ''}', '${customerName.replace(/'/g, "\\'").replace(/"/g, '\\"')}', true)">
                            💬 Enviar WhatsApp
                        </button>
                    ` : `
                        <button class="recovery-btn disabled">
                            📋 Sem WhatsApp
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Enviar mensagem de recuperação
function sendRecoveryMessage(sessionId, products, total, customerPhone = null, customerName = 'Cliente', useWeb = false) {
    const message = `🍷 *Adega do Tio Pancho*\n\nOlá ${customerName}! 😊\n\n😢 Notamos que você esqueceu alguns itens no seu carrinho:\n\n📦 Produtos: ${products}\n💰 Total: ${total}\n\n🎁 Que tal finalizar sua compra? Temos vinhos especiais esperando por você!\n\n✨ *Oferta especial*: Use o cupom VOLTA10 e ganhe 10% de desconto!\n\n👉 Finalize agora: ${window.location.origin.replace('/analytics', '')}\n\n🍷 Adega do Tio Pancho - Os melhores vinhos da região!`;
    
    const encodedMessage = encodeURIComponent(message);
    let whatsappUrl;
    
    if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        
        // Sempre usar WhatsApp Web
        whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
    } else {
        whatsappUrl = `https://web.whatsapp.com/`;
        alert('Número de telefone não disponível. A mensagem será copiada para você enviar manualmente.');
    }
    
    window.open(whatsappUrl, '_blank');
    
    const recoveries = JSON.parse(localStorage.getItem('cartRecoveries') || '[]');
    recoveries.push({
        sessionId,
        sentAt: new Date().toISOString(),
        products,
        total,
        customerPhone,
        customerName,
        platform: useWeb ? 'web' : 'app'
    });
    localStorage.setItem('cartRecoveries', JSON.stringify(recoveries));
    
    showRecoveryNotification(customerName, useWeb ? 'WhatsApp Web' : 'WhatsApp App');
}

// Carregar carrinhos desistidos
async function loadDesistedCarts() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    const list = document.getElementById('abandoned-carts-list');
    
    const desistedFromActive = Object.entries(activeCarts)
        .filter(([sessionId, cart]) => cart.state === 'desistido')
        .map(([sessionId, cart]) => ({
            sessionId,
            timestamp: new Date(cart.lastActivity || cart.created).toISOString(),
            products: cart.items || [],
            total: cart.total || 0,
            customerPhone: cart.customerPhone || null,
            customerName: cart.customerName || null,
            orderId: cart.orderId || null
        }));
    
    const desistedFromEvents = events.filter(event => 
        event.state === 'desistido'
    ).map(event => ({
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        products: event.products || [],
        total: event.total || 0,
        customerPhone: event.customerPhone || null,
        customerName: event.customerName || null,
        orderId: event.orderId || null
    }));
    
    const allDesisted = [...desistedFromActive, ...desistedFromEvents];
    const uniqueDesisted = allDesisted.filter((cart, index, self) => 
        index === self.findIndex(c => c.sessionId === cart.sessionId)
    ).slice(-15).reverse();
    
    // Buscar WhatsApp do banco de dados para clientes sem telefone
    for (let cart of uniqueDesisted) {
        if (!cart.customerPhone && cart.customerName && cart.customerName !== 'Cliente não identificado') {
            try {
                const client = window.supabase?.createClient(
                    'https://vtrgtorablofhmhizrjr.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
                );
                
                if (client) {
                    const { data } = await client
                        .from('clientes')
                        .select('whatsapp')
                        .ilike('nome', `%${cart.customerName}%`)
                        .single();
                    
                    if (data?.whatsapp) {
                        cart.customerPhone = data.whatsapp;
                    }
                }
            } catch (error) {
                console.log('Erro ao buscar WhatsApp:', error);
            }
        }
    }
    
    if (uniqueDesisted.length === 0) {
        list.innerHTML = '<p>Nenhuma compra desistida encontrada</p>';
        return;
    }
    
    const withPhone = uniqueDesisted.filter(c => c.customerPhone).length;
    const header = withPhone > 0 ? `
        <div class="bulk-actions">
            <button class="bulk-recovery-btn" onclick="sendBulkDesisted()">
                📢 Enviar para Todos com WhatsApp (${withPhone})
            </button>
        </div>
    ` : '';
    
    list.innerHTML = header + uniqueDesisted.map(cart => {
        const time = new Date(cart.timestamp).toLocaleString('pt-BR');
        const products = Array.isArray(cart.products) ? 
            cart.products.map(p => typeof p === 'object' ? p.name : p).join(', ') : 
            'Produtos não especificados';
        const total = cart.total ? `R$ ${cart.total.toFixed(2)}` : 'N/A';
        const hasPhone = cart.customerPhone;
        const customerName = cart.customerName || 'Cliente não identificado';
        
        return `
            <div class="abandoned-cart-item ${hasPhone ? 'has-phone' : 'no-phone'}">
                <div class="cart-info">
                    <div class="cart-header">
                        <strong>🚫 ${customerName}</strong>
                        <span class="cart-time">${time}</span>
                    </div>
                    <div class="cart-details">
                        <div>📦 Produtos: ${products}</div>
                        <div>💰 Total: ${total}</div>
                        ${cart.orderId ? `<div>🆔 Pedido: #${cart.orderId}</div>` : ''}
                        ${hasPhone ? `<div>📱 Tel: ${cart.customerPhone}</div>` : '<div style="color: #fd7e14;">⚠️ Sem telefone cadastrado</div>'}
                    </div>
                </div>
                <div class="cart-actions">
                    <button class="recovery-btn ${hasPhone ? '' : 'disabled'}" 
                            onclick="sendDesistedMessage('${cart.sessionId}', '${products.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${total}', '${cart.customerPhone || ''}', '${customerName.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
                        ${hasPhone ? '💬 Enviar WhatsApp' : '📋 Sem WhatsApp'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Enviar mensagem para desistidos
function sendDesistedMessage(sessionId, products, total, customerPhone = null, customerName = 'Cliente') {
    const message = `🍷 *Adega do Tio Pancho*\n\nOlá ${customerName}! 😊\n\n😔 Notamos que você desistiu da sua compra:\n\n📦 Produtos: ${products}\n💰 Total: ${total}\n\n💡 Que tal uma segunda chance? Preparamos uma oferta especial só para você!\n\n🎁 *Oferta exclusiva*: Use o cupom VOLTA15 e ganhe 15% de desconto!\n\n✨ Nossos vinhos estão esperando por você!\n\n👉 Acesse: ${window.location.origin.replace('/analytics', '')}\n\n🍷 Adega do Tio Pancho - Sua adega de confiança!`;
    
    const encodedMessage = encodeURIComponent(message);
    let whatsappUrl;
    
    if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
    } else {
        whatsappUrl = `https://web.whatsapp.com/`;
        alert('Número de telefone não disponível. A mensagem será copiada para você enviar manualmente.');
    }
    
    window.open(whatsappUrl, '_blank');
    showRecoveryNotification(customerName);
}

// Enviar recuperação em lote para desistidos
function sendBulkDesisted() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    
    const desistedFromActive = Object.entries(activeCarts)
        .filter(([sessionId, cart]) => cart.state === 'desistido' && cart.customerPhone)
        .map(([sessionId, cart]) => ({
            sessionId,
            products: cart.items || [],
            total: cart.total || 0,
            customerPhone: cart.customerPhone,
            customerName: cart.customerName || 'Cliente'
        }));
    
    const desistedFromEvents = events.filter(event => 
        event.state === 'desistido' && event.customerPhone
    );
    
    const allDesisted = [...desistedFromActive, ...desistedFromEvents];
    const uniqueDesisted = allDesisted.filter((cart, index, self) => 
        index === self.findIndex(c => c.sessionId === cart.sessionId)
    );
    
    if (uniqueDesisted.length === 0) {
        alert('⚠️ Nenhuma compra desistida com telefone disponível.');
        return;
    }
    
    const confirmed = confirm(`📢 Enviar mensagem de reconquista para ${uniqueDesisted.length} clientes?\n\n⚠️ Isso abrirá ${uniqueDesisted.length} abas do WhatsApp.`);
    if (!confirmed) return;
    
    let sent = 0;
    uniqueDesisted.forEach((cart, index) => {
        setTimeout(() => {
            const products = Array.isArray(cart.products) ? 
                cart.products.map(p => typeof p === 'object' ? p.name : p).join(', ') : 
                'Produtos';
            const total = cart.total ? `R$ ${cart.total.toFixed(2)}` : 'N/A';
            const customerName = cart.customerName || 'Cliente';
            
            sendDesistedMessage(cart.sessionId, products, total, cart.customerPhone, customerName);
            sent++;
            
            if (sent === uniqueDesisted.length) {
                setTimeout(() => {
                    showBulkNotification(sent);
                }, 1000);
            }
        }, index * 3000);
    });
}

// Enviar recuperação em lote
function sendBulkRecovery() {
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    
    // Buscar carrinhos abandonados com telefone
    const abandonedFromActive = Object.entries(activeCarts)
        .filter(([sessionId, cart]) => cart.state === 'incompleto' && cart.customerPhone)
        .map(([sessionId, cart]) => ({
            sessionId,
            products: cart.items || [],
            total: cart.total || 0,
            customerPhone: cart.customerPhone,
            customerName: cart.customerName || 'Cliente'
        }));
    
    const abandonedFromEvents = events.filter(event => 
        event.state === 'incompleto' && event.customerPhone
    );
    
    const allAbandoned = [...abandonedFromActive, ...abandonedFromEvents];
    const uniqueAbandoned = allAbandoned.filter((cart, index, self) => 
        index === self.findIndex(c => c.sessionId === cart.sessionId)
    );
    
    if (uniqueAbandoned.length === 0) {
        alert('⚠️ Nenhum carrinho abandonado com telefone disponível.');
        return;
    }
    
    const confirmed = confirm(`📢 Enviar mensagem de recuperação para ${uniqueAbandoned.length} clientes?\n\n⚠️ Isso abrirá ${uniqueAbandoned.length} abas do WhatsApp.`);
    if (!confirmed) return;
    
    let sent = 0;
    uniqueAbandoned.forEach((cart, index) => {
        setTimeout(() => {
            const products = Array.isArray(cart.products) ? 
                cart.products.map(p => typeof p === 'object' ? p.name : p).join(', ') : 
                'Produtos';
            const total = cart.total ? `R$ ${cart.total.toFixed(2)}` : 'N/A';
            const customerName = cart.customerName || 'Cliente';
            
            sendRecoveryMessage(cart.sessionId, products, total, cart.customerPhone, customerName);
            sent++;
            
            if (sent === uniqueAbandoned.length) {
                setTimeout(() => {
                    showBulkNotification(sent);
                }, 1000);
            }
        }, index * 3000); // 3 segundos entre cada envio para não sobrecarregar
    });
}

// Mostrar notificação de envio em lote
function showBulkNotification(count) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #25D366, #128c7e);
        color: white;
        padding: 30px;
        border-radius: 15px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        text-align: center;
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 15px;">🎉</div>
        <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 10px;">
            Envio Concluído!
        </div>
        <div style="font-size: 1rem; opacity: 0.9;">
            ${count} mensagens de recuperação enviadas via WhatsApp
        </div>
        <div style="margin-top: 20px;">
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: white; color: #25D366; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// Mostrar notificação de recuperação enviada
function showRecoveryNotification(customerName = 'Cliente', platform = 'WhatsApp') {
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
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${platform.includes('Web') ? '💻' : '📱'}</span>
            <div>
                <div style="font-weight: bold;">Mensagem Enviada!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${platform} aberto para ${customerName}</div>
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
    
    // Simular dados mais realistas
    const testCustomers = [
        { name: 'João Silva', phone: '11999887766' },
        { name: 'Maria Santos', phone: '11988776655' },
        { name: 'Pedro Costa', phone: null },
        { name: 'Ana Oliveira', phone: '11977665544' }
    ];
    
    const testProducts = [
        [{ name: 'Vinho Tinto Reserva', price: 89.90 }, { name: 'Vinho Branco Seco', price: 65.50 }],
        [{ name: 'Espumante Brut', price: 120.00 }],
        [{ name: 'Vinho Rosé', price: 75.90 }, { name: 'Kit Degustação', price: 199.90 }]
    ];
    
    const customer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
    const products = testProducts[Math.floor(Math.random() * testProducts.length)];
    const total = products.reduce((sum, p) => sum + p.price, 0);
    
    activeCarts[sessionId] = {
        state: 'incompleto',
        created: Date.now() - (Math.random() * 30 * 60 * 1000), // Até 30 min atrás
        lastActivity: Date.now() - (Math.random() * 30 * 60 * 1000),
        items: products,
        total: total,
        customerName: customer.name,
        customerPhone: customer.phone
    };
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
    
    // Atualizar analytics
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    analytics.incompleto = (analytics.incompleto || 0) + 1;
    localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
    
    // Adicionar evento
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    events.push({
        state: 'incompleto',
        timestamp: new Date().toISOString(),
        sessionId,
        products: products,
        total: total,
        customerName: customer.name,
        customerPhone: customer.phone,
        timeInactive: Math.round(Math.random() * 30)
    });
    localStorage.setItem('cartEvents', JSON.stringify(events));
    
    console.log('🛒 Carrinho abandonado simulado:', customer.name);
    
    // Atualizar interface
    setTimeout(() => {
        loadAnalyticsData();
        loadActivityLog();
        if (currentTab === 'abandoned') {
            loadAbandonedCarts();
        } else {
            loadDesistedCarts();
        }
    }, 100);
}

// Resetar analytics
async function resetAnalytics() {
    if (confirm('Tem certeza que deseja resetar todos os dados de analytics? Isso limpará dados da página E do banco de dados.')) {
        try {
            // Limpar banco de dados
            const client = getSupabaseClient();
            if (client) {
                await client.from('carrinho_status').delete().neq('id', 0);
                await client.from('carrinho_abandonado').delete().neq('id', 0);
                console.log('✅ Dados do banco limpos');
            }
            
            // Limpar localStorage
            localStorage.removeItem('cartAnalytics');
            localStorage.removeItem('cartEvents');
            localStorage.removeItem('activeCarts');
            localStorage.removeItem('analyticsOrders');
            
            // Resetar interface
            document.querySelectorAll('[id^="stat-"]').forEach(el => el.textContent = '0');
            document.querySelectorAll('[id^="flow-"]').forEach(el => el.textContent = '0');
            
            alert('Dados resetados com sucesso (página + banco de dados)!');
            
        } catch (error) {
            console.error('Erro ao limpar banco:', error);
            alert('Erro ao limpar banco de dados: ' + error.message);
        }
    }
}



// Simular dados para testar taxas
function createTestData() {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    
    // Simular dados realistas

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
        state: 'editado',
        created: Date.now(),
        lastActivity: Date.now() - (6 * 60 * 1000),
        items: [{name: 'Vinho Teste', price: 89.90}],
        total: 89.90
    };
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
    
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');

    localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
    
    setTimeout(checkAbandonedCarts, 1000);
}

// Exportar dados para Excel
function exportData() {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    
    // Calcular taxas
    const totalCarts = (analytics.adicionado || 0) + (analytics.editado || 0) + (analytics.incompleto || 0) + (analytics.confirmado || 0);
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



// Atualizar dados automaticamente a cada 5 segundos para incluir banco
setInterval(async () => {
    await loadAnalyticsData();
}, 5000);

// Escutar mudanças no localStorage para atualização instantânea
window.addEventListener('storage', async function(e) {
    if (e.key === 'cartAnalytics' || e.key === 'cartEvents') {
        await loadAnalyticsData();
    }
});

// Escutar eventos customizados para atualização imediata na mesma aba
window.addEventListener('cartAnalyticsUpdate', async function(e) {
    console.log('🔄 Atualizando analytics em tempo real:', e.detail);
    await loadAnalyticsData();
});

function simulateDesistedCart() {
    const sessionId = 'desisted_' + Date.now() + Math.random();
    const activeCarts = JSON.parse(localStorage.getItem('activeCarts') || '{}');
    
    const testCustomers = [
        { name: 'Carlos Mendes', phone: '11955443322' },
        { name: 'Lucia Ferreira', phone: '11944332211' },
        { name: 'Roberto Lima', phone: null }
    ];
    
    const testProducts = [
        [{ name: 'Vinho Cabernet', price: 95.90 }],
        [{ name: 'Champagne Premium', price: 180.00 }]
    ];
    
    const customer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
    const products = testProducts[Math.floor(Math.random() * testProducts.length)];
    const total = products.reduce((sum, p) => sum + p.price, 0);
    
    activeCarts[sessionId] = {
        state: 'desistido',
        created: Date.now() - (Math.random() * 60 * 60 * 1000),
        lastActivity: Date.now() - (Math.random() * 60 * 60 * 1000),
        items: products,
        total: total,
        customerName: customer.name,
        customerPhone: customer.phone,
        orderId: 'PED' + Math.floor(Math.random() * 10000)
    };
    
    localStorage.setItem('activeCarts', JSON.stringify(activeCarts));
    
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    events.push({
        state: 'desistido',
        timestamp: new Date().toISOString(),
        sessionId,
        products: products,
        total: total,
        customerName: customer.name,
        customerPhone: customer.phone,
        orderId: 'PED' + Math.floor(Math.random() * 10000)
    });
    localStorage.setItem('cartEvents', JSON.stringify(events));
}