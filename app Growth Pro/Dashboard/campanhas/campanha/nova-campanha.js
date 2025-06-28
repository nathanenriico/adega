document.addEventListener('DOMContentLoaded', function() {
    // Elementos do wizard
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const wizardPanels = document.querySelectorAll('.wizard-panel');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    // Elementos do formulário
    const campaignName = document.getElementById('campaign-name');
    const campaignObjective = document.getElementById('campaign-objective');
    const campaignBudget = document.getElementById('campaign-budget');
    const campaignDuration = document.getElementById('campaign-duration');
    const platformCheckboxes = document.querySelectorAll('input[name="platform"]');
    
    // Elementos de segmentação
    const audienceType = document.getElementById('audience-type');
    const audienceAgeMin = document.getElementById('audience-age-min');
    const audienceAgeMax = document.getElementById('audience-age-max');
    const audienceGender = document.getElementById('audience-gender');
    const audienceLocation = document.getElementById('audience-location');
    const audienceInterests = document.getElementById('audience-interests');
    const placementCheckboxes = document.querySelectorAll('input[name="placement"]');
    
    // Elementos de anúncio
    const adHeadline = document.getElementById('ad-headline');
    const adDescription = document.getElementById('ad-description');
    const adImage = document.getElementById('ad-image');
    const adCta = document.getElementById('ad-cta');
    const adUrl = document.getElementById('ad-url');
    const platformTabs = document.querySelectorAll('.ad-platform-tab');
    
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
        
        // Preencher campos com valores padrão para conta demo
        campaignName.value = campaignName.value || "Campanha de Teste";
        campaignObjective.value = campaignObjective.value || "traffic";
        campaignBudget.value = campaignBudget.value || "50";
        audienceLocation.value = audienceLocation.value || "Brasil";
    }
    
    // Navegação do wizard
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.dataset.next) - 1;
            const nextStep = parseInt(this.dataset.next);
            
            // Validar campos antes de avançar
            if (validateStep(currentStep)) {
                // Marcar etapa atual como concluída
                wizardSteps[currentStep].classList.add('completed');
                
                // Desativar etapa atual
                wizardSteps[currentStep].classList.remove('active');
                wizardPanels[currentStep].classList.remove('active');
                
                // Ativar próxima etapa
                wizardSteps[nextStep].classList.add('active');
                wizardPanels[nextStep].classList.add('active');
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.dataset.prev) + 1;
            const prevStep = parseInt(this.dataset.prev);
            
            // Desativar etapa atual
            wizardSteps[currentStep].classList.remove('active');
            wizardPanels[currentStep].classList.remove('active');
            
            // Ativar etapa anterior
            wizardSteps[prevStep].classList.add('active');
            wizardPanels[prevStep].classList.add('active');
        });
    });
    
    // Definir valores padrão para campos obrigatórios
    function setDefaultValues() {
        // Se o campo de localização estiver vazio, preencher com "Brasil"
        if (!audienceLocation.value) {
            audienceLocation.value = "Brasil";
        }
    }
    
    // Validação de etapas
    function validateStep(step) {
        switch(step) {
            case 0: // Informações da Campanha
                if (!campaignName.value) {
                    alert('Por favor, insira um nome para a campanha.');
                    return false;
                }
                if (!campaignObjective.value) {
                    alert('Por favor, selecione um objetivo para a campanha.');
                    return false;
                }
                if (!campaignBudget.value || campaignBudget.value < 10) {
                    alert('Por favor, insira um orçamento válido (mínimo R$ 10,00).');
                    return false;
                }
                return true;
                
            case 1: // Segmentação de Público
                // Definir valor padrão para localização se estiver vazio
                setDefaultValues();
                return true;
                
            case 2: // Criação de Anúncios
                if (!adHeadline.value) {
                    alert('Por favor, insira um título para o anúncio.');
                    return false;
                }
                if (!adDescription.value) {
                    alert('Por favor, insira uma descrição para o anúncio.');
                    return false;
                }
                if (!adUrl.value) {
                    alert('Por favor, insira uma URL de destino para o anúncio.');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }
    
    // Salvar dados da campanha para revisão
    function saveCampaignData() {
        const campaignData = {
            name: campaignName.value,
            objective: campaignObjective.options[campaignObjective.selectedIndex].text,
            budget: campaignBudget.value,
            duration: campaignDuration.options[campaignDuration.selectedIndex].text,
            platforms: Array.from(platformCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value === 'meta' ? 'Meta Ads' : 'Google Ads')
                .join(', '),
            audienceType: audienceType.options[audienceType.selectedIndex].text,
            audienceAge: `${audienceAgeMin.value} a ${audienceAgeMax.value} anos`,
            audienceGender: audienceGender.options[audienceGender.selectedIndex].text,
            audienceLocation: audienceLocation.value,
            audienceInterests: audienceInterests.value,
            audiencePlacements: Array.from(placementCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => {
                    switch(checkbox.value) {
                        case 'feed': return 'Feed';
                        case 'stories': return 'Stories';
                        case 'search': return 'Pesquisa';
                        case 'display': return 'Display';
                        case 'youtube': return 'YouTube';
                        default: return checkbox.value;
                    }
                })
                .join(', '),
            adHeadline: adHeadline.value,
            adDescription: adDescription.value,
            adCta: adCta.options[adCta.selectedIndex].text,
            adUrl: adUrl.value,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('campaignData', JSON.stringify(campaignData));
    }
    
    // Criar prévia do anúncio
    function createAdPreview() {
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-preview-container';
        adContainer.style.width = '300px';
        adContainer.style.border = '1px solid #ddd';
        adContainer.style.borderRadius = '8px';
        adContainer.style.overflow = 'hidden';
        
        // Imagem do anúncio
        const adImagePreview = document.createElement('div');
        adImagePreview.style.height = '150px';
        adImagePreview.style.backgroundColor = '#f0f0f0';
        adImagePreview.style.display = 'flex';
        adImagePreview.style.alignItems = 'center';
        adImagePreview.style.justifyContent = 'center';
        
        if (adImage.files.length > 0) {
            const img = document.createElement('img');
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'cover';
            
            // Usar FileReader para exibir a imagem selecionada
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(adImage.files[0]);
            
            adImagePreview.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-image';
            icon.style.fontSize = '3rem';
            icon.style.color = '#aaa';
            adImagePreview.appendChild(icon);
        }
        
        // Conteúdo do anúncio
        const adContent = document.createElement('div');
        adContent.style.padding = '15px';
        
        const headline = document.createElement('h4');
        headline.textContent = adHeadline.value;
        headline.style.margin = '0 0 10px 0';
        headline.style.fontSize = '16px';
        headline.style.fontWeight = 'bold';
        
        const description = document.createElement('p');
        description.textContent = adDescription.value;
        description.style.margin = '0 0 15px 0';
        description.style.fontSize = '14px';
        description.style.color = '#444';
        
        const ctaButton = document.createElement('button');
        ctaButton.textContent = adCta.options[adCta.selectedIndex].text;
        ctaButton.style.backgroundColor = '#4f46e5';
        ctaButton.style.color = 'white';
        ctaButton.style.border = 'none';
        ctaButton.style.padding = '8px 16px';
        ctaButton.style.borderRadius = '4px';
        ctaButton.style.fontSize = '14px';
        ctaButton.style.fontWeight = '500';
        ctaButton.style.cursor = 'pointer';
        
        adContent.appendChild(headline);
        adContent.appendChild(description);
        adContent.appendChild(ctaButton);
        
        adContainer.appendChild(adImagePreview);
        adContainer.appendChild(adContent);
        
        return adContainer;
    }
    
    // Atualizar prévia do anúncio em tempo real
    function updateAdPreview() {
        const previewFrame = document.querySelector('.ad-preview-frame');
        if (previewFrame) {
            previewFrame.innerHTML = '';
            previewFrame.appendChild(createAdPreview());
        }
    }
    
    // Eventos para atualizar a prévia do anúncio
    [adHeadline, adDescription, adCta, adUrl].forEach(element => {
        element.addEventListener('input', updateAdPreview);
    });
    
    adImage.addEventListener('change', updateAdPreview);
    
    // Alternar entre plataformas na prévia
    platformTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            platformTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // Aqui você poderia ajustar a prévia com base na plataforma selecionada
        });
    });
    
    // Botão para ir para revisão e publicação
    const goToReviewBtn = document.getElementById('go-to-review');
    if (goToReviewBtn) {
        goToReviewBtn.addEventListener('click', function(e) {
            // Validar campos antes de avançar
            if (!validateStep(2)) {
                e.preventDefault();
                return;
            }
            
            // Salvar dados da campanha no localStorage
            saveCampaignData();
        });
    }
    
    // Inicializar prévia do anúncio quando a página carregar
    updateAdPreview();
});