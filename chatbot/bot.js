const { Client, LocalAuth } = require('whatsapp-web.js');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode-terminal');

// Configurações
const OPENAI_API_KEY = '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';
const SUPABASE_URL = 'https://vtrgtorablofhmhizrjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4';

// Inicializar clientes
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Contexto otimizado para ChatGPT
const SYSTEM_PROMPT = `Você é um atendente virtual especializado da Adega do Tio Pancho, uma adega premium com delivery.

INFORMAÇÕES DA EMPRESA:
- Nome: Adega do Tio Pancho
- Horário: Segunda a Domingo, 18h às 02h
- Telefone: (11) 00000-0000
- Taxa de entrega: R$ 8,90 (GRÁTIS acima de R$ 80)
- Tempo de entrega: 45-60 minutos
- PIX: 11000000000 (NuBank - Adega do Tio Pancho)

PRODUTOS E PREÇOS:
🍺 CERVEJAS:
- Heineken 600ml: R$ 12,90
- Stella Artois 550ml: R$ 11,50
- Corona 355ml: R$ 9,90
- Brahma 350ml: R$ 4,50
- Skol 350ml: R$ 4,00

🍷 VINHOS:
- Vinho Tinto Seco: R$ 45,90
- Vinho Branco Suave: R$ 42,90
- Espumante Brut: R$ 38,90

🥃 DESTILADOS:
- Whisky Red Label: R$ 89,90
- Vodka Smirnoff: R$ 35,90
- Cachaça 51: R$ 18,90

🥤 BEBIDAS:
- Refrigerante 2L: R$ 8,90
- Água 500ml: R$ 3,50
- Energético: R$ 7,90

INSTRUÇÕES DE ATENDIMENTO:
1. Seja extremamente cordial, use emojis e linguagem natural
2. Para pedidos do site, confirme os dados e colete endereço
3. Sempre ofereça PIX como forma preferencial (mais rápido)
4. Calcule totais automaticamente e informe frete
5. Confirme todos os dados antes de finalizar
6. Seja proativo em sugerir produtos complementares
7. Mantenha tom profissional mas amigável
8. Sempre finalize com dados de contato e tempo de entrega

FLUXO DE VENDA:
1. Receber pedido/saudação
2. Confirmar produtos e quantidades
3. Coletar endereço completo
4. Oferecer formas de pagamento (PIX preferencial)
5. Calcular total com frete
6. Confirmar todos os dados
7. Finalizar com dados PIX e tempo de entrega

Responda sempre de forma natural, prestativa e focada em fechar a venda!`;

// Estado das conversas
const userSessions = new Map();

console.log('🤖 Iniciando Chatbot Adega do Tio Pancho...');

client.on('qr', qr => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO:\n');
    qrcode.generate(qr, {small: true});
    console.log('\n✅ Abra WhatsApp > Dispositivos Conectados > Escaneie o código\n');
});

client.on('ready', () => {
    console.log('🍷 Chatbot Adega do Tio Pancho conectado!');
    console.log('🤖 Atendimento automático ativo no número: (11) 00000-0000');
    console.log('🚀 ChatGPT-4 configurado para vendas automáticas');
    console.log('🔗 Integração com checkout do site ativa');
    console.log('💾 Salvamento automático no Supabase configurado');
    console.log('\n✅ Sistema pronto para receber pedidos!');
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado!');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para gerar resposta com ChatGPT
async function generateResponse(message, customerName = 'Cliente', context = '') {
    try {
        const fullPrompt = context ? `${SYSTEM_PROMPT}\n\nCONTEXTO ADICIONAL: ${context}` : SYSTEM_PROMPT;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: fullPrompt },
                { role: "user", content: `Cliente ${customerName} disse: "${message}"` }
            ],
            max_tokens: 500,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erro ChatGPT:', error);
        return `🍷 *Adega do Tio Pancho*\n\nOlá! Bem-vindo à nossa adega! 🍻\n\nComo posso ajudá-lo hoje?\n\n📋 *Temos:*\n• Cervejas geladas\n• Vinhos selecionados\n• Destilados premium\n• Delivery rápido\n\n📱 (11) 00000-0000`;
    }
}

