// Configurações padrão
let config = {
    adegaName: 'Adega do Tio Pancho',
    whatsappNumber: '1193394-9002',
    defaultMessage: 'Oi, quero ver as ofertas da adega!',
    paymentLink: 'https://mpago.la/2TkKdAB?amount={valor}&description={descricao}'
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
    
    // Detectar se é mobile para usar URL apropriada
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappUrl = `https://wa.me/${currentNumber}?text=${encodedMessage}`;
    
    console.log('WhatsApp URL:', whatsappUrl, 'Mobile:', isMobile);
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

// Renderizar produtos com carrossel
function renderProducts(productsToRender = products) {
    const grid = document.getElementById('products-grid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum produto encontrado.</p>';
        return;
    }
    
    grid.innerHTML = productsToRender.map(product => {
        const hasMultipleImages = product.images && product.images.length > 1;
        
        return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image-container">
                ${hasMultipleImages ? `
                    <div class="product-carousel" id="carousel-${product.id}">
                        <div class="carousel-nav prev" onclick="prevProductImage(${product.id})">‹</div>
                        <img src="${product.images[0]}" alt="${product.name}" class="product-image" 
                             onerror="this.src='https://via.placeholder.com/400x200/333/fff?text=Produto'">
                        <div class="carousel-nav next" onclick="nextProductImage(${product.id})">›</div>
                        <div class="carousel-dots">
                            ${product.images.map((_, index) => `
                                <div class="dot ${index === 0 ? 'active' : ''}" onclick="goToProductImage(${product.id}, ${index})"></div>
                            `).join('')}
                        </div>
                        <div class="image-counter">${1}/${product.images.length}</div>
                    </div>
                ` : `
                    <img src="${product.image}" alt="${product.name}" class="product-image" 
                         onerror="this.src='https://via.placeholder.com/400x200/333/fff?text=Produto'">
                `}
            </div>
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
    `;
    }).join('');
    
    updateCartDisplay();
    loadSuggestions();
    initializeProductCarousels();
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

// Salvar configurações de IA
function saveAISettings() {
    const apiKey = document.getElementById('openai-api-key').value.trim();
    
    if (apiKey) {
        localStorage.setItem('openai-api-key', apiKey);
        alert('Chave da API salva! Chatbot inteligente ativado.');
    } else {
        localStorage.removeItem('openai-api-key');
        alert('Chave removida. Chatbot usará respostas locais.');
    }
}

// Testar IA
async function testAI() {
    try {
        const response = await getAIResponse('Olá, você está funcionando?');
        alert('IA funcionando! Resposta: ' + response);
    } catch (error) {
        alert('Erro na IA: ' + error.message + '. Verifique sua chave da API.');
    }
}

// Carregar dados no admin
function loadAdminData() {
    document.getElementById('adega-name').value = config.adegaName;
    document.getElementById('whatsapp-number').value = config.whatsappNumber;
    document.getElementById('default-message').value = config.defaultMessage;
    document.getElementById('payment-link').value = config.paymentLink || '';
    
    // Mostrar status da API
    const apiKey = localStorage.getItem('openai-api-key');
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKey && !apiKey.startsWith('***')) {
        apiKeyInput.placeholder = 'Chave configurada (clique para alterar)';
        apiKeyInput.value = '';
    } else {
        apiKeyInput.placeholder = 'Chave da API OpenAI (opcional)';
    }
    
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
    const paymentLink = document.getElementById('payment-link').value.trim();
    
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
    config.paymentLink = paymentLink;
    
    saveData();
    updateSiteContent();
    
    console.log('Novo número WhatsApp salvo:', config.whatsappNumber);
    console.log('Link de pagamento salvo:', config.paymentLink);
    alert('Configurações salvas com sucesso!');
}

// Atualizar conteúdo do site em tempo real
function updateSiteContent() {
    document.querySelector('.logo h1').textContent = `🍷 ${config.adegaName}`;
    document.title = `${config.adegaName} - Bebidas Premium e Combos Especiais`;
}

// Preview com navegação entre múltiplas imagens
function previewImage(input) {
    const previewDiv = document.getElementById('image-preview');
    
    if (input.files && input.files.length > 0) {
        const files = Array.from(input.files);
        let currentIndex = 0;
        
        function showImage(index) {
            const file = files[index];
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewDiv.innerHTML = `
                    <div class="image-carousel">
                        <div class="carousel-header">
                            <span>Imagem ${index + 1} de ${files.length}</span>
                            <div class="carousel-controls">
                                <button onclick="previousImage()" ${index === 0 ? 'disabled' : ''}>‹</button>
                                <button onclick="nextImage()" ${index === files.length - 1 ? 'disabled' : ''}>›</button>
                            </div>
                        </div>
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <div class="image-preview-info">
                            ✅ ${file.name} - ${(file.size / 1024).toFixed(1)} KB
                        </div>
                        <div class="image-thumbnails">
                            ${files.map((f, i) => `
                                <div class="thumbnail ${i === index ? 'active' : ''}" onclick="showImageAt(${i})">
                                    ${i + 1}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
        
        window.currentImageIndex = currentIndex;
        window.imageFiles = files;
        
        window.nextImage = () => {
            if (window.currentImageIndex < window.imageFiles.length - 1) {
                window.currentImageIndex++;
                showImage(window.currentImageIndex);
            }
        };
        
        window.previousImage = () => {
            if (window.currentImageIndex > 0) {
                window.currentImageIndex--;
                showImage(window.currentImageIndex);
            }
        };
        
        window.showImageAt = (index) => {
            window.currentImageIndex = index;
            showImage(index);
        };
        
        showImage(0);
    } else {
        previewDiv.innerHTML = '';
    }
}

// Adicionar produto
function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const imageFiles = document.getElementById('product-image-file').files;
    const imageUrl = document.getElementById('product-image-url').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    
    if (!name || !price || price <= 0) {
        alert('Preencha o nome e um preço válido para o produto!');
        return;
    }
    
    if (imageFiles.length > 0) {
        const images = [];
        let processedCount = 0;
        
        Array.from(imageFiles).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                images[index] = e.target.result;
                processedCount++;
                
                if (processedCount === imageFiles.length) {
                    const newProduct = {
                        id: Date.now(),
                        name,
                        images: images,
                        image: images[0],
                        price,
                        category
                    };
                    
                    products.push(newProduct);
                    saveData();
                    clearProductForm();
                    refreshProductDisplay();
                    alert('Produto adicionado com sucesso!');
                }
            };
            reader.readAsDataURL(file);
        });
        return;
    }
    
    const finalImageUrl = imageUrl || 'https://via.placeholder.com/400x200/333/fff?text=Produto';
    
    const newProduct = {
        id: Date.now(),
        name,
        images: [finalImageUrl],
        image: finalImageUrl,
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
    document.getElementById('product-image-file').value = '';
    document.getElementById('product-image-url').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').selectedIndex = 0;
    document.getElementById('image-preview').innerHTML = '';
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
    // Não salvar estado automaticamente
    loadAdminData();
}

// Ir para home (ícone da casa)
function goToHome() {
    // Se admin estiver aberto, fechar
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel.classList.contains('hidden')) {
        adminPanel.classList.add('hidden');
        clearAdminState();
    }
    
    // Ir para seção home
    showSection('home');
}

// Voltar ao site
function backToSite() {
    document.getElementById('admin-panel').classList.add('hidden');
    // Limpar estado para não abrir automaticamente
    clearAdminState();
    showSection('home');
}

// Logout admin
function logout() {
    document.getElementById('admin-panel').classList.add('hidden');
    clearAdminState();
}

// Funções para gerenciar o endereço de entrega
function saveDeliveryAddress() {
    // Obter valores dos campos
    const cep = document.getElementById('address-cep').value.trim();
    const street = document.getElementById('address-street').value.trim();
    const number = document.getElementById('address-number').value.trim();
    const complement = document.getElementById('address-complement').value.trim();
    const neighborhood = document.getElementById('address-neighborhood').value.trim();
    const city = document.getElementById('address-city').value.trim();
    
    // Validar campos obrigatórios
    if (!cep || !street || !number || !neighborhood || !city) {
        alert('Por favor, preencha todos os campos obrigatórios (marcados com ✅).');
        return;
    }
    
    // Formatar endereço completo
    const addressText = `${street}, ${number}${complement ? ` - ${complement}` : ''}
${neighborhood}, ${city}
CEP: ${cep}`;
    
    // Salvar no localStorage
    try {
        // Salvar endereço formatado
        localStorage.setItem('deliveryAddress', addressText);
        
        // Salvar campos individuais para uso futuro
        const addressData = { cep, street, number, complement, neighborhood, city };
        localStorage.setItem('deliveryAddressData', JSON.stringify(addressData));
        
        console.log('Endereço salvo no localStorage:', addressText);
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        alert('Erro ao salvar o endereço. Por favor, tente novamente.');
        return;
    }
    
    // Mostrar o endereço salvo
    const addressDisplay = document.getElementById('address-display');
    const savedAddressDiv = document.getElementById('saved-address');
    const addressForm = document.getElementById('delivery-address-form');
    
    if (addressDisplay) addressDisplay.textContent = addressText;
    if (savedAddressDiv) savedAddressDiv.style.display = 'block';
    if (addressForm) addressForm.style.display = 'none';
    
    // Notificar o usuário
    alert('Endereço de entrega salvo com sucesso!');
}

function editDeliveryAddress() {
    // Recuperar dados do endereço salvo
    const savedAddressData = localStorage.getItem('deliveryAddressData');
    console.log('Editando endereço:', savedAddressData);
    
    const addressForm = document.getElementById('delivery-address-form');
    const savedAddressDiv = document.getElementById('saved-address');
    
    // Mostrar formulário e esconder endereço salvo
    if (addressForm) addressForm.style.display = 'flex';
    if (savedAddressDiv) savedAddressDiv.style.display = 'none';
    
    // Preencher campos com dados salvos
    if (savedAddressData) {
        try {
            const addressData = JSON.parse(savedAddressData);
            
            // Preencher cada campo
            document.getElementById('address-cep').value = addressData.cep || '';
            document.getElementById('address-street').value = addressData.street || '';
            document.getElementById('address-number').value = addressData.number || '';
            document.getElementById('address-complement').value = addressData.complement || '';
            document.getElementById('address-neighborhood').value = addressData.neighborhood || '';
            document.getElementById('address-city').value = addressData.city || '';
        } catch (error) {
            console.error('Erro ao carregar dados do endereço:', error);
        }
    }
}

function loadDeliveryAddress() {
    try {
        const savedAddress = localStorage.getItem('deliveryAddress');
        console.log('Tentando carregar endereço:', savedAddress);
        
        const addressDisplay = document.getElementById('address-display');
        const savedAddressDiv = document.getElementById('saved-address');
        const addressForm = document.getElementById('delivery-address-form');
        
        if (!addressDisplay || !savedAddressDiv || !addressForm) {
            console.error('Elementos não encontrados no DOM');
            return false;
        }
        
        if (savedAddress) {
            addressDisplay.textContent = savedAddress;
            savedAddressDiv.style.display = 'block';
            addressForm.style.display = 'none';
            console.log('Endereço exibido com sucesso');
        } else {
            savedAddressDiv.style.display = 'none';
            addressForm.style.display = 'flex';
            console.log('Nenhum endereço salvo encontrado');
        }
        return true;
    } catch (error) {
        console.error('Erro ao carregar endereço:', error);
        return false;
    }
}

// Função para garantir que o endereço seja carregado
function ensureAddressLoaded(attempts = 0) {
    // Limitar o número de tentativas para evitar loops infinitos
    if (attempts > 10) {
        console.error('Não foi possível carregar o endereço após várias tentativas');
        return;
    }
    
    // Verificar se os elementos necessários existem
    const addressDisplay = document.getElementById('address-display');
    const savedAddressDiv = document.getElementById('saved-address');
    const addressForm = document.getElementById('delivery-address-form');
    
    if (!addressDisplay || !savedAddressDiv || !addressForm) {
        console.log(`Elementos ainda não estão prontos, tentativa ${attempts + 1}/10, tentando novamente em 200ms...`);
        setTimeout(() => ensureAddressLoaded(attempts + 1), 200);
        return;
    }
    
    console.log('Elementos encontrados, carregando endereço...');
    const success = loadDeliveryAddress();
    
    if (!success) {
        console.log('Falha ao carregar endereço, tentando novamente em 500ms...');
        setTimeout(() => ensureAddressLoaded(attempts + 1), 500);
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderProducts();
    
    if (config.adegaName !== 'Adega do Tio Pancho') {
        updateSiteContent();
    }
    
    // Inicializar sistema de analytics
    if (!window.CartAnalytics) {
        console.log('Inicializando sistema de analytics...');
        initializeCartAnalytics();
    }
    
    // Carregar endereço de entrega salvo com retry
    console.log('Iniciando carregamento do endereço de entrega...');
    ensureAddressLoaded();
    
    updateCartDisplay();
});

// Garantir que o endereço seja carregado mesmo após o carregamento completo da página
window.addEventListener('load', function() {
    console.log('Página totalmente carregada, verificando endereço...');
    initializeDeliveryAddress();
});

// Função de inicialização do endereço de entrega
function initializeDeliveryAddress() {
    // Verificar se há um endereço salvo no localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    console.log('Inicializando endereço de entrega, endereço salvo:', savedAddress);
    
    // Obter referências aos elementos
    const addressDisplay = document.getElementById('address-display');
    const savedAddressDiv = document.getElementById('saved-address');
    const addressForm = document.getElementById('delivery-address-form');
    
    // Verificar se todos os elementos existem
    if (!addressDisplay || !savedAddressDiv || !addressForm) {
        console.error('Elementos não encontrados, tentando novamente em 300ms...');
        setTimeout(initializeDeliveryAddress, 300);
        return;
    }
    
    // Configurar os elementos com base no endereço salvo
    if (savedAddress) {
        addressDisplay.textContent = savedAddress;
        savedAddressDiv.style.display = 'block';
        addressForm.style.display = 'none';
        console.log('Endereço exibido com sucesso na inicialização');
    } else {
        savedAddressDiv.style.display = 'none';
        addressForm.style.display = 'flex';
        console.log('Nenhum endereço salvo encontrado na inicialização');
    }
    
    // Adicionar máscara para o CEP
    const cepInput = document.getElementById('address-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            if (value.length > 5) {
                value = value.slice(0, 5) + '-' + value.slice(5);
            }
            this.value = value;
        });
    }
}
    
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

// Funções do Carrinho
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = cart.find(item => item.id === productId);
    const wasEmpty = cart.length === 0;
    
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
    
    // Analytics do carrinho
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (wasEmpty) {
        console.log('🛍️ Carrinho ativado:', cart.length, 'itens, R$', total);
        trackCartEvent('ativo', { items: cart.length, total, products: cart });
    } else {
        console.log('✏️ Carrinho editado:', cart.length, 'itens, R$', total);
        trackCartEvent('editado', { items: cart.length, total, products: cart });
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    
    // Analytics - carrinho editado ou abandonado
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cart.length === 0) {
        console.log('🚫 Carrinho esvaziado');
        // Solicitar telefone antes de abandonar
        const phone = requestPhoneForRecovery();
        trackCartEvent('desistido', { 
            reason: 'manual_clear', 
            items: 0, 
            total: 0,
            customerPhone: phone
        });
    } else {
        trackCartEvent('editado', { items: cart.length, total, products: cart });
    }
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
            
            // Analytics - carrinho editado
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            trackCartEvent('editado', { items: cart.length, total, products: cart });
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
    
    // Atualizar widget do carrinho no menu fixo
    const cartCountWidget = document.getElementById('cart-count-widget');
    const cartTotalWidget = document.getElementById('cart-total-widget');
    
    if (cartCountWidget) {
        cartCountWidget.textContent = `${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`;
    }
    if (cartTotalWidget) {
        cartTotalWidget.textContent = `R$ ${cartTotal.toFixed(2)}`;
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

function goToCheckout() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Verificar se há endereço de entrega salvo
    const deliveryAddress = localStorage.getItem('deliveryAddress');
    if (!deliveryAddress) {
        const confirmAddress = confirm('Você ainda não cadastrou um endereço de entrega. Deseja cadastrar agora?');
        if (confirmAddress) {
            // Mostrar seção de endereço
            showSection('home');
            
            // Mostrar formulário de endereço
            const addressForm = document.getElementById('delivery-address-form');
            const savedAddressDiv = document.getElementById('saved-address');
            
            if (addressForm) {
                addressForm.style.display = 'flex';
                // Focar no primeiro campo
                const cepInput = document.getElementById('address-cep');
                if (cepInput) cepInput.focus();
            }
            if (savedAddressDiv) savedAddressDiv.style.display = 'none';
            
            // Rolar para o formulário de endereço
            const addressCard = document.querySelector('.delivery-address-card');
            if (addressCard) {
                addressCard.scrollIntoView({ behavior: 'smooth' });
            }
            
            return;
        }
    }
    
    // Salvar dados do carrinho para a página de checkout
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    // Redirecionar para a página de checkout
    window.location.href = 'checkout.html';
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Mostrar indicador de processamento imediatamente
    const processingIndicator = document.createElement('div');
    processingIndicator.className = 'cart-notification';
    processingIndicator.innerHTML = '<span class="processing-animation">Processando pedido...</span>';
    document.body.appendChild(processingIndicator);
    
    // Calcular total do carrinho
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    const paymentText = {
        'pix': 'PIX',
        'cartao': 'Cartão',
        'dinheiro': 'Dinheiro'
    };
    
    // Obter endereço de entrega
    const deliveryAddress = localStorage.getItem('deliveryAddress') || 'Endereço não informado';
    
    // Salvar pedido no sistema (sem esperar)
    const orderId = saveOrderToSystem(cart, cartTotal, selectedPayment);
    
    // Preparar mensagem WhatsApp em segundo plano
    let message = 'Olá! Gostaria de fazer este pedido:\\n\\n';
    cart.forEach(item => {
        message += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\\n`;
    });
    message += `\\nTotal: R$ ${cartTotal.toFixed(2)}`;
    message += `\\nForma de Pagamento: ${paymentText[selectedPayment]}`;
    message += `\\n\\nEndereço de Entrega:\\n${deliveryAddress}`;
    
    // Remover indicador de processamento
    processingIndicator.remove();
    
    // Mostrar mensagem de pedido recebido
    showOrderConfirmation(orderId, cartTotal);
    
    // Preparar URL do WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp em uma nova aba (sem delay)
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 500);
    
    // Limpar carrinho após confirmação
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

// Mostrar mensagem de confirmação do pedido
function showOrderConfirmation(orderId, total) {
    // Criar modal de confirmação simplificado e otimizado
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    // Usar HTML mínimo para renderização mais rápida
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <div style="font-size: 3rem; color: #4CAF50;">✅</div>
            <h3 style="color: #4CAF50;">Pedido Recebido!</h3>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 0.5rem 0;">
                <p><strong>Número:</strong> #${orderId}</p>
                <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
            </div>
            <button onclick="closeOrderConfirmation()" style="background: #d4af37; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; margin-top: 0.5rem;">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fechar modal de confirmação
function closeOrderConfirmation() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Função de fallback para rastreamento de carrinho
function trackCartEvent(state, data = {}) {
    const analytics = JSON.parse(localStorage.getItem('cartAnalytics') || '{}');
    const events = JSON.parse(localStorage.getItem('cartEvents') || '[]');
    
    analytics[state] = (analytics[state] || 0) + 1;
    analytics.lastUpdate = new Date().toISOString();
    
    // Coletar informações do cliente se disponível
    const customerInfo = getCustomerInfo();
    
    events.push({
        state,
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(36),
        customerPhone: customerInfo.phone,
        customerName: customerInfo.name,
        ...data
    });
    
    if (events.length > 100) events.splice(0, events.length - 100);
    
    localStorage.setItem('cartAnalytics', JSON.stringify(analytics));
    localStorage.setItem('cartEvents', JSON.stringify(events));
    
    // Disparar evento para atualização imediata
    window.dispatchEvent(new CustomEvent('cartAnalyticsUpdate', { detail: { state, data } }));
    
    console.log(`📊 Cart Event: ${state}`, data);
}

// Obter informações do cliente
function getCustomerInfo() {
    // Tentar obter do formulário de checkout se existir
    const phoneInput = document.querySelector('input[name="phone"], input[id*="phone"], input[placeholder*="telefone"]');
    const nameInput = document.querySelector('input[name="name"], input[id*="name"], input[placeholder*="nome"]');
    
    return {
        phone: phoneInput ? phoneInput.value : null,
        name: nameInput ? nameInput.value : null
    };
}

// Solicitar telefone para recuperação
function requestPhoneForRecovery() {
    const phone = prompt('📱 Para recuperar seu carrinho caso saia da página, informe seu WhatsApp (opcional):');
    if (phone && phone.trim()) {
        localStorage.setItem('customerPhone', phone.trim());
        localStorage.setItem('customerPhoneTime', Date.now());
        return phone.trim();
    }
    return null;
}

// Inicializar sistema de analytics
function initializeCartAnalytics() {
    window.CartAnalytics = {
        trackEvent: trackCartEvent,
        onCartActivated: (items, total) => {
            trackCartEvent('ativo', { items: items.length, total, products: items });
        },
        onCartEdited: (items, total) => {
            trackCartEvent('editado', { items: items.length, total, products: items });
        },
        onOrderConfirmed: (orderId, items, total, paymentMethod) => {
            trackCartEvent('confirmado', { orderId, items: items.length, total, paymentMethod });
        },
        onCartAbandoned: (reason = 'manual') => {
            trackCartEvent('desistido', { reason });
        }
    };
    console.log('✅ Sistema CartAnalytics inicializado');
}

// Salvar pedido no sistema de gestão
function saveOrderToSystem(cartItems, total, paymentMethod) {
    const orderId = Date.now();
    localStorage.setItem('currentOrderId', orderId);
    
    const paymentText = {
        'pix': 'PIX',
        'cartao': 'Cartão',
        'dinheiro': 'Dinheiro'
    };
    
    const newOrder = {
        id: orderId,
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
    
    // Salvar pedido de forma assíncrona
    setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('adegaOrders')) || [];
        orders.push(newOrder);
        localStorage.setItem('adegaOrders', JSON.stringify(orders));
        
        // Analytics - pedido criado
        console.log('🆕 Pedido criado:', newOrder.id);
        trackCartEvent('novo', { orderId: newOrder.id, total });
        
        // Analytics - carrinho confirmado
        console.log('✅ Carrinho confirmado');
        trackCartEvent('confirmado', { total });
    }, 0);
    
    return orderId;
}

// Abrir gestão de pedidos
function openOrdersManagement() {
    window.open('../pedidos/gestao.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Abrir analytics do carrinho
function openCartAnalytics() {
    window.open('../analytics/analytics.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

// Funções do carrossel de produtos
let productCarouselStates = {};

function initializeProductCarousels() {
    products.forEach(product => {
        if (!product.images && product.image) {
            product.images = [product.image];
        }
        if (product.images && product.images.length > 1) {
            productCarouselStates[product.id] = { currentIndex: 0, images: product.images };
        }
    });
}

function nextProductImage(productId) {
    const state = productCarouselStates[productId];
    if (!state) return;
    
    state.currentIndex = (state.currentIndex + 1) % state.images.length;
    updateProductCarousel(productId);
}

function prevProductImage(productId) {
    const state = productCarouselStates[productId];
    if (!state) return;
    
    state.currentIndex = state.currentIndex === 0 ? state.images.length - 1 : state.currentIndex - 1;
    updateProductCarousel(productId);
}

function goToProductImage(productId, index) {
    const state = productCarouselStates[productId];
    if (!state) return;
    
    state.currentIndex = index;
    updateProductCarousel(productId);
}

function updateProductCarousel(productId) {
    const state = productCarouselStates[productId];
    const carousel = document.getElementById(`carousel-${productId}`);
    if (!carousel || !state) return;
    
    const img = carousel.querySelector('.product-image');
    const dots = carousel.querySelectorAll('.dot');
    const counter = carousel.querySelector('.image-counter');
    
    img.src = state.images[state.currentIndex];
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentIndex);
    });
    
    counter.textContent = `${state.currentIndex + 1}/${state.images.length}`;
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

async function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('send-btn');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addChatMessage(message, 'user');
    input.value = '';
    
    // Mostrar indicador de digitação
    sendBtn.innerHTML = '⏳';
    sendBtn.disabled = true;
    addTypingIndicator();
    
    try {
        // Tentar resposta inteligente primeiro
        const aiResponse = await getAIResponse(message);
        removeTypingIndicator();
        addChatMessage(aiResponse, 'bot');
    } catch (error) {
        // Fallback para resposta local
        removeTypingIndicator();
        const fallbackResponse = getBotResponse(message.toLowerCase());
        addChatMessage(fallbackResponse, 'bot');
    }
    
    sendBtn.innerHTML = '➤';
    sendBtn.disabled = false;
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Coletar dados do site
function getSiteData() {
    const siteData = {
        products: products.map(p => `${p.name} - R$ ${p.price.toFixed(2)} (${p.category})`).join('\n'),
        cart: cart.length > 0 ? cart.map(item => `${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n') : 'Carrinho vazio',
        cartTotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
    };
    return siteData;
}

// Resposta IA usando OpenAI API
async function getAIResponse(message) {
    const apiKey = localStorage.getItem('openai-api-key');
    
    if (!apiKey) {
        throw new Error('API key não configurada');
    }
    
    // Limpar chave se estiver mascarada
    if (apiKey.startsWith('***')) {
        throw new Error('Chave mascarada - insira a chave real');
    }
    
    const siteData = getSiteData();
    
    // Detectar mensagem de acompanhamento de pedido
    const orderTrackingPattern = /pedido #(\d+)/i;
    const orderMatch = message.match(orderTrackingPattern);
    
    if (orderMatch && (message.includes('acompanhar') || message.includes('andamento'))) {
        const orderId = orderMatch[1];
        return `Olá! 👋\nRecebemos seu pedido #${orderId} com sucesso!\nEle já está em processamento e em breve você receberá atualizações por aqui sobre cada etapa do seu pedido. ✅`;
    }
    
    const context = `Você é um assistente virtual da Adega do Tio Pancho, uma loja de bebidas premium em Atibaia, SP.

Informações da empresa:
- Nome: Adega do Tio Pancho
- Endereço: R. Oswaldo Barreto, 708 E - Alvinópolis, Atibaia - SP, 12942-570
- WhatsApp: (11) 93394-9002
- Horário: Domingo 09:00-18:00, Segunda 09:00-17:00, Terça-Quinta 10:00-20:00, Sexta-Sábado 10:00-22:00
- Entregas: 10:00-20:00
- Especialidade: Bebidas premium com entrega rápida

PRODUTOS DISPONÍVEIS:
${siteData.products}

CARRINHO ATUAL DO CLIENTE:
${siteData.cart}
Total do carrinho: R$ ${siteData.cartTotal}

Instrucções:
- Se a mensagem contiver "pedido #" e "acompanhar", responda: "Olá! 👋 Recebemos seu pedido #[número] com sucesso! Ele já está em processamento e em breve você receberá atualizações por aqui sobre cada etapa do seu pedido. ✅"
- Use APENAS os produtos listados acima
- Se perguntarem sobre preços, use os valores exatos
- Se perguntarem sobre o carrinho, use as informações atuais
- Recomende produtos baseado no que temos
- Sempre direcione para WhatsApp para finalizar pedidos
- Seja útil e conciso`;
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: context },
                    { role: 'user', content: message }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 401) {
                throw new Error('Chave da API inválida ou expirada');
            } else if (response.status === 429) {
                throw new Error('Limite de uso excedido - tente novamente em alguns minutos');
            } else if (response.status === 403) {
                throw new Error('Acesso negado - verifique se sua conta OpenAI tem créditos');
            } else {
                throw new Error(`Erro ${response.status}: ${errorData.error?.message || 'Erro desconhecido'}`);
            }
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API');
        }
        
        return data.choices[0].message.content.trim();
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Erro de conexão - verifique sua internet');
        }
        throw error;
    }
}

// Indicador de digitação
function addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    typingDiv.id = 'typing-indicator';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function getBotResponse(message) {
    const siteData = getSiteData();
    
    console.log('Mensagem recebida:', message);
    
    // Detectar mensagem de acompanhamento de pedido
    if (message.includes('pedido') && message.includes('#')) {
        const orderMatch = message.match(/#(\d+)/);
        const orderId = orderMatch ? orderMatch[1] : '123456';
        console.log('Pedido detectado:', orderId);
        return `Olá! 👋\nRecebemos seu pedido #${orderId} com sucesso!\nEle já está em processamento e em breve você receberá atualizações por aqui sobre cada etapa do seu pedido. ✅`;
    }
    
    // Respostas com dados reais do site
    if (message.includes('produto') || message.includes('bebida') || message.includes('o que tem')) {
        return `Temos estes produtos disponíveis:\n\n${siteData.products}\n\nQual produto te interessa? Posso adicionar ao seu carrinho!`;
    }
    if (message.includes('preço') || message.includes('valor') || message.includes('quanto custa')) {
        const productMentioned = products.find(p => message.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
        if (productMentioned) {
            return `${productMentioned.name} custa R$ ${productMentioned.price.toFixed(2)}. Quer adicionar ao carrinho?`;
        }
        return `Nossos preços:\n\n${siteData.products}\n\nQual produto te interessa?`;
    }
    if (message.includes('carrinho') || message.includes('pedido')) {
        if (cart.length === 0) {
            return 'Seu carrinho está vazio. Que tal ver nossos produtos? Posso recomendar algo!';
        }
        return `Seu carrinho atual:\n\n${siteData.cart}\n\nTotal: R$ ${siteData.cartTotal}\n\nQuer finalizar pelo WhatsApp?`;
    }
    if (message.includes('horário') || message.includes('funcionamento')) {
        return 'Horários:\n• Domingo: 09:00-18:00\n• Segunda: 09:00-17:00\n• Terça-Quinta: 10:00-20:00\n• Sexta-Sábado: 10:00-22:00\n\n🚚 Entregas: 10:00-20:00';
    }
    if (message.includes('endereço') || message.includes('localização')) {
        return 'Estamos na R. Oswaldo Barreto, 708 E - Alvinópolis, Atibaia - SP, 12942-570.';
    }
    if (message.includes('entrega') || message.includes('frete')) {
        return 'Fazemos entregas das 10:00 às 20:00! Use nossa calculadora de frete no carrinho para ver preços e prazos.';
    }
    if (message.includes('whatsapp') || message.includes('contato')) {
        return 'Nosso WhatsApp: (11) 93394-9002. Ou use os botões do site para contato direto!';
    }
    if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde')) {
        return 'Olá! Como posso ajudar? Posso falar sobre nossos produtos, preços, seu carrinho, entregas ou horários!';
    }
    
    // Resposta padrão
    return 'Desculpe, não consegui processar sua pergunta. Posso ajudar com produtos, preços, carrinho, entregas ou horários. WhatsApp: (11) 93394-9002';
}