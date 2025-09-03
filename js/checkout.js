function showPixModal(orderId) {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    console.log('PIX Modal - Carrinho:', cart);
    console.log('PIX Modal - Subtotal:', subtotal);
    console.log('PIX Modal - Total:', total);
    
    // Obter dados da conta
    const accountInfo = PixStatic.getAccountInfo();
    
    // Gerar QR Code
    const qrCodeUrl = PixStatic.generateQrCodeUrl(total);
    
    // Calcular tempo de expiração
    const expirationDate = new Date(Date.now() + 5 * 60000);
    const expirationTime = expirationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'pix-payment-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h3>Pagamento via PIX</h3>
            <div class="pix-payment-container">
                <div class="pix-qrcode" id="pix-qrcode-container">
                    <img src="${qrCodeUrl}" alt="QR Code PIX" style="width: 100%; height: 100%;">
                </div>
                
                <p>Faça uma transferência PIX para a conta abaixo:</p>
                
                <div class="pix-info" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <p><strong>Chave PIX:</strong> ${accountInfo.pixKey}</p>
                    <p><strong>Agência:</strong> ${accountInfo.agency}</p>
                    <p><strong>Conta:</strong> ${accountInfo.account}</p>
                    <p><strong>Valor:</strong> R$ ${total.toFixed(2)}</p>
                    <p style="color: #F44336; font-weight: bold; text-align: center; margin-top: 10px;">
                        Favor transferir o valor exato: R$ ${total.toFixed(2)}
                    </p>
                </div>
                
                <div class="pix-code-container">
                    <p><strong>Copiar chave PIX:</strong></p>
                    <div class="pix-code" id="pix-code">${accountInfo.pixKey}</div>
                    <button class="copy-button" onclick="copyPixCode()" title="Copiar chave PIX">📋</button>
                </div>
                
                <div class="pix-status status-waiting" id="pix-status">
                    Aguardando pagamento...
                </div>
                
                <div class="pix-timer">
                    <span id="pix-timer-text">Tempo restante: 05:00</span>
                    <div class="pix-timer-bar">
                        <div class="pix-timer-progress" id="pix-timer-progress"></div>
                    </div>
                </div>
            </div>
            
            <p style="font-size: 0.9rem; color: #666; margin: 1rem 0;">
                Após o pagamento, clique em "Já paguei" para confirmar.
            </p>
            
            <div style="margin-top: 1rem;">
                <button onclick="cancelPixPayment()" style="background: #666; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">
                    Cancelar
                </button>
                <button onclick="checkPixPaymentManually()" style="background: #d4af37; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                    Já paguei
                </button>


            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Iniciar timer de expiração
    startPixTimer(5 * 60); // 5 minutos em segundos
}