// Detectar pedidos do checkout
function isCheckoutOrder(message) {
    return message.includes('Pedido da Adega') || 
           message.includes('Total:') || 
           message.includes('Itens:') ||
           message.includes('Pedido #') ||
           message.includes('INICIAR_BOT_AUTOMATICO') ||
           message.match(/R\$\s*\d+[,.]?\d*/);
}

// Processar pedido do checkout
async function processCheckoutOrder(message, phone, customerName) {
    try {
        // Extrair dados do pedido
        const orderIdMatch = message.match(/Pedido #(\d+)/);
        const totalMatch = message.match(/Total:\s*R\$\s*([\d,]+\.?\d*)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : Date.now();
        const total = totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : 0;
        
        // Salvar no Supabase
        const orderData = {
            id: parseInt(orderId),
            cliente_nome: customerName,
            cliente_telefone: phone,
            valor_total: total,
            status: 'novo',
            forma_pagamento: 'A definir',
            endereco: 'A coletar',
            data_pedido: new Date().toISOString(),
            origem: 'chatbot_checkout'
        };
        
        await supabase.from('pedidos').insert(orderData);
        console.log(`✅ Pedido #${orderId} salvo no banco`);
        
        return orderId;
    } catch (error) {
        console.error('❌ Erro ao processar pedido:', error);
        return null;
    }
}

client.on('message', async msg => {
    if (!msg.from.endsWith('@c.us') || msg.fromMe) return;
    
    console.log(`📱 Mensagem de ${msg.from}: ${msg.body}`);
    
    try {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const customerName = contact.pushname || 'Cliente';
        const userId = msg.from;
        
        // Inicializar sessão do usuário
        if (!userSessions.has(userId)) {
            userSessions.set(userId, {
                lastMessage: Date.now(),
                orderData: null,
                context: ''
            });
        }
        
        const session = userSessions.get(userId);
        session.lastMessage = Date.now();
        
        // Verificar se é pedido do checkout
        if (isCheckoutOrder(msg.body)) {
            console.log('🛒 Pedido do checkout detectado');
            
            const orderId = await processCheckoutOrder(msg.body, userId, customerName);
            session.context = `Cliente fez pedido pelo site. Pedido #${orderId}. Dados do pedido: ${msg.body}`;
            
            await delay(1000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const checkoutResponse = `🍷 *Adega do Tio Pancho - Atendimento Automático*\n\nOlá, ${customerName}! Bem-vindo! 🍻\n\n✅ *Pedido recebido automaticamente do site!*\n\n🤖 Sou seu atendente virtual com inteligência artificial. Vou processar sua compra de forma rápida e eficiente!\n\nPara finalizar seu pedido, preciso confirmar:\n\n📍 *Seu endereço completo para entrega:*\n• Rua, número e complemento\n• Bairro\n• Cidade - CEP\n\n💰 *Formas de pagamento disponíveis:*\n• PIX (mais rápido) - 11000000000\n• Dinheiro na entrega\n• Cartão na entrega\n\n🚚 *Entrega em 45-60 minutos*\n🍷 *Taxa: R$ 8,90 (GRÁTIS acima de R$ 80)*\n\n*Por favor, me informe seu endereço para calcularmos o total!*`;
            
            await client.sendMessage(msg.from, checkoutResponse);
            return;
        }
        
        // Resposta com ChatGPT
        await delay(1000);
        await chat.sendStateTyping();
        await delay(2000);
        
        const gptResponse = await generateResponse(msg.body, customerName, session.context);
        await client.sendMessage(msg.from, gptResponse);
        
        // Log para monitoramento
        console.log(`✅ Resposta enviada para ${customerName}: ${gptResponse.substring(0, 100)}...`);
        
        // Atualizar contexto se necessário
        if (msg.body.match(/(endereço|rua|bairro|cidade)/i)) {
            session.context += ` Cliente informou endereço: ${msg.body}`;
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        await client.sendMessage(msg.from, '❌ Erro temporário. Tente novamente em instantes.');
    }
});

// Limpeza de sessões antigas (a cada hora)
setInterval(() => {
    const now = Date.now();
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.lastMessage > 3600000) { // 1 hora
            userSessions.delete(userId);
            console.log(`🧹 Sessão limpa: ${userId}`);
        }
    }
}, 3600000);

client.initialize();

console.log('⏳ Aguardando conexão WhatsApp...');