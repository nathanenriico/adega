// Integração com Chatbot WhatsApp
function sendOrderToChatbot() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
    
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Calcular totais
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 80 ? 0 : 8.90;
    const total = subtotal + deliveryFee;
    
    // Gerar ID do pedido
    const orderId = Date.now();
    
    // Montar mensagem para o chatbot
    let message = `🍷 *Pedido da Adega do Tio Pancho*\n\n`;
    message += `📋 *Pedido #${orderId}*\n\n`;
    message += `👤 *Cliente:* ${customerData.name || 'Cliente Site'}\n`;
    message += `📱 *Telefone:* ${customerData.phone || 'Não informado'}\n`;
    message += `📧 *Email:* ${customerData.email || 'Não informado'}\n\n`;
    
    message += `🛒 *Itens do Pedido:*\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Quantidade: ${item.quantity}x\n`;
        message += `   Preço unitário: R$ ${item.price.toFixed(2)}\n`;
        message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💰 *Resumo Financeiro:*\n`;
    message += `Subtotal produtos: R$ ${subtotal.toFixed(2)}\n`;
    message += `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}\n`;
    message += `*TOTAL GERAL: R$ ${total.toFixed(2)}*\n\n`;
    
    message += `⏰ *Pedido realizado em:* ${new Date().toLocaleString('pt-BR')}\n\n`;
    message += `🤖 *Pedido enviado automaticamente do site para processamento via chatbot inteligente.*`;
    
    // Salvar pedido localmente
    const orderData = {
        id: orderId,
        customer: customerData.name || 'Cliente Site',
        items: cart,
        total: total,
        status: 'chatbot_processing',
        paymentMethod: 'A definir',
        date: new Date().toISOString(),
        source: 'website'
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('adegaOrders', JSON.stringify(existingOrders));
    
    // Detectar dispositivo e abrir WhatsApp
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappNumber = '5511000000000';
    
    // Adicionar identificador para iniciar bot automaticamente
    message += `\n\n🤖 INICIAR_BOT_AUTOMATICO`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = isMobile 
        ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
        : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    // Abrir WhatsApp e iniciar bot automaticamente
    window.open(whatsappUrl, '_blank');
    
    // Notificar que o bot deve iniciar
    console.log('🤖 Pedido enviado para bot automático no número:', whatsappNumber);
    
    // Mostrar confirmação
    showChatbotConfirmation(orderId);
}

// Mostrar confirmação de envio para chatbot
function showChatbotConfirmation(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 500px;">
            <h3>🤖 Pedido Enviado para Chatbot!</h3>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 4rem;">✅</div>
                <p><strong>Pedido #${orderId}</strong></p>
            </div>
            
            <div style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h4>🧠 Atendimento com Inteligência Artificial</h4>
                <p>Seu pedido foi enviado para nosso chatbot inteligente!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                <h4>🤖 O que acontece agora:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>✅ ChatGPT-4 recebeu seu pedido automaticamente</li>
                    <li>🧠 IA vai processar e responder inteligentemente</li>
                    <li>📍 Vai solicitar confirmação do endereço</li>
                    <li>💳 Vai oferecer formas de pagamento (PIX preferencial)</li>
                    <li>🚚 Vai calcular frete e confirmar entrega</li>
                    <li>✅ Vai finalizar a venda automaticamente</li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>📱 Continue no WhatsApp!</strong></p>
                <p>O chatbot já está processando seu pedido com IA.</p>
                <p><strong>Número:</strong> (11) 00000-0000</p>
            </div>
            
            <button onclick="closeChatbotModal()" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: bold;">
                🍷 Entendi! Vou ao WhatsApp
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fechar modal
function closeChatbotModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

// Tornar função global
window.sendOrderToChatbot = sendOrderToChatbot;