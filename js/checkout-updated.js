// Atualizar botão de confirmação
function updateConfirmButton(total) {
    document.getElementById('confirm-btn').textContent = `Fazer Pedido - R$ ${total.toFixed(2)}`;
}

// Carregar dados do carrinho
function loadCartData() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const orderItemsContainer = document.getElementById('order-items');
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhum item no carrinho</p>';
        return;
    }
    
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="item">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">Qtd: ${item.quantity}</span>
            </div>
            <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    calculateTotals();
    loadAvailableCoupons();
}

// Calcular totais com cupom
function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    
    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon') || 'null');
    let discount = 0;
    let finalDeliveryFee = deliveryFee;
    
    if (appliedCoupon) {
        if (appliedCoupon.discount.includes('%')) {
            const percentage = parseInt(appliedCoupon.discount);
            discount = subtotal * (percentage / 100);
        } else if (appliedCoupon.discount === 'Frete Grátis') {
            finalDeliveryFee = 0;
        }
    }
    
    const total = subtotal - discount + finalDeliveryFee;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    
    const discountElement = document.getElementById('discount');
    if (discount > 0) {
        discountElement.style.display = 'block';
        const percentage = ((discount / subtotal) * 100).toFixed(0);
        discountElement.innerHTML = `
            <span style="font-weight: bold;">💰 Você está economizando ${percentage}%</span>
            <span style="font-weight: bold; font-size: 1.1em;">- R$ ${discount.toFixed(2)}</span>
        `;
    } else {
        discountElement.style.display = 'none';
    }
    
    const deliveryElement = document.getElementById('delivery-fee');
    if (finalDeliveryFee === 0) {
        deliveryElement.innerHTML = '<span style="text-decoration: line-through;">R$ 8,90</span> <span style="color: #25D366;">GRÁTIS</span>';
    } else {
        deliveryElement.textContent = `R$ ${finalDeliveryFee.toFixed(2)}`;
    }
    
    document.getElementById('total').innerHTML = `<strong>R$ ${total.toFixed(2)}</strong>`;
    updateConfirmButton(total);
}

