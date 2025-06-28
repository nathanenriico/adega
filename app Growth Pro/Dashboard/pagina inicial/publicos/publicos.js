document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const createAudienceBtn = document.getElementById('create-audience-btn');
    const audienceModal = document.getElementById('audience-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const audienceForm = document.getElementById('audience-form');
    const searchInput = document.getElementById('search-audience');
    const platformFilter = document.getElementById('platform-filter');
    const typeFilter = document.getElementById('type-filter');
    const audienceCards = document.querySelectorAll('.audience-card');
    const editButtons = document.querySelectorAll('.edit-btn');
    const duplicateButtons = document.querySelectorAll('.duplicate-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
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
    }
    
    // Abrir modal
    createAudienceBtn.addEventListener('click', function() {
        audienceModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
    });
    
    // Fechar modal
    function closeModal() {
        audienceModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar rolagem do body
        audienceForm.reset(); // Limpar formulário
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === audienceModal) {
            closeModal();
        }
    });
    
    // Envio do formulário
    audienceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const name = document.getElementById('audience-name').value;
        const platform = document.getElementById('audience-platform').value;
        const type = document.getElementById('audience-type').value;
        const description = document.getElementById('audience-description').value;
        
        // Validação simples
        if (!name) {
            alert('Por favor, insira um nome para o público.');
            return;
        }
        
        // Criar novo card de público (simulação)
        createAudienceCard(name, platform, type, description);
        
        // Fechar modal
        closeModal();
        
        // Mensagem de sucesso
        alert('Público criado com sucesso!');
    });
    
    // Função para criar um novo card de público
    function createAudienceCard(name, platform, type, description) {
        // Criar elementos
        const audienceList = document.querySelector('.audience-list');
        const card = document.createElement('div');
        card.className = 'audience-card';
        
        // Determinar ícone e texto da plataforma
        const platformIcon = platform === 'meta' ? 'facebook' : 'google';
        const platformText = platform === 'meta' ? 'Meta Ads' : 'Google Ads';
        
        // Determinar texto do tipo
        let typeText;
        switch(type) {
            case 'custom': typeText = 'Personalizado'; break;
            case 'lookalike': typeText = 'Semelhante'; break;
            case 'retargeting': typeText = 'Retargeting'; break;
            default: typeText = 'Personalizado';
        }
        
        // Gerar tamanho aleatório do público (simulação)
        const size = Math.floor(Math.random() * 5000000) + 10000;
        let sizeText;
        if (size >= 1000000) {
            sizeText = `~${(size / 1000000).toFixed(1)}M pessoas`;
        } else {
            sizeText = `~${(size / 1000).toFixed(1)}K pessoas`;
        }
        
        // Conteúdo HTML do card
        card.innerHTML = `
            <div class="audience-info">
                <h3>${name}</h3>
                <div class="audience-meta">
                    <span class="audience-platform"><i class="fab fa-${platformIcon}"></i> ${platformText}</span>
                    <span class="audience-type">${typeText}</span>
                    <span class="audience-size">${sizeText}</span>
                </div>
                <p class="audience-description">${description || 'Sem descrição.'}</p>
            </div>
            <div class="audience-actions">
                <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn duplicate-btn"><i class="fas fa-copy"></i></button>
                <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        const newEditBtn = card.querySelector('.edit-btn');
        const newDuplicateBtn = card.querySelector('.duplicate-btn');
        const newDeleteBtn = card.querySelector('.delete-btn');
        
        newEditBtn.addEventListener('click', function() {
            alert('Editar público: ' + name);
        });
        
        newDuplicateBtn.addEventListener('click', function() {
            alert('Duplicar público: ' + name);
        });
        
        newDeleteBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este público?')) {
                card.remove();
            }
        });
        
        // Adicionar card à lista
        audienceList.prepend(card);
    }
    
    // Filtrar públicos
    function filterAudiences() {
        const searchTerm = searchInput.value.toLowerCase();
        const platformValue = platformFilter.value;
        const typeValue = typeFilter.value;
        
        audienceCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const platform = card.querySelector('.audience-platform').textContent.toLowerCase();
            const type = card.querySelector('.audience-type').textContent.toLowerCase();
            
            // Verificar se atende aos critérios de filtro
            const matchesSearch = name.includes(searchTerm);
            const matchesPlatform = platformValue === 'all' || platform.includes(platformValue);
            const matchesType = typeValue === 'all' || type.toLowerCase().includes(typeValue);
            
            // Mostrar ou ocultar com base nos filtros
            if (matchesSearch && matchesPlatform && matchesType) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Eventos de filtro
    searchInput.addEventListener('input', filterAudiences);
    platformFilter.addEventListener('change', filterAudiences);
    typeFilter.addEventListener('change', filterAudiences);
    
    // Eventos para botões de ação
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.audience-card');
            const name = card.querySelector('h3').textContent;
            alert('Editar público: ' + name);
        });
    });
    
    duplicateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.audience-card');
            const name = card.querySelector('h3').textContent;
            alert('Duplicar público: ' + name);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.audience-card');
            const name = card.querySelector('h3').textContent;
            
            if (confirm('Tem certeza que deseja excluir este público?')) {
                card.remove();
            }
        });
    });
});