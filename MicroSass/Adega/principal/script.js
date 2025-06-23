// Configurações padrão
let config = {
    adegaName: 'Adega do Tio Pancho',
    whatsappNumber: '1193394-9002',
    defaultMessage: 'Oi, quero ver as ofertas da adega!'
};

// Analytics
let analytics = {
    whatsappClicks: 0,
    productViews: {},
    dailyVisitors: 0,
    lastVisit: null
};

// Produtos padrão
let products = [
    {
        id: 1,
        name: 'Combo Cerveja Artesanal',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 45.90,
        category: 'combos'
    },
    {
        id: 2,
        name: 'Vinho Tinto Premium',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        price: 89.90,
        category: 'bebidas'
    },
    {
        id: 3,
        name: 'Kit Whisky + Taças',
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
        price: 159.90,
        category: 'combos'
    },
    {
        id: 4,
        name: 'Promoção Cerveja Gelada',
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400',
        price: 12.90,
        category: 'promocoes'
    }
];

// Carrinho de compras
let cart = [];

// Carregar dados do localStorage
function loadData() {
    const savedConfig = localStorage.getItem('adegaConfig');
    const savedProducts = localStorage.getItem('adegaProducts');
    const savedAnalytics = localStorage.getItem('adegaAnalytics');
    const savedCart = localStorage.getItem('adegaCart');
    
    if (savedConfig) {
        config = JSON.parse(savedConfig);
    }
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    
    if (savedAnalytics) {
        analytics = JSON.parse(savedAnalytics);
    }
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    // Contar visitante diário
    const today = new Date().toDateString();
    if (analytics.lastVisit !== today) {
        analytics.dailyVisitors++;
        analytics.lastVisit = today;
        saveAnalytics();
    }
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('adegaConfig', JSON.stringify(config));
    localStorage.setItem('adegaProducts', JSON.stringify(products));
}

// Salvar carrinho
function saveCart() {
    localStorage.setItem('adegaCart', JSON.stringify(cart));
}

// Salvar analytics
function saveAnalytics() {
    localStorage.setItem('adegaAnalytics', JSON.stringify(analytics));
}

// Abrir WhatsApp
function openWhatsApp(productName = null) {
    // Garantir que usa o número atualizado
    const currentNumber = config.whatsappNumber || '5599999999999';
    let message = config.defaultMessage || 'Oi, quero ver as ofertas da adega!';
    
    if (productName) {
        message = `Oi! Tenho interesse no produto: ${productName}. Pode me dar mais informações?`;
        analytics.productViews[productName] = (analytics.productViews[productName] || 0) + 1;
    }
    
    analytics.whatsappClicks++;
    saveAnalytics();
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${currentNumber}?text=${encodedMessage}`;
    
    console.log('WhatsApp URL:', whatsappUrl); // Para debug
    window.open(whatsappUrl, '_blank');
}

// Filtrar produtos
function filterProducts(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    renderProducts(filteredProducts);
}

// Renderizar produtos
function renderProducts(productsToRender = products) {
    const grid = document.getElementById('products-grid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum produto encontrado.</p>';
        return;
    }
    
    grid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-category="${product.category}">
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
            <div class="suggestions" id="suggestions-${product.id}"></div>
        </div>
    `).join('');
    
    updateCartDisplay();
    loadSuggestions();
}

// Sugestões de produtos
const productSuggestions = {
    1: [2, 4], // Combo Cerveja -> Vinho, Promoção
    2: [3, 1], // Vinho -> Whisky, Combo Cerveja
    3: [2, 4], // Whisky -> Vinho, Promoção
    4: [1, 2]  // Promoção -> Combo, Vinho
};

