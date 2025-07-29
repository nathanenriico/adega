// Sistema de Fidelidade
let currentCustomer = null;

// Carregar cliente logado
document.addEventListener('DOMContentLoaded', function() {
    checkLoyaltyModal();
});

function checkLoyaltyModal() {
    const savedCustomer = localStorage.getItem('loyaltyCustomer');
    const modalSkipped = localStorage.getItem('loyaltyModalSkipped');
    
    if (!savedCustomer && !modalSkipped) {
        document.getElementById('loyalty-modal').style.display = 'block';
    } else {
        document.getElementById('loyalty-modal').style.display = 'none';
        loadCurrentCustomer();
    }
}

function closeLoyaltyModal() {
    document.getElementById('loyalty-modal').style.display = 'none';
    loadCurrentCustomer();
}

function skipLoyalty() {
    localStorage.setItem('loyaltyModalSkipped', 'true');
    closeLoyaltyModal();
}

function createModalLoyaltyAccount() {
    const name = document.getElementById('modal-loyalty-name').value.trim();
    const phone = document.getElementById('modal-loyalty-phone').value.trim();
    
    if (!name || !phone) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    if (phone.length < 10) {
        alert('Número de WhatsApp inválido!');
        return;
    }
    
    currentCustomer = {
        id: Date.now(),
        name: name,
        phone: phone,
        points: 0,
        orders: [],
        coupons: [],
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('loyaltyCustomer', JSON.stringify(currentCustomer));
    closeLoyaltyModal();
    showSuccessMessage();
    showCustomerProfile();
}

function loadCurrentCustomer() {
    const savedCustomer = localStorage.getItem('loyaltyCustomer');
    if (savedCustomer) {
        currentCustomer = JSON.parse(savedCustomer);
        showCustomerPanel();
        showCustomerProfile();
    } else {
        showLoyaltySignup();
    }
}

// Criar conta no clube de fidelidade
function createLoyaltyAccount() {
    const name = document.getElementById('loyalty-name').value.trim();
    const phone = document.getElementById('loyalty-phone').value.trim();
    
    if (!name || !phone) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Validar telefone
    if (phone.length < 10) {
        alert('Número de WhatsApp inválido!');
        return;
    }
    
    // Criar cliente
    currentCustomer = {
        id: Date.now(),
        name: name,
        phone: phone,
        points: 0,
        orders: [],
        coupons: [],
        createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    localStorage.setItem('loyaltyCustomer', JSON.stringify(currentCustomer));
    
    // Mostrar painel do cliente
    showCustomerPanel();
    showCustomerProfile();
}

// Mostrar painel do cliente
function showCustomerPanel() {
    document.getElementById('loyalty-signup').style.display = 'none';
    document.getElementById('customer-panel').style.display = 'block';
    
    // Atualizar dados na tela
    document.getElementById('customer-name-display').textContent = currentCustomer.name;
    document.getElementById('customer-points').textContent = currentCustomer.points;
    document.getElementById('customer-orders').textContent = currentCustomer.orders.length;
    document.getElementById('customer-coupons').textContent = currentCustomer.coupons.length;
}

function showCustomerProfile() {
    if (currentCustomer) {
        document.getElementById('customer-profile').style.display = 'flex';
        document.getElementById('profile-name').textContent = currentCustomer.name.split(' ')[0];
    }
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <h3>✅ Conta Criada com Sucesso!</h3>
        <p>Bem-vindo ao Clube de Fidelidade, ${currentCustomer.name}!</p>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
        showCustomerPanel();
    }, 2500);
}

// Mostrar tela de cadastro
function showLoyaltySignup() {
    document.getElementById('loyalty-signup').style.display = 'block';
    document.getElementById('customer-panel').style.display = 'none';
}

// Logout do cliente
function logoutCustomer() {
    if (confirm('Deseja sair da sua conta?')) {
        localStorage.removeItem('loyaltyCustomer');
        currentCustomer = null;
        showLoyaltySignup();
        
        // Limpar campos
        document.getElementById('loyalty-name').value = '';
        document.getElementById('loyalty-phone').value = '';
    }
}

// Fazer novo pedido via WhatsApp
function makeNewOrder() {
    const message = `🍷 *Adega do Tio Pancho*

Olá! Sou ${currentCustomer.name} e gostaria de fazer um pedido.

📊 *Meus dados:*
• Pontos acumulados: ${currentCustomer.points}
• Pedidos anteriores: ${currentCustomer.orders.length}
• Cupons disponíveis: ${currentCustomer.coupons.length}

Gostaria de ver os produtos disponíveis e fazer meu pedido! 🛒`;

    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.open(`https://wa.me/5511941716617?text=${encodedMessage}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${encodedMessage}`, '_blank');
    }
}

// Mostrar histórico de pedidos
function showOrderHistory() {
    const historyDiv = document.getElementById('order-history');
    const couponsDiv = document.getElementById('coupons-list');
    
    // Esconder cupons
    couponsDiv.style.display = 'none';
    
    // Mostrar/esconder histórico
    if (historyDiv.style.display === 'none') {
        historyDiv.style.display = 'block';
        loadOrderHistory();
    } else {
        historyDiv.style.display = 'none';
    }
}