// Carregar cupons disponíveis
async function loadAvailableCoupons() {
    const customerId = localStorage.getItem('loyaltyCustomerId') || localStorage.getItem('userId');
    const couponSelect = document.getElementById('coupon-select');
    
    if (!customerId) {
        couponSelect.innerHTML = '<option value="">Faça login para usar cupons</option>';
        return;
    }
    
    // Aguardar Supabase estar disponível
    let attempts = 0;
    while ((!window.supabase || typeof supabase === 'undefined') && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (typeof supabase === 'undefined') {
        console.error('Supabase não está carregado');
        couponSelect.innerHTML = '<option value="">Sistema indisponível</option>';
        return;
    }
    
    try {
        console.log('Carregando cupons para cliente:', customerId);
        
        const { data, error } = await supabase
            .from('cupons')
            .select('*')
            .eq('cliente_id', customerId)
            .eq('usado', false)
            .order('data_criacao', { ascending: false });
        
        if (error) {
            console.error('Erro na consulta:', error);
            throw error;
        }
        
        console.log('Cupons encontrados:', data);
        
        if (!data || data.length === 0) {
            couponSelect.innerHTML = '<option value="">Nenhum cupom disponível</option>';
            return;
        }
        
        couponSelect.innerHTML = '<option value="">Selecionar cupom</option>' + 
            data.map(coupon => 
                `<option value="${coupon.id}">${coupon.titulo} - ${coupon.desconto}</option>`
            ).join('');
            
        console.log('Cupons carregados com sucesso:', data.length);
    } catch (error) {
        console.error('Erro ao carregar cupons:', error);
        couponSelect.innerHTML = '<option value="">Erro ao carregar cupons</option>';
    }
}

// Aplicar cupom
async function applyCoupon() {
    const couponSelect = document.getElementById('coupon-select');
    const couponId = couponSelect.value;
    
    if (!couponId) {
        localStorage.removeItem('appliedCoupon');
        calculateTotals();
        return;
    }
    
    // Verificar se Supabase está disponível
    if (typeof supabase === 'undefined') {
        console.error('Supabase não está carregado');
        alert('Erro: Sistema de cupons indisponível');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('cupons')
            .select('*')
            .eq('id', couponId)
            .eq('usado', false)
            .single();
        
        if (error) {
            console.error('Erro ao buscar cupom:', error);
            alert('Cupom não encontrado ou já utilizado.');
            return;
        }
        
        const coupon = {
            id: data.id,
            title: data.titulo,
            description: data.descricao,
            discount: data.desconto
        };
        
        localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        calculateTotals();
        
        // Salvar dados do cliente no banco
        await saveCouponUsage(coupon);
        
        console.log('Cupom aplicado:', coupon);
        
    } catch (error) {
        console.error('Erro ao aplicar cupom:', error);
        alert('Erro ao aplicar cupom.');
    }
}

// Salvar dados do cliente ao aplicar cupom
async function saveCouponUsage(coupon) {
    try {
        const userId = localStorage.getItem('userId');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Obter endereço do banco
        let address = 'Endereço não informado';
        if (userId && typeof supabase !== 'undefined') {
            const { data: addressData } = await supabase
                .from('clientes')
                .select('rua, numero, complemento, bairro, cidade, cep')
                .eq('id', userId)
                .single();
            
            if (addressData && addressData.rua) {
                address = `${addressData.rua}, ${addressData.numero}${addressData.complemento ? ` - ${addressData.complemento}` : ''}, ${addressData.bairro}, ${addressData.cidade}, CEP: ${addressData.cep}`;
            }
        }
        
        // Salvar na tabela de uso de cupons
        await supabase.from('cupom_uso').insert({
            cupom_id: coupon.id,
            cliente_nome: userData.nome || 'Cliente',
            cliente_telefone: userData.whatsapp || '5511941716617',
            endereco: address,
            desconto_aplicado: coupon.discount
        });
        
        console.log('✅ Dados do cliente salvos ao aplicar cupom');
    } catch (error) {
        console.error('Erro ao salvar uso do cupom:', error);
    }
}

// Função para marcar cupom como usado
async function markCouponAsUsed(couponId) {
    if (!couponId || typeof supabase === 'undefined') return;
    
    try {
        const { error } = await supabase
            .from('cupons')
            .update({ 
                usado: true, 
                data_uso: new Date().toISOString() 
            })
            .eq('id', couponId);
        
        if (error) {
            console.error('Erro ao marcar cupom como usado:', error);
        } else {
            console.log('Cupom marcado como usado:', couponId);
        }
    } catch (error) {
        console.error('Erro ao marcar cupom como usado:', error);
    }
}

// Funções principais
function goBack() {
    window.location.href = 'index.html';
}

async function changeAddress() {
    // Pré-carregar dados do endereço atual
    try {
        const userId = localStorage.getItem('userId');
        if (userId && typeof supabase !== 'undefined') {
            const { data, error } = await supabase
                .from('clientes')
                .select('rua, numero, complemento, bairro, cidade, cep')
                .eq('id', userId)
                .single();
            
            if (!error && data) {
                document.getElementById('cep-input').value = data.cep || '';
                document.getElementById('street-input').value = data.rua || '';
                document.getElementById('number-input').value = data.numero || '';
                document.getElementById('neighborhood-input').value = data.bairro || '';
            }
        } else {
            // Fallback para localStorage
            const savedAddressData = localStorage.getItem('deliveryAddressData');
            if (savedAddressData) {
                const addressData = JSON.parse(savedAddressData);
                document.getElementById('cep-input').value = addressData.cep || '';
                document.getElementById('street-input').value = addressData.street || '';
                document.getElementById('number-input').value = addressData.number || '';
                document.getElementById('neighborhood-input').value = addressData.neighborhood || '';
            }
        }
    } catch (error) {
        console.log('Erro ao carregar dados para edição:', error);
    }
    
    document.getElementById('address-modal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

async function saveAddress() {
    const cep = document.getElementById('cep-input').value;
    const street = document.getElementById('street-input').value;
    const number = document.getElementById('number-input').value;
    const neighborhood = document.getElementById('neighborhood-input').value;
    
    if (street && number && neighborhood) {
        try {
            // Salvar no banco de dados se usuário estiver logado
            const userId = localStorage.getItem('userId');
            if (userId && typeof supabase !== 'undefined') {
                const { error } = await supabase
                    .from('clientes')
                    .update({
                        rua: street,
                        numero: number,
                        bairro: neighborhood,
                        cidade: 'Atibaia',
                        cep: cep || ''
                    })
                    .eq('id', userId);
                
                if (error) {
                    console.error('Erro ao salvar endereço no banco:', error);
                } else {
                    console.log('✅ Endereço salvo no banco de dados');
                }
            }
            
            // Salvar no localStorage como backup
            const addressText = `${street}, ${number}\n${neighborhood}, Atibaia\nCEP: ${cep}`;
            localStorage.setItem('deliveryAddress', addressText);
            localStorage.setItem('deliveryAddressData', JSON.stringify({
                cep: cep,
                street: street,
                number: number,
                complement: '',
                neighborhood: neighborhood,
                city: 'Atibaia'
            }));
            
            // Atualizar endereço na tela
            const addressInfo = document.querySelector('.address-info');
            addressInfo.innerHTML = `
                <p><strong>${street}, ${number}</strong></p>
                <p>${neighborhood} - Atibaia, SP</p>
                <p>CEP: ${cep}</p>
            `;
            
            closeModal();
            showMessage('Endereço atualizado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            showMessage('Erro ao salvar endereço. Tente novamente.', 'error');
        }
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

async function updateCustomerPoints(customerId, pointsToAdd, orderId = null, description = null) {
    try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase não disponível');
        
        // Buscar pontos atuais
        const { data: currentData, error: fetchError } = await client
            .from('clientes')
            .select('pontos')
            .eq('id', customerId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const currentPoints = currentData.pontos || 0;
        const newPoints = currentPoints + pointsToAdd;
        
        // Atualizar pontos no banco
        const { error: updateError } = await client
            .from('clientes')
            .update({ pontos: newPoints })
            .eq('id', customerId);
        
        if (updateError) throw updateError;
        
        // Registrar no histórico
        const { error: historyError } = await client
            .from('pontos_historico')
            .insert({
                cliente_id: customerId,
                pontos: pointsToAdd,
                tipo: 'ganho',
                descricao: description || `Pontos ganhos na compra`,
                pedido_id: orderId
            });
        
        if (historyError) {
            console.error('Erro ao salvar histórico:', historyError);
        }
        
        console.log(`✅ Pontos: ${currentPoints} + ${pointsToAdd} = ${newPoints}`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar pontos:', error);
    }
}

async function confirmOrder() {
    // Verificar carrinho instantaneamente
    const cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Obter dados do formulário diretamente
    const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'pix';
    const changeAmount = document.getElementById('change-amount')?.value || '';
    
    console.log('Elemento de pagamento encontrado:', paymentMethodElement);
    console.log('Valor do método de pagamento:', paymentMethod);
    console.log('Valor do troco:', changeAmount);
    const cpfCnpj = document.getElementById('cpf-cnpj')?.value || '';
    
    // Validar CPF/CNPJ se fornecido
    if (cpfCnpj && !validateCpfCnpj(cpfCnpj)) {
        showMessage('CPF/CNPJ inválido. Por favor, verifique.', 'error');
        return;
    }
    
    // Gerar ID imediatamente
    const orderId = Date.now();
    localStorage.setItem('currentOrderId', orderId.toString());
    
    // Verificar se há cupom aplicado
    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon') || 'null');
    
    // Calcular total com desconto
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    let deliveryFee = 8.90;
    let discount = 0;
    
    if (appliedCoupon) {
        if (appliedCoupon.discount.includes('%')) {
            const percentage = parseInt(appliedCoupon.discount);
            discount = subtotal * (percentage / 100);
        } else if (appliedCoupon.discount === 'Frete Grátis') {
            deliveryFee = 0;
        }
    }
    
    const total = subtotal - discount + deliveryFee;
    localStorage.setItem('currentOrderTotal', total.toFixed(2));
    
    // Salvar pedido na gestão
    await saveOrderToManagement(cart, paymentMethod, cpfCnpj, changeAmount);
    
    // Marcar cupom como usado se houver
    if (appliedCoupon && appliedCoupon.id) {
        await markCouponAsUsed(appliedCoupon.id);
        localStorage.removeItem('appliedCoupon');
        console.log('Cupom marcado como usado:', appliedCoupon.id);
    }
    
    // Atualizar pontos imediatamente
    if (typeof window.atualizarPontosAgora === 'function') {
        setTimeout(window.atualizarPontosAgora, 500);
        setTimeout(window.atualizarPontosAgora, 2000);
    }
    
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

async function saveOrderToManagement(cart, paymentMethod, cpfCnpj, changeAmount = '') {
    // Usar o ID já gerado na confirmOrder
    const orderId = parseInt(localStorage.getItem('currentOrderId'));
    
    // Obter endereço do banco de dados primeiro
    let address = 'Endereço não informado';
    
    try {
        const userId = localStorage.getItem('userId');
        if (userId && typeof supabase !== 'undefined') {
            const { data: addressData } = await supabase
                .from('clientes')
                .select('rua, numero, complemento, bairro, cidade, cep')
                .eq('id', userId)
                .single();
            
            if (addressData && addressData.rua) {
                address = `${addressData.rua}, ${addressData.numero}${addressData.complemento ? ` - ${addressData.complemento}` : ''}, ${addressData.bairro}, ${addressData.cidade}, CEP: ${addressData.cep}`;
                console.log('✅ Endereço obtido do banco:', address);
            }
        }
    } catch (error) {
        console.log('Erro ao buscar endereço do banco, tentando fallbacks...');
        
        // Fallback 1: localStorage
        const savedAddress = localStorage.getItem('deliveryAddress');
        if (savedAddress) {
            address = savedAddress.replace(/\n/g, ', ');
            console.log('✅ Endereço obtido do localStorage:', address);
        } else {
            // Fallback 2: DOM
            const addressInfo = document.querySelector('.address-info');
            if (addressInfo) {
                address = addressInfo.textContent.trim().replace(/\s+/g, ' ');
                console.log('✅ Endereço obtido do DOM:', address);
            }
        }
    }
    
    console.log('📍 Endereço capturado para pedido:', address);
    // Obter dados do usuário logado
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const customerName = userData.nome || 'Cliente';
    let customerPhone = userData.whatsapp ? userData.whatsapp.replace(/\D/g, '') : '11941716617';
    
    // Garantir que o número tenha o código do país
    if (customerPhone && !customerPhone.startsWith('55')) {
        customerPhone = '55' + customerPhone;
    }
    
    // Calcular totais rapidamente
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = subtotal + deliveryFee;
    
    // Mapear método de pagamento
    let paymentText = {
        'money': 'Dinheiro',
        'credit-card-delivery': 'Cartão de Crédito na Entrega',
        'debit-card-delivery': 'Cartão de Débito na Entrega',
        'pix': 'PIX'
    }[paymentMethod] || paymentMethod;
    
    // Adicionar informação do troco se for dinheiro
    if (paymentMethod === 'money' && changeAmount && parseFloat(changeAmount) > 0) {
        paymentText += ` (Troco para R$ ${parseFloat(changeAmount).toFixed(2)})`;
    }
    
    console.log('Método de pagamento original:', paymentMethod);
    console.log('Método de pagamento mapeado:', paymentText);
    
    // Criar objeto de pedido para o banco com itens detalhados
    const orderData = {
        id: orderId,
        customer: customerName,
        phone: customerPhone,
        date: new Date().toISOString(),
        status: paymentMethod === 'pix' ? 'aguardando_pagamento' : 'novo',
        payment_status: paymentMethod === 'pix' ? 'aguardando_comprovante' : 'pagamento_na_entrega',
        paymentMethod: paymentText,
        forma_pagamento: paymentText,
        troco: paymentMethod === 'money' && changeAmount ? parseFloat(changeAmount) : null,
        total: total,
        address: address,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        }))
    };
    
    // Tentar salvar no banco
    if (typeof supabase !== 'undefined' && typeof db !== 'undefined' && db.saveOrder) {
        // Obter dados do cliente logado
        const customerId = localStorage.getItem('userId');
        let customerName = null;
        
        // Buscar nome do cliente se estiver logado
        if (customerId && typeof supabase !== 'undefined') {
            try {
                const { data: customerData } = await supabase
                    .from('clientes')
                    .select('nome')
                    .eq('id', customerId)
                    .single();
                customerName = customerData?.nome || null;
            } catch (error) {
                console.log('Cliente não encontrado, usando dados do formulário');
            }
        }
        
        // Preparar dados para o Supabase (conforme estrutura da tabela)
        const supabaseOrderData = {
            cliente_id: customerId ? parseInt(customerId) : null,
            cliente_nome: customerName || orderData.customer,
            cliente_telefone: orderData.phone,
            valor_total: parseFloat(orderData.total),
            pontos_ganhos: Math.floor(orderData.total / 10),
            status: orderData.status,
            forma_pagamento: paymentText,
            endereco: orderData.address,
            itens_json: JSON.stringify(orderData.items)
        };
        
        console.log('Dados sendo salvos no Supabase:', supabaseOrderData);
        
        // Salvar diretamente no Supabase com dados completos incluindo itens
        try {
            const completeData = {
                id: orderId,
                cliente_nome: customerName,
                cliente_telefone: customerPhone,
                valor_total: parseFloat(orderData.total),
                status: 'novo',
                forma_pagamento: paymentText,
                endereco: orderData.address,
                itens_json: JSON.stringify(orderData.items),
                data_pedido: new Date().toISOString()
            };
            
            console.log('Dados completos para Supabase:', completeData);
            
            const { error } = await supabase
                .from('pedidos')
                .insert(completeData);
            
            if (error) {
                console.error('❌ Erro detalhado:', error.message, error.details, error.hint);
            } else {
                console.log('✅ Pedido salvo no Supabase:', orderId);
                
                // Registrar pontos no histórico
                if (customerId) {
                    const pointsToAdd = Math.floor(orderData.total / 10);
                    
                    await supabase.from('pontos_historico').insert({
                        cliente_id: parseInt(customerId),
                        pontos: pointsToAdd,
                        tipo: 'ganho',
                        descricao: `Pontos ganhos na compra #${orderId}`,
                        pedido_id: orderId
                    });
                    
                    console.log(`✅ ${pointsToAdd} pontos registrados no histórico`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao salvar no banco:', error);
        }
            
        // Salvar no localStorage como backup com itens completos
        const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        const localOrderData = {
            ...orderData,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            }))
        };
        orders.push(localOrderData);
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        console.log('✅ Pedido salvo no localStorage com itens:', localOrderData.items);
    } else {
        console.warn('⚠️ Banco de dados não disponível, salvando apenas localmente');
        
        // Salvar no localStorage se Supabase não estiver disponível com itens completos
        const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        const localOrderData = {
            ...orderData,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            }))
        };
        orders.push(localOrderData);
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        console.log('✅ Pedido salvo localmente com itens:', localOrderData.items);
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
    const changeAmount = document.getElementById('change-amount')?.value || '';
    
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
        
        message = `🍷 *Adega do Tio Pancho*\n\nOlá! Acabei de fazer o pedido #${orderId} no valor de R$ ${orderTotal}.\n\n💵 Pagamento: ${paymentText} na entrega`;
        
        // Adicionar informação do troco se for dinheiro
        if (paymentMethod === 'money' && changeAmount && parseFloat(changeAmount) > 0) {
            message += `\n💰 Troco para: R$ ${parseFloat(changeAmount).toFixed(2)}`;
        }
        
        message += `\n\nPor favor, confirme meu pedido e me informe o tempo de entrega.\n\nObrigado!`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5511941716617';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`, '_blank');
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
    loadCartData();
    updatePixValue();
    
    // Carregar endereço imediatamente
    loadSavedAddressInCheckout();
    
    // Event listeners para métodos de pagamento
    document.getElementById('money')?.addEventListener('change', function() {
        const changeInfo = document.getElementById('change-info');
        if (changeInfo) {
            changeInfo.style.display = this.checked ? 'block' : 'none';
        }
    });
    
    // Esconder campo de troco para outros métodos
    document.querySelectorAll('input[name="payment"]:not(#money)').forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                const changeInfo = document.getElementById('change-info');
                if (changeInfo) {
                    changeInfo.style.display = 'none';
                }
            }
        });
    });
});

// Função para carregar endereço salvo no checkout
async function loadSavedAddressInCheckout() {
    const addressInfo = document.querySelector('.address-info');
    if (!addressInfo) return;
    
    const userId = localStorage.getItem('userId');
    console.log('UserId encontrado:', userId);
    
    if (!userId || typeof supabase === 'undefined') {
        console.log('UserId ou Supabase não disponível');
        addressInfo.innerHTML = '<p><strong>Endereço não cadastrado</strong></p><p>Clique em "Alterar" para cadastrar</p>';
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (!error && data && data.rua) {
            addressInfo.innerHTML = `
                <p><strong>${data.rua}, ${data.numero}</strong></p>
                ${data.complemento ? `<p>${data.complemento}</p>` : ''}
                <p>${data.bairro}, ${data.cidade}</p>
                <p>CEP: ${data.cep}</p>
            `;
        } else {
            addressInfo.innerHTML = '<p><strong>Endereço não cadastrado</strong></p><p>Clique em "Alterar" para cadastrar</p>';
        }
    } catch (error) {
        addressInfo.innerHTML = '<p><strong>Endereço não cadastrado</strong></p><p>Clique em "Alterar" para cadastrar</p>';
    }
}