function loadSuggestions() {
    products.forEach(product => {
        const suggestionsDiv = document.getElementById(`suggestions-${product.id}`);
        if (suggestionsDiv && productSuggestions[product.id]) {
            const suggestedIds = productSuggestions[product.id];
            const suggestedProducts = products.filter(p => suggestedIds.includes(p.id));
            
            if (suggestedProducts.length > 0) {
                suggestionsDiv.innerHTML = `
                    <div class="suggestions-title">Quem comprou isso também comprou:</div>
                    <div class="suggestions-list">
                        ${suggestedProducts.map(sp => `
                            <div class="suggestion-item" onclick="addToCart(${sp.id})">
                                <span>${sp.name}</span>
                                <span>R$ ${sp.price.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    });
}

// Calculadora de frete por quilometragem
function calculateShipping() {
    const cep = document.getElementById('cep-input').value.replace(/\D/g, '');
    const resultDiv = document.getElementById('shipping-result');
    
    if (cep.length !== 8) {
        resultDiv.innerHTML = '<p style="color: #dc3545;">CEP inválido</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p style="color: #d4af37;">Calculando frete...</p>';
    
    // Distâncias aproximadas por região (em km)
    const region = cep.substring(0, 2);
    let distance;
    
    switch(region) {
        case '12': distance = 15; break; // Atibaia
        case '01': case '02': case '03': case '04': case '05': distance = 65; break; // São Paulo
        case '13': case '19': distance = 45; break; // Campinas
        case '20': case '21': case '22': case '23': case '24': distance = 450; break; // Rio de Janeiro
        case '30': case '31': case '32': case '33': case '34': distance = 380; break; // Minas Gerais
        case '40': case '41': case '42': case '43': case '44': distance = 1200; break; // Bahia
        case '50': case '51': case '52': case '53': case '54': distance = 2100; break; // Pernambuco
        case '60': case '61': case '62': case '63': distance = 2400; break; // Ceará
        case '70': case '71': case '72': case '73': distance = 1000; break; // Brasília
        case '80': case '81': case '82': case '83': distance = 400; break; // Paraná
        case '90': case '91': case '92': case '93': distance = 1100; break; // Rio Grande do Sul
        default: distance = 800; // Média nacional
    }
    
    // Cálculo: R$ 1,25 por km + taxa fixa de R$ 5,00
    const pricePerKm = 1.25;
    const fixedFee = 5.00;
    const deliveryPrice = (distance * pricePerKm) + fixedFee;
    
    // Prazo baseado na distância
    let deliveryTime;
    if (distance <= 50) deliveryTime = '1-2 dias';
    else if (distance <= 200) deliveryTime = '2-4 dias';
    else if (distance <= 500) deliveryTime = '3-6 dias';
    else if (distance <= 1000) deliveryTime = '4-8 dias';
    else deliveryTime = '5-12 dias';
    
    setTimeout(() => {
        resultDiv.innerHTML = `
            <div class="distance-info">Distância: ${distance} km</div>
            <div class="shipping-options">
                <div class="shipping-option">
                    <span><strong>Entrega</strong><br>${deliveryTime}</span>
                    <span>R$ ${deliveryPrice.toFixed(2)}</span>
                </div>
                <div class="shipping-option">
                    <span><strong>Retirada na Loja</strong><br>Hoje</span>
                    <span>R$ 0,00</span>
                </div>
            </div>
        `;
    }, 1000);
}

// Modal Admin
function showAdminLogin() {
    document.getElementById('admin-modal').style.display = 'block';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// Login Admin
function adminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === 'admin123') {
        closeAdminModal();
        showAdminPanel();
    } else {
        alert('Senha incorreta!');
    }
}



// Carregar dados no admin
function loadAdminData() {
    document.getElementById('adega-name').value = config.adegaName;
    document.getElementById('whatsapp-number').value = config.whatsappNumber;
    document.getElementById('default-message').value = config.defaultMessage;
    
    updateAnalyticsDisplay();
    renderAdminProducts();
}

// Atualizar display de analytics
function updateAnalyticsDisplay() {
    document.getElementById('whatsapp-clicks').textContent = analytics.whatsappClicks;
    document.getElementById('daily-visitors').textContent = analytics.dailyVisitors;
    
    // Produtos mais populares
    const popular = Object.entries(analytics.productViews)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, views]) => `${name}: ${views}`)
        .join('<br>');
    
    document.getElementById('popular-products').innerHTML = popular || 'Nenhum dado ainda';
}

