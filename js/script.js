// Configurações padrão
let config = {
    adegaName: 'Adega do Tio Pancho',
    whatsappNumber: '5511941716617',
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
    // Cervejas
    {
        id: 1,
        name: 'Heineken Lata 350ml',
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400',
        price: 4.50,
        category: 'cervejas'
    },
    {
        id: 2,
        name: 'Stella Artois',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 5.90,
        category: 'cervejas'
    },
    {
        id: 3,
        name: 'Corona Extra 355ml',
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400',
        price: 6.50,
        category: 'cervejas'
    },
    {
        id: 4,
        name: 'Brahma Duplo Malte',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 3.90,
        category: 'cervejas'
    },
    // Drinks
    {
        id: 5,
        name: 'Smirnoff Ice 275ml',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        price: 8.90,
        category: 'drinks'
    },
    {
        id: 6,
        name: 'Caipirinha Ypioca',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        price: 12.50,
        category: 'drinks'
    },
    {
        id: 7,
        name: 'Batida de Coco Pitú',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        price: 15.90,
        category: 'drinks'
    },
    // Vinhos
    {
        id: 8,
        name: 'Vinho Tinto Cabernet',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        price: 45.90,
        category: 'vinhos'
    },
    {
        id: 9,
        name: 'Vinho Branco Chardonnay',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        price: 42.90,
        category: 'vinhos'
    },
    {
        id: 10,
        name: 'Espumante Chandon',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        price: 89.90,
        category: 'vinhos'
    },
    // Refrigerantes
    {
        id: 11,
        name: 'Coca-Cola 2L',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        price: 8.50,
        category: 'refrigerantes'
    },
    {
        id: 12,
        name: 'Guaraná Antarctica 2L',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        price: 7.90,
        category: 'refrigerantes'
    },
    {
        id: 13,
        name: 'Fanta Laranja 2L',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        price: 7.50,
        category: 'refrigerantes'
    },
    // Águas e Gelo
    {
        id: 14,
        name: 'Água Crystal 1,5L',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
        price: 3.50,
        category: 'aguas'
    },
    {
        id: 15,
        name: 'Água com Gás Perrier',
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400',
        price: 8.90,
        category: 'aguas'
    },
    {
        id: 16,
        name: 'Gelo 2kg',
        image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=400',
        price: 5.00,
        category: 'aguas'
    },
    // Chopp
    {
        id: 17,
        name: 'Chopp Brahma 1L',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 18.90,
        category: 'chopp'
    },
    {
        id: 18,
        name: 'Chopp Heineken 1L',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 22.50,
        category: 'chopp'
    },
    {
        id: 19,
        name: 'Chopp Stella Artois 1L',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        price: 24.90,
        category: 'chopp'
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
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    renderProducts(filteredProducts);
}

// Renderizar produtos
function renderProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    // Usar produtos globais se não especificado
    const products = productsToRender || window.products || [];
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; opacity: 0.7; color: #fff; padding: 40px;">Nenhum produto encontrado. <br><button onclick="reloadProductsFromDatabase()" style="margin-top: 10px; background: #25d366; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">🔄 Recarregar</button></p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
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
        </div>
    `).join('');
    
    console.log(`✅ ${products.length} produtos renderizados`);
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
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Modal admin não encontrado');
    }
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
async function loadAdminData() {
    const adegaNameEl = document.getElementById('adega-name');
    const whatsappNumberEl = document.getElementById('whatsapp-number');
    const defaultMessageEl = document.getElementById('default-message');
    const paymentLinkEl = document.getElementById('payment-link');
    
    if (adegaNameEl) adegaNameEl.value = config.adegaName;
    if (whatsappNumberEl) whatsappNumberEl.value = config.whatsappNumber;
    if (defaultMessageEl) defaultMessageEl.value = config.defaultMessage;
    if (paymentLinkEl) paymentLinkEl.value = config.paymentLink || '';
    
    // Mostrar status da API
    const apiKey = localStorage.getItem('openai-api-key');
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKeyInput) {
        if (apiKey && !apiKey.startsWith('***')) {
            apiKeyInput.placeholder = 'Chave configurada (clique para alterar)';
            apiKeyInput.value = '';
        } else {
            apiKeyInput.placeholder = 'Chave da API OpenAI (opcional)';
        }
    }
    
    updateAnalyticsDisplay();
    renderEstoque();
    
    // Adicionar event listener para pesquisa
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            const searchTerm = this.value.toLowerCase();
            
            // Buscar nos produtos do Supabase
            try {
                const client = getSupabaseClient();
                
                const { data: supabaseProducts } = await client
                    .from('products')
                    .select('*')
                    .eq('active', true)
                    .ilike('name', `%${searchTerm}%`);
                
                const tbody = document.getElementById('estoque-tbody');
                
                if (supabaseProducts && supabaseProducts.length > 0) {
                    tbody.innerHTML = supabaseProducts.map(product => `
                        <tr>
                            <td class="codigo-cell">${String(product.id).padStart(8, '0')}</td>
                            <td class="componente-cell" title="${product.name}">${product.name}</td>
                            <td class="estoque-cell">${Math.floor(Math.random() * 100) + 1}</td>
                            <td>
                                <button class="action-btn edit-action-btn" onclick="editProduct(${product.id})">
                                    ✏️
                                </button>
                            </td>
                            <td>
                                <button class="action-btn delete-action-btn" onclick="deleteProduct(${product.id})">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; opacity: 0.7; padding: 40px;">Nenhum produto encontrado</td></tr>';
                }
            } catch (error) {
                console.log('Erro na pesquisa, usando produtos locais');
                // Fallback para pesquisa local
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    String(product.id).includes(searchTerm)
                );
                
                const tbody = document.getElementById('estoque-tbody');
                tbody.innerHTML = filteredProducts.map(product => `
                    <tr>
                        <td class="codigo-cell">${String(product.id).padStart(8, '0')}</td>
                        <td class="componente-cell" title="${product.name}">${product.name}</td>
                        <td class="estoque-cell">${Math.floor(Math.random() * 100) + 1}</td>
                        <td>
                            <button class="action-btn edit-action-btn" onclick="editProduct(${product.id})">
                                ✏️
                            </button>
                        </td>
                        <td>
                            <button class="action-btn delete-action-btn" onclick="deleteProduct(${product.id})">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        });
    }
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

// Testar salvamento de pedido
async function testOrderSave() {
    try {
        const testOrder = {
            cliente_id: null,
            valor_total: 25.50,
            pontos_ganhos: 2,
            status: 'novo',
            forma_pagamento: 'PIX',
            endereco: 'Endereço de teste'
        };
        
        console.log('Testando salvamento de pedido:', testOrder);
        const savedOrder = await db.saveOrder(testOrder);
        console.log('Pedido de teste salvo:', savedOrder);
        
        alert('Pedido de teste salvo com sucesso! ID: ' + savedOrder.id);
        
    } catch (error) {
        console.error('Erro no teste:', error);
        alert('Erro ao testar pedido: ' + error.message);
    }
}

// Renderizar produtos no estoque
async function renderEstoque() {
    const tbody = document.getElementById('estoque-tbody');
    
    try {
        const client = getSupabaseClient();
        
        const { data: supabaseProducts, error } = await client
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && supabaseProducts && supabaseProducts.length > 0) {
            tbody.innerHTML = supabaseProducts.map(product => `
                <tr>
                    <td class="codigo-cell">${String(product.id).padStart(8, '0')}</td>
                    <td class="componente-cell" title="${product.name}">${product.name}</td>
                    <td class="estoque-cell">${Math.floor(Math.random() * 100) + 1}</td>
                    <td>
                        <button class="action-btn edit-action-btn" onclick="editProduct(${product.id})">
                            ✏️
                        </button>
                    </td>
                    <td>
                        <button class="action-btn delete-action-btn" onclick="deleteProduct(${product.id})">
                            🗑️
                        </button>
                    </td>
                </tr>
            `).join('');
            return;
        }
    } catch (error) {
        console.log('Erro ao carregar do Supabase:', error);
    }
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; opacity: 0.7; padding: 40px;">Nenhum produto encontrado no banco de dados</td></tr>';
}

// Filtrar produtos no admin
function filterAdminProducts() {
    renderAdminProducts();
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
    document.querySelector('.logo h1').innerHTML = `<img src="adega-logo.jpg" alt="${config.adegaName}" style="height: 40px; vertical-align: middle; margin-right: 8px;" onerror="this.style.display='none'"> ${config.adegaName}`;
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
async function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const imageFiles = document.getElementById('product-image-file').files;
    const imageUrl = document.getElementById('product-image-url').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    
    if (!name || !price || price <= 0) {
        alert('Preencha o nome e um preço válido para o produto!');
        return;
    }
    
    try {
        let finalImages = [];
        let finalImageUrl = '';
        
        if (imageFiles.length > 0) {
            const images = [];
            let processedCount = 0;
            
            await new Promise((resolve) => {
                Array.from(imageFiles).forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        images[index] = e.target.result;
                        processedCount++;
                        
                        if (processedCount === imageFiles.length) {
                            finalImages = images;
                            finalImageUrl = images[0];
                            resolve();
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });
        } else {
            finalImageUrl = imageUrl || 'https://via.placeholder.com/400x200/333/fff?text=Produto';
            finalImages = [finalImageUrl];
        }
        
        const newProduct = {
            name,
            images: finalImages,
            image: finalImageUrl,
            price,
            category,
            active: true
        };
        
        // Salvar no Supabase PRIMEIRO
        const savedProduct = await db.saveProduct(newProduct);
        console.log('✅ Produto salvo no Supabase:', savedProduct.name);
        
        // Adicionar ID local para compatibilidade
        savedProduct.id = savedProduct.id || Date.now();
        
        // Adicionar ao array local
        products.push(savedProduct);
        saveData();
        clearProductForm();
        refreshProductDisplay();
        hideAddProductSection();
        alert('Produto adicionado e salvo no banco de dados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar produto no banco:', error);
        
        // Fallback: salvar apenas localmente se houver erro no banco
        const localProduct = {
            id: Date.now(),
            name,
            images: finalImages,
            image: finalImageUrl,
            price,
            category
        };
        
        products.push(localProduct);
        saveData();
        clearProductForm();
        refreshProductDisplay();
        alert('Produto adicionado localmente. Erro ao salvar no banco: ' + error.message);
    }
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

// Funções para alternar entre estoque e adicionar produto
function showAddProductSection() {
    document.getElementById('estoque-section').style.display = 'none';
    document.getElementById('add-product-section').style.display = 'block';
}

function hideAddProductSection() {
    document.getElementById('add-product-section').style.display = 'none';
    document.getElementById('estoque-section').style.display = 'block';
}

// Atualizar display de produtos
function refreshProductDisplay() {
    renderProducts();
    renderEstoque();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    filterButtons[0].classList.add('active');
}

// Excluir produto
async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
        try {
            // Deletar no Supabase PRIMEIRO (delete permanente)
            await db.deleteProduct(id);
            console.log('✅ Produto excluído permanentemente do Supabase:', product.name);
            
            // Remover do array local
            products = products.filter(product => product.id !== id);
            saveData();
            refreshProductDisplay();
            
            if (analytics.productViews[product.name]) {
                delete analytics.productViews[product.name];
                saveAnalytics();
                updateAnalyticsDisplay();
            }
            
            alert('Produto excluído do banco de dados com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir produto do banco:', error);
            
            // Fallback: remover apenas localmente
            products = products.filter(product => product.id !== id);
            saveData();
            refreshProductDisplay();
            
            if (analytics.productViews[product.name]) {
                delete analytics.productViews[product.name];
                saveAnalytics();
                updateAnalyticsDisplay();
            }
            
            alert('Produto excluído localmente. Erro no banco: ' + error.message);
        }
    }
}

// Editar produto
async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Nome do produto:', product.name);
    if (!newName || newName.trim() === '') return;
    
    const newPrice = prompt('Preço do produto:', product.price);
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) return;
    
    const newImage = prompt('URL da imagem (deixe vazio para manter):', product.image);
    
    try {
        const updatedData = {
            name: newName.trim(),
            price: parseFloat(newPrice)
        };
        
        if (newImage && newImage.trim() !== '') {
            updatedData.image = newImage.trim();
            updatedData.images = [newImage.trim()];
        }
        
        // Atualizar no Supabase PRIMEIRO
        await db.updateProduct(id, updatedData);
        console.log('✅ Produto atualizado no Supabase:', updatedData.name);
        
        // Atualizar no array local
        product.name = updatedData.name;
        product.price = updatedData.price;
        if (updatedData.image) {
            product.image = updatedData.image;
            product.images = updatedData.images;
        }
        
        saveData();
        refreshProductDisplay();
        alert('Produto atualizado no banco de dados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao atualizar produto no banco:', error);
        
        // Fallback: atualizar apenas localmente
        product.name = updatedData.name;
        product.price = updatedData.price;
        if (updatedData.image) {
            product.image = updatedData.image;
            product.images = updatedData.images;
        }
        
        saveData();
        refreshProductDisplay();
        alert('Produto atualizado localmente. Erro no banco: ' + error.message);
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('admin-modal');
    if (event.target === modal) {
        closeAdminModal();
    }
}

// Enter no campo de senha e garantir que botão admin funcione
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('admin-password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
    
    // Garantir que botão admin funcione
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAdminLogin();
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
async function showAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
    // Não salvar estado automaticamente
    await loadAdminData();
    
    // Verificar status do banco ao abrir o admin
    setTimeout(updateDatabaseStatus, 500);
}

// Ir para home (ícone da casa) - esta função será sobrescrita pelo fix-navigation.js
function goToHome() {
    console.log('🏠 goToHome chamada do script.js - redirecionando para window.goToHome');
    
    // Usar a função global se disponível
    if (typeof window.goToHome === 'function' && window.goToHome !== goToHome) {
        window.goToHome();
        return;
    }
    
    // Fallback local
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && !adminPanel.classList.contains('hidden')) {
        adminPanel.classList.add('hidden');
        clearAdminState();
    }
    
    // Usar showSection se disponível
    if (typeof showSection === 'function') {
        showSection('home');
    } else if (typeof window.showSection === 'function') {
        window.showSection('home');
    } else {
        console.error('❌ Nenhuma função de navegação disponível');
    }
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
        
        // Atualizar checkout se estiver aberto
        updateCheckoutAddress(addressText);
        
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

// Função para atualizar endereço no checkout
function updateCheckoutAddress(addressText) {
    // Verificar se estamos na página de checkout
    const checkoutAddressInfo = document.querySelector('.address-info');
    if (checkoutAddressInfo) {
        const lines = addressText.split('\n');
        checkoutAddressInfo.innerHTML = `
            <p><strong>${lines[0]}</strong></p>
            <p>${lines[1]}</p>
            <p>${lines[2]}</p>
        `;
    }
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

// Função removida - endereço é carregado do banco de dados

// Carregar produtos do Supabase
async function loadProductsFromDatabase() {
    try {
        const dbProducts = await db.getProducts();
        if (dbProducts && dbProducts.length > 0) {
            // Substituir produtos locais pelos do banco (fonte da verdade)
            products = dbProducts.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image || product.images?.[0] || 'https://via.placeholder.com/400x200/333/fff?text=Produto',
                images: product.images || [product.image]
            }));
            saveData();
            console.log(`✅ ${dbProducts.length} produtos carregados do Supabase`);
            
            // Renderizar produtos imediatamente
            renderProducts();
            return true;
        } else {
            console.log('📎 Nenhum produto encontrado no Supabase');
            return false;
        }
    } catch (error) {
        console.log('⚠️ Erro ao carregar produtos do Supabase:', error.message);
        console.log('📱 Usando produtos locais como fallback');
        return false;
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando aplicação...');
    
    loadData();
    
    // Carregar produtos do Supabase primeiro
    const hasDbProducts = await loadProductsFromDatabase();
    
    // Se não há produtos no banco, sincronizar os locais e renderizar
    if (!hasDbProducts) {
        await syncAllProductsToSupabase();
        renderProducts();
    }
    
    if (config.adegaName !== 'Adega do Tio Pancho') {
        updateSiteContent();
    }
    
    // Inicializar sistema de analytics
    if (!window.CartAnalytics) {
        console.log('Inicializando sistema de analytics...');
        initializeCartAnalytics();
    }
    
    updateCartDisplay();
    
    // Carregar dados do usuário - PRIORIDADE MÁXIMA
    console.log('🔄 Carregando perfil do usuário...');
    await loadUserProfile();
    
    // Aguardar um pouco e tentar novamente se não carregou
    setTimeout(async () => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.nome) {
            const panel = document.getElementById('logged-customer-panel');
            if (!panel || panel.style.display === 'none') {
                console.log('🔄 Recarregando painel do cliente...');
                await loadUserProfile();
            }
        }
    }, 2000);
    
    console.log('✅ Aplicação inicializada');
});

// Endereço é carregado automaticamente do banco de dados

// Sincronizar todos os produtos com Supabase
async function syncAllProductsToSupabase() {
    try {
        console.log('🔄 Sincronizando todos os produtos com Supabase...');
        
        // Obter produtos existentes no Supabase
        const existingProducts = await db.getProducts();
        const existingNames = existingProducts.map(p => p.name.toLowerCase());
        
        let syncCount = 0;
        
        // Sincronizar produtos do array local
        for (const product of products) {
            const productExists = existingNames.includes(product.name.toLowerCase());
            
            if (!productExists) {
                const productData = {
                    name: product.name,
                    image: product.image,
                    images: product.images || [product.image],
                    price: product.price,
                    category: product.category,
                    active: true
                };
                
                await db.saveProduct(productData);
                syncCount++;
                console.log(`✅ Produto salvo no banco: ${product.name}`);
            }
        }
        
        if (syncCount > 0) {
            console.log(`🎉 ${syncCount} produtos sincronizados com sucesso!`);
            // Recarregar produtos do banco após sincronização
            await loadProductsFromDatabase();
        } else {
            console.log('✅ Todos os produtos já estão sincronizados');
        }
        
    } catch (error) {
        console.log('⚠️ Erro na sincronização:', error.message);
        console.log('📱 Continuando com produtos locais');
    }
}

// Função removida - endereço é carregado do banco de dados
    
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

// Função para salvar carrinho abandonado
async function saveAbandonedCart(cartItems, total, userData) {
    console.log(`🚫 Registrando carrinho abandonado: R$ ${total}`);
    
    try {
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const { error } = await client.from('carrinho_abandonado').insert({
            cliente_nome: userData.nome || null,
            cliente_telefone: userData.whatsapp || '5511941716617',
            produtos_json: JSON.stringify(cartItems),
            valor_total: total
        });
        
        if (error) {
            console.error('❌ Erro ao salvar carrinho abandonado:', error);
        } else {
            console.log(`✅ Carrinho abandonado registrado: ${userData.whatsapp} - R$ ${total}`);
        }
    } catch (error) {
        console.error('❌ Erro geral ao registrar abandono:', error);
    }
}

// Função para salvar produto excluído no analytics
async function saveRemovedProductAnalytics(removedProduct) {
    console.log(`🗑️ Registrando produto excluído: ${removedProduct.name}`);
    
    try {
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const clienteTelefone = userData.whatsapp || '5511941716617';
        
        const { error } = await client.from('produtos_excluidos').insert({
            produto_id: removedProduct.id,
            produto_nome: removedProduct.name,
            produto_preco: removedProduct.price,
            quantidade: removedProduct.quantity,
            cliente_telefone: clienteTelefone,
            data_exclusao: new Date().toISOString()
        });
        
        if (error) {
            console.error('❌ Erro ao salvar produto excluído:', error);
        } else {
            console.log(`✅ Produto excluído registrado: ${removedProduct.name} - Tel: ${clienteTelefone}`);
        }
    } catch (error) {
        console.error('❌ Erro geral ao registrar exclusão:', error);
    }
}

// Função para salvar no banco carrinho_status
async function saveToCarrinhoStatus(status, total) {
    console.log(`🔄 Tentando salvar: ${status} - R$ ${total}`);
    
    try {
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const clienteNome = userData.nome || 'Cliente WhatsApp';
        const clienteTelefone = userData.whatsapp || '5511941716617';
        
        const { data, error } = await client.from('carrinho_status').insert({
            cliente_nome: clienteNome,
            cliente_telefone: clienteTelefone,
            status: status,
            valor_total: parseFloat(total),
            pedido_id: `${status}_${Date.now()}`,
            produtos_json: JSON.stringify(cart)
        });
        
        if (error) {
            console.error('❌ Erro:', error);
        } else {
            console.log(`✅ SALVO: ${status} - ${clienteNome} - ${cart.length} produtos - R$ ${total}`);
        }
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Funções do Carrinho
async function addToCart(productId) {
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
    
    // Salvar no banco carrinho_status
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const status = wasEmpty ? 'adicionado' : 'editado';
    
    await saveToCarrinhoStatus(status, total);
    
    // Analytics do carrinho
    if (wasEmpty) {
        console.log('🛍️ Carrinho adicionado:', cart.length, 'itens, R$', total);
        trackCartEvent('adicionado', { items: cart.length, total, products: cart });
    } else {
        console.log('✏️ Carrinho editado:', cart.length, 'itens, R$', total);
        trackCartEvent('editado', { items: cart.length, total, products: cart });
    }
}

async function removeFromCart(productId) {
    // Capturar dados ANTES de remover
    const originalCart = [...cart];
    const originalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const removedProduct = cart.find(item => item.id === productId);
    
    // Registrar produto excluído no banco
    if (removedProduct) {
        await saveRemovedProductAnalytics(removedProduct);
    }
    
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    
    // Salvar remoção no banco
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const status = cart.length === 0 ? 'desistido' : 'editado';
    await saveToCarrinhoStatus(status, total);
    
    // Analytics - carrinho editado ou abandonado
    if (cart.length === 0) {
        console.log('🚫 Carrinho esvaziado');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Registrar carrinho abandonado para recuperação
        await saveAbandonedCart(originalCart, originalTotal, userData);
        
        trackCartEvent('desistido', { 
            reason: 'manual_clear', 
            items: originalCart.length,
            total: originalTotal,
            products: originalCart,
            customerName: userData.nome || 'Cliente não identificado',
            customerPhone: userData.whatsapp || null
        });
    } else {
        trackCartEvent('editado', { items: cart.length, total, products: cart });
    }
}

async function updateCartQuantity(productId, quantity) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            cartItem.quantity = quantity;
            saveCart();
            updateCartDisplay();
            
            // Salvar alteração no banco
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            await saveToCarrinhoStatus('editado', total);
            
            // Analytics - carrinho editado
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
            `).join('') + `
                <div class="cart-footer-content" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div class="cart-total" style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; font-weight: 700; color: #d4af37; margin-bottom: 15px;">
                        <span>Total:</span>
                        <span>R$ ${(cartTotal + 8.90).toFixed(2)}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 15px; text-align: center;">
                        Subtotal: R$ ${cartTotal.toFixed(2)} + Taxa de entrega: R$ 8,90
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="goToCheckout()" class="checkout-btn" style="width: 100%; background: linear-gradient(45deg, #25d366, #128c7e); color: white; border: none; padding: 15px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                            📋 Finalizar Pedido
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function showCartNotification(message = 'Produto adicionado ao carrinho!') {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
    
    // Salvar dados do carrinho para a página de checkout
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    // Fechar carrinho antes de redirecionar
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    
    // Redirecionar para a página de checkout
    window.location.href = 'checkout.html';
}

// Tornar função global
window.goToCheckout = goToCheckout;

// Função para redirecionar para WhatsApp com bot
function redirectToWhatsAppBot(orderData) {
    const botTrigger = `🤖 NOVO_PEDIDO_BOT`;
    
    const orderDetails = `
