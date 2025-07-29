// Atualizar botão de confirmação
function updateConfirmButton(total) {
    document.getElementById('confirm-btn').textContent = `Fazer Pedido - R$ ${total.toFixed(2)}`;
}

// Carregar dados do carrinho
function loadCartData() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const orderItemsContainer = document.getElementById('order-items');
    
    console.log('Checkout - Carrinho carregado:', cart);
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhum item no carrinho</p>';
        return;
    }
    
    // Renderizar itens do carrinho
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="item">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">Qtd: ${item.quantity}</span>
            </div>
            <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    // Calcular totais
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    // Atualizar valores na tela
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').innerHTML = `<strong>R$ ${total.toFixed(2)}</strong>`;
    updateConfirmButton(total);
}

// Funções principais
function goBack() {
    window.history.back();
}

function changeAddress() {
    document.getElementById('address-modal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function saveAddress() {
    const cep = document.getElementById('cep-input').value;
    const street = document.getElementById('street-input').value;
    const number = document.getElementById('number-input').value;
    const neighborhood = document.getElementById('neighborhood-input').value;
    
    if (street && number && neighborhood) {
        // Atualizar endereço na tela
        const addressInfo = document.querySelector('.address-info');
        addressInfo.innerHTML = `
            <p><strong>${street}, ${number}</strong></p>
            <p>${neighborhood} - Atibaia, SP</p>
            <p>CEP: ${cep}</p>
        `;
        
        closeModal();
        showMessage('Endereço atualizado com sucesso!');
    } else {
        alert('Por favor, preencha todos os campos obrigatórios.');
    }
}

function saveCard() {
    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (cardNumber && cardName && cardExpiry && cardCvv) {
        closeModal();
        showMessage('Cartão adicionado com sucesso!');
    } else {
        alert('Por favor, preencha todos os campos do cartão.');
    }
}

function confirmOrder() {
    // Verificar carrinho instantaneamente
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Obter dados do formulário diretamente
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const cpfCnpj = document.getElementById('cpf-cnpj')?.value || '';
    
    // Validar CPF/CNPJ se fornecido
    if (cpfCnpj && !validateCpfCnpj(cpfCnpj)) {
        showMessage('CPF/CNPJ inválido. Por favor, verifique.', 'error');
        return;
    }
    
    // Gerar ID imediatamente
    const orderId = Date.now();
    localStorage.setItem('currentOrderId', orderId.toString());
    
    // Calcular total
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    localStorage.setItem('currentOrderTotal', total.toFixed(2));
    
    // Salvar pedido na gestão
    saveOrderToManagement(cart, paymentMethod, cpfCnpj);
    
    // Mostrar confirmação imediatamente
    if (paymentMethod === 'pix') {
        // Para PIX, mostrar tela de pagamento PIX
        showSimplePixPayment(orderId);
    } else {
        // Para métodos de pagamento na entrega, mostrar mensagem de pedido recebido
        showDeliveryPaymentMessage(orderId, paymentMethod);
    }
}

// Função para validar CPF/CNPJ
function validateCpfCnpj(value) {
    // Remover caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');
    
    // Se estiver vazio, considerar válido (campo opcional)
    if (!cleanValue) return true;
    
    // Validar CPF (11 dígitos)
    if (cleanValue.length === 11) {
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleanValue)) return false;
        
        // Implementação simplificada - em produção, usar validação completa
        return true;
    }
    
    // Validar CNPJ (14 dígitos)
    if (cleanValue.length === 14) {
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cleanValue)) return false;
        
        // Implementação simplificada - em produção, usar validação completa
        return true;
    }
    
    // Se não for CPF nem CNPJ, inválido
    return false;
}

