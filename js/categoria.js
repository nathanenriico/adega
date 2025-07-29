// JavaScript para página de categoria
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('adegaCart')) || [];

// Carregar produtos do localStorage
let products = [];
const savedProducts = localStorage.getItem('adegaProducts');
if (savedProducts) {
    products = JSON.parse(savedProducts);
} else {
    // Produtos padrão caso não existam no localStorage
    products = [
        { id: 1, name: 'Heineken Lata 350ml', image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400', price: 4.50, category: 'cervejas' },
        { id: 2, name: 'Stella Artois Long Neck', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 5.90, category: 'cervejas' },
        { id: 5, name: 'Smirnoff Ice 275ml', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', price: 8.90, category: 'drinks' },
        { id: 6, name: 'Caipirinha Ypioca', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', price: 12.50, category: 'drinks' },
        { id: 8, name: 'Vinho Tinto Cabernet', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', price: 45.90, category: 'vinhos' }
    ];
}

// Obter categoria da URL
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria') || 'all';
}

// Definir categoria ativa
function setActiveCategory(category) {
    currentCategory = category;
    
    // Atualizar visual das categorias
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) {
            item.classList.add('active');
        }
    });
    
    // Atualizar título
    const categoryNames = {
        'all': 'Todos os Produtos',
        'cervejas': 'Cervejas',
        'drinks': 'Drinks', 
        'vinhos': 'Vinhos',
        'refrigerantes': 'Refrigerantes',
        'aguas': 'Águas e Gelo',
        'chopp': 'Chopp'
    };
    
    document.getElementById('category-title').textContent = categoryNames[category] || 'Produtos';
    
    // Renderizar produtos
    renderProducts();
}

// Renderizar produtos
function renderProducts() {
    const productsList = document.getElementById('products-list');
    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }
    
    productsList.innerHTML = filteredProducts.map(product => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/80x80/333/fff?text=Produto'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">Produto de qualidade premium</div>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
            </div>
            <div class="product-actions">
                <button class="add-product-btn" onclick="addToCart(${product.id})">Adicionar</button>
            </div>
        </div>
    `).join('');
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    localStorage.setItem('adegaCart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Feedback visual
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Adicionado!';
    btn.style.background = '#4CAF50';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#ff6b6b';
    }, 1000);
}

// Atualizar display do carrinho
function updateCartDisplay() {
    const cartFixed = document.getElementById('cart-fixed');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (totalItems > 0) {
        cartFixed.style.display = 'flex';
        cartItems.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
        cartTotal.textContent = `R$ ${totalPrice.toFixed(2)}`;
    } else {
        cartFixed.style.display = 'none';
    }
}

// Ir para carrinho
function goToCart() {
    window.location.href = 'index.html#cart';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Configurar categoria inicial
    const initialCategory = getCategoryFromURL();
    setActiveCategory(initialCategory);
    
    // Event listeners para categorias
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
        });
    });
    
    // Atualizar display do carrinho
    updateCartDisplay();
    
    // Busca
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) &&
            (currentCategory === 'all' || p.category === currentCategory)
        );
        
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = filteredProducts.map(product => `
            <div class="product-item">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/80x80/333/fff?text=Produto'">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">Produto de qualidade premium</div>
                    <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                </div>
                <div class="product-actions">
                    <button class="add-product-btn" onclick="addToCart(${product.id})">Adicionar</button>
                </div>
            </div>
        `).join('');
    });
});