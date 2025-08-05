// Verificar se o usuário já está cadastrado
document.addEventListener('DOMContentLoaded', function() {
    const userRegistered = localStorage.getItem('userRegistered');
    if (userRegistered === 'true') {
        window.location.href = 'index.html';
    }
    
    setupFormValidation();
});

function setupFormValidation() {
    const form = document.getElementById('welcome-form');
    const cepInput = document.getElementById('cep');
    const whatsappInput = document.getElementById('whatsapp');
    
    // Máscara para CEP
    cepInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        this.value = value;
        
        // Buscar endereço automaticamente
        if (value.length === 9) {
            buscarEnderecoPorCEP(value);
        }
    });
    
    // Máscara para WhatsApp
    whatsappInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        this.value = value;
    });
    
    form.addEventListener('submit', handleFormSubmit);
}

async function buscarEnderecoPorCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('rua').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || 'Atibaia';
        }
    } catch (error) {
        console.log('Erro ao buscar CEP:', error);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        nome: formData.get('nome').trim(),
        whatsapp: formData.get('whatsapp').trim(),
        cep: formData.get('cep').trim(),
        rua: formData.get('rua').trim(),
        numero: formData.get('numero').trim(),
        complemento: formData.get('complemento').trim(),
        bairro: formData.get('bairro').trim(),
        cidade: formData.get('cidade').trim()
    };
    
    // Validação
    if (!validateForm(userData)) {
        return;
    }
    
    // Mostrar loading
    showLoading(true);
    hideError();
    
    // Aguardar Supabase estar disponível
    let attempts = 0;
    while ((!window.supabase || !supabase) && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        if (window.supabase && !supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    }
    
    try {
        console.log('🔄 Tentando salvar no banco:', userData);
        console.log('🔍 Supabase disponível:', typeof supabase !== 'undefined');
        
        if (typeof supabase === 'undefined' || !supabase) {
            throw new Error('Supabase não está carregado');
        }
        
        // Verificar se usuário já existe
        const cleanWhatsapp = userData.whatsapp.replace(/\D/g, '');
        const { data: existingUser, error: checkError } = await supabase
            .from('clientes')
            .select('id, nome, pontos')
            .or(`whatsapp.eq.${userData.whatsapp},whatsapp.eq.${cleanWhatsapp}`);
        
        console.log('🔍 Verificação de usuário existente:', { existingUser, checkError });
        
        let data;
        if (existingUser) {
            // Usuário já existe, apenas atualizar dados
            console.log('🔄 Atualizando usuário existente...');
            const { data: updatedData, error } = await supabase
                .from('clientes')
                .update({
                    nome: userData.nome,
                    cep: userData.cep,
                    rua: userData.rua,
                    numero: userData.numero,
                    complemento: userData.complemento || null,
                    bairro: userData.bairro,
                    cidade: userData.cidade
                })
                .eq('id', existingUser.id)
                .select()
                .single();
            
            console.log('📊 Resultado da atualização:', { updatedData, error });
            if (error) throw error;
            data = updatedData;
            
            // Salvar endereço atualizado
            const deliveryAddress = `${userData.rua}, ${userData.numero}${userData.complemento ? ` - ${userData.complemento}` : ''}
${userData.bairro}, ${userData.cidade}
CEP: ${userData.cep}`;
            localStorage.setItem('deliveryAddress', deliveryAddress);
            localStorage.setItem('deliveryAddressData', JSON.stringify({
                cep: userData.cep,
                street: userData.rua,
                number: userData.numero,
                complement: userData.complemento,
                neighborhood: userData.bairro,
                city: userData.cidade
            }));
        } else {
            // Novo usuário
            console.log('🆕 Criando novo usuário...');
            const { data: newData, error } = await supabase
                .from('clientes')
                .insert({
                    nome: userData.nome,
                    whatsapp: userData.whatsapp,
                    cep: userData.cep,
                    rua: userData.rua,
                    numero: userData.numero,
                    complemento: userData.complemento || null,
                    bairro: userData.bairro,
                    cidade: userData.cidade,
                    pontos: 100
                })
                .select()
                .single();
            
            console.log('📊 Resultado da criação:', { newData, error });
            if (error) throw error;
            data = newData;
            
            // Salvar endereço do novo usuário
            const deliveryAddress = `${userData.rua}, ${userData.numero}${userData.complemento ? ` - ${userData.complemento}` : ''}
${userData.bairro}, ${userData.cidade}
CEP: ${userData.cep}`;
            localStorage.setItem('deliveryAddress', deliveryAddress);
            localStorage.setItem('deliveryAddressData', JSON.stringify({
                cep: userData.cep,
                street: userData.rua,
                number: userData.numero,
                complement: userData.complemento,
                neighborhood: userData.bairro,
                city: userData.cidade
            }));
        }
        
        // Salvar no localStorage
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userId', data.id);
        
        // Salvar endereço de entrega formatado
        const deliveryAddress = `${userData.rua}, ${userData.numero}${userData.complemento ? ` - ${userData.complemento}` : ''}
${userData.bairro}, ${userData.cidade}
CEP: ${userData.cep}`;
        localStorage.setItem('deliveryAddress', deliveryAddress);
        localStorage.setItem('deliveryAddressData', JSON.stringify({
            cep: userData.cep,
            street: userData.rua,
            number: userData.numero,
            complement: userData.complemento,
            neighborhood: userData.bairro,
            city: userData.cidade
        }));
        
        console.log('✅ Dados salvos - ID:', data.id, 'Nome:', userData.nome);
        console.log('✅ Endereço salvo:', deliveryAddress);
        
        // Mostrar sucesso e redirecionar
        showSuccess();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro detalhado ao salvar:', error);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Detalhes do erro:', error.details);
        showError(`Erro ao salvar: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function validateForm(data) {
    // Validar campos obrigatórios
    const required = ['nome', 'whatsapp', 'cep', 'rua', 'numero', 'bairro', 'cidade'];
    for (let field of required) {
        if (!data[field]) {
            showError(`O campo ${field} é obrigatório.`);
            return false;
        }
    }
    
    // Validar CEP
    if (!/^\d{5}-\d{3}$/.test(data.cep)) {
        showError('CEP deve ter o formato 12345-678');
        return false;
    }
    
    // Validar WhatsApp
    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(data.whatsapp)) {
        showError('WhatsApp deve ter o formato (11) 99999-9999');
        return false;
    }
    
    return true;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (show) {
        loading.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
    } else {
        loading.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continuar para a Adega 🍷';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
}

function showSuccess() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.className = 'success-message';
    errorDiv.innerHTML = 'Cadastro realizado com sucesso!<br>🎉 Você ganhou 100 pontos de boas-vindas!<br>📍 Seu endereço foi salvo para entregas!<br>Redirecionando...';
    errorDiv.style.display = 'block';
}