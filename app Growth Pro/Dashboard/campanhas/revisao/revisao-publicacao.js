document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const editButtons = document.querySelectorAll('.edit-btn');
    const backBtn = document.getElementById('back-btn');
    const publishBtn = document.getElementById('publish-btn');
    const publishModal = document.getElementById('publish-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const viewCampaignBtn = document.getElementById('view-campaign-btn');
    const goDashboardBtn = document.getElementById('go-dashboard-btn');
    
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
    
    // Carregar dados da campanha do localStorage
    function loadCampaignData() {
        // Tentar obter dados da campanha do localStorage
        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
        
        // Se não houver dados, usar valores padrão
        if (!Object.keys(campaignData).length) {
            return;
        }
        
        // Preencher os campos com os dados da campanha
        document.getElementById('campaign-name-value').textContent = campaignData.name || 'Campanha de Verão 2025';
        document.getElementById('campaign-objective-value').textContent = campaignData.objective || 'Conversões';
        document.getElementById('campaign-budget-value').textContent = `R$ ${campaignData.budget || '100,00'}`;
        document.getElementById('campaign-duration-value').textContent = campaignData.duration || '30 dias';
        document.getElementById('campaign-platforms-value').textContent = campaignData.platforms || 'Meta Ads, Google Ads';
        
        document.getElementById('audience-type-value').textContent = campaignData.audienceType || 'Novo Público';
        document.getElementById('audience-age-value').textContent = campaignData.audienceAge || '18 a 65+ anos';
        document.getElementById('audience-gender-value').textContent = campaignData.audienceGender || 'Todos';
        document.getElementById('audience-location-value').textContent = campaignData.audienceLocation || 'Brasil';
        document.getElementById('audience-interests-value').textContent = campaignData.audienceInterests || 'Esportes, Fitness, Tecnologia';
        document.getElementById('audience-placements-value').textContent = campaignData.audiencePlacements || 'Feed, Stories';
        
        document.getElementById('ad-headline-value').textContent = campaignData.adHeadline || 'Oferta Especial de Verão!';
        document.getElementById('ad-description-value').textContent = campaignData.adDescription || 'Aproveite nossos produtos com 30% OFF. Promoção por tempo limitado!';
        document.getElementById('ad-cta-value').textContent = campaignData.adCta || 'Comprar Agora';
        document.getElementById('ad-url-value').textContent = campaignData.adUrl || 'https://seusite.com.br/promocao';
        
        // Se houver imagem do anúncio, atualizar a prévia
        if (campaignData.adImageUrl) {
            const adImage = document.querySelector('.ad-preview-image img');
            if (adImage) {
                adImage.src = campaignData.adImageUrl;
            }
        }
    }
    
    // Carregar dados ao iniciar a página
    loadCampaignData();
    
    // Botões de edição
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Redirecionar para a etapa correspondente na página de nova campanha
            switch(section) {
                case 'info':
                    window.location.href = '../campanha/nova-campanha.html#step-1';
                    break;
                case 'audience':
                    window.location.href = '../campanha/nova-campanha.html#step-2';
                    break;
                case 'ads':
                    window.location.href = '../campanha/nova-campanha.html#step-3';
                    break;
            }
        });
    });
    
    // Botão voltar
    backBtn.addEventListener('click', function() {
        window.location.href = '../campanha/nova-campanha.html';
    });
    
    // Botão publicar
    publishBtn.addEventListener('click', function() {
        // Mostrar modal de confirmação
        publishModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
        
        // Simular publicação da campanha
        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
        
        // Adicionar data de publicação
        campaignData.publishedAt = new Date().toISOString();
        campaignData.status = 'active';
        
        // Salvar campanha atualizada
        localStorage.setItem('campaignData', JSON.stringify(campaignData));
        
        // Adicionar à lista de campanhas
        const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        campaigns.push(campaignData);
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
    });
    
    // Fechar modal
    function closeModal() {
        publishModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar rolagem do body
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === publishModal) {
            closeModal();
        }
    });
    
    // Botão ver detalhes da campanha
    viewCampaignBtn.addEventListener('click', function() {
        // Redirecionar para página de detalhes da campanha (simulação)
        alert('Esta funcionalidade será implementada em breve.');
    });
    
    // Botão ir para dashboard
    goDashboardBtn.addEventListener('click', function() {
        window.location.href = '../../pagina inicial/dashboard/dashboard.html';
    });
    
    // Gerar estimativas de desempenho aleatórias
    function generateEstimates() {
        // Obter orçamento da campanha
        const campaignData = JSON.parse(localStorage.getItem('campaignData') || '{}');
        const budget = parseFloat(campaignData.budget || 100);
        
        // Calcular estimativas com base no orçamento
        const impressionsMin = Math.floor(budget * 100);
        const impressionsMax = Math.floor(budget * 300);
        const clicksMin = Math.floor(impressionsMin * 0.02);
        const clicksMax = Math.floor(impressionsMax * 0.02);
        const conversionsMin = Math.floor(clicksMin * 0.025);
        const conversionsMax = Math.floor(clicksMax * 0.025);
        
        // Atualizar valores na interface
        const impressionsElement = document.querySelector('.estimate-card:nth-child(1) .estimate-value');
        const clicksElement = document.querySelector('.estimate-card:nth-child(2) .estimate-value');
        const conversionsElement = document.querySelector('.estimate-card:nth-child(3) .estimate-value');
        
        if (impressionsElement) {
            impressionsElement.textContent = `${impressionsMin.toLocaleString()} - ${impressionsMax.toLocaleString()}`;
        }
        
        if (clicksElement) {
            clicksElement.textContent = `${clicksMin.toLocaleString()} - ${clicksMax.toLocaleString()}`;
        }
        
        if (conversionsElement) {
            conversionsElement.textContent = `${conversionsMin.toLocaleString()} - ${conversionsMax.toLocaleString()}`;
        }
    }
    
    // Gerar estimativas ao carregar a página
    generateEstimates();
});