function saveOrderToManagement(cart, paymentMethod, cpfCnpj) {
    // Usar o ID já gerado na confirmOrder
    const orderId = parseInt(localStorage.getItem('currentOrderId'));
    
    // Obter dados mínimos necessários
    const addressInfo = document.querySelector('.address-info');
    const address = addressInfo ? addressInfo.textContent.trim() : 'Endereço não informado';
    const customerName = document.getElementById('customer-name')?.value || 'Cliente';
    const customerPhone = document.getElementById('customer-phone')?.value || '11941716617';
    
    // Calcular totais rapidamente
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    // Mapear método de pagamento
    const paymentText = {
        'money': 'Dinheiro',
        'credit-card-delivery': 'Cartão de Crédito na Entrega',
        'debit-card-delivery': 'Cartão de Débito na Entrega',
        'pix': 'PIX'
    }[paymentMethod] || paymentMethod;
    
    // Criar objeto de pedido para o banco
    const orderData = {
        id: orderId,
        customer: customerName,
        phone: customerPhone,
        date: new Date().toISOString(),
        status: paymentMethod === 'pix' ? 'aguardando_pagamento' : 'novo',
        payment_status: paymentMethod === 'pix' ? 'aguardando_comprovante' : 'pagamento_na_entrega',
        paymentMethod: paymentText,
        total: total,
        address: address,
        items: cart
    };
    
    // Salvar no localStorage imediatamente
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    orders.push(orderData);
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
    
    // Tentar salvar no banco em background
    if (typeof db !== 'undefined' && db.saveOrder) {
        db.saveOrder(orderData).then(() => {
            console.log('Pedido salvo no banco:', orderId);
        }).catch(error => {
            console.error('Erro ao salvar no banco:', error);
        });
    }
    
    return orderId;
}

function showDeliveryPaymentMessage(orderId, paymentMethod) {
    // Redirecionar diretamente para WhatsApp
    goToWhatsAppWithOrder(orderId, paymentMethod);
}

// WhatsApp Bot Functions
let currentBotPhone = '11999999999'; // Simular número do cliente

function toggleWhatsAppBot() {
    const botContainer = document.getElementById('whatsapp-bot-container');
    if (botContainer.style.display === 'none' || !botContainer.style.display) {
        botContainer.style.display = 'flex';
        // Fechar outros chats
        document.getElementById('chatbot-container').classList.remove('active');
    } else {
        botContainer.style.display = 'none';
    }
}

function handleWhatsAppBotInput(event) {
    if (event.key === 'Enter') {
        sendWhatsAppBotMessage();
    }
}

