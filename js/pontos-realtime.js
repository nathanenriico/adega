// Atualização de pontos em tempo real do banco de dados
async function atualizarPontosAgora() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const client = window.supabase?.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        if (!client) return;
        
        const { data, error } = await client
            .from('clientes')
            .select('pontos')
            .eq('id', userId)
            .single();
        
        if (!error && data) {
            const pontos = data.pontos || 0;
            ['customer-points-display', 'dropdown-points'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = `${pontos} pontos`;
            });
            console.log(`Pontos atualizados: ${pontos}`);
        }
    } catch (error) {
        console.log('Erro ao atualizar pontos:', error);
    }
}

// Atualizar imediatamente quando carregar
setTimeout(atualizarPontosAgora, 1000);

// Atualizar a cada 5 segundos
setInterval(atualizarPontosAgora, 5000);

// Tornar função global
window.atualizarPontosAgora = atualizarPontosAgora;