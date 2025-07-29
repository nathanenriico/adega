// Sistema de Bot WhatsApp para Pedidos
class WhatsAppBot {
    constructor() {
        this.currentSession = null;
        this.sessionTimeout = 300000; // 5 minutos
    }

    // Processar mensagem do cliente
    processMessage(customerPhone, message) {
        const session = this.getOrCreateSession(customerPhone);
        const response = this.generateResponse(session, message);
        
        // Salvar na gestão se necessário
        if (response.saveToManagement) {
            this.saveToOrderManagement(session, response.orderData);
        }
        
        return response;
    }

    // Obter ou criar sessão
    getOrCreateSession(customerPhone) {
        const sessionKey = `whatsapp_session_${customerPhone}`;
        let session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
        
        if (!session || this.isSessionExpired(session)) {
            session = {
                phone: customerPhone,
                step: 'greeting',
                cart: [],
                customerData: null,
                startTime: Date.now(),
                lastActivity: Date.now()
            };
        }
        
        session.lastActivity = Date.now();
        localStorage.setItem(sessionKey, JSON.stringify(session));
        return session;
    }

    // Verificar se sessão expirou
    isSessionExpired(session) {
        return (Date.now() - session.lastActivity) > this.sessionTimeout;
    }

    // Gerar resposta baseada no contexto
    generateResponse(session, message) {
        const msg = message.toLowerCase().trim();
        
        switch (session.step) {
            case 'greeting':
                return this.handleGreeting(session, msg);
            case 'menu':
                return this.handleMenu(session, msg);
            case 'adding_items':
                return this.handleAddingItems(session, msg);
            case 'checkout':
                return this.handleCheckout(session, msg);
            case 'payment':
                return this.handlePayment(session, msg);
            default:
                return this.handleDefault(session, msg);
        }
    }

    // Saudação inicial
    handleGreeting(session, message) {
        session.step = 'menu';
        
        return {
            message: `🍷 *Olá! Bem-vindo à Adega do Tio Pancho!*

Sou seu assistente virtual especializado em pedidos. Como posso ajudar?

*Menu Principal:*
1️⃣ Ver produtos disponíveis
2️⃣ Fazer pedido
3️⃣ Acompanhar pedido existente
4️⃣ Falar com atendente humano

Digite o número da opção desejada.`,
            saveToManagement: false
        };
    }

    // Menu principal
    handleMenu(session, message) {
        switch (message) {
            case '1':
                return this.showProducts(session);
            case '2':
                session.step = 'adding_items';
                return this.startOrder(session);
            case '3':
                return this.trackOrder(session);
            case '4':
                return this.transferToHuman(session);
            default:
                return {
                    message: `Por favor, digite apenas o número da opção (1, 2, 3 ou 4).`,
                    saveToManagement: false
                };
        }
    }

    // Mostrar produtos
    showProducts(session) {
        const products = JSON.parse(localStorage.getItem('adegaProducts') || '[]');
        
        let productList = `🍷 *Produtos Disponíveis:*\n\n`;
        products.forEach((product, index) => {
            productList += `${index + 1}️⃣ ${product.name}\nR$ ${product.price.toFixed(2)}\n\n`;
        });
        
        productList += `Para fazer pedido, digite *2* no menu principal.`;
        
        return {
            message: productList,
            saveToManagement: false
        };
    }

    // Iniciar pedido
    startOrder(session) {
        const products = JSON.parse(localStorage.getItem('adegaProducts') || '[]');
        
        let message = `🛒 *Vamos fazer seu pedido!*\n\n`;
        products.forEach((product, index) => {
            message += `${index + 1} - ${product.name} - R$ ${product.price.toFixed(2)}\n`;
        });
        
        message += `\n*Como pedir:*\nDigite o número do produto seguido da quantidade\nExemplo: "1 2" (2 unidades do produto 1)\n\nOu digite "finalizar" para concluir o pedido.`;
        
        return {
            message: message,
            saveToManagement: false
        };
    }

