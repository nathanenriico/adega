// Função para atualizar pontos em tempo real
async function updatePointsDisplay() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { data, error } = await client
            .from('clientes')
            .select('pontos')
            .eq('id', userId)
            .single();
        
        if (!error && data) {
            const pointsDisplay = document.getElementById('customer-points-display');
            if (pointsDisplay) {
                pointsDisplay.textContent = `${data.pontos || 0} pontos`;
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar pontos:', error);
    }
}

// Atualizar pontos a cada 5 segundos
setInterval(updatePointsDisplay, 5000);

// Atualizar ao carregar a página
document.addEventListener('DOMContentLoaded', updatePointsDisplay);

window.updatePointsDisplay = updatePointsDisplay;