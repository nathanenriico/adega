// Script de inicialização da navegação
console.log('🚀 Inicializando sistema de navegação...');

// Função para garantir que apenas a seção home seja exibida inicialmente
function initializeNavigation() {
    console.log('🔧 Configurando navegação inicial...');
    
    // Esconder todas as seções primeiro
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
    });
    
    // Mostrar apenas a seção home
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('active');
        homeSection.style.display = 'block';
        homeSection.style.visibility = 'visible';
        homeSection.style.opacity = '1';
        console.log('✅ Seção home ativada como padrão');
    }
    
    // Ativar o link do menu home
    const homeLinks = document.querySelectorAll('[onclick*="showSection(\'home\')"]');
    homeLinks.forEach(link => {
        link.classList.add('active');
    });
    
    console.log('🎯 Navegação inicializada com sucesso!');
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}

// Executar também quando a página estiver totalmente carregada
window.addEventListener('load', function() {
    console.log('🔄 Verificando navegação após carregamento completo...');
    
    // Verificar se há alguma seção sendo exibida incorretamente
    const visibleSections = document.querySelectorAll('.section[style*="block"], .section.active');
    if (visibleSections.length > 1) {
        console.warn('⚠️ Múltiplas seções visíveis detectadas, corrigindo...');
        initializeNavigation();
    }
});

// Prevenir conflitos de navegação
window.addEventListener('beforeunload', function() {
    console.log('📝 Salvando estado da navegação...');
    sessionStorage.setItem('lastSection', 'home');
});

console.log('✅ Sistema de navegação carregado!');