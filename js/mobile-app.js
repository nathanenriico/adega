// Mobile App Functionality

// Produtos de exemplo para mobile
const mobileProducts = [
    {
        id: 1,
        name: 'Vinho Tinto Premium',
        price: 89.90,
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300',
        category: 'bebidas'
    },
    {
        id: 2,
        name: 'Cerveja Artesanal',
        price: 12.90,
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=300',
        category: 'cervejas'
    },
    {
        id: 3,
        name: 'Whisky Premium',
        price: 159.90,
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300',
        category: 'destilados'
    },
    {
        id: 4,
        name: 'Combo Festa',
        price: 45.90,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300',
        category: 'combos'
    },
    {
        id: 5,
        name: 'Promoção Cerveja',
        price: 8.90,
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=300',
        category: 'promocoes'
    },
    {
        id: 6,
        name: 'Vinho Branco',
        price: 65.90,
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300',
        category: 'bebidas'
    }
];

let mobileCart = [];

// Inicializar app mobile
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        renderMobileProducts();
        setupMobileSearch();
    }
});

// Renderizar produtos mobile
function renderMobileProducts(products = mobileProducts) {
    const grid = document.getElementById('mobile-products-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="mobile-product-card">
            <img src="${product.image}" alt="${product.name}" class="mobile-product-image">
            <div class="mobile-product-name">${product.name}</div>
            <div class="mobile-product-price">R$ ${product.price.toFixed(2)}</div>
            <button class="mobile-add-btn" onclick="addToMobileCart(${product.id})">+</button>
        </div>
    `).join('');
}

// Filtrar produtos mobile
function filterMobileProducts(category) {
    // Atualizar categoria ativa
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filtrar produtos
    const filtered = category === 'all' 
        ? mobileProducts 
        : mobileProducts.filter(p => p.category === category);
    
    renderMobileProducts(filtered);
}

// Adicionar ao carrinho mobile
function addToMobileCart(productId) {
    const product = mobileProducts.find(p => p.id === productId);
    const existingItem = mobileCart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        mobileCart.push({ ...product, quantity: 1 });
    }

    updateMobileCartDisplay();
}

// Atualizar display do carrinho mobile
function updateMobileCartDisplay() {
    const count = mobileCart.reduce((total, item) => total + item.quantity, 0);
    const total = mobileCart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const countElement = document.getElementById('mobile-cart-count');
    const cartButton = document.querySelector('.mobile-cart');
    
    if (countElement) countElement.textContent = count;
    if (cartButton) {
        cartButton.innerHTML = `
            🛒 R$ ${total.toFixed(2)}
            <span class="mobile-cart-count">${count}</span>
        `;
    }

    // Atualizar modal do carrinho
    const cartItems = document.getElementById('mobile-cart-items');
    if (cartItems) {
        cartItems.innerHTML = mobileCart.map(item => `
            <div class="mobile-cart-item">
                <img src="${item.image}" alt="${item.name}" class="mobile-cart-item-image">
                <div class="mobile-cart-item-info">
                    <div class="mobile-cart-item-name">${item.name}</div>
                    <div class="mobile-cart-item-price">R$ ${item.price.toFixed(2)}</div>
                </div>
                <div class="mobile-cart-controls">
                    <button class="mobile-cart-btn" onclick="updateMobileCartQuantity(${item.id}, -1)">-</button>
                    <span class="mobile-cart-quantity">${item.quantity}</span>
                    <button class="mobile-cart-btn" onclick="updateMobileCartQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    const totalElement = document.getElementById('mobile-cart-total');
    if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2)}`;
}

// Atualizar quantidade no carrinho mobile
function updateMobileCartQuantity(productId, change) {
    const item = mobileCart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            mobileCart = mobileCart.filter(item => item.id !== productId);
        }
        updateMobileCartDisplay();
    }
}

// Toggle carrinho mobile
function toggleMobileCart() {
    const modal = document.getElementById('mobile-cart-modal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

// Finalizar pedido mobile
function goToMobileCheckout() {
    if (mobileCart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Usar a mesma função de checkout do desktop
    if (typeof goToCheckout === 'function') {
        // Sincronizar carrinho mobile com desktop
        cart = mobileCart.map(item => ({
            ...item,
            id: item.id
        }));
        goToCheckout();
    } else {
        // Fallback para WhatsApp
        openWhatsApp();
    }
}

// Mostrar seção mobile
function showMobileSection(section) {
    // Atualizar navegação ativa
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.mobile-nav-item').classList.add('active');
    
    // Mostrar seção correspondente no desktop se necessário
    if (typeof showSection === 'function') {
        showSection(section);
    }
}

// Configurar busca mobile
function setupMobileSearch() {
    const searchInput = document.getElementById('mobile-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const filtered = mobileProducts.filter(product => 
                product.name.toLowerCase().includes(query)
            );
            renderMobileProducts(filtered);
        });
    }
}

// Função para alterar endereço
function changeAddress() {
    if (window.innerWidth > 768) return;
    
    // Garantir que estamos na seção home
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('home').classList.add('active');
    
    // Scroll para o formulário de endereço
    setTimeout(() => {
        const addressCard = document.querySelector('.delivery-address-card');
        if (addressCard) {
            addressCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Manter o texto padrão sempre
document.addEventListener('DOMContentLoaded', function() {
    // O texto sempre será "Endereço atual" definido no CSS
});

// Redimensionamento da janela
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        renderMobileProducts();
    }
});