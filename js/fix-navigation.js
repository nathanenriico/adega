// Correção rápida para navegação - carregar antes do script principal
console.log('🔧 Carregando correções de navegação...');

// Definir funções essenciais no escopo global imediatamente
window.showSection = function(sectionId) {
    console.log('Navegando para seção:', sectionId);
    
    const sections = document.querySelectorAll('.section');
    const targetSection = document.getElementById(sectionId);
    
    // Animação de saída
    sections.forEach(section => {
        if (section.classList.contains('active')) {
            section.style.opacity = '0';
            section.style.transform = 'translateX(-20px)';
        }
    });
    
    setTimeout(() => {
        sections.forEach(section => section.classList.remove('active'));
        
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.opacity = '0';
            targetSection.style.transform = 'translateX(20px)';
            
            // Animação de entrada
            setTimeout(() => {
                targetSection.style.transition = 'all 0.3s ease';
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateX(0)';
            }, 50);
        }
    }, 150);
    
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = Array.from(navLinks).find(link => 
        link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${sectionId}'`)
    );
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
};

window.toggleMenu = function() {
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (sideMenu) sideMenu.classList.toggle('active');
    if (menuOverlay) menuOverlay.classList.toggle('active');
};

window.goToHome = function() {
    window.showSection('home');
};

