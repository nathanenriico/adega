// Inicialização única do Supabase
console.log('🔧 Carregando correção final da navegação...');

// Aguardar Supabase estar disponível
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabase) {
            console.log('✅ Supabase já disponível');
            resolve();
            return;
        }
        
        const checkSupabase = () => {
            if (window.supabase) {
                console.log('✅ Supabase carregado');
                resolve();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        
        checkSupabase();
    });
}

// Inicializar quando Supabase estiver pronto
waitForSupabase().then(() => {
    console.log('✅ Correção final da navegação carregada');
    
    // Garantir que getSupabaseClient esteja disponível globalmente
    if (typeof getSupabaseClient === 'undefined') {
        window.getSupabaseClient = function() {
            if (!window._supabaseClient) {
                window._supabaseClient = window.supabase.createClient(
                    'https://vtrgtorablofhmhizrjr.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
                );
            }
            return window._supabaseClient;
        };
    }
});