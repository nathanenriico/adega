// Script dedicado para carregar produtos do Supabase
console.log('🔄 Carregando script de produtos...');

// Função simples para carregar produtos
async function loadSupabaseProducts() {
    console.log('📦 Iniciando carregamento de produtos...');
    
    // Verificar se Supabase está disponível
    if (!window.supabase) {
        console.error('❌ Supabase não disponível');
        return;
    }
    
    try {
        console.log('🔍 Buscando produtos no Supabase...');
        
        const { data, error } = await window.supabase
            .from('products')
            .select('*')
            .eq('active', true);
        
        if (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            return;
        }
        
        console.log('📊 Dados recebidos:', data);
        
        if (data && data.length > 0) {
            // Mapear produtos para formato esperado
            window.products = data.map(product => ({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                category: product.category,
                image: product.image || 'https://via.placeholder.com/400x200/333/fff?text=Produto',
                images: product.images || [product.image]
            }));
            
            console.log(`✅ ${window.products.length} produtos carregados:`, window.products);
            
            // Renderizar produtos se a função existir
            if (typeof window.renderProducts === 'function') {
                window.renderProducts();
            } else if (typeof renderProducts === 'function') {
                renderProducts();
            }
            
            return true;
        } else {
            console.log('⚠️ Nenhum produto ativo encontrado no banco');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro na função loadSupabaseProducts:', error);
        return false;
    }
}

// Tornar função global
window.loadSupabaseProducts = loadSupabaseProducts;

// Executar quando Supabase estiver pronto
function waitAndLoad() {
    if (window.supabase) {
        console.log('🚀 Supabase pronto, carregando produtos...');
        loadSupabaseProducts();
    } else {
        console.log('⏳ Aguardando Supabase...');
        setTimeout(waitAndLoad, 500);
    }
}

// Iniciar processo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, iniciando carregamento de produtos...');
    setTimeout(waitAndLoad, 1000);
});

window.addEventListener('load', function() {
    console.log('🌐 Página carregada, verificando produtos...');
    setTimeout(waitAndLoad, 2000);
});

console.log('✅ Script de produtos carregado');