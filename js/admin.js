

// Menu toggle function
function toggleMenu() {
    console.log('Menu toggle');
}

// Admin Functions
function adminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === 'admin123') {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        
        // Carregar produtos da página principal
        const savedProducts = localStorage.getItem('adegaProducts');
        if (savedProducts) {
            window.products = JSON.parse(savedProducts);
        }
        
        loadProducts();
    } else {
        alert('Senha incorreta!');
    }
}

function logout() {
    window.location.reload();
}

// Carregar produtos na tabela
function loadProducts() {
    // Garantir que temos os produtos da página principal
    if (typeof products === 'undefined' || products.length === 0) {
        // Carregar produtos do localStorage se existir
        const savedProducts = localStorage.getItem('adegaProducts');
        if (savedProducts) {
            window.products = JSON.parse(savedProducts);
        }
    }
    
    const productsList = document.getElementById('products-list');
    
    if (!products || products.length === 0) {
        productsList.innerHTML = '<div class="empty-state">Nenhum produto cadastrado</div>';
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-row">
            <div class="product-code">#${product.id}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-category">${getCategoryName(product.category)}</div>
            <div class="product-price">R$ ${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">✏️</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Obter nome da categoria
function getCategoryName(category) {
    const names = {
        'cervejas': 'Cervejas',
        'drinks': 'Drinks', 
        'vinhos': 'Vinhos',
        'refrigerantes': 'Refrigerantes',
        'aguas': 'Águas e Gelo',
        'chopp': 'Chopp'
    };
    return names[category] || category;
}

// Adicionar produto
async function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageFile = document.getElementById('product-image-file').files[0];
    
    if (!name || !price || price <= 0) {
        alert('Preencha nome e preço válidos!');
        return;
    }
    
    let imageUrl = 'https://via.placeholder.com/200x150/28a745/fff?text=Produto';
    
    if (imageFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    const newProduct = {
        id: Date.now(),
        name,
        price,
        category,
        image: imageUrl
    };
    
    try {
        // Salvar no Supabase
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: newProduct.name,
                    price: newProduct.price,
                    category: newProduct.category,
                    image: newProduct.image,
                    active: true
                }])
                .select()
                .single();
                
            if (error) throw error;
            newProduct.supabase_id = data.id;
        }
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
    }
    
    // Adicionar ao array local
    if (!window.products) window.products = [];
    products.push(newProduct);
    
    // Salvar no localStorage para sincronizar com a página principal
    localStorage.setItem('adegaProducts', JSON.stringify(products));
    
    // Forçar atualização na página principal se estiver aberta
    if (window.opener && window.opener.renderProducts) {
        window.opener.products = products;
        window.opener.renderProducts();
    }
    
    // Limpar formulário
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-image-file').value = '';
    document.getElementById('product-category').selectedIndex = 0;
    
    // Recarregar lista
    loadProducts();
    
    alert('Produto adicionado com sucesso!');
}

// Editar produto
async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Nome do produto:', product.name);
    if (!newName || newName.trim() === '') return;
    
    const newPrice = prompt('Preço do produto:', product.price);
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) return;
    
    // Atualizar produto
    product.name = newName.trim();
    product.price = parseFloat(newPrice);
    
    try {
        // Atualizar no Supabase
        if (typeof supabase !== 'undefined' && product.supabase_id) {
            const { error } = await supabase
                .from('products')
                .update({
                    name: product.name,
                    price: product.price
                })
                .eq('id', product.supabase_id);
                
            if (error) throw error;
        }
    } catch (error) {
        console.error('Erro ao atualizar no Supabase:', error);
    }
    
    // Salvar no localStorage
    localStorage.setItem('adegaProducts', JSON.stringify(products));
    
    // Forçar atualização na página principal se estiver aberta
    if (window.opener && window.opener.renderProducts) {
        window.opener.products = products;
        window.opener.renderProducts();
    }
    
    loadProducts();
    
    alert('Produto atualizado com sucesso!');
}

