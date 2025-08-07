// Template de configuração - RENOMEIE para config.js e preencha com suas chaves
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://vtrgtorablofhmhizrjr.supabase.co',
    SUPABASE_ANON_KEY:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
,
    
    // WhatsApp
    WHATSAPP_NUMBER: '5511933949002',
    
    // OpenAI (opcional)
    OPENAI_API_KEY: '',
    
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