// Resetar analytics
function resetAnalytics() {
    if (confirm('Tem certeza que deseja resetar todos os dados de analytics?')) {
        analytics = {
            whatsappClicks: 0,
            productViews: {},
            dailyVisitors: 0,
            lastVisit: null
        };
        saveAnalytics();
        updateAnalyticsDisplay();
        alert('Dados resetados com sucesso!');
    }
}

// Renderizar produtos no admin
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    
    if (products.length === 0) {
        list.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    list.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-info">
                <strong>${product.name}</strong><br>
                <span style="color: #d4af37;">R$ ${product.price.toFixed(2)}</span> - 
                <span style="text-transform: capitalize;">${product.category}</span>
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
}

// Salvar configurações
function saveSettings() {
    const newName = document.getElementById('adega-name').value.trim();
    const newNumber = document.getElementById('whatsapp-number').value.trim();
    const newMessage = document.getElementById('default-message').value.trim();
    
    if (!newName || !newNumber) {
        alert('Nome da adega e número do WhatsApp são obrigatórios!');
        return;
    }
    
    // Validar formato do número
    if (!/^\d{10,15}$/.test(newNumber)) {
        alert('Número do WhatsApp deve ter entre 10 e 15 dígitos!');
        return;
    }
    
    config.adegaName = newName;
    config.whatsappNumber = newNumber;
    config.defaultMessage = newMessage;
    
    saveData();
    updateSiteContent();
    
    console.log('Novo número WhatsApp salvo:', config.whatsappNumber);
    alert('Configurações salvas com sucesso!');
}

// Atualizar conteúdo do site em tempo real
function updateSiteContent() {
    document.querySelector('.logo h1').textContent = `🍷 ${config.adegaName}`;
    document.title = `${config.adegaName} - Bebidas Premium e Combos Especiais`;
}

// Adicionar produto
function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const image = document.getElementById('product-image').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    
    if (!name || !price || price <= 0) {
        alert('Preencha o nome e um preço válido para o produto!');
        return;
    }
    
    const newProduct = {
        id: Date.now(),
        name,
        image: image || 'https://via.placeholder.com/400x200/333/fff?text=Produto',
        price,
        category
    };
    
    products.push(newProduct);
    saveData();
    
    clearProductForm();
    refreshProductDisplay();
    
    alert('Produto adicionado com sucesso!');
}

// Limpar formulário de produto
function clearProductForm() {
    document.getElementById('product-name').value = '';
    document.getElementById('product-image').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').selectedIndex = 0;
}

// Atualizar display de produtos
function refreshProductDisplay() {
    renderProducts();
    renderAdminProducts();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    filterButtons[0].classList.add('active');
}

// Excluir produto
function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
        products = products.filter(product => product.id !== id);
        saveData();
        refreshProductDisplay();
        
        if (analytics.productViews[product.name]) {
            delete analytics.productViews[product.name];
            saveAnalytics();
            updateAnalyticsDisplay();
        }
    }
}

// Editar produto
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Nome do produto:', product.name);
    if (!newName || newName.trim() === '') return;
    
    const newPrice = prompt('Preço do produto:', product.price);
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) return;
    
    const newImage = prompt('URL da imagem (deixe vazio para manter):', product.image);
    
    product.name = newName.trim();
    product.price = parseFloat(newPrice);
    if (newImage && newImage.trim() !== '') {
        product.image = newImage.trim();
    }
    
    saveData();
    refreshProductDisplay();
    alert('Produto atualizado com sucesso!');
}



// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('admin-modal');
    if (event.target === modal) {
        closeAdminModal();
    }
}

// Enter no campo de senha
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('admin-password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});

// Salvar estado do admin
function saveAdminState() {
    localStorage.setItem('adminOpen', 'true');
}

function clearAdminState() {
    localStorage.removeItem('adminOpen');
}

// Mostrar painel admin
function showAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
    saveAdminState();
    loadAdminData();
}

// Logout admin
function logout() {
    document.getElementById('admin-panel').classList.add('hidden');
    clearAdminState();
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderProducts();
    
    if (config.adegaName !== 'Adega do Tio Pancho') {
        updateSiteContent();
    }
    
    // Verificar se admin estava aberto
    if (localStorage.getItem('adminOpen') === 'true') {
        showAdminPanel();
    }
    
    updateCartDisplay();
    
    // Validação em tempo real
    const whatsappInput = document.getElementById('whatsapp-number');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 13) value = value.slice(0, 13);
            this.value = value;
        });
    }
    
    const priceInput = document.getElementById('product-price');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
        });
    }
});

