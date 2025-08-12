// Sistema de Fidelidade com Supabase
let currentCustomer = null;
let supabaseClient = null;

// Inicializar Supabase
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    setTimeout(() => {
        loadSavedCustomerInfo();
    }, 500);
});

// Funções globais para informações do cliente
window.saveCustomerInfo = async function() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    
    if (!name || !phone) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    if (phone.length < 10) {
        alert('Número de WhatsApp inválido!');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('clientes')
            .insert([{ 
                nome: name, 
                telefone: phone,
                pontos: 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        const customerData = {
            id: data.id,
            name: data.nome,
            phone: data.telefone,
            points: data.pontos || 0
        };
        
        localStorage.setItem('customerInfo', JSON.stringify(customerData));
        showSavedCustomerInfo(customerData);
        alert('Informações salvas com sucesso!');
        
    } catch (error) {
        if (error.code === '23505') {
            alert('Este telefone já está cadastrado!');
        } else {
            alert('Erro ao salvar informações. Tente novamente.');
        }
    }
};

window.editCustomerInfo = function() {
    const savedData = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    
    const infoSection = document.getElementById('customer-info');
    infoSection.innerHTML = `
        <div class="info-card">
            <h2>📋 Suas Informações</h2>
            <p>Para melhor atendimento, informe seus dados abaixo:</p>
            
            <div class="info-form">
                <input type="text" id="customer-name" placeholder="Seu nome completo" value="${savedData.name || ''}" required>
                <input type="tel" id="customer-phone" placeholder="Seu WhatsApp (com DDD)" value="${savedData.phone || ''}" required>
                <button onclick="saveCustomerInfo()" class="save-info-btn">Salvar Informações</button>
            </div>
        </div>
    `;
};

// Mostrar informações salvas
function showSavedCustomerInfo(customerData) {
    const infoSection = document.getElementById('customer-info');
    
    infoSection.innerHTML = `
        <div class="info-card saved-profile">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <div class="profile-welcome">
                    <h2>Olá, ${customerData.name.split(' ')[0]}! 👋</h2>
                    <p>Suas informações estão salvas</p>
                </div>
            </div>
            <div class="profile-details">
                <div class="detail-item">
                    <span class="detail-icon">📝</span>
                    <div class="detail-content">
                        <span class="detail-label">Nome Completo</span>
                        <span class="detail-value">${customerData.name}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📱</span>
                    <div class="detail-content">
                        <span class="detail-label">WhatsApp</span>
                        <span class="detail-value">${customerData.phone}</span>
                    </div>
                </div>
                <div class="detail-item points-item">
                    <span class="detail-icon">🎆</span>
                    <div class="detail-content">
                        <span class="detail-label">Pontos Acumulados</span>
                        <span class="detail-value">${customerData.points || 0} pontos</span>
                    </div>
                </div>
            </div>
            <div class="points-system">
                <h3>🎯 Sistema de Pontos</h3>
                <p>Ganhe 1 ponto a cada R$ 10 gastos</p>
                <div class="coupon-store">
                    <h4>🎁 Loja de Cupons</h4>
                    <div class="store-grid">
                        <div class="coupon-option" onclick="exchangePoints('5off', 50)">
                            <div class="coupon-title">5% OFF</div>
                            <div class="coupon-cost">50 pontos</div>
                        </div>
                        <div class="coupon-option" onclick="exchangePoints('10off', 100)">
                            <div class="coupon-title">10% OFF</div>
                            <div class="coupon-cost">100 pontos</div>
                        </div>
                        <div class="coupon-option" onclick="exchangePoints('frete', 150)">
                            <div class="coupon-title">Frete Grátis</div>
                            <div class="coupon-cost">150 pontos</div>
                        </div>
                        <div class="coupon-option" onclick="exchangePoints('15off', 200)">
                            <div class="coupon-title">15% OFF</div>
                            <div class="coupon-cost">200 pontos</div>
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="editCustomerInfo()" class="edit-profile-btn">
                <span>✏️</span> Editar Informações
            </button>
        </div>
    `;
    
    // Mostrar perfil no header
    showCustomerProfile(customerData);
}

// Mostrar perfil do cliente no header
function showCustomerProfile(customerData) {
    const profileElement = document.getElementById('customer-profile');
    const profileName = document.getElementById('profile-name');
    
    if (profileElement && profileName) {
        profileName.textContent = customerData.name.split(' ')[0];
        profileElement.style.display = 'flex';
    }
}

// Carregar informações salvas na inicialização
async function loadSavedCustomerInfo() {
    const savedData = localStorage.getItem('customerInfo');
    if (savedData) {
        const customerData = JSON.parse(savedData);
        
        if (customerData.id && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('clientes')
                    .select('*')
                    .eq('id', customerData.id)
                    .single();
                
                if (data) {
                    const updatedData = {
                        id: data.id,
                        name: data.nome,
                        phone: data.telefone,
                        points: data.pontos || 0
                    };
                    localStorage.setItem('customerInfo', JSON.stringify(updatedData));
                    showSavedCustomerInfo(updatedData);
                    return;
                }
            } catch (error) {
                console.log('Erro ao carregar dados do banco:', error);
            }
        }
        
        // Garantir que pontos seja 0 se não existir
        if (!customerData.points) customerData.points = 0;
        showSavedCustomerInfo(customerData);
    }
}
// Função para trocar pontos por cupons
async function exchangePoints(couponType, pointsCost) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert('Erro: usuário não identificado');
        return;
    }
    
    const client = getSupabaseClient();
    if (!client) {
        alert('Erro: sistema indisponível');
        return;
    }
    
    try {
        // Buscar pontos atuais
        const { data: currentData, error: fetchError } = await client
            .from('clientes')
            .select('pontos')
            .eq('id', userId)
            .single();
        
        if (fetchError) {
            alert('Erro ao verificar pontos');
            return;
        }
        
        const currentPoints = currentData.pontos || 0;
        
        if (currentPoints < pointsCost) {
            alert(`Pontos insuficientes! Você tem ${currentPoints} pontos e precisa de ${pointsCost}.`);
            return;
        }
        
        const coupons = {
            '5off': { title: '5% OFF', description: 'Desconto de 5% em qualquer pedido', discount: '5%' },
            '10off': { title: '10% OFF', description: 'Desconto de 10% em qualquer pedido', discount: '10%' },
            'frete': { title: 'Frete Grátis', description: 'Entrega gratuita no próximo pedido', discount: 'Frete Grátis' },
            '15off': { title: '15% OFF', description: 'Desconto de 15% em qualquer pedido', discount: '15%' }
        };
        
        const coupon = coupons[couponType];
        
        // Debitar pontos
        const { error: updateError } = await client
            .from('clientes')
            .update({ pontos: currentPoints - pointsCost })
            .eq('id', userId);
        
        if (updateError) throw updateError;
        
        // Criar cupom
        const { error: insertError } = await client
            .from('cupons')
            .insert({
                cliente_id: parseInt(userId),
                titulo: coupon.title,
                descricao: coupon.description,
                desconto: coupon.discount,
                usado: false
            });
        
        if (insertError) throw insertError;
        
        // Salvar IDs para checkout
        localStorage.setItem('loyaltyCustomerId', userId);
        
        // Atualizar display de pontos
        const newPoints = currentPoints - pointsCost;
        const pointsDisplay = document.getElementById('customer-points-display');
        if (pointsDisplay) {
            pointsDisplay.textContent = newPoints + ' pontos';
        }
        
        alert(`Cupom ${coupon.title} adquirido com sucesso! Use no checkout.`);
        
    } catch (error) {
        console.error('Erro ao trocar cupom:', error);
        alert('Erro ao criar cupom. Verifique se a tabela existe no banco.');
    }
}

window.exchangePoints = exchangePoints;