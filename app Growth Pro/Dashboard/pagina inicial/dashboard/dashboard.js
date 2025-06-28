document.addEventListener('DOMContentLoaded', function() {
    const createCampaignBtn = document.getElementById('create-campaign-btn');
    const userAvatar = document.querySelector('.user-avatar');
    const userNameSpan = document.querySelector('.user-menu span');
    
    // Verificar se há um usuário logado (conta demo)
    const isDemoAccount = localStorage.getItem('demoAccount') === 'true';
    const userName = localStorage.getItem('userName');
    
    if (isDemoAccount && userName) {
        // Atualizar nome do usuário
        userNameSpan.textContent = userName;
        
        // Usar ícone de avatar padrão
        if (localStorage.getItem('useAvatarIcon') === 'true') {
            // Substituir a imagem por um ícone de avatar
            userAvatar.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            userAvatar.style.backgroundColor = '#ffffff';
        }
    }
    
    // Botão para criar nova campanha
    createCampaignBtn.addEventListener('click', function() {
        window.location.href = '../campanhas/nova-campanha.html';
    });
});