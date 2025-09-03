// Função para abrir WhatsApp Web ou App
function openWhatsApp(message, phone = '5511000000000') {
    const encodedMessage = encodeURIComponent(message);
    
    // Detectar dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let whatsappUrl;
    
    if (isMobile) {
        // Mobile: Abre o app WhatsApp
        whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    } else {
        // Desktop: Abre WhatsApp Web
        whatsappUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    }
    
    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');
}

// Função específica para atendimento
function openWhatsAppSupport() {
    const message = `🍷 *Olá, Adega do Tio Pancho!*

Estou entrando em contato através do site para atendimento.

Como posso ser ajudado?`;
    
    openWhatsApp(message);
}

// Tornar funções globais
window.openWhatsApp = openWhatsApp;
window.openWhatsAppSupport = openWhatsAppSupport;