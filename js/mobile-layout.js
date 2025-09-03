// Mobile Layout Functions
function renderMobileProducts() {
    const mobileGrid = document.getElementById('mobile-products-grid');
    if (!mobileGrid) return;
    
    const products = window.products || [];
    
    if (products.length === 0) {
        mobileGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Carregando produtos...</p>';
        return;
    }
    
    mobileGrid.innerHTML = products.slice(0, 10).map(product => `
        <div class="mobile-product-card">
            <img src="${product.image}" alt="${product.name}" class="mobile-product-image" 
                 onerror="this.src='https://via.placeholder.com/150x140/f0f0f0/999?text=Produto'">
            <div class="mobile-product-badge">-20%</div>
            <button class="mobile-product-heart">♥</button>
            <div class="mobile-product-info">
                <div class="mobile-product-name">${product.name}</div>
                <div class="mobile-product-brand">ADEGA</div>
                <div class="product-rating"></div>
                <div class="mobile-product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <button class="mobile-add-btn" onclick="showProductDetails(${product.id})">
                    Ver Detalhes
                </button>
            </div>
        </div>
    `).join('');
}

// Atualizar contador do carrinho mobile
function updateMobileCartCount() {
    const cart = JSON.parse(localStorage.getItem('adegaCart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const mobileCartBadge = document.getElementById('mobile-cart-count');
    if (mobileCartBadge) {
        mobileCartBadge.textContent = count;
        mobileCartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Filtrar produtos no mobile
function filterMobileProducts(category) {
    const products = window.products || [];
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    const mobileGrid = document.getElementById('mobile-products-grid');
    if (!mobileGrid) return;
    
    mobileGrid.innerHTML = filteredProducts.slice(0, 10).map(product => `
        <div class="mobile-product-card">
            <img src="${product.image}" alt="${product.name}" class="mobile-product-image" 
                 onerror="this.src='https://via.placeholder.com/150x140/f0f0f0/999?text=Produto'">
            <div class="mobile-product-badge">-20%</div>
            <button class="mobile-product-heart">♥</button>
            <div class="mobile-product-info">
                <div class="mobile-product-brand">ADEGA</div>
                <div class="mobile-product-name">${product.name}</div>
                <div class="mobile-product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <button class="mobile-add-btn" onclick="addToCart(${product.id})">
                    🛒 Adicionar
                </button>
            </div>
        </div>
    `).join('');
}

// Busca mobile - funciona por nome e categoria
function searchMobileProducts() {
    const searchInput = document.getElementById('mobile-search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Se não há termo de busca, mostrar todos os produtos
    if (!searchTerm) {
        renderMobileProducts();
        return;
    }
    
    const products = window.products || [];
    
    // Buscar por nome do produto OU categoria
    const filteredProducts = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category.toLowerCase().includes(searchTerm);
        
        // Mapear termos comuns para categorias
        const categoryMappings = {
            'cerveja': 'cervejas',
            'vinho': 'vinhos', 
            'drink': 'drinks',
            'agua': 'aguas',
            'água': 'aguas',
            'refrigerante': 'refrigerantes',
            'destilado': 'destilados',
            'whisky': 'destilados',
            'vodka': 'destilados',
            'cachaça': 'destilados',
            'gin': 'destilados'
        };
        
        // Verificar se o termo de busca corresponde a algum mapeamento
        const mappedCategory = categoryMappings[searchTerm];
        const mappingMatch = mappedCategory && product.category === mappedCategory;
        
        return nameMatch || categoryMatch || mappingMatch;
    });
    
    const mobileGrid = document.getElementById('mobile-products-grid');
    if (!mobileGrid) return;
    
    if (filteredProducts.length === 0) {
        mobileGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <p>Nenhum produto encontrado para "${searchTerm}"</p>
                <p style="font-size: 14px; opacity: 0.7;">Tente buscar por: cerveja, vinho, drink, água...</p>
            </div>
        `;
        return;
    }
    
    mobileGrid.innerHTML = filteredProducts.map(product => `
        <div class="mobile-product-card">
            <img src="${product.image}" alt="${product.name}" class="mobile-product-image" 
                 onerror="this.src='https://via.placeholder.com/150x140/f0f0f0/999?text=Produto'">
            <div class="mobile-product-badge">-20%</div>
            <button class="mobile-product-heart">♥</button>
            <div class="mobile-product-info">
                <div class="mobile-product-brand">ADEGA</div>
                <div class="mobile-product-name">${product.name}</div>
                <div class="mobile-product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <button class="mobile-add-btn" onclick="addToCart(${product.id})">
                    🛒 Adicionar
                </button>
            </div>
        </div>
    `).join('');
    
    // Mostrar resultado da busca
    console.log(`🔍 Busca mobile: "${searchTerm}" - ${filteredProducts.length} produtos encontrados`);
}

// Sobrescrever função de filtro para mobile
const originalFilterProducts = window.filterProducts;
window.filterProducts = function(category) {
    // Executar função original
    if (originalFilterProducts) {
        originalFilterProducts(category);
    }
    
    // Executar versão mobile
    if (window.innerWidth <= 768) {
        filterMobileProducts(category);
    }
};

// Função de busca unificada que funciona tanto no desktop quanto no mobile
function searchProducts() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        searchMobileProducts();
    } else {
        // Busca desktop
        const searchInput = document.getElementById('product-search');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            if (typeof window.reloadProductsFromDatabase === 'function') {
                window.reloadProductsFromDatabase();
            } else {
                renderProducts();
            }
            return;
        }
        
        const products = window.products || [];
        
        const filteredProducts = products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);
            
            const categoryMappings = {
                'cerveja': 'cervejas',
                'vinho': 'vinhos', 
                'drink': 'drinks',
                'agua': 'aguas',
                'água': 'aguas',
                'refrigerante': 'refrigerantes',
                'destilado': 'destilados',
                'whisky': 'destilados',
                'vodka': 'destilados',
                'cachaça': 'destilados',
                'gin': 'destilados'
            };
            
            const mappedCategory = categoryMappings[searchTerm];
            const mappingMatch = mappedCategory && product.category === mappedCategory;
            
            return nameMatch || categoryMatch || mappingMatch;
        });
        
        renderProducts(filteredProducts);
        console.log(`🔍 Busca desktop: "${searchTerm}" - ${filteredProducts.length} produtos encontrados`);
    }
}

// Sobrescrever função global de busca
window.searchProducts = searchProducts;

// Inicializar mobile layout
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        // Mostrar home por padrão
        showMobileSection('home');
        
        setTimeout(() => {
            renderMobileProducts();
            updateMobileCartCount();
        }, 1000);
        
        // Event listeners para busca mobile
        const mobileSearchInput = document.getElementById('mobile-search-input');
        if (mobileSearchInput) {
            // Busca ao pressionar Enter
            mobileSearchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchMobileProducts();
                }
            });
            
            // Busca em tempo real (opcional)
            mobileSearchInput.addEventListener('input', function() {
                // Debounce para evitar muitas chamadas
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    searchMobileProducts();
                }, 300);
            });
        }
        
        // Event listener para botão de busca mobile
        const mobileSearchBtn = document.querySelector('.mobile-search-btn');
        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', searchMobileProducts);
        }
    }
});

// Atualizar contador quando carrinho mudar
const originalUpdateCartDisplay = window.updateCartDisplay;
window.updateCartDisplay = function() {
    if (originalUpdateCartDisplay) {
        originalUpdateCartDisplay();
    }
    updateMobileCartCount();
};

// Função para mostrar seções no mobile
function showMobileSection(sectionId) {
    // Esconder elementos mobile da home
    const mobileElements = ['.mobile-banner', '.mobile-categories', '.mobile-products', '.mobile-delivery-info'];
    mobileElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = sectionId === 'home' ? '' : 'none';
        }
    });
    
    // Mostrar seção desktop correspondente
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Rolar para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função específica para mobile chatbot
function toggleMobileChatBot() {
    console.log('🤖 toggleMobileChatBot chamada');
    const chatbot = document.getElementById('chatbot-container');
    
    if (chatbot) {
        const isActive = chatbot.classList.contains('active');
        
        if (isActive) {
            // Fechar chat
            chatbot.classList.remove('active');
            chatbot.style.transform = 'translateY(100%)';
            chatbot.style.display = 'none';
            
            setTimeout(() => {
                chatbot.style.display = '';
                chatbot.style.transform = '';
            }, 300);
            
            console.log('🔴 Chat fechado');
        } else {
            // Abrir chat
            chatbot.style.display = 'flex';
            chatbot.style.transform = 'translateY(0)';
            chatbot.classList.add('active');
            console.log('🟢 Chat aberto');
            initializeMobileChatBot();
        }
    } else {
        console.error('❌ Elemento chatbot-container não encontrado');
    }
}

// Inicializar chatbot mobile
function initializeMobileChatBot() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer && messagesContainer.children.length <= 1) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'bot-message';
        welcomeMessage.innerHTML = `
            🍷 Olá! Bem-vindo à Adega do Tio Pancho!<br><br>
            Como posso ajudar você hoje?<br><br>
            • Ver produtos<br>
            • Fazer pedido<br>
            • Horários<br>
            • Contato
        `;
        messagesContainer.appendChild(welcomeMessage);
    }
}

// Função de emergência para fechar o chat
function forceCloseChatBot() {
    console.log('🆘 Forçando fechamento do chat');
    const chatbot = document.getElementById('chatbot-container');
    if (chatbot) {
        chatbot.classList.remove('active');
        chatbot.style.display = 'none !important';
        chatbot.style.transform = 'translateY(100%) !important';
        chatbot.style.visibility = 'hidden !important';
        
        setTimeout(() => {
            chatbot.style.display = '';
            chatbot.style.transform = '';
            chatbot.style.visibility = '';
        }, 500);
        
        console.log('✅ Chat fechado forçadamente');
    }
}

// Função simples para fechar chat (pode ser chamada no console)
function closeChatNow() {
    const chatbot = document.getElementById('chatbot-container');
    if (chatbot) {
        chatbot.style.display = 'none';
        chatbot.classList.remove('active');
        console.log('Chat fechado imediatamente');
    }
}

// Tornar funções globais
window.renderMobileProducts = renderMobileProducts;
window.updateMobileCartCount = updateMobileCartCount;
window.showMobileSection = showMobileSection;
window.toggleMobileChatBot = toggleMobileChatBot;
window.searchMobileProducts = searchMobileProducts;
window.forceCloseChatBot = forceCloseChatBot;
window.closeChatNow = closeChatNow;

// Garantir que o botão de fechar do chat funcione no mobile
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos foram carregados
    setTimeout(function() {
        // Adicionar event listener para o botão de fechar do chat
        const chatCloseBtn = document.querySelector('.chatbot-header button');
        if (chatCloseBtn) {
            console.log('✅ Botão de fechar chat encontrado');
            
            // Remover qualquer event listener anterior
            chatCloseBtn.removeAttribute('onclick');
            
            // Adicionar novo event listener
            chatCloseBtn.addEventListener('click', function(e) {
                console.log('🔴 Botão de fechar clicado');
                e.preventDefault();
                e.stopPropagation();
                
                // Forçar fechamento do chat
                const chatbot = document.getElementById('chatbot-container');
                if (chatbot) {
                    chatbot.classList.remove('active');
                    // Forçar estilo inline para garantir fechamento
                    chatbot.style.transform = 'translateY(100%)';
                    chatbot.style.display = 'none';
                    
                    // Restaurar após animação
                    setTimeout(() => {
                        chatbot.style.display = '';
                        chatbot.style.transform = '';
                    }, 300);
                    
                    console.log('✅ Chat fechado com sucesso');
                }
            });
            
            // Adicionar event listener para touch (mobile)
            chatCloseBtn.addEventListener('touchend', function(e) {
                console.log('🔴 Botão de fechar tocado (touch)');
                e.preventDefault();
                e.stopPropagation();
                
                const chatbot = document.getElementById('chatbot-container');
                if (chatbot) {
                    chatbot.classList.remove('active');
                    console.log('✅ Chat fechado com sucesso (touch)');
                }
            });
        } else {
            console.error('❌ Botão de fechar chat não encontrado');
        }
        
        // Adicionar event listener para fechar chat clicando no overlay (mobile)
        const chatContainer = document.getElementById('chatbot-container');
        if (chatContainer) {
            chatContainer.addEventListener('click', function(e) {
                // Se clicou no overlay (fundo), fechar o chat
                if (e.target === chatContainer) {
                    console.log('🔴 Clicou no overlay - fechando chat');
                    chatContainer.classList.remove('active');
                }
            });
        }
    }, 1000);
});