// Template de configuração - RENOMEIE para config.js e preencha com suas chaves
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'SUA_URL_SUPABASE_AQUI',
    SUPABASE_ANON_KEY: 'SUA_CHAVE_ANONIMA_AQUI',
    
    // WhatsApp
    WHATSAPP_NUMBER: '5511933949002',
    
    // Configurações da Adega
    ADEGA_NAME: 'Adega do Tio Pancho',
    DELIVERY_FEE: 5.00,
    MIN_ORDER: 20.00
};

// Verificar se as chaves foram configuradas
if (CONFIG.SUPABASE_URL === 'SUA_URL_SUPABASE_AQUI') {
    console.warn('⚠️ Configure suas chaves de API no arquivo config.js');
}

// Exportar configuração
window.CONFIG = CONFIG;