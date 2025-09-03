// Modal de detalhes do produto
function showProductDetails(productId) {
    const products = window.products || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'product-details-modal';
    modal.innerHTML = `
        <div class="product-details-content">
            <div class="product-details-header">
                <button class="back-btn" onclick="closeProductDetails()">←</button>
                <button class="search-btn">🔍</button>
            </div>
            
            <div class="product-details-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x300/f0f0f0/999?text=Produto'">
            </div>
            
            <div class="product-details-info">
                <h2 class="product-details-name">${product.name}</h2>
                <p class="product-details-category">ADEGA</p>
                
                <div class="product-details-description">
                    <p>Produto premium da Adega do Tio Pancho. Qualidade garantida e sabor incomparável. Ideal para momentos especiais e celebrações.</p>
                </div>
                
                <div class="product-details-options">
                    <div class="option-group">
                        <h4>Tamanho</h4>
                        <div class="option-buttons">
                            <button class="option-btn active">Padrão</button>
                            <button class="option-btn">Grande</button>
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <h4>Quantidade</h4>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="changeQuantity(-1)">-</button>
                            <span class="qty-display" id="qty-display">1</span>
                            <button class="qty-btn" onclick="changeQuantity(1)">+</button>
                        </div>
                    </div>
                </div>
                
                <div class="product-details-actions">
                    <div class="price-section">
                        <span class="price-label">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button class="order-btn" onclick="addToCartFromDetails(${product.id})">
                        PEDIR AGORA
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeProductDetails() {
    const modal = document.querySelector('.product-details-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

let currentQuantity = 1;

function changeQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    document.getElementById('qty-display').textContent = currentQuantity;
}

function addToCartFromDetails(productId) {
    const products = window.products || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Adicionar ao carrinho com quantidade
    for (let i = 0; i < currentQuantity; i++) {
        if (typeof window.addToCart === 'function') {
            window.addToCart(productId);
        }
    }
    
    // Fechar modal
    closeProductDetails();
    
    // Redirecionar para WhatsApp
    const total = product.price * currentQuantity;
    const message = `🍷 *Adega do Tio Pancho*\n\nOlá! Gostaria de fazer este pedido:\n\n• ${product.name} - Qtd: ${currentQuantity} - R$ ${total.toFixed(2)}\n\nPor favor, confirme meu pedido e me informe a forma de pagamento.\n\nObrigado!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5511941716617?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Reset quantity
    currentQuantity = 1;
}

// Tornar funções globais
window.showProductDetails = showProductDetails;
window.closeProductDetails = closeProductDetails;
window.changeQuantity = changeQuantity;
window.addToCartFromDetails = addToCartFromDetails;