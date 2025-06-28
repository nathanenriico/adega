document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const tabLinks = document.querySelectorAll('.settings-nav li');
    const tabContents = document.querySelectorAll('.settings-tab');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const showKeyBtn = document.querySelector('.show-key-btn');
    const copyKeyBtn = document.querySelector('.copy-key-btn');
    const apiKeyInput = document.getElementById('api-key');
    
    // Verificar usuário logado (conta demo)
    const isDemoAccount = localStorage.getItem('demoAccount') === 'true';
    const userName = localStorage.getItem('userName');
    
    if (isDemoAccount && userName) {
        // Atualizar nome do usuário
        const userNameSpan = document.querySelector('.user-menu span');
        if (userNameSpan) {
            userNameSpan.textContent = userName;
        }
        
        // Atualizar avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && localStorage.getItem('useAvatarIcon') === 'true') {
            userAvatar.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }
        
        // Atualizar avatar grande nas configurações
        const userAvatarLarge = document.querySelector('.user-avatar-large');
        if (userAvatarLarge && localStorage.getItem('useAvatarIcon') === 'true') {
            userAvatarLarge.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }
        
        // Atualizar nome no formulário de perfil
        const userNameInput = document.getElementById('user-name');
        if (userNameInput) {
            userNameInput.value = userName;
        }
    }
    
    // Navegação entre abas
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remover classe active de todas as abas
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            
            // Adicionar classe active à aba clicada
            this.classList.add('active');
            
            // Mostrar conteúdo correspondente
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Envio do formulário de perfil
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('user-name').value;
            const email = document.getElementById('user-email').value;
            const company = document.getElementById('user-company').value;
            
            // Validação simples
            if (!name || !email) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Atualizar nome do usuário na interface
            const userNameSpan = document.querySelector('.user-menu span');
            if (userNameSpan) {
                userNameSpan.textContent = name;
            }
            
            // Armazenar nome atualizado
            localStorage.setItem('userName', name);
            
            // Simular salvamento
            alert('Perfil atualizado com sucesso!');
        });
    }
    
    // Envio do formulário de senha
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validação simples
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            // Simular alteração de senha
            alert('Senha alterada com sucesso!');
            this.reset();
        });
    }
    
    // Mostrar/ocultar chave de API
    if (showKeyBtn && apiKeyInput) {
        showKeyBtn.addEventListener('click', function() {
            const isShowing = this.getAttribute('data-show') === 'true';
            
            if (isShowing) {
                apiKeyInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
                this.setAttribute('data-show', 'false');
            } else {
                apiKeyInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                this.setAttribute('data-show', 'true');
            }
        });
    }
    
    // Copiar chave de API
    if (copyKeyBtn && apiKeyInput) {
        copyKeyBtn.addEventListener('click', function() {
            // Salvar tipo atual
            const currentType = apiKeyInput.type;
            
            // Mudar para texto para poder copiar
            apiKeyInput.type = 'text';
            
            // Selecionar e copiar
            apiKeyInput.select();
            document.execCommand('copy');
            
            // Restaurar tipo
            apiKeyInput.type = currentType;
            
            // Feedback visual
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
            
            // Remover seleção
            window.getSelection().removeAllRanges();
        });
    }
    
    // Eventos para botões de conexão
    const connectionButtons = document.querySelectorAll('.connection-actions button');
    connectionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const platform = this.closest('.connection-card').querySelector('h3').textContent;
            
            alert(`Ação "${action}" para ${platform}`);
        });
    });
    
    // Eventos para botões de faturamento
    const billingButtons = document.querySelectorAll('.plan-actions button, .card-actions button, .invoice-actions button');
    billingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            alert(`Ação "${action}" iniciada`);
        });
    });
    
    // Botão para adicionar método de pagamento
    const addPaymentBtn = document.querySelector('.add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            alert('Adicionar novo método de pagamento');
        });
    }
    
    // Botão para alterar avatar
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            alert('Funcionalidade de alteração de avatar');
        });
    }
    
    // Botão para salvar preferências de notificação
    const saveNotificationsBtn = document.querySelector('#notifications-tab .primary-btn');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', function() {
            alert('Preferências de notificação salvas com sucesso!');
        });
    }
});