// Funções do Carrinho
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
    
    saveCart();
    updateCartDisplay();
    showCartNotification();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

function updateCartQuantity(productId, quantity) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            cartItem.quantity = quantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Atualizar badge do menu
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    // Atualizar total do modal
    const cartTotalModal = document.getElementById('cart-total-modal');
    if (cartTotalModal) {
        cartTotalModal.textContent = `R$ ${cartTotal.toFixed(2)}`;
    }
    
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
                        <span>R$ ${item.price.toFixed(2)} x ${item.quantity}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Produto adicionado ao carrinho!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    updateCartDisplay();
    
    // Fechar menu se estiver aberto
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    const paymentText = {
        'pix': 'PIX',
        'cartao': 'Cartão',
        'dinheiro': 'Dinheiro'
    };
    
    let message = 'Olá! Gostaria de fazer este pedido:\n\n';
    
    cart.forEach(item => {
        message += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\nTotal: R$ ${cartTotal.toFixed(2)}`;
    message += `\nForma de Pagamento: ${paymentText[selectedPayment]}`;
    
    // Salvar pedido no sistema
    saveOrderToSystem(cart, cartTotal, selectedPayment);
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    cart = [];
    saveCart();
    updateCartDisplay();
    
    // Fechar carrinho após envio
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    
    analytics.whatsappClicks++;
    saveAnalytics();
}

// Salvar pedido no sistema de gestão
function saveOrderToSystem(cartItems, total, paymentMethod) {
    const orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];
    
    const paymentText = {
        'pix': 'PIX',
        'cartao': 'Cartão',
        'dinheiro': 'Dinheiro'
    };
    
    const newOrder = {
        id: Date.now(),
        customer: 'Cliente WhatsApp',
        date: new Date().toISOString(),
        status: 'novo',
        total: total,
        paymentMethod: paymentText[paymentMethod],
        items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('adegaOrders', JSON.stringify(orders));
}

// Abrir gestão de pedidos
function openOrdersManagement() {
    window.open('../pedidos/gestao.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Navegação do menu
function showSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Mostrar seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Atualizar menu ativo
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Chat Bot
function toggleChatBot() {
    const chatbot = document.getElementById('chatbot-container');
    chatbot.classList.toggle('active');
    
    // Fechar menu se estiver aberto
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simular resposta do bot
    setTimeout(() => {
        const response = getBotResponse(message.toLowerCase());
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(message) {
    // Respostas automáticas baseadas em palavras-chave
    if (message.includes('horário') || message.includes('funcionamento')) {
        return 'Funcionamos de Segunda a Domingo: 09:00-22:00. Entregas até 20:00.';
    }
    if (message.includes('endereço') || message.includes('localização')) {
        return 'Estamos na R. Oswaldo Barreto, 708 E - Alvinópolis, Atibaia - SP, 12942-570.';
    }
    if (message.includes('entrega') || message.includes('frete')) {
        return 'Fazemos entregas! Use nossa calculadora de frete no carrinho para ver preços e prazos.';
    }
    if (message.includes('produto') || message.includes('bebida')) {
        return 'Temos vinhos, cervejas artesanais, destilados e combos especiais. Veja nossa seção de produtos!';
    }
    if (message.includes('preço') || message.includes('valor')) {
        return 'Nossos preços são competitivos! Veja todos os valores na seção de produtos.';
    }
    if (message.includes('whatsapp') || message.includes('contato')) {
        return 'Nosso WhatsApp: (11) 93394-9002. Ou use os botões do site para contato direto!';
    }
    if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde')) {
        return 'Olá! Como posso ajudar você hoje? Posso falar sobre produtos, entregas, horários ou localização.';
    }
    
    // Resposta padrão
    return 'Desculpe, não entendi. Posso ajudar com: produtos, entregas, horários, endereço ou contato. Ou fale direto no WhatsApp: (11) 93394-9002';
}