// Excluir produto
async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (!confirm(`Excluir "${product.name}"?`)) return;
    
    try {
        // Excluir do Supabase (usar ID do produto ou supabase_id)
        if (typeof supabase !== 'undefined') {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.supabase_id || product.id);
                
            if (error) throw error;
            console.log('✅ Produto excluído do Supabase');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir do Supabase:', error);
    }
    
    // Remover do array local
    window.products = products.filter(p => p.id !== id);
    
    // Salvar no localStorage
    localStorage.setItem('adegaProducts', JSON.stringify(window.products));
    
    // Forçar atualização na página principal se estiver aberta
    if (window.opener && window.opener.renderProducts) {
        window.opener.products = window.products;
        window.opener.renderProducts();
    }
    
    loadProducts();
    
    // Disparar evento customizado para notificar outras abas
    localStorage.setItem('productDeleted', JSON.stringify({id, timestamp: Date.now()}));
    
    alert('Produto excluído com sucesso!');
}

// Pesquisar produtos
function searchProducts() {
    const search = document.getElementById('search-products').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    
    let filtered = products;
    
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        );
    }
    
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    displayFilteredProducts(filtered);
}

// Filtrar produtos por categoria
function filterProducts() {
    searchProducts();
}

// Exibir produtos filtrados
function displayFilteredProducts(filtered) {
    const productsList = document.getElementById('products-list');
    
    if (filtered.length === 0) {
        productsList.innerHTML = '<div class="empty-state">Nenhum produto encontrado</div>';
        return;
    }
    
    productsList.innerHTML = filtered.map(product => `
        <div class="product-row">
            <div class="product-code">#${product.id}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-category">${getCategoryName(product.category)}</div>
            <div class="product-price">R$ ${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">✏️</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
            </div>
        </div>
    `).join('');
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

// Atualizar preview do produto
function updateProductPreview() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageFile = document.getElementById('product-image-file').files[0];
    
    const previewDiv = document.getElementById('product-preview');
    
    if (!name && !price && !imageFile) {
        previewDiv.innerHTML = '<div class="preview-placeholder"><p>Preencha os campos acima para visualizar o produto</p></div>';
        return;
    }
    
    const categoryNames = {
        'cervejas': 'Cervejas',
        'drinks': 'Drinks',
        'vinhos': 'Vinhos',
        'refrigerantes': 'Refrigerantes',
        'aguas': 'Águas e Gelo',
        'chopp': 'Chopp'
    };
    
    let imageUrl = 'https://via.placeholder.com/300x150/28a745/fff?text=Produto';
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageUrl = e.target.result;
            renderPreview();
        };
        reader.readAsDataURL(imageFile);
    } else {
        renderPreview();
    }
    
    function renderPreview() {
        previewDiv.innerHTML = `
            <div class="product-card-preview">
                <img src="${imageUrl}" alt="${name || 'Produto'}">
                <div class="product-name">${name || 'Nome do produto'}</div>
                <div class="product-category">${categoryNames[category] || 'Categoria'}</div>
                <div class="product-price">R$ ${price ? price.toFixed(2) : '0,00'}</div>
                <div class="preview-actions">
                    <button class="preview-btn preview-add-btn">Adicionar 🛒</button>
                    <button class="preview-btn preview-whatsapp-btn">WhatsApp 💬</button>
                </div>
            </div>
        `;
    }
}

// Adicionar listeners para atualizar preview em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const categorySelect = document.getElementById('product-category');
    const imageInput = document.getElementById('product-image-file');
    
    if (nameInput) nameInput.addEventListener('input', updateProductPreview);
    if (priceInput) priceInput.addEventListener('input', updateProductPreview);
    if (categorySelect) categorySelect.addEventListener('change', updateProductPreview);
    if (imageInput) imageInput.addEventListener('change', updateProductPreview);
});

// Definir funções no escopo global
window.toggleMenu = toggleMenu;
window.adminLogin = adminLogin;
window.logout = logout;
window.addProduct = addProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.updateProductPreview = updateProductPreview;