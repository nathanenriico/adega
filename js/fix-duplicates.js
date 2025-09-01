// Função para remover duplicatas da tabela pedido_status
async function removePedidoStatusDuplicates() {
    if (!confirm('⚠️ ATENÇÃO: Esta operação irá remover registros duplicados da tabela pedido_status.\n\nDeseja continuar?')) {
        return;
    }

    try {
        console.log('🔄 Iniciando remoção de duplicatas...');
        
        // 1. Buscar todos os registros agrupados por pedido_id e status
        const { data: allRecords, error: fetchError } = await supabase
            .from('pedido_status')
            .select('*')
            .order('pedido_id, status, data_alteracao');
        
        if (fetchError) {
            throw fetchError;
        }
        
        console.log(`📊 Total de registros encontrados: ${allRecords.length}`);
        
        // 2. Identificar duplicatas e manter apenas o mais recente
        const uniqueRecords = new Map();
        const duplicatesToDelete = [];
        
        allRecords.forEach(record => {
            const key = `${record.pedido_id}-${record.status}`;
            
            if (uniqueRecords.has(key)) {
                // Já existe um registro para este pedido+status
                const existing = uniqueRecords.get(key);
                
                // Comparar datas para manter o mais recente
                if (new Date(record.data_alteracao) > new Date(existing.data_alteracao)) {
                    // Registro atual é mais recente, marcar o anterior para deletar
                    duplicatesToDelete.push(existing.id);
                    uniqueRecords.set(key, record);
                } else {
                    // Registro existente é mais recente, marcar o atual para deletar
                    duplicatesToDelete.push(record.id);
                }
            } else {
                // Primeiro registro para este pedido+status
                uniqueRecords.set(key, record);
            }
        });
        
        console.log(`🔍 Duplicatas encontradas: ${duplicatesToDelete.length}`);
        console.log(`✅ Registros únicos: ${uniqueRecords.size}`);
        
        if (duplicatesToDelete.length === 0) {
            alert('✅ Nenhuma duplicata encontrada!\n\nA tabela pedido_status já está limpa.');
            return;
        }
        
        // 3. Deletar duplicatas em lotes
        const batchSize = 50;
        let deletedCount = 0;
        
        for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
            const batch = duplicatesToDelete.slice(i, i + batchSize);
            
            const { error: deleteError } = await supabase
                .from('pedido_status')
                .delete()
                .in('id', batch);
            
            if (deleteError) {
                console.error('Erro ao deletar lote:', deleteError);
                throw deleteError;
            }
            
            deletedCount += batch.length;
            console.log(`🗑️ Deletados ${deletedCount}/${duplicatesToDelete.length} registros duplicados`);
        }
        
        // 4. Verificar resultado final
        const { data: finalRecords, error: finalError } = await supabase
            .from('pedido_status')
            .select('pedido_id, status, count(*)')
            .group('pedido_id, status')
            .having('count(*) > 1');
        
        if (finalError) {
            console.error('Erro na verificação final:', finalError);
        }
        
        const remainingDuplicates = finalRecords ? finalRecords.length : 0;
        
        // 5. Mostrar resultado
        const message = `🎉 Limpeza concluída com sucesso!\n\n` +
                       `📊 Registros deletados: ${deletedCount}\n` +
                       `✅ Registros únicos mantidos: ${uniqueRecords.size}\n` +
                       `⚠️ Duplicatas restantes: ${remainingDuplicates}`;
        
        alert(message);
        
        console.log('✅ Remoção de duplicatas concluída!');
        
    } catch (error) {
        console.error('❌ Erro na remoção de duplicatas:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// Função para verificar duplicatas sem remover
async function checkPedidoStatusDuplicates() {
    try {
        console.log('🔍 Verificando duplicatas...');
        
        const { data: duplicates, error } = await supabase
            .from('pedido_status')
            .select('pedido_id, status, count(*)')
            .group('pedido_id, status')
            .having('count(*) > 1')
            .order('pedido_id');
        
        if (error) {
            throw error;
        }
        
        if (!duplicates || duplicates.length === 0) {
            alert('✅ Nenhuma duplicata encontrada!\n\nA tabela pedido_status está limpa.');
            return;
        }
        
        let message = `⚠️ Encontradas ${duplicates.length} duplicatas:\n\n`;
        duplicates.forEach(dup => {
            message += `Pedido #${dup.pedido_id} - Status: ${dup.status} (${dup.count} registros)\n`;
        });
        
        message += `\nDeseja remover as duplicatas automaticamente?`;
        
        if (confirm(message)) {
            await removePedidoStatusDuplicates();
        }
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// Função para mostrar estatísticas da tabela
async function showPedidoStatusStats() {
    try {
        const { data: stats, error } = await supabase
            .from('pedido_status')
            .select('status, count(*)')
            .group('status')
            .order('status');
        
        if (error) {
            throw error;
        }
        
        let message = '📊 Estatísticas da tabela pedido_status:\n\n';
        let total = 0;
        
        stats.forEach(stat => {
            message += `${stat.status}: ${stat.count} registros\n`;
            total += parseInt(stat.count);
        });
        
        message += `\nTotal: ${total} registros`;
        
        alert(message);
        
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}