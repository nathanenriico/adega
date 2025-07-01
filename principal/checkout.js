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

function addCard() {
    document.getElementById('card-modal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

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
        
        // Selecionar automaticamente a opção de cartão
        document.getElementById('card').checked = true;
    } else {
        alert('Por favor, preencha todos os campos do cartão.');
    }
}

function confirmOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const cpfCnpj = document.getElementById('cpf-cnpj').value;
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    
    console.log('Confirmando pedido - Carrinho:', cart);
    console.log('Confirmando pedido - Método pagamento:', paymentMethod);
    
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Salvar pedido na gestão
    saveOrderToManagement(cart, paymentMethod, cpfCnpj);
    
    // Simular processamento do pedido
    const confirmBtn = document.querySelector('.confirm-order-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.innerHTML = 'Processando...';
    confirmBtn.disabled = true;
    
    setTimeout(() => {
        if (paymentMethod === 'pix') {
            showPixModal();
        } else {
            showSuccessMessage();
        }
        
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
    }, 2000);
}

function saveOrderToManagement(cart, paymentMethod, cpfCnpj) {
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const addressInfo = document.querySelector('.address-info');
    const address = addressInfo.textContent.trim();
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    const paymentText = {
        'pix': 'PIX',
        'card': 'Cartão de Crédito',
        'money': 'Dinheiro',
        'card-delivery': 'Cartão na Entrega'
    };
    
    const orderId = Date.now();
    const newOrder = {
        id: orderId,
        customer: 'Cliente Checkout',
        phone: '11941716617', // Número do cliente para WhatsApp
        date: new Date().toISOString(),
        status: 'novo',
        total: total,
        paymentMethod: paymentText[paymentMethod] || paymentMethod,
        address: address,
        cpfCnpj: cpfCnpj || '',
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        whatsappNotifications: [] // Histórico de notificações
    };
    
    orders.push(newOrder);
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
    
    // Salvar ID do pedido para acompanhamento
    localStorage.setItem('currentOrderId', orderId);
    
    // Limpar carrinho após salvar pedido
    localStorage.removeItem('adegaCart');
}

function showPixModal() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    console.log('PIX Modal - Carrinho:', cart);
    console.log('PIX Modal - Subtotal:', subtotal);
    console.log('PIX Modal - Total:', total);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h3>Pagamento via PIX</h3>
            <div style="background: #f5f5f5; padding: 2rem; border-radius: 8px; margin: 1rem 0;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
                <p><strong>Chave PIX:</strong></p>
                <p style="background: white; padding: 0.5rem; border-radius: 4px; font-family: monospace;">
                    11933949002@pix.com.br
                </p>
                <p style="margin-top: 1rem; color: #666;">
                    Valor: <strong>R$ ${total.toFixed(2)}</strong>
                </p>
            </div>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">
                Após o pagamento, seu pedido será confirmado automaticamente.
            </p>
            <button onclick="closePixModal()" style="background: #d4af37; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                Entendi
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closePixModal() {
    const modal = document.querySelector('.modal:last-child');
    if (modal) {
        modal.remove();
    }
    showSuccessMessage();
}

function showSuccessMessage() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 1rem;">✅</div>
            <h3 style="color: #4CAF50;">Pedido Confirmado!</h3>
            <p style="margin: 1rem 0;">Seu pedido foi recebido e está sendo preparado.</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
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
}

function closeSuccessModal() {
    const modal = document.querySelector('.modal:last-child');
    if (modal) {
        modal.remove();
    }
}

function goToWhatsApp() {
    const orderId = localStorage.getItem('currentOrderId');
    const message = encodeURIComponent(`🍷 *Adega do Tio Pancho*\n\nOlá! Acabei de fazer o pedido #${orderId}.\n\nGostaria de acompanhar o andamento pelo WhatsApp.\n\nObrigado!`);
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Mobile: Abrir app WhatsApp
        window.open(`https://wa.me/5511941716617?text=${message}`, '_blank');
    } else {
        // Desktop: Abrir WhatsApp Web
        window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${message}`, '_blank');
    }
    
    // Iniciar sistema de notificações
    initWhatsAppNotifications(orderId);
    
    closeSuccessModal();
}

// Sistema de notificações WhatsApp
function initWhatsAppNotifications(orderId) {
    // Salvar configuração de notificações
    const notificationConfig = {
        orderId: orderId,
        enabled: true,
        lastCheck: new Date().toISOString()
    };
    localStorage.setItem('whatsappNotifications', JSON.stringify(notificationConfig));
    
    // Iniciar monitoramento de mudanças de status
    startOrderStatusMonitoring();
}

// Monitorar mudanças de status do pedido
function startOrderStatusMonitoring() {
    const checkInterval = setInterval(() => {
        const config = JSON.parse(localStorage.getItem('whatsappNotifications'));
        if (!config || !config.enabled) {
            clearInterval(checkInterval);
            return;
        }
        
        checkOrderStatusChange(config.orderId);
    }, 5000); // Verificar a cada 5 segundos
}

function checkOrderStatusChange(orderId) {
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    const lastNotification = order.whatsappNotifications?.slice(-1)[0];
    const currentStatus = order.status;
    
    // Se status mudou, enviar notificação
    if (!lastNotification || lastNotification.status !== currentStatus) {
        sendWhatsAppNotification(order, currentStatus);
    }
}

function sendWhatsAppNotification(order, newStatus) {
    const statusMessages = {
        'preparando': `🍷 *Pedido #${order.id}*\n\n✅ Seu pedido está sendo preparado!\n\nTempo estimado: 30-40 minutos\n\n_Adega do Tio Pancho_`,
        'saindo': `🍷 *Pedido #${order.id}*\n\n🚚 Seu pedido está a caminho!\n\nO entregador já saiu e chegará em breve.\n\n_Adega do Tio Pancho_`,
        'entregue': `🍷 *Pedido #${order.id}*\n\n🎉 Pedido entregue com sucesso!\n\nObrigado pela preferência!\n\n⭐ Avalie nosso atendimento\n\n_Adega do Tio Pancho_`
    };
    
    const message = statusMessages[newStatus];
    if (!message) return;
    
    // Abrir WhatsApp Web com mensagem automática
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://web.whatsapp.com/send?phone=${order.phone}&text=${encodedMessage}`, '_blank');
    
    // Registrar notificação enviada
    const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === order.id);
    
    if (orderIndex !== -1) {
        if (!orders[orderIndex].whatsappNotifications) {
            orders[orderIndex].whatsappNotifications = [];
        }
        
        orders[orderIndex].whatsappNotifications.push({
            status: newStatus,
            message: message,
            sentAt: new Date().toISOString()
        });
        
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
    }
}

function showMessage(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Formatação de CPF/CNPJ
document.getElementById('cpf-cnpj').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        // CPF
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    e.target.value = value;
});

// Formatação de cartão
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Mostrar campo de troco quando dinheiro for selecionado
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment') {
        const changeInput = document.getElementById('change-amount');
        if (e.target.value === 'money') {
            changeInput.style.display = 'block';
        } else {
            changeInput.style.display = 'none';
        }
    }
});

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});