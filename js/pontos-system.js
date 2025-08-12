// Sistema de Pontos
async function addPointsToCustomer(customerId, points, orderId, description) {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        // Buscar dados do cliente
        const { data: currentData } = await client
            .from('clientes')
            .select('pontos, nome, whatsapp, rua, numero, complemento, bairro, cidade, cep')
            .eq('id', customerId)
            .single();
        
        const currentPoints = currentData?.pontos || 0;
        const newPoints = currentPoints + points;
        const clienteName = currentData?.nome || 'Cliente';
        const clientePhone = currentData?.whatsapp || '';
        const clienteAddress = currentData ? 
            `${currentData.rua}, ${currentData.numero}${currentData.complemento ? ', ' + currentData.complemento : ''}, ${currentData.bairro}, ${currentData.cidade} - ${currentData.cep}` : '';
        
        // Atualizar pontos
        await client
            .from('clientes')
            .update({ pontos: newPoints })
            .eq('id', customerId);
        
        // Registrar histórico
        await client
            .from('pontos_historico')
            .insert({
                cliente_id: customerId,
                cliente_nome: clienteName,
                cliente_telefone: clientePhone,
                cliente_endereco: clienteAddress,
                pontos: points,
                tipo: 'ganho',
                descricao: description,
                pedido_id: orderId
            });
        
        console.log(`✅ +${points} pontos para ${clienteName}`);
        
    } catch (error) {
        console.error('❌ Erro ao adicionar pontos:', error);
    }
}

// Usar pontos (para cupons)
async function usePoints(customerId, points, description) {
    try {
        const client = getSupabaseClient();
        if (!client) return false;
        
        // Verificar pontos disponíveis
        const { data: currentData } = await client
            .from('clientes')
            .select('pontos, nome, whatsapp, rua, numero, complemento, bairro, cidade, cep')
            .eq('id', customerId)
            .single();
        
        const currentPoints = currentData?.pontos || 0;
        const clienteName = currentData?.nome || 'Cliente';
        const clientePhone = currentData?.whatsapp || '';
        const clienteAddress = currentData ? 
            `${currentData.rua}, ${currentData.numero}${currentData.complemento ? ', ' + currentData.complemento : ''}, ${currentData.bairro}, ${currentData.cidade} - ${currentData.cep}` : '';
        if (currentPoints < points) return false;
        
        const newPoints = currentPoints - points;
        
        // Atualizar pontos
        await client
            .from('clientes')
            .update({ pontos: newPoints })
            .eq('id', customerId);
        
        // Registrar histórico
        await client
            .from('pontos_historico')
            .insert({
                cliente_id: customerId,
                cliente_nome: clienteName,
                cliente_telefone: clientePhone,
                cliente_endereco: clienteAddress,
                pontos: -points,
                tipo: 'usado',
                descricao: description
            });
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao usar pontos:', error);
        return false;
    }
}

window.addPointsToCustomer = addPointsToCustomer;
window.usePoints = usePoints;