const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

console.log('🚀 Iniciando Bot da Adega do Tio Pancho...');

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
    console.log('🍷 Adega do Tio Pancho - Bot ativo!');
});

client.on('message', async msg => {
    if (msg.fromMe || !msg.from.endsWith('@c.us')) return;
    
    console.log(`📨 Nova mensagem de ${msg.from}: ${msg.body}`);
    
    try {
        const chat = await msg.getChat();
        await chat.sendStateTyping();
        
        // Resposta automática simples para teste
        const response = `🍷 *Adega do Tio Pancho*\n\nOlá! Recebi sua mensagem: "${msg.body}"\n\nEste é um teste automático do bot!\n\nDigite "menu" para ver as opções.`;
        
        await msg.reply(response);
        console.log('✅ Resposta enviada!');
        
    } catch (error) {
        console.error('❌ Erro ao responder:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Bot desconectado:', reason);
});

client.initialize();

console.log('⏳ Aguardando QR Code...');