// Carregar histórico de pedidos
function loadOrderHistory() {
    const historyList = document.getElementById('history-list');
    
    if (currentCustomer.orders.length === 0) {
        historyList.innerHTML = '<p>Nenhum pedido realizado ainda.</p>';
        return;
    }
    
    historyList.innerHTML = currentCustomer.orders.map(order => `
        <div class="history-item">
            <div class="order-info">
                <strong>Pedido #${order.id}</strong>
                <span class="order-date">${formatDate(order.date)}</span>
            </div>
            <div class="order-total">R$ ${order.total.toFixed(2)}</div>
            <div class="order-points">+${order.pointsEarned} pontos</div>
        </div>
    `).join('');
}

// Mostrar cupons
function showCoupons() {
    const historyDiv = document.getElementById('order-history');
    const couponsDiv = document.getElementById('coupons-list');
    
    // Esconder histórico
    historyDiv.style.display = 'none';
    
    // Mostrar/esconder cupons
    if (couponsDiv.style.display === 'none') {
        couponsDiv.style.display = 'block';
        loadCoupons();
    } else {
        couponsDiv.style.display = 'none';
    }
}

// Carregar cupons
function loadCoupons() {
    const couponsList = document.getElementById('available-coupons');
    
    if (currentCustomer.coupons.length === 0) {
        couponsList.innerHTML = '<p>Nenhum cupom disponível. Faça pedidos para ganhar cupons!</p>';
        return;
    }
    
    couponsList.innerHTML = currentCustomer.coupons.map(coupon => `
        <div class="coupon-item">
            <div class="coupon-info">
                <strong>${coupon.title}</strong>
                <p>${coupon.description}</p>
            </div>
            <div class="coupon-discount">${coupon.discount}</div>
            <button onclick="useCoupon('${coupon.id}')" class="use-coupon-btn">Usar Cupom</button>
        </div>
    `).join('');
}

// Usar cupom
function useCoupon(couponId) {
    const coupon = currentCustomer.coupons.find(c => c.id === couponId);
    if (!coupon) return;
    
    const message = `🍷 *Adega do Tio Pancho*

Olá! Sou ${currentCustomer.name} e gostaria de usar meu cupom:

🎁 *${coupon.title}*
${coupon.description}
Desconto: ${coupon.discount}

Gostaria de fazer um pedido usando este cupom! 🛒`;

    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.open(`https://wa.me/5511941716617?text=${encodedMessage}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${encodedMessage}`, '_blank');
    }
}

// Enviar mensagem de boas-vindas
function sendWelcomeMessage() {
    const message = `🌟 *Bem-vindo ao Clube de Fidelidade!*

Olá ${currentCustomer.name}! 

Sua conta foi criada com sucesso! Agora você pode:
✅ Acumular pontos a cada compra
📲 Receber atualizações no WhatsApp
🎁 Ganhar cupons exclusivos

Faça seu primeiro pedido e comece a acumular benefícios! 🍷`;

    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setTimeout(() => {
        if (isMobile) {
            window.open(`https://wa.me/5511941716617?text=${encodedMessage}`, '_blank');
        } else {
            window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${encodedMessage}`, '_blank');
        }
    }, 1000);
}

// Adicionar pontos (chamado quando pedido é confirmado)
function addPointsToCustomer(orderId, orderTotal) {
    if (!currentCustomer) return;
    
    const pointsEarned = Math.floor(orderTotal / 10); // 1 ponto a cada R$ 10
    currentCustomer.points += pointsEarned;
    
    // Adicionar ao histórico
    currentCustomer.orders.push({
        id: orderId,
        date: new Date().toISOString(),
        total: orderTotal,
        pointsEarned: pointsEarned
    });
    
    // Verificar se ganhou cupom
    checkForNewCoupons();
    
    // Salvar
    localStorage.setItem('loyaltyCustomer', JSON.stringify(currentCustomer));
    
    // Atualizar tela se estiver visível
    if (document.getElementById('customer-panel').style.display !== 'none') {
        showCustomerPanel();
    }
}

// Verificar novos cupons
function checkForNewCoupons() {
    const totalOrders = currentCustomer.orders.length;
    const totalPoints = currentCustomer.points;
    
    // Cupom a cada 5 pedidos
    if (totalOrders % 5 === 0 && totalOrders > 0) {
        currentCustomer.coupons.push({
            id: Date.now(),
            title: '10% OFF',
            description: 'Desconto de 10% em qualquer pedido',
            discount: '10%',
            createdAt: new Date().toISOString()
        });
    }
    
    // Cupom por pontos
    if (totalPoints >= 100 && !currentCustomer.coupons.find(c => c.title === 'Frete Grátis')) {
        currentCustomer.coupons.push({
            id: Date.now() + 1,
            title: 'Frete Grátis',
            description: 'Entrega gratuita no próximo pedido',
            discount: 'Frete Grátis',
            createdAt: new Date().toISOString()
        });
    }
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}