window.toggleCart = function() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar) cartSidebar.classList.toggle('active');
    if (cartOverlay) cartOverlay.classList.toggle('active');
    
    updateCartDisplay();
};

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Atualizar badge do carrinho
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    // Atualizar widget do carrinho
    const cartCountWidget = document.getElementById('cart-count-widget');
    const cartTotalWidget = document.getElementById('cart-total-widget');
    
    if (cartCountWidget) cartCountWidget.textContent = `${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`;
    if (cartTotalWidget) cartTotalWidget.textContent = `R$ ${cartTotal.toFixed(2)}`;
    
    // Atualizar itens do carrinho
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; opacity: 0.7; color: #fff; padding: 20px;">Carrinho vazio</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <strong>${item.name}</strong><br>
                        <span>R$ ${item.price.toFixed(2)} x ${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
                    </div>
                </div>
            `).join('');
            
            // Adicionar total geral
            cartItems.innerHTML += `
                <div class="cart-total-section">
                    <div class="cart-total-line">
                        <strong>Total: R$ ${cartTotal.toFixed(2)}</strong>
                    </div>
                    <button onclick="goToCheckout()" class="checkout-btn">Finalizar Pedido</button>
                </div>
            `;
            
            // Verificar se há endereço de entrega
            const deliveryAddress = localStorage.getItem('deliveryAddress');
            if (!deliveryAddress) {
                const checkoutBtn = document.querySelector('.checkout-btn');
                if (checkoutBtn) {
                    checkoutBtn.onclick = function() {
                        alert('Por favor, cadastre um endereço de entrega antes de finalizar o pedido.');
                        window.showSection('home');
                        const addressForm = document.getElementById('delivery-address-form');
                        if (addressForm) addressForm.style.display = 'flex';
                    };
                }
            }
        }
    }
}

window.updateCartQuantity = function(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        if (quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            cartItem.quantity = quantity;
        }
        localStorage.setItem('adegaCart', JSON.stringify(cart));
        updateCartDisplay();
    }
};

window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('adegaCart', JSON.stringify(cart));
    updateCartDisplay();
};

function showCartNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = 'Produto adicionado ao carrinho!';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Estilos para o carrinho
const cartStyles = document.createElement('style');
cartStyles.textContent = `
    .cart-total-section {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 15px;
        margin-top: 15px;
        text-align: center;
    }
    
    .cart-total-line {
        color: #d4af37;
        font-size: 18px;
        margin-bottom: 15px;
    }
    
    .checkout-btn {
        background: linear-gradient(135deg, #d4af37, #b8941f);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s ease;
    }
    
    .checkout-btn:hover {
        background: linear-gradient(135deg, #b8941f, #9d7a1a);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(cartStyles);

window.openWhatsApp = function(productName = null) {
    const currentNumber = '1193394-9002';
    let message = 'Oi, quero ver as ofertas da adega!';
    
    if (productName) {
        message = `Oi! Tenho interesse no produto: ${productName}. Pode me dar mais informações?`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${currentNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};

window.showAdminLogin = function() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.style.display = 'block';
    }
};

window.closeAdminModal = function() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.adminLogin = function() {
    const password = document.getElementById('admin-password').value;
    
    if (password === 'admin123') {
        window.closeAdminModal();
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
        }
        window.renderAdminProducts();
    } else {
        alert('Senha incorreta!');
    }
};

// Produtos padrão para exibição imediata
window.products = [
    // Cervejas
    {id: 1, name: 'Heineken Lata 350ml', image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400', price: 4.50, category: 'cervejas'},
    {id: 2, name: 'Stella Artois Long Neck', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 5.90, category: 'cervejas'},
    {id: 3, name: 'Corona Extra 355ml', image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400', price: 6.50, category: 'cervejas'},
    {id: 4, name: 'Brahma Duplo Malte', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 3.90, category: 'cervejas'},
    // Drinks
    {id: 5, name: 'Smirnoff Ice 275ml', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', price: 8.90, category: 'drinks'},
    {id: 6, name: 'Caipirinha Ypioca', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', price: 12.50, category: 'drinks'},
    {id: 7, name: 'Batida de Coco Pitú', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', price: 15.90, category: 'drinks'},
    // Vinhos
    {id: 8, name: 'Vinho Tinto Cabernet', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', price: 45.90, category: 'vinhos'},
    {id: 9, name: 'Vinho Branco Chardonnay', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', price: 42.90, category: 'vinhos'},
    {id: 10, name: 'Espumante Chandon', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', price: 89.90, category: 'vinhos'},
    // Refrigerantes
    {id: 11, name: 'Coca-Cola 2L', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', price: 8.50, category: 'refrigerantes'},
    {id: 12, name: 'Guaraná Antarctica 2L', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', price: 7.90, category: 'refrigerantes'},
    {id: 13, name: 'Fanta Laranja 2L', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', price: 7.50, category: 'refrigerantes'},
    // Águas e Gelo
    {id: 14, name: 'Água Crystal 1,5L', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', price: 3.50, category: 'aguas'},
    {id: 15, name: 'Água com Gás Perrier', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', price: 8.90, category: 'aguas'},
    {id: 16, name: 'Gelo 2kg', image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=400', price: 5.00, category: 'aguas'},
    // Chopp
    {id: 17, name: 'Chopp Brahma 1L', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 18.90, category: 'chopp'},
    {id: 18, name: 'Chopp Heineken 1L', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 22.50, category: 'chopp'},
    {id: 19, name: 'Chopp Stella Artois 1L', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', price: 24.90, category: 'chopp'}
];

// Renderizar produtos
window.renderProducts = function(productsToRender = window.products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        grid.innerHTML = productsToRender.map((product, index) => `
            <div class="product-card" style="animation-delay: ${index * 0.1}s">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/400x200/333/fff?text=Produto'">
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Adicionar 🛒
                    </button>
                    <button class="whatsapp-btn-small" onclick="openWhatsApp('${product.name}')">
                        WhatsApp 💬
                    </button>
                </div>
            </div>
        `).join('');
        
        grid.style.transition = 'all 0.4s ease';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    }, 100);
};

window.addToCart = function(productId) {
    const product = window.products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
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
    console.log('Produto adicionado ao carrinho:', product.name);
    
    // Mostrar notificação visual ao invés de alert
    showCartNotification();
};

window.filterProducts = function(category) {
    const filteredProducts = category === 'all' 
        ? window.products 
        : window.products.filter(product => product.category === category);
    
    window.renderProducts(filteredProducts);
};

window.openCategoryPage = function(category) {
    window.filterProducts(category);
};

window.renderAdminProducts = function() {
    const list = document.getElementById('admin-products-list');
    const filter = document.getElementById('admin-category-filter');
    const selectedCategory = filter ? filter.value : 'all';
    
    if (!list) return;
    
    const filteredProducts = selectedCategory === 'all' 
        ? window.products 
        : window.products.filter(product => product.category === selectedCategory);
    
    const categoryNames = {
        'cervejas': 'Cervejas',
        'drinks': 'Drinks',
        'vinhos': 'Vinhos',
        'refrigerantes': 'Refrigerantes',
        'aguas': 'Águas e Gelo',
        'chopp': 'Chopp'
    };
    
    list.innerHTML = filteredProducts.map(product => `
        <div class="product-item">
            <div class="product-info">
                <strong>${product.name}</strong><br>
                <span style="color: #d4af37;">R$ ${product.price.toFixed(2)}</span><br>
                <small style="color: #999;">${categoryNames[product.category] || product.category}</small>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">
                    Editar
                </button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
};

window.filterAdminProducts = function() {
    window.renderAdminProducts();
};

// Funções do menu lateral
window.toggleWhatsAppBot = function() {
    const bot = document.getElementById('whatsapp-bot-container');
    if (bot) {
        bot.style.display = bot.style.display === 'flex' ? 'none' : 'flex';
    }
};

window.toggleChatBot = function() {
    const chatbot = document.getElementById('chatbot-container');
    if (chatbot) {
        chatbot.classList.toggle('active');
    }
};

window.goToCheckout = async function() {
    const cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
    
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryAddress = localStorage.getItem('deliveryAddress') || 'Endereço não informado';
    
    try {
        console.log('Tentando salvar pedido no Supabase...');
        console.log('Dados do pedido:', { valor_total: cartTotal, endereco: deliveryAddress });
        
        // Verificar se supabase está disponível
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase não está disponível');
        }
        
        // Salvar pedido no Supabase
        const { data, error } = await supabase
            .from('pedidos')
            .insert({
                valor_total: cartTotal,
                pontos_ganhos: Math.floor(cartTotal / 10),
                status: 'novo',
                forma_pagamento: 'A definir',
                endereco: deliveryAddress
            })
            .select()
            .single();
            
        if (error) {
            console.error('Erro detalhado do Supabase:', error);
            throw error;
        }
        
        console.log('✅ Pedido salvo no banco:', data);
        
        // Salvar dados do carrinho para o checkout
        localStorage.setItem('checkoutCart', JSON.stringify(cart));
        localStorage.setItem('currentOrderId', data.id);
        
        // Limpar carrinho
        localStorage.removeItem('adegaCart');
        updateCartDisplay();
        
        // Redirecionar para a página de checkout
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('❌ Erro ao salvar pedido:', error);
        
        // Salvar localmente como fallback
        const localOrder = {
            id: Date.now(),
            valor_total: cartTotal,
            pontos_ganhos: Math.floor(cartTotal / 10),
            status: 'novo',
            forma_pagamento: 'A definir',
            endereco: deliveryAddress,
            data_pedido: new Date().toISOString(),
            items: cart
        };
        
        const orders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        orders.push(localOrder);
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        
        console.log('Pedido salvo localmente:', localOrder.id);
        
        // Salvar dados do carrinho para o checkout
        localStorage.setItem('checkoutCart', JSON.stringify(cart));
        localStorage.setItem('currentOrderId', localOrder.id);
        
        // Limpar carrinho
        localStorage.removeItem('adegaCart');
        updateCartDisplay();
        
        // Redirecionar para a página de checkout
        window.location.href = 'checkout.html';
    }
};

// Funções de fidelidade
window.closeLoyaltyModal = function() {
    const modal = document.getElementById('loyalty-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.skipLoyalty = function() {
    window.closeLoyaltyModal();
};

window.createLoyaltyAccount = function() {
    // Redirecionar para a função real no loyalty.js
    if (typeof createLoyaltyAccount === 'function') {
        createLoyaltyAccount();
    }
};

window.createModalLoyaltyAccount = function() {
    // Redirecionar para a função real no loyalty.js
    if (typeof createModalLoyaltyAccount === 'function') {
        createModalLoyaltyAccount();
    }
};

// Carregar produtos do banco de dados
async function loadProductsFromDB() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            // Converter campos do banco para formato local
            window.products = data.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                image: item.image
            }));
            localStorage.setItem('adegaProducts', JSON.stringify(window.products));
            console.log(`✅ ${data.length} produtos carregados do banco`);
        }
    } catch (error) {
        console.log('⚠️ Usando produtos padrão:', error.message);
    }
    
    if (window.renderProducts) {
        window.renderProducts();
    }
}

// Carregar produtos quando a página estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    // Primeiro carregar do localStorage se existir
    const savedProducts = localStorage.getItem('adegaProducts');
    if (savedProducts) {
        window.products = JSON.parse(savedProducts);
        window.renderProducts();
        console.log('✅ Produtos carregados do localStorage');
    }
    
    // Carregar carrinho e atualizar display
    updateCartDisplay();
    
    // Depois tentar carregar do banco
    setTimeout(() => {
        if (typeof supabase !== 'undefined') {
            loadProductsFromDB();
        } else if (!savedProducts) {
            window.renderProducts();
            console.log('✅ Produtos padrão carregados!');
        }
    }, 1000);
    
    // Escutar mudanças no localStorage para sincronizar entre abas
    window.addEventListener('storage', function(e) {
        if (e.key === 'adegaProducts') {
            window.products = JSON.parse(e.newValue || '[]');
            window.renderProducts();
            console.log('✅ Produtos atualizados via storage event');
        }
        if (e.key === 'adegaCart') {
            updateCartDisplay();
        }
    });
});

console.log('✅ Correções de navegação carregadas!');