// Webhook para iniciar bot automaticamente quando pedido é enviado
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Endpoint para receber notificações de pedidos
app.post('/start-bot', (req, res) => {
    const { orderId, customerPhone, customerName } = req.body;
    
    console.log(`🚀 Iniciando bot automaticamente para pedido #${orderId}`);
    console.log(`📱 Cliente: ${customerName} - ${customerPhone}`);
    
    // Aqui você pode adicionar lógica adicional se necessário
    // O bot já está configurado para detectar pedidos automaticamente
    
    res.json({ 
        success: true, 
        message: 'Bot iniciado automaticamente',
        orderId: orderId
    });
});

// Endpoint de status
app.get('/status', (req, res) => {
    res.json({ 
        status: 'active',
        service: 'Chatbot Adega do Tio Pancho',
        number: '11999968124'
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Webhook rodando na porta ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/start-bot`);
});

module.exports = app;