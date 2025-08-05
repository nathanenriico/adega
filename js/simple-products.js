// Script super simples para carregar produtos
console.log('🚀 Carregando script simples de produtos...');

// Aguardar 3 segundos e tentar carregar
setTimeout(async () => {
    console.log('⏰ Tentando carregar produtos após 3 segundos...');
    
    if (!window.supabase) {
        console.error('❌ Supabase não disponível');
        return;
    }
    
    try {
        console.log('🔍 Buscando produtos...');
        const { data, error } = await window.supabase
            .from('products')
            .select('*');
        
        console.log('📊 Resultado:', { data, error });
        
        if (error) {
            console.error('❌ Erro:', error);
            return;
        }
        
        if (data && data.length > 0) {
            console.log(`✅ ${data.length} produtos encontrados`);
            
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = data.map(p => `
                    <div class="product-card">
                        <img src="${p.image || 'https://via.placeholder.com/400x200/333/fff?text=Produto'}" 
                             alt="${p.name}" class="product-image">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">R$ ${parseFloat(p.price).toFixed(2)}</div>
                        <button class="product-btn" onclick="openWhatsApp('${p.name}')">
                            Pedir via WhatsApp 📱
                        </button>
                    </div>
                `).join('');
                
                console.log('✅ Produtos renderizados no grid');
            } else {
                console.error('❌ Grid não encontrado');
            }
        } else {
            console.log('⚠️ Nenhum produto encontrado');
        }
        
    } catch (err) {
        console.error('❌ Erro geral:', err);
    }
}, 3000);