    // Adicionar itens
    handleAddingItems(session, message) {
        if (message === 'finalizar') {
            if (session.cart.length === 0) {
                return {
                    message: `Seu carrinho está vazio. Adicione produtos antes de finalizar.`,
                    saveToManagement: false
                };
            }
            session.step = 'checkout';
            return this.showCheckout(session);
        }

        const parts = message.split(' ');
        if (parts.length !== 2) {
            return {
                message: `Formato inválido. Use: número_produto quantidade\nExemplo: "1 2"`,
                saveToManagement: false
            };
        }

        const productIndex = parseInt(parts[0]) - 1;
        const quantity = parseInt(parts[1]);
        const products = JSON.parse(localStorage.getItem('adegaProducts') || '[]');

        if (productIndex < 0 || productIndex >= products.length || quantity <= 0) {
            return {
                message: `Produto ou quantidade inválida. Tente novamente.`,
                saveToManagement: false
            };
        }

        const product = products[productIndex];
        const existingItem = session.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            session.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        const total = session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
            message: `✅ ${product.name} (${quantity}x) adicionado ao carrinho!\n\n*Carrinho atual:*\n${this.formatCart(session.cart)}\n\n*Total: R$ ${total.toFixed(2)}*\n\nContinue adicionando produtos ou digite "finalizar".`,
            saveToManagement: false
        };
    }

    // Mostrar checkout
    showCheckout(session) {
        const total = session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 8.90;
        const finalTotal = total + deliveryFee;

        return {
            message: `🛒 *Resumo do Pedido:*\n\n${this.formatCart(session.cart)}\n\nSubtotal: R$ ${total.toFixed(2)}\nTaxa de entrega: R$ ${deliveryFee.toFixed(2)}\n*Total: R$ ${finalTotal.toFixed(2)}*\n\n*Formas de pagamento:*\n1️⃣ PIX\n2️⃣ Dinheiro na entrega\n3️⃣ Cartão na entrega\n\nDigite o número da forma de pagamento.`,
            saveToManagement: false
        };
    }

    // Processar pagamento
    handlePayment(session, message) {
        const paymentMethods = {
            '1': 'PIX',
            '2': 'Dinheiro',
            '3': 'Cartão'
        };

        if (!paymentMethods[message]) {
            return {
                message: `Opção inválida. Digite 1 (PIX), 2 (Dinheiro) ou 3 (Cartão).`,
                saveToManagement: false
            };
        }

        const orderId = Date.now();
        const total = session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 8.90;

        const orderData = {
            id: orderId,
            customer: 'Cliente WhatsApp',
            phone: session.phone,
            date: new Date().toISOString(),
            status: 'novo',
            total: total,
            paymentMethod: paymentMethods[message],
            items: session.cart,
            source: 'whatsapp_bot'
        };

        // Limpar sessão
        localStorage.removeItem(`whatsapp_session_${session.phone}`);

        return {
            message: `✅ *Pedido confirmado!*\n\nNúmero: #${orderId}\nTotal: R$ ${total.toFixed(2)}\nPagamento: ${paymentMethods[message]}\n\nSeu pedido foi enviado para nossa cozinha!\nTempo estimado: 45-55 minutos\n\nObrigado pela preferência! 🍷`,
            saveToManagement: true,
            orderData: orderData
        };
    }

    // Transferir para humano
    transferToHuman(session) {
        return {
            message: `🤝 *Transferindo para atendente humano...*\n\nUm de nossos atendentes entrará em contato em breve.\n\nEnquanto isso, você pode:\n• Acessar nossa gestão de pedidos\n• Fazer pedido pelo site\n• Aguardar o contato\n\nObrigado pela paciência!`,
            saveToManagement: true,
            orderData: {
                type: 'human_transfer',
                phone: session.phone,
                timestamp: new Date().toISOString(),
                context: session
            }
        };
    }

    // Salvar na gestão de pedidos
    saveToOrderManagement(session, orderData) {
        if (orderData.type === 'human_transfer') {
            // Registrar transferência
            const transfers = JSON.parse(localStorage.getItem('humanTransfers') || '[]');
            transfers.push(orderData);
            localStorage.setItem('humanTransfers', JSON.stringify(transfers));
        } else {
            // Salvar pedido normal
            const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
            orders.push(orderData);
            localStorage.setItem('adegaOrders', JSON.stringify(orders));
        }
    }

    // Formatar carrinho
    formatCart(cart) {
        return cart.map(item => 
            `• ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
    }

    // Resposta padrão
    handleDefault(session, message) {
        return {
            message: `Não entendi sua mensagem. Digite "menu" para ver as opções disponíveis.`,
            saveToManagement: false
        };
    }
}

// Instância global do bot
const whatsappBot = new WhatsAppBot();

// Função para simular resposta do bot (para demonstração)
function simulateBotResponse(customerPhone, message) {
    return whatsappBot.processMessage(customerPhone, message);
}