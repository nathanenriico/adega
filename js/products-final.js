// Script final para carregar produtos
console.log('🚀 Carregando produtos final...');

// Função simples para carregar produtos
function carregarProdutos() {
    console.log('📦 Carregando produtos do banco...');
    
    const grid = document.getElementById('products-grid');
    if (!grid) {
        console.error('❌ Grid não encontrado');
        return;
    }
    
    grid.innerHTML = '<p style="text-align: center; color: #fff; padding: 40px;">Carregando produtos...</p>';
    
    // Usar o supabase global - criar cliente
    if (!window.supabase) {
        console.error('❌ Supabase não disponível');
        grid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Supabase não disponível</p>';
        return;
    }
    
    const client = window.supabase.createClient(
        'https://vtrgtorablofhmhizrjr.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
    );
    
    client
        .from('products')
        .select('*')
        .then(function(response) {
            console.log('📊 Resposta:', response);
            
            if (response.error) {
                console.error('❌ Erro:', response.error);
                grid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Erro: ' + response.error.message + '</p>';
                return;
            }
            
            const produtos = response.data;
            if (!produtos || produtos.length === 0) {
                grid.innerHTML = '<p style="text-align: center; color: #fff; padding: 40px;">Nenhum produto encontrado</p>';
                return;
            }
            
            console.log('✅ ' + produtos.length + ' produtos encontrados');
            
            // Renderizar produtos
            let html = '';
            produtos.forEach(function(produto) {
                html += `
                    <div class="product-card">
                        <img src="${produto.image || 'https://via.placeholder.com/400x200/333/fff?text=Produto'}" 
                             alt="${produto.name}" 
                             class="product-image" 
                             onerror="this.src='https://via.placeholder.com/400x200/333/fff?text=Produto'">
                        <div class="product-name">${produto.name}</div>
                        <div class="product-price">R$ ${parseFloat(produto.price).toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="add-to-cart-btn" onclick="addToCart(${produto.id})">
                                Adicionar 🛒
                            </button>
                            <button class="whatsapp-btn-small" onclick="openWhatsApp('${produto.name}')">
                                WhatsApp 💬
                            </button>
                        </div>
                    </div>
                `;
            });
            
            grid.innerHTML = html;
            console.log('✅ Produtos renderizados com sucesso');
        })
        .catch(function(erro) {
            console.error('❌ Erro geral:', erro);
            grid.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Erro: ' + erro.message + '</p>';
        });
}

// Tornar função global
window.carregarProdutos = carregarProdutos;
window.loadSupabaseProducts = carregarProdutos;

// Executar quando tudo estiver pronto
setTimeout(function() {
    console.log('⏰ Executando carregamento automático...');
    carregarProdutos();
}, 2000);

console.log('✅ Script de produtos carregado');