📋 *Dados do Pedido:*
• ID: #${orderData.id}
• Cliente: ${orderData.customer}
• Total: R$ ${orderData.total.toFixed(2)}
• Pagamento: ${orderData.paymentMethod}
• Data: ${new Date().toLocaleString('pt-BR')}

🛒 *Itens:*
${orderData.items.map(item => `• ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n')}

📍 *Endereço:*
${orderData.address || 'Endereço não informado'}

⚡ *Status:* Aguardando confirmação`;

    const fullMessage = `${botTrigger}${orderDetails}`;
    
    localStorage.setItem(`bot_order_${orderData.id}`, JSON.stringify(orderData));
    
    const encodedMessage = encodeURIComponent(fullMessage);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.open(`https://wa.me/5511941716617?text=${encodedMessage}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?phone=5511941716617&text=${encodedMessage}`, '_blank');
    }
}

// Função alternativa para finalizar pedido direto pelo WhatsApp
async function finalizarPedidoWhatsApp() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 8.90;
    const total = cartTotal + deliveryFee;
    
    let message = '🍷 *Adega do Tio Pancho*\n\nOlá! Gostaria de fazer este pedido:\n\n';
    
    cart.forEach(item => {
        message += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 Subtotal: R$ ${cartTotal.toFixed(2)}`;
    message += `\n🚚 Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`;
    message += `\n✅ *Total: R$ ${total.toFixed(2)}*`;
    
    const deliveryAddress = localStorage.getItem('deliveryAddress');
    if (deliveryAddress) {
        message += `\n\n📍 *Endereço de Entrega:*\n${deliveryAddress}`;
    }
    
    message += `\n\nPor favor, confirme meu pedido e me informe a forma de pagamento disponível.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5511941716617?text=${encodedMessage}`;
    
    // Fechar carrinho
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Atualizar pontos do cliente
    const userId = localStorage.getItem('userId');
    if (userId) {
        const pointsToAdd = Math.floor(cartTotal / 10);
        await updateCustomerPoints(userId, pointsToAdd);
    }
    
    // Limpar carrinho após enviar
    cart = [];
    saveCart();
    updateCartDisplay();
    
    // Mostrar confirmação
    showCartNotification('Pedido enviado para o WhatsApp!');
    
    // Analytics - pedido enviado pelo WhatsApp
    analytics.whatsappClicks++;
    saveAnalytics();
}

// Tornar função global
window.finalizarPedidoWhatsApp = finalizarPedidoWhatsApp;

async function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    // Mostrar indicador de processamento
    const processingIndicator = document.createElement('div');
    processingIndicator.className = 'cart-notification';
    processingIndicator.innerHTML = '<span class="processing-animation">Processando pedido...</span>';
    document.body.appendChild(processingIndicator);
    
    try {
        // Calcular total e obter dados
        const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value || 'pix';
        const paymentText = {
            'pix': 'PIX',
            'cartao': 'Cartão',
            'dinheiro': 'Dinheiro'
        };
        const deliveryAddress = localStorage.getItem('deliveryAddress') || 'Endereço não informado';
        
        // Criar pedido local primeiro
        const localOrder = {
            id: Date.now(),
            customer: 'Cliente WhatsApp',
            total: cartTotal,
            paymentMethod: paymentText[selectedPayment],
            address: deliveryAddress,
            date: new Date().toISOString(),
            status: 'novo',
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        // Salvar no localStorage
        const existingOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        existingOrders.push(localOrder);
        localStorage.setItem('adegaOrders', JSON.stringify(existingOrders));
        console.log('✅ Pedido salvo no localStorage:', localOrder.id);
        
        // Obter ID do cliente
        const userId = localStorage.getItem('userId');
        
        // Salvar no Supabase
        const client = getSupabaseClient();
        let data = null, error = null;
        
        if (client) {
            const result = await client
                .from('pedidos')
                .insert({
                    cliente_id: userId,
                    valor_total: cartTotal,
                    pontos_ganhos: Math.floor(cartTotal / 10),
                    status: 'novo',
                    forma_pagamento: paymentText[selectedPayment],
                    endereco: deliveryAddress
                })
                .select()
                .single();
            data = result.data;
            error = result.error;
        }
            
        // Atualizar pontos do cliente
        if (!error && data && userId) {
            await updateCustomerPoints(userId, Math.floor(cartTotal / 10));
        }
            
        if (error) {
            console.error('❌ Erro Supabase:', error);
        } else {
            console.log('✅ Pedido salvo no Supabase:', data.id);
            localOrder.supabase_id = data.id;
            localStorage.setItem('adegaOrders', JSON.stringify(existingOrders));
        }
        
        // Atualizar pedido local com dados do Supabase
        if (data && data.id) {
            localOrder.supabase_id = data.id;
        }
        
        console.log('💾 SALVANDO NO LOCALSTORAGE:');
        console.log('Pedido a ser salvo:', localOrder);
        
        const allOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        console.log('Pedidos existentes:', allOrders.length);
        
        allOrders.push(localOrder);
        localStorage.setItem('adegaOrders', JSON.stringify(allOrders));
        
        const savedOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        console.log('✅ CONFIRMADO - Total de pedidos após salvar:', savedOrders.length);
        console.log('✅ Último pedido salvo:', savedOrders[savedOrders.length - 1]);
        
        // Forçar atualização da gestão se estiver aberta
        if (window.opener && window.opener.loadOrdersFromDB) {
            window.opener.loadOrdersFromDB();
        }
        
        // Preparar mensagem WhatsApp
        let message = 'Olá! Gostaria de fazer este pedido:\\n\\n';
        cart.forEach(item => {
            message += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\\n`;
        });
        message += `\\nTotal: R$ ${cartTotal.toFixed(2)}`;
        message += `\\nForma de Pagamento: ${paymentText[selectedPayment]}`;
        message += `\\n\\nEndereço de Entrega:\\n${deliveryAddress}`;
        
        // Remover indicador e mostrar confirmação
        processingIndicator.remove();
        showOrderConfirmation(data.id, cartTotal);
        
        // Pontos já são atualizados na função updateCustomerPoints
        
        // Abrir WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
        setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
        
        // Limpar carrinho
        cart = [];
        saveCart();
        updateCartDisplay();
        
        // Fechar carrinho
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        
        analytics.whatsappClicks++;
        saveAnalytics();
        
    } catch (error) {
        console.error('❌ Erro ao salvar pedido:', error);
        processingIndicator.remove();
        
        // Salvar localmente mesmo se falhar no Supabase
        const fallbackOrder = {
            id: Date.now(),
            customer: 'Cliente WhatsApp',
            total: cartTotal,
            paymentMethod: paymentText[selectedPayment],
            address: deliveryAddress,
            date: new Date().toISOString(),
            status: 'novo',
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        console.log('💾 FALLBACK - SALVANDO NO LOCALSTORAGE:');
        console.log('Pedido fallback:', fallbackOrder);
        
        const existingOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        console.log('Pedidos existentes (fallback):', existingOrders.length);
        
        existingOrders.push(fallbackOrder);
        localStorage.setItem('adegaOrders', JSON.stringify(existingOrders));
        
        const savedOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        console.log('✅ FALLBACK CONFIRMADO - Total:', savedOrders.length);
        console.log('✅ Pedido fallback salvo:', savedOrders[savedOrders.length - 1]);
        
        // Continuar fluxo normal
        let message = 'Olá! Gostaria de fazer este pedido:\\n\\n';
        cart.forEach(item => {
            message += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\\n`;
        });
        message += `\\nTotal: R$ ${cartTotal.toFixed(2)}`;
        message += `\\nForma de Pagamento: ${paymentText[selectedPayment]}`;
        message += `\\n\\nEndereço de Entrega:\\n${deliveryAddress}`;
        
        showOrderConfirmation(fallbackOrder.id, cartTotal);
        
        // Atualizar pontos mesmo no fallback
        const userId = localStorage.getItem('userId');
        if (userId) {
            await updateCustomerPoints(userId, Math.floor(cartTotal / 10));
            await loadCustomerPoints();
        }
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
        setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
        
        cart = [];
        saveCart();
        updateCartDisplay();
        
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        
        analytics.whatsappClicks++;
        saveAnalytics();
        
        alert('Pedido processado! (Salvo localmente)');
    }
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
    
    // Coletar informações do cliente do localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const customerInfo = {
        phone: userData.whatsapp || null,
        name: userData.nome || null
    };
    
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
    // Função removida - não solicitar mais telefone
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
window.openOrdersManagement = function() {
    window.open('gestao.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
};

// Abrir analytics do carrinho
window.openCartAnalytics = function() {
    window.open('analytics.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
};

// Abrir analytics de produtos excluídos
window.openRemovedProductsAnalytics = function() {
    window.open('produtos-excluidos.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
};

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

// Interceptar navegação para produtos
const originalShowSection = window.showSection;
window.showSection = async function(sectionId) {
    // Chamar função original
    if (originalShowSection) {
        originalShowSection(sectionId);
    }
    
    // Se for a seção de produtos, garantir que estejam carregados
    if (sectionId === 'products') {
        console.log('🍷 Verificando produtos...');
        if (!window.products || window.products.length === 0) {
            if (typeof window.reloadProductsFromDatabase === 'function') {
                await window.reloadProductsFromDatabase();
            }
        } else {
            renderProducts();
        }
    }
};

// Garantir que produtos sejam carregados quando a página for totalmente carregada
window.addEventListener('load', async function() {
    setTimeout(async () => {
        console.log('🔄 Carregamento final - verificando produtos...');
        if (!window.products || window.products.length === 0) {
            if (typeof window.reloadProductsFromDatabase === 'function') {
                await window.reloadProductsFromDatabase();
            }
        }
    }, 3000);
});



window.filterProducts = function(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const products = window.products || [];
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    renderProducts(filteredProducts);
};

// Tornar funções globais
window.renderProducts = renderProducts;
window.saveToCarrinhoStatus = saveToCarrinhoStatus;

window.addToCart = async function(productId) {
    console.log(`🛒 Adicionando produto ${productId}`);
    
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
    
    // Salvar no banco
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const status = wasEmpty ? 'adicionado' : 'editado';
    console.log(`📊 Status: ${status}, Total: R$ ${total}`);
    
    await saveToCarrinhoStatus(status, total);
};

window.openWhatsApp = function(productName = null) {
    const currentNumber = config.whatsappNumber || '5599999999999';
    let message = config.defaultMessage || 'Oi, quero ver as ofertas da adega!';
    
    if (productName) {
        message = `Oi! Tenho interesse no produto: ${productName}. Pode me dar mais informações?`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${currentNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};

window.toggleChatBot = toggleChatBot;
window.handleChatInput = handleChatInput;
window.sendChatMessage = sendChatMessage;



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
        // Tentar usar IA primeiro
        const aiResponse = await getAIResponse(message);
        removeTypingIndicator();
        addChatMessage(aiResponse, 'bot');
    } catch (error) {
        // Fallback para resposta local
        removeTypingIndicator();
        const response = getBotResponse(message.toLowerCase());
        addChatMessage(response, 'bot');
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
    const apiKey = localStorage.getItem('openai-api-key') || CONFIG?.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('API key não configurada');
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
    
    // Respostas expandidas com dados reais do site
    if (message.includes('produto') || message.includes('bebida') || message.includes('o que tem') || message.includes('catálogo') || message.includes('menu')) {
        return `Temos estes produtos disponíveis:\n\n${siteData.products}\n\nQual produto te interessa? Posso adicionar ao seu carrinho!`;
    }
    if (message.includes('preço') || message.includes('valor') || message.includes('quanto custa') || message.includes('custo')) {
        const productMentioned = products.find(p => message.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
        if (productMentioned) {
            return `${productMentioned.name} custa R$ ${productMentioned.price.toFixed(2)}. Quer adicionar ao carrinho?`;
        }
        return `Nossos preços:\n\n${siteData.products}\n\nQual produto te interessa?`;
    }
    if (message.includes('carrinho') || message.includes('pedido') || message.includes('compra')) {
        if (cart.length === 0) {
            return 'Seu carrinho está vazio. Que tal ver nossos produtos? Posso recomendar algo!';
        }
        return `Seu carrinho atual:\n\n${siteData.cart}\n\nTotal: R$ ${siteData.cartTotal}\n\nQuer finalizar pelo WhatsApp?`;
    }
    if (message.includes('horário') || message.includes('funcionamento') || message.includes('aberto') || message.includes('fechado')) {
        return 'Horários:\n• Domingo: 09:00-18:00\n• Segunda: 09:00-17:00\n• Terça-Quinta: 10:00-20:00\n• Sexta-Sábado: 10:00-22:00\n\n🚚 Entregas: 10:00-20:00';
    }
    if (message.includes('endereço') || message.includes('localização') || message.includes('onde') || message.includes('local')) {
        return 'Estamos na R. Oswaldo Barreto, 708 E - Alvinópolis, Atibaia - SP, 12942-570.';
    }
    if (message.includes('entrega') || message.includes('frete') || message.includes('delivery') || message.includes('envio')) {
        return 'Fazemos entregas das 10:00 às 20:00! Use nossa calculadora de frete no carrinho para ver preços e prazos. Taxa de entrega varia conforme a distância.';
    }
    if (message.includes('whatsapp') || message.includes('contato') || message.includes('telefone') || message.includes('falar')) {
        return 'Nosso WhatsApp: (11) 93394-9002. Ou use os botões do site para contato direto!';
    }
    if (message.includes('pagamento') || message.includes('pagar') || message.includes('pix') || message.includes('cartão') || message.includes('dinheiro')) {
        return 'Aceitamos PIX, cartão de crédito/débito e dinheiro na entrega. PIX tem desconto especial!';
    }
    if (message.includes('promoção') || message.includes('desconto') || message.includes('oferta') || message.includes('cupom')) {
        return 'Temos promoções especiais! Siga nosso WhatsApp para receber ofertas exclusivas. Cupons disponíveis no sistema de pontos!';
    }
    if (message.includes('vinho') || message.includes('cerveja') || message.includes('drink') || message.includes('refrigerante')) {
        const category = message.includes('vinho') ? 'vinhos' : message.includes('cerveja') ? 'cervejas' : message.includes('drink') ? 'drinks' : 'refrigerantes';
        const categoryProducts = products.filter(p => p.category === category);
        if (categoryProducts.length > 0) {
            return `Temos ${categoryProducts.length} opções de ${category}:\n\n${categoryProducts.map(p => `${p.name} - R$ ${p.price.toFixed(2)}`).join('\n')}\n\nQual te interessa?`;
        }
    }
    if (message.includes('pontos') || message.includes('fidelidade') || message.includes('recompensa')) {
        return 'Temos sistema de pontos! A cada R$ 10 gastos, você ganha 1 ponto. Troque por descontos e brindes especiais!';
    }
    if (message.includes('cadastro') || message.includes('registrar') || message.includes('conta')) {
        return 'Para se cadastrar, basta fazer seu primeiro pedido! Coletamos seus dados para entregas futuras e sistema de pontos.';
    }
    if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
        return 'Olá! Como posso ajudar? Posso falar sobre produtos, preços, carrinho, entregas, horários, pagamentos, promoções e muito mais!';
    }
    if (message.includes('obrigado') || message.includes('valeu') || message.includes('tchau') || message.includes('até logo')) {
        return 'Por nada! Foi um prazer ajudar. Volte sempre à Adega do Tio Pancho! 🍷';
    }
    
    // Resposta inteligente baseada em palavras-chave
    const keywords = message.toLowerCase().split(' ');
    const responses = {
        'como': 'Como posso ajudar? Fale sobre produtos, preços, entregas, horários ou qualquer dúvida!',
        'qual': 'Qual informação você precisa? Produtos, preços, horários, entregas?',
        'quando': 'Nossos horários: Dom 09-18h, Seg 09-17h, Ter-Qui 10-20h, Sex-Sáb 10-22h. Entregas 10-20h.',
        'onde': 'R. Oswaldo Barreto, 708 E - Alvinópolis, Atibaia - SP. WhatsApp: (11) 93394-9002',
        'porque': 'Somos a Adega do Tio Pancho, especializada em bebidas premium com entrega rápida!',
        'ajuda': 'Claro! Posso ajudar com produtos, preços, pedidos, entregas, horários e muito mais. O que precisa?'
    };
    
    for (const keyword of keywords) {
        if (responses[keyword]) {
            return responses[keyword];
        }
    }
    
    // Resposta padrão mais útil
    return `Não entendi exatamente sua pergunta, mas posso ajudar com:\n\n• 🍷 Produtos e preços\n• 🛒 Carrinho e pedidos\n• 🚚 Entregas e frete\n• 🕒 Horários\n• 💳 Pagamentos\n• 🎁 Promoções\n• 📍 Localização\n\nOu fale direto no WhatsApp: (11) 93394-9002`;
}

// Função de busca de produtos
function searchProducts() {
    const searchInput = document.getElementById('product-search') || document.getElementById('mobile-product-search');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Função global para busca de produtos
window.searchProducts = searchProducts;

// Funções de usuário
async function loadUserProfile() {
    console.log('👤 Carregando perfil do usuário...');
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    console.log('📊 Dados do usuário:', userData);
    
    if (userData.nome) {
        console.log('✅ Usuário encontrado, carregando painel...');
        // Carregar painel do cliente
        await loadCustomerPanel(userData);
    } else {
        console.log('⚠️ Nenhum usuário logado encontrado');
        // Mostrar formulário de informações se não houver usuário
        const customerInfo = document.getElementById('customer-info');
        if (customerInfo) {
            customerInfo.style.display = 'block';
        }
    }
}

async function loadCustomerPanel(userData) {
    console.log('🔄 Carregando painel do cliente:', userData);
    
    const customerPanel = document.getElementById('logged-customer-panel');
    const customerInfo = document.getElementById('customer-info');
    
    if (userData.nome) {
        // Esconder formulário e mostrar painel
        if (customerInfo) {
            customerInfo.style.display = 'none';
            console.log('✅ Formulário escondido');
        }
        if (customerPanel) {
            customerPanel.style.display = 'block';
            console.log('✅ Painel do cliente exibido');
        }
        
        // Preencher dados
        const firstName = userData.nome.split(' ')[0];
        const loggedNameEl = document.getElementById('logged-customer-name');
        const fullNameEl = document.getElementById('customer-full-name');
        const whatsappEl = document.getElementById('customer-whatsapp');
        
        if (loggedNameEl) {
            loggedNameEl.textContent = firstName;
            console.log('✅ Nome definido:', firstName);
        }
        if (fullNameEl) fullNameEl.textContent = userData.nome;
        if (whatsappEl) whatsappEl.textContent = userData.whatsapp;
        
        // Carregar pontos do banco SEMPRE
        await loadCustomerPoints();
        
        // Forçar atualização dos pontos após 1 segundo
        setTimeout(async () => {
            await loadCustomerPoints();
        }, 1000);
        
        // Mostrar perfil no header
        showCustomerProfile({ name: userData.nome });
        
        console.log('✅ Painel do cliente carregado completamente');
    }
}

// Mostrar perfil do cliente no header
function showCustomerProfile(customerData) {
    const profileElement = document.getElementById('customer-profile');
    const profileName = document.getElementById('profile-name');
    
    if (profileElement && profileName) {
        profileName.textContent = customerData.name.split(' ')[0];
        profileElement.style.display = 'flex';
        
        // Adicionar evento de clique para mostrar menu
        profileElement.onclick = function() {
            toggleUserMenu();
        };
    }
}

function toggleUserMenu() {
    // Criar menu dropdown simples
    const existingMenu = document.getElementById('user-dropdown');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const dropdown = document.createElement('div');
    dropdown.id = 'user-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 150px;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="showSection('home'); document.getElementById('user-dropdown').remove();">
            🏠 Meu Perfil
        </div>
        <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="showOrderHistory(); document.getElementById('user-dropdown').remove();">
            📋 Meus Pedidos
        </div>
        <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="showCoupons(); document.getElementById('user-dropdown').remove();">
            🎁 Meus Cupons
        </div>
        <div style="padding: 10px; cursor: pointer; color: #dc3545;" onclick="logout(); document.getElementById('user-dropdown').remove();">
            🚪 Sair
        </div>
    `;
    
    document.body.appendChild(dropdown);
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

async function loadCustomerPoints() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const client = getSupabaseClient();
        if (!client) return;
        
        const { data, error } = await client
            .from('clientes')
            .select('pontos')
            .eq('id', userId)
            .single();
        
        if (!error && data) {
            const points = data.pontos || 0;
            
            // Atualizar todos os elementos de pontos
            const pointsElements = [
                document.getElementById('customer-points-display'),
                document.getElementById('dropdown-points')
            ];
            
            pointsElements.forEach(element => {
                if (element) {
                    element.textContent = `${points} pontos`;
                }
            });
        }
    } catch (error) {
        console.log('Erro ao carregar pontos:', error);
    }
}

// Função para obter cliente Supabase
function getSupabaseClient() {
    if (!window.supabase) {
        console.error('Supabase não disponível');
        return null;
    }
    
    return window.supabase.createClient(
        'https://vtrgtorablofhmhizrjr.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
    );
}

// Atualizar pontos do cliente no banco
async function updateCustomerPoints(userId, pointsToAdd, orderId = null, description = null) {
    try {
        const client = getSupabaseClient();
        if (!client) {
            console.error('Supabase não disponível para atualizar pontos');
            return;
        }
        
        // Buscar dados completos do cliente
        const { data: clientData, error: fetchError } = await client
            .from('clientes')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (fetchError) {
            console.error('Erro ao buscar dados do cliente:', fetchError);
            return;
        }
        
        const currentPoints = clientData.pontos || 0;
        const newPoints = currentPoints + pointsToAdd;
        
        // Atualizar pontos
        const { error: updateError } = await client
            .from('clientes')
            .update({ pontos: newPoints })
            .eq('id', userId);
            
        if (updateError) {
            console.error('Erro ao atualizar pontos:', updateError);
            return;
        }
        
        // Registrar no histórico com dados do cliente
        const { error: historyError } = await client
            .from('pontos_historico')
            .insert({
                cliente_id: userId,
                pontos: pointsToAdd,
                tipo: 'ganho',
                descricao: description || `Pontos ganhos na compra`,
                pedido_id: orderId,
                cliente_nome: clientData.nome,
                cliente_telefone: clientData.whatsapp,
                cliente_endereco: `${clientData.rua}, ${clientData.numero}, ${clientData.bairro}, ${clientData.cidade}`
            });
        
        if (historyError) {
            console.error('Erro ao salvar histórico:', historyError);
        }
        
        console.log(`✅ Pontos atualizados: +${pointsToAdd} (total: ${newPoints})`);
        updatePointsDisplay(newPoints);
        showPointsNotification(pointsToAdd, newPoints);
        
    } catch (error) {
        console.error('Erro na atualização de pontos:', error);
    }
}

// Atualizar exibição de pontos na tela
function updatePointsDisplay(newPoints) {
    const pointsDisplay = document.getElementById('customer-points-display');
    if (pointsDisplay) {
        pointsDisplay.textContent = `${newPoints} pontos`;
    }
}

// Mostrar notificação de pontos ganhos
function showPointsNotification(pointsAdded, totalPoints) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37, #b8941f);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">🎆</div>
            <div>
                <div style="font-size: 14px; font-weight: bold;">Pontos Ganhos!</div>
                <div style="font-size: 12px; opacity: 0.9;">+${pointsAdded} pontos</div>
                <div style="font-size: 12px; opacity: 0.8;">Total: ${totalPoints} pontos</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

async function exchangeCoupon(title, cost) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Erro: usuário não identificado');
            return;
        }
        
        const client = getSupabaseClient();
        if (!client) {
            alert('Erro: banco de dados não disponível');
            return;
        }
        
        // Buscar dados completos do cliente
        const { data: userData, error: userError } = await client
            .from('clientes')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (userError || !userData) {
            alert('Erro ao verificar pontos');
            return;
        }
        
        const currentPoints = userData.pontos || 0;
        
        if (currentPoints < cost) {
            alert(`Você precisa de ${cost} pontos. Você tem apenas ${currentPoints} pontos.`);
            return;
        }
        
        const confirmExchange = window.confirm(`Trocar ${cost} pontos por ${title}?`);
        if (!confirmExchange) return;
        
        const newPoints = currentPoints - cost;
        
        // Descontar pontos
        const { error: updateError } = await client
            .from('clientes')
            .update({ pontos: newPoints })
            .eq('id', userId);
        
        if (updateError) {
            alert('Erro ao processar troca');
            return;
        }
        
        // Criar cupom com dados completos do cliente
        const endereco = `${userData.rua}, ${userData.numero}${userData.complemento ? ', ' + userData.complemento : ''}, ${userData.bairro}, ${userData.cidade}, CEP: ${userData.cep}`;
        
        const { error: couponError } = await client
            .from('cupons')
            .insert({
                cliente_id: userId,
                titulo: title,
                descricao: `Cupom de ${title}`,
                desconto: title,
                usado: false,
                cliente_nome: userData.nome,
                cliente_telefone: userData.whatsapp,
                cliente_endereco: endereco
            });
        
        if (couponError) {
            alert('Erro ao criar cupom');
            return;
        }
        
        // Registrar no histórico de pontos com dados completos
        await client
            .from('pontos_historico')
            .insert({
                cliente_id: userId,
                pontos: -cost,
                tipo: 'troca',
                descricao: `Troca por cupom: ${title}`,
                cliente_nome: userData.nome,
                cliente_telefone: userData.whatsapp,
                cliente_endereco: endereco
            });
        
        updatePointsDisplay(newPoints);
        alert(`Cupom ${title} adquirido com sucesso!\nPontos restantes: ${newPoints}`);
        
    } catch (error) {
        console.error('Erro na troca:', error);
        alert('Erro ao processar troca');
    }
}