function sendWhatsAppBotMessage() {
    const input = document.getElementById('whatsapp-bot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addWhatsAppBotMessage(message, 'user');
    input.value = '';
    
    // Processar com o bot
    setTimeout(() => {
        const response = whatsappBot.processMessage(currentBotPhone, message);
        addWhatsAppBotMessage(response.message, 'bot');
        
        // Salvar na gestão se necessário
        if (response.saveToManagement && response.orderData) {
            if (response.orderData.type !== 'human_transfer') {
                const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
                orders.push(response.orderData);
                localStorage.setItem('adegaOrders', JSON.stringify(orders));
                
                // Mostrar notificação
                showBotOrderNotification(response.orderData.id);
            }
        }
    }, 1000);
}

function addWhatsAppBotMessage(message, sender) {
    const messagesContainer = document.getElementById('whatsapp-bot-messages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'user-message-whatsapp';
    } else {
        messageDiv.className = 'bot-message whatsapp-style';
    }
    
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showBotOrderNotification(orderId) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #25D366;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
    `;
    
    notification.innerHTML = `🤖 Novo pedido via Bot: #${orderId}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Função para mostrar uma aba de pagamento PIX simples
function showSimplePixPayment(orderId) {
    // Redirecionar diretamente para WhatsApp
    goToWhatsAppWithOrder(orderId, 'pix');
}

// Função removida - confirmação PIX agora é feita apenas na gestão de pedidos

function closeSuccessModal() {
    const modal = document.querySelector('.modal:last-child');
    if (modal) {
        modal.remove();
    }
}

// Função para mostrar mensagem de sucesso após pagamento PIX
function showSuccessMessage() {
    const orderId = localStorage.getItem('currentOrderId');
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const order = orders.find(o => o.id == orderId);
    
    if (!order) {
        console.error('Pedido não encontrado');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 1rem;">✅</div>
            <h3 style="color: #4CAF50;">Pedido Pago e Confirmado!</h3>
            <p style="margin: 1rem 0;">Seu pagamento foi aprovado e seu pedido foi recebido e está sendo preparado.</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p><strong>Número do pedido:</strong> #${orderId}</p>
                <p><strong>Status do pagamento:</strong> <span style="color: #4CAF50;">Confirmado ✅</span></p>
                <p><strong>Tempo estimado:</strong> 45-55 minutos</p>
                <p><strong>Acompanhe pelo WhatsApp:</strong> (11) 93394-9002</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">Pedido salvo na gestão de pedidos!</p>
            </div>
            <button onclick="goToWhatsApp()" style="background: #25D366; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">
                Acompanhar no WhatsApp
            </button>
            <button onclick="closeSuccessModal()" style="background: #d4af37; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Limpar carrinho após confirmação
    localStorage.removeItem('adegaCart');
    localStorage.removeItem('checkoutCart');
}

function goToWhatsAppWithOrder(orderId, paymentMethod) {
    const orderTotal = localStorage.getItem('currentOrderTotal') || '0.00';
    
    // Mensagens diferentes por forma de pagamento
    let message;
    
    if (paymentMethod === 'pix') {
        message = `🍷 *Adega do Tio Pancho*\n\nOlá! Acabei de fazer o pedido #${orderId} no valor de R$ ${orderTotal}.\n\n💳 Realizei o pagamento via PIX e estou enviando o comprovante.\n\nPor favor, confirme o recebimento para liberar meu pedido.\n\nObrigado!`;
    } else {
        const paymentText = {
            'money': 'Dinheiro',
            'credit-card-delivery': 'Cartão de Crédito',
            'debit-card-delivery': 'Cartão de Débito'
        }[paymentMethod] || 'na entrega';
        
        message = `🍷 *Adega do Tio Pancho*\n\nOlá! Acabei de fazer o pedido #${orderId} no valor de R$ ${orderTotal}.\n\n💵 Pagamento: ${paymentText} na entrega\n\nPor favor, confirme meu pedido e me informe o tempo de entrega.\n\nObrigado!`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.open(`https://wa.me/5511941716617?text=${encodedMessage}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${encodedMessage}`, '_blank');
    }
    
    // Limpar carrinho após finalizar
    localStorage.removeItem('adegaCart');
    localStorage.removeItem('checkoutCart');
}

// Função legacy para compatibilidade
function goToWhatsApp() {
    const orderId = localStorage.getItem('currentOrderId');
    goToWhatsAppWithOrder(orderId, 'pix');
}

function showMessage(text, type = 'success') {
    const message = document.createElement('div');
    
    // Definir cores com base no tipo
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = '#4CAF50';
            break;
        case 'error':
            backgroundColor = '#F44336';
            break;
        case 'warning':
            backgroundColor = '#FFC107';
            break;
        case 'info':
            backgroundColor = '#2196F3';
            break;
        default:
            backgroundColor = '#4CAF50';
    }
    
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 80%;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Função para mostrar abas de pagamento
function showPaymentTab(tab) {
    // Atualizar abas
    document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="showPaymentTab('${tab}')"]`).classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.payment-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-payment`).classList.add('active');
    
    // Limpar seleções anteriores
    document.querySelectorAll('input[name="payment"]').forEach(input => input.checked = false);
    
    // Selecionar primeira opção da aba ativa
    const firstOption = document.querySelector(`#${tab}-payment input[name="payment"]`);
    if (firstOption) firstOption.checked = true;
    
    // Mostrar/esconder campo de troco
    const changeAmount = document.getElementById('change-amount');
    if (changeAmount) {
        changeAmount.style.display = (tab === 'delivery' && document.getElementById('money').checked) ? 'block' : 'none';
    }
}

// Atualizar valor do PIX no carregamento da página
function updatePixValue() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    // Atualizar valor
    const pixValueElement = document.getElementById('pix-value');
    if (pixValueElement) {
        pixValueElement.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Carregar dados quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de checkout carregada, carregando dados do carrinho...');
    loadCartData();
    
    // Carregar endereço salvo
    loadSavedAddressInCheckout();
    
    // Atualizar valor do PIX
    updatePixValue();
    
    // Adicionar listener para o campo de troco
    document.getElementById('money')?.addEventListener('change', function() {
        document.getElementById('change-amount').style.display = this.checked ? 'block' : 'none';
    });
});

// Função para carregar endereço salvo no checkout
function loadSavedAddressInCheckout() {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
        const addressInfo = document.querySelector('.address-info');
        if (addressInfo) {
            const lines = savedAddress.split('\n');
            addressInfo.innerHTML = `
                <p><strong>${lines[0]}</strong></p>
                <p>${lines[1]}</p>
                <p>${lines[2]}</p>
            `;
        }
    }
}