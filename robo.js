const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('📱 Escaneie o QR Code acima com o WhatsApp (11) 93394-9002');
});

client.on('ready', () => {
    console.log('🍷 Adega do Tio Pancho - Bot WhatsApp (11) 93394-9002 conectado!');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {
    // Ignorar mensagens de grupos e próprias mensagens
    if (!msg.from.endsWith('@c.us') || msg.fromMe) {
        return;
    }
    
    console.log('📱 Mensagem recebida:', msg.body, 'de:', msg.from);
    
    try {
        const chat = await msg.getChat();
        
        // Menu principal e saudações
        if (msg.body.match(/(menu|oi|olá|ola|bom dia|boa tarde|boa noite)/i)) {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const contact = await msg.getContact();
            const name = contact.pushname || 'Cliente';
            
            const menuMessage = `🍷 *Adega do Tio Pancho*

Olá, ${name.split(" ")[0]}! Bem-vindo(a) à nossa adega! 🍻

*📋 Menu Principal:*

1️⃣ Ver Cardápio
2️⃣ Fazer Pedido  
3️⃣ Acompanhar Pedido
4️⃣ Horário e Localização
5️⃣ Falar com Atendente

*Digite o número da opção desejada*

🕐 Segunda a Domingo: 18h às 02h
🚚 Taxa: R$ 5,00 | Grátis acima de R$ 80,00`;
            
            await client.sendMessage(msg.from, menuMessage);
        }
        // Opção 1 - Cardápio
        else if (msg.body === '1') {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const cardapio = `🍷 *CARDÁPIO - ADEGA DO TIO PANCHO*

🍺 *CERVEJAS:*
• Heineken 600ml - R$ 12,90
• Stella Artois 550ml - R$ 11,50
• Corona 355ml - R$ 9,90
• Brahma 350ml - R$ 4,50

🍷 *VINHOS:*
• Vinho Tinto Seco - R$ 45,90
• Vinho Branco Suave - R$ 42,90
• Espumante Brut - R$ 38,90

🥃 *DESTILADOS:*
• Whisky Red Label - R$ 89,90
• Vodka Smirnoff - R$ 35,90
• Cachaça 51 - R$ 18,90

🥤 *BEBIDAS:*
• Refrigerante 2L - R$ 8,90
• Água 500ml - R$ 3,50
• Energético - R$ 7,90

*Para fazer pedido, digite 2*`;
            
            await client.sendMessage(msg.from, cardapio);
        }
        // Opção 2 - Fazer Pedido
        else if (msg.body === '2') {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const pedido = `🛒 *FAZER PEDIDO*

Para fazer seu pedido:

📱 *Acesse nosso site:*
https://adega-tio-pancho.vercel.app

💬 *Ou me diga:*
1. Qual bebida deseja?
2. Quantidade
3. Seu endereço
4. Forma de pagamento (PIX/Dinheiro)

*Exemplo:*
"Quero 2 Heineken 600ml
Rua das Flores, 123
Pagamento: PIX"

🚚 Taxa de entrega: R$ 5,00
(Grátis acima de R$ 80,00)`;
            
            await client.sendMessage(msg.from, pedido);
        }
        // Opção 3 - Acompanhar Pedido
        else if (msg.body === '3') {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const acompanhar = `📦 *ACOMPANHAR PEDIDO*

Para acompanhar seu pedido:

🔢 *Digite o número do seu pedido*

Ou acesse:
📱 https://adega-tio-pancho.vercel.app/pedidos

*Status possíveis:*
✅ Pedido Recebido
👨🍳 Preparando
🚚 Saindo para Entrega
🎉 Entregue

*Digite o número do seu pedido*`;
            
            await client.sendMessage(msg.from, acompanhar);
        }
        // Opção 4 - Informações
        else if (msg.body === '4') {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const info = `📍 *ADEGA DO TIO PANCHO*

🕐 *Horário de Funcionamento:*
Segunda a Domingo: 18h às 02h

📱 *Contato:*
(11) 93394-9002

🚚 *Delivery:*
Taxa: R$ 5,00 | Grátis acima de R$ 80,00

📍 *Localização:*
São Paulo, SP

*Estamos sempre prontos para te atender!* 🍻`;
            
            await client.sendMessage(msg.from, info);
        }
        // Opção 5 - Atendente
        else if (msg.body === '5') {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const atendente = `👨💼 *ATENDIMENTO HUMANO*

Você será direcionado para um atendente!

⏰ *Horário de Atendimento:*
Segunda a Domingo: 18h às 02h

📞 *Contato Direto:*
(11) 93394-9002

*Aguarde que em breve um atendente entrará em contato!*

🍷 Obrigado por escolher a Adega do Tio Pancho!`;
            
            await client.sendMessage(msg.from, atendente);
        }
        // Detecção de produtos
        else if (msg.body.match(/(heineken|stella|corona|brahma|vinho|whisky|vodka|cachaça)/i)) {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const contact = await msg.getContact();
            const name = contact.pushname || 'Cliente';
            
            const produto = `🍷 *Ótima escolha, ${name.split(" ")[0]}!*

Detectei que você quer fazer um pedido! 🛒

Para finalizar, preciso de:

📍 *Seu endereço completo*
💳 *Forma de pagamento* (PIX ou Dinheiro)

*Ou acesse nosso site:*
📱 https://adega-tio-pancho.vercel.app

🚚 Entregamos em até 45 minutos!`;
            
            await client.sendMessage(msg.from, produto);
        }
        // Números de pedido
        else if (msg.body.match(/^#?\d{3,6}$/)) {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const numeroPedido = msg.body.replace('#', '');
            
            const status = `📦 *STATUS DO PEDIDO #${numeroPedido}*

✅ *Pedido encontrado!*

👨🍳 Status: Preparando
⏰ Tempo estimado: 30-40 min
🚚 Entregador: A caminho

*Seu pedido está sendo preparado com carinho!*

🍷 Adega do Tio Pancho
📱 (11) 93394-9002`;
            
            await client.sendMessage(msg.from, status);
        }
        // Agradecimentos
        else if (msg.body.match(/(obrigado|obrigada|valeu|thanks)/i)) {
            await delay(1500);
            await chat.sendStateTyping();
            await delay(1500);
            
            const obrigado = `🍻 *Por nada!*

Sempre à disposição!

🍷 Adega do Tio Pancho
*Sua adega de confiança!*

Digite *menu* para ver as opções novamente.`;
            
            await client.sendMessage(msg.from, obrigado);
        }
        // Resposta padrão
        else {
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const padrao = `🤖 *Desculpe, não entendi!*

🍷 *Adega do Tio Pancho*

Digite *menu* para ver as opções:

1️⃣ Ver Cardápio
2️⃣ Fazer Pedido
3️⃣ Acompanhar Pedido
4️⃣ Horário e Localização
5️⃣ Falar com Atendente

*Como posso te ajudar?* 😊`;
            
            await client.sendMessage(msg.from, padrao);
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
    }
});