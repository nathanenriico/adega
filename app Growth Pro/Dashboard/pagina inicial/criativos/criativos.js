document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const createCreativeBtn = document.getElementById('create-creative-btn');
    const creativeModal = document.getElementById('creative-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const creativeForm = document.getElementById('creative-form');
    const searchInput = document.getElementById('search-creative');
    const formatFilter = document.getElementById('format-filter');
    const platformFilter = document.getElementById('platform-filter');
    const creativeCards = document.querySelectorAll('.creative-card');
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
    createCreativeBtn.addEventListener('click', function() {
        creativeModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
    });
    
    // Fechar modal
    function closeModal() {
        creativeModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar rolagem do body
        creativeForm.reset(); // Limpar formulário
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === creativeModal) {
            closeModal();
        }
    });
    
    // Atualizar label do upload de arquivo com base no formato selecionado
    const creativeFormat = document.getElementById('creative-format');
    const creativeMedia = document.getElementById('creative-media');
    const fileUploadLabel = document.querySelector('.file-upload-label span');
    
    creativeFormat.addEventListener('change', function() {
        const format = this.value;
        
        if (format === 'image') {
            creativeMedia.accept = 'image/*';
            fileUploadLabel.textContent = 'Escolher Imagem';
        } else if (format === 'video') {
            creativeMedia.accept = 'video/*';
            fileUploadLabel.textContent = 'Escolher Vídeo';
        } else if (format === 'carousel') {
            creativeMedia.accept = 'image/*';
            fileUploadLabel.textContent = 'Escolher Imagens';
            creativeMedia.multiple = true;
        }
    });
    
    // Mostrar nome do arquivo selecionado
    creativeMedia.addEventListener('change', function() {
        if (this.files.length > 0) {
            if (this.files.length === 1) {
                fileUploadLabel.textContent = this.files[0].name;
            } else {
                fileUploadLabel.textContent = `${this.files.length} arquivos selecionados`;
            }
        } else {
            fileUploadLabel.textContent = 'Escolher Arquivo';
        }
    });
    
    // Envio do formulário
    creativeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const name = document.getElementById('creative-name').value;
        const format = document.getElementById('creative-format').value;
        const platform = document.getElementById('creative-platform').value;
        const headline = document.getElementById('creative-headline').value;
        const description = document.getElementById('creative-description').value;
        
        // Validação simples
        if (!name || !headline) {
            alert('Por favor, preencha o nome e o título do criativo.');
            return;
        }
        
        if (!creativeMedia.files.length) {
            alert('Por favor, selecione um arquivo de mídia.');
            return;
        }
        
        // Criar novo card de criativo (simulação)
        createCreativeCard(name, format, platform, headline);
        
        // Fechar modal
        closeModal();
        
        // Mensagem de sucesso
        alert('Criativo criado com sucesso!');
    });
    
    // Função para criar um novo card de criativo
    function createCreativeCard(name, format, platform, headline) {
        // Criar elementos
        const creativeGrid = document.querySelector('.creative-grid');
        const card = document.createElement('div');
        card.className = 'creative-card';
        
        // Determinar ícone e texto da plataforma
        const platformIcon = platform === 'meta' ? 'facebook' : 'google';
        const platformText = platform === 'meta' ? 'Meta Ads' : 'Google Ads';
        
        // Determinar preview com base no formato
        let previewHTML;
        let formatIcon;
        let formatText;
        
        switch(format) {
            case 'video':
                previewHTML = `<div class="video-placeholder"><i class="fas fa-play-circle"></i></div>`;
                formatIcon = 'video';
                formatText = 'Vídeo';
                break;
            case 'carousel':
                previewHTML = `<div class="carousel-placeholder"><i class="fas fa-images"></i></div>`;
                formatIcon = 'clone';
                formatText = 'Carrossel';
                break;
            default: // image
                // Gerar cor aleatória para o placeholder
                const colors = ['4285f4', '34a853', 'fbbc05', 'ea4335', '1877f2'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                previewHTML = `<img src="https://via.placeholder.com/600x400/${randomColor}/ffffff?text=${encodeURIComponent(headline)}" alt="${name}">`;
                formatIcon = 'image';
                formatText = 'Imagem';
        }
        
        // Gerar estatísticas aleatórias (simulação)
        const ctr = (Math.random() * 5 + 1).toFixed(1);
        const conversions = Math.floor(Math.random() * 100 + 10);
        
        // Data atual formatada
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR');
        
        // Conteúdo HTML do card
        card.innerHTML = `
            <div class="creative-preview ${format}-preview">
                ${previewHTML}
                <div class="creative-format">
                    <i class="fas fa-${formatIcon}"></i> ${formatText}
                </div>
            </div>
            <div class="creative-info">
                <h3>${name}</h3>
                <div class="creative-meta">
                    <span class="creative-platform"><i class="fab fa-${platformIcon}"></i> ${platformText}</span>
                    <span class="creative-date">Criado em ${formattedDate}</span>
                </div>
                <div class="creative-stats">
                    <div class="stat">
                        <span class="stat-label">CTR</span>
                        <span class="stat-value">${ctr}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Conversões</span>
                        <span class="stat-value">${conversions}</span>
                    </div>
                </div>
            </div>
            <div class="creative-actions">
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
            alert('Editar criativo: ' + name);
        });
        
        newDuplicateBtn.addEventListener('click', function() {
            alert('Duplicar criativo: ' + name);
        });
        
        newDeleteBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este criativo?')) {
                card.remove();
            }
        });
        
        // Adicionar card à grade
        creativeGrid.prepend(card);
    }
    
    // Filtrar criativos
    function filterCreatives() {
        const searchTerm = searchInput.value.toLowerCase();
        const formatValue = formatFilter.value;
        const platformValue = platformFilter.value;
        
        creativeCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const format = card.querySelector('.creative-format').textContent.toLowerCase();
            const platform = card.querySelector('.creative-platform').textContent.toLowerCase();
            
            // Verificar se atende aos critérios de filtro
            const matchesSearch = name.includes(searchTerm);
            const matchesFormat = formatValue === 'all' || format.includes(formatValue);
            const matchesPlatform = platformValue === 'all' || platform.includes(platformValue);
            
            // Mostrar ou ocultar com base nos filtros
            if (matchesSearch && matchesFormat && matchesPlatform) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Eventos de filtro
    searchInput.addEventListener('input', filterCreatives);
    formatFilter.addEventListener('change', filterCreatives);
    platformFilter.addEventListener('change', filterCreatives);
    
    // Eventos para botões de ação
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.creative-card');
            const name = card.querySelector('h3').textContent;
            alert('Editar criativo: ' + name);
        });
    });
    
    duplicateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.creative-card');
            const name = card.querySelector('h3').textContent;
            alert('Duplicar criativo: ' + name);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.creative-card');
            const name = card.querySelector('h3').textContent;
            
            if (confirm('Tem certeza que deseja excluir este criativo?')) {
                card.remove();
            }
        });
    });
});