// Tornar função global
window.exchangeCoupon = exchangeCoupon;

function toggleUserMenu() {
    const confirmLogout = confirm('Deseja sair da sua conta?');
    if (confirmLogout) {
        logout();
    }
}

// Funções do sistema de pontos
function makeNewOrder() {
    showSection('products');
}

function showOrderHistory() {
    const historyDiv = document.getElementById('order-history');
    const couponsDiv = document.getElementById('coupons-list');
    
    if (historyDiv.style.display === 'none') {
        historyDiv.style.display = 'block';
        couponsDiv.style.display = 'none';
        loadOrderHistory();
    } else {
        historyDiv.style.display = 'none';
    }
}

function showCoupons() {
    // Criar modal fullscreen
    const modal = document.createElement('div');
    modal.className = 'coupons-modal';
    modal.innerHTML = `
        <div class="coupons-modal-content">
            <div class="coupons-header">
                <button class="back-btn" onclick="closeCouponsModal()">←</button>
                <h2>MEUS CUPONS</h2>
            </div>
            <div class="add-coupon-section">
                <button class="add-coupon-btn" onclick="showAddCouponForm()">ADICIONAR CUPOM</button>
            </div>
            <div class="coupons-body" id="coupons-body">
                <div class="loading-coupons">Carregando cupons...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    loadCouponsModal();
}

function closeCouponsModal() {
    const modal = document.querySelector('.coupons-modal');
    if (modal) modal.remove();
}

async function loadCouponsModal() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            document.getElementById('coupons-body').innerHTML = `
                <div class="empty-coupons">
                    <div class="empty-icon">🎁</div>
                    <p>Você ainda não possui cupons</p>
                </div>
            `;
            return;
        }
        
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const { data: coupons, error } = await client
            .from('cupons')
            .select('*')
            .eq('cliente_id', userId)
            .order('data_criacao', { ascending: false });
        
        if (error || !coupons || coupons.length === 0) {
            document.getElementById('coupons-body').innerHTML = `
                <div class="empty-coupons">
                    <div class="empty-icon">🎁</div>
                    <p>Você ainda não possui cupons</p>
                </div>
            `;
            return;
        }
        
        const activeCoupons = coupons.filter(c => !c.usado);
        const usedCoupons = coupons.filter(c => c.usado);
        
        let html = '';
        
        if (activeCoupons.length > 0) {
            html += '<div class="coupons-section"><h3>CUPONS ATIVOS</h3>';
            activeCoupons.forEach(coupon => {
                html += `
                    <div class="coupon-card active">
                        <div class="coupon-badge">Frete grátis</div>
                        <div class="coupon-code">${coupon.titulo}</div>
                        <div class="coupon-description">${coupon.descricao}</div>
                        <button class="use-coupon-btn" onclick="useCouponModal(${coupon.id})">USAR CUPOM</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (usedCoupons.length > 0) {
            html += '<div class="coupons-section"><h3>CUPONS VENCIDOS</h3>';
            usedCoupons.forEach(coupon => {
                html += `
                    <div class="coupon-card expired">
                        <div class="coupon-badge expired">-30%</div>
                        <div class="coupon-code">${coupon.titulo}</div>
                        <div class="coupon-description">${coupon.descricao}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        document.getElementById('coupons-body').innerHTML = html;
        
    } catch (error) {
        document.getElementById('coupons-body').innerHTML = `
            <div class="empty-coupons">
                <div class="empty-icon">❌</div>
                <p>Erro ao carregar cupons</p>
            </div>
        `;
    }
}

function showAddCouponForm() {
    const code = prompt('Digite o código do cupom:');
    if (code) {
        alert('Funcionalidade em desenvolvimento');
    }
}

function useCouponModal(couponId) {
    alert('Cupom será aplicado no próximo pedido!');
}

async function loadOrderHistory() {
    const historyList = document.getElementById('history-list');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        historyList.innerHTML = '<p>Faça login para ver seus pedidos.</p>';
        return;
    }
    
    historyList.innerHTML = '<p>Carregando pedidos...</p>';
    
    try {
        const client = getSupabaseClient();
        if (!client) {
            throw new Error('Banco de dados não disponível');
        }
        
        const { data: orders, error } = await client
            .from('pedidos')
            .select('*')
            .eq('cliente_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            throw error;
        }
        
        if (!orders || orders.length === 0) {
            historyList.innerHTML = '<p>Nenhum pedido encontrado.</p>';
            return;
        }
        
        historyList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="order-total">R$ ${parseFloat(order.valor_total).toFixed(2)}</div>
                <div class="order-status">${order.status || 'Processando'}</div>
                <div class="order-payment">${order.forma_pagamento || 'N/A'}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        
        // Fallback para localStorage
        const localOrders = JSON.parse(localStorage.getItem('adegaOrders') || '[]');
        
        if (localOrders.length === 0) {
            historyList.innerHTML = '<p>Nenhum pedido encontrado.</p>';
            return;
        }
        
        historyList.innerHTML = localOrders.slice(-5).reverse().map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="order-total">R$ ${order.total.toFixed(2)}</div>
                <div class="order-status">${order.status}</div>
            </div>
        `).join('');
    }
}

async function loadAvailableCoupons() {
    const couponsList = document.getElementById('available-coupons');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        couponsList.innerHTML = '<p>Faça login para ver seus cupons.</p>';
        return;
    }
    
    try {
        const client = getSupabaseClient();
        if (!client) {
            couponsList.innerHTML = '<p>Erro: banco de dados não disponível.</p>';
            return;
        }
        
        const { data, error } = await client
            .from('cupons')
            .select('*')
            .eq('cliente_id', userId)
            .eq('usado', false);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            couponsList.innerHTML = '<p>Você não possui cupons disponíveis.</p>';
            return;
        }
        
        couponsList.innerHTML = data.map(coupon => `
            <div class="coupon-item">
                <div class="coupon-title">${coupon.titulo}</div>
                <div class="coupon-description">${coupon.descricao || coupon.desconto}</div>
                <button onclick="useCoupon(${coupon.id})" class="use-coupon-btn">Usar Cupom</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar cupons:', error);
        couponsList.innerHTML = '<p>Erro ao carregar cupons.</p>';
    }
}

function useCoupon(couponId) {
    alert('Cupom será aplicado no próximo pedido!');
}

function logoutCustomer() {
    logout();
}

function logout() {
    const confirmLogout = confirm('Tem certeza que deseja sair?');
    if (confirmLogout) {
        localStorage.removeItem('userRegistered');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
        localStorage.removeItem('deliveryAddress');
        localStorage.removeItem('deliveryAddressData');
        window.location.href = 'registro.html';
    }
}

// Função removida - não enviar mais mensagem de carrinho abandonado

// Tornar funções globais
window.makeNewOrder = makeNewOrder;
window.showOrderHistory = showOrderHistory;
window.showCoupons = showCoupons;
window.closeCouponsModal = closeCouponsModal;
window.logoutCustomer = logoutCustomer;

async function showOrderHistory() {
    const historyDiv = document.getElementById('order-history');
    const historyList = document.getElementById('history-list');
    
    if (!historyDiv || !historyList) return;
    
    historyDiv.style.display = 'block';
    historyList.innerHTML = '<p>Carregando pedidos...</p>';
    
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            historyList.innerHTML = '<p>Usuário não identificado</p>';
            return;
        }
        
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const { data: orders, error } = await client
            .from('pedidos')
            .select('*')
            .eq('cliente_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            historyList.innerHTML = '<p>Erro ao carregar pedidos</p>';
            return;
        }
        
        if (!orders || orders.length === 0) {
            historyList.innerHTML = '<p>Nenhum pedido encontrado</p>';
            return;
        }
        
        const ordersHtml = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="order-total">R$ ${parseFloat(order.valor_total || 0).toFixed(2)}</div>
                <div class="order-status">${order.status || 'Novo'}</div>
                <div class="order-payment">Pagamento: ${order.forma_pagamento || 'Não informado'}</div>
            </div>
        `).join('');
        
        historyList.innerHTML = ordersHtml;
        
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        historyList.innerHTML = '<p>Erro ao carregar pedidos</p>';
    }
}

window.showOrderHistory = showOrderHistory;
async function showOrderHistory() {
    // Criar modal fullscreen
    const modal = document.createElement('div');
    modal.className = 'orders-modal';
    modal.innerHTML = `
        <div class="orders-modal-content">
            <div class="orders-header">
                <button class="back-btn" onclick="closeOrdersModal()">←</button>
                <h2>MEUS PEDIDOS</h2>
            </div>
            <div class="orders-body" id="orders-body">
                <div class="loading-orders">Carregando pedidos...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Carregar pedidos
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            document.getElementById('orders-body').innerHTML = `
                <div class="empty-orders">
                    <div class="empty-icon">📋</div>
                    <p>Você ainda não possui pedidos realizados</p>
                </div>
            `;
            return;
        }
        
        const client = window.supabase.createClient(
            'https://vtrgtorablofhmhizrjr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmd0b3JhYmxvZmhtaGl6cmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3OTQ3NSwiZXhwIjoyMDY4ODU1NDc1fQ.lq8BJEn9HVeyQl6SUCdVXgxdWsveDS07kQUhktko8B4'
        );
        
        const { data: orders, error } = await client
            .from('pedidos')
            .select('*')
            .eq('cliente_id', userId)
            .order('data_pedido', { ascending: false });
        
        if (error || !orders || orders.length === 0) {
            document.getElementById('orders-body').innerHTML = `
                <div class="empty-orders">
                    <div class="empty-icon">📋</div>
                    <p>Você ainda não possui pedidos realizados</p>
                </div>
            `;
            return;
        }
        
        const ordersHtml = orders.map(order => `
            <div class="order-card">
                <div class="order-info">
                    <div class="order-number">Pedido #${order.id}</div>
                    <div class="order-date">${new Date(order.data_pedido).toLocaleDateString('pt-BR')}</div>
                    <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
                </div>
                <div class="order-total">R$ ${parseFloat(order.valor_total).toFixed(2)}</div>
            </div>
        `).join('');
        
        document.getElementById('orders-body').innerHTML = ordersHtml;
        
    } catch (error) {
        document.getElementById('orders-body').innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon">❌</div>
                <p>Erro ao carregar pedidos</p>
            </div>
        `;
    }
}

function getStatusText(status) {
    const statusMap = {
        'novo': 'Novo',
        'confirmado': 'Confirmado',
        'preparando': 'Preparando',
        'saiu_entrega': 'Saiu para entrega',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || 'Novo';
}

function closeOrdersModal() {
    const modal = document.querySelector('.orders-modal');
    if (modal) modal.remove();
}

window.showOrderHistory = showOrderHistory;
window.closeOrdersModal = closeOrdersModal;
function showOrderHistory() {
    window.open('pedidos.html', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
}

window.showOrderHistory = showOrderHistory;
// Forçar atualização de pontos ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    setTimeout(async () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            await loadCustomerPoints();
        }
    }, 2000);
});

// Atualizar pontos periodicamente
setInterval(async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        await loadCustomerPoints();
    }
}, 10000); // A cada 10 segundos
// Atualizar informações do cliente periodicamente
setInterval(async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        await loadCustomerPoints();
        loadUserDataToDropdown();
    }
}, 3000); // A cada 3 segundos