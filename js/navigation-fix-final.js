// Correção final e definitiva da navegação
console.log('🔧 Carregando correção final da navegação...');

// Garantir que as funções sejam definidas globalmente
(function() {
    'use strict';
    
    // Função principal de navegação
    function showSectionFinal(sectionId) {
        console.log('🔄 showSectionFinal chamada para:', sectionId);
        
        // Verificar se a seção existe
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.error('❌ Seção não encontrada:', sectionId);
            return false;
        }
        
        // Esconder todas as seções
        const allSections = document.querySelectorAll('.section');
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.style.opacity = '0';
        });
        
        // Mostrar apenas a seção alvo
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        targetSection.style.opacity = '1';
        
        // Carregar produtos se for a seção de produtos
        if (sectionId === 'products' && typeof window.reloadProductsFromDatabase === 'function') {
            setTimeout(() => {
                window.reloadProductsFromDatabase();
            }, 100);
        }
        
        // Atualizar menus ativos
        document.querySelectorAll('.nav-menu a, .nav-item, .mobile-nav-item').forEach(link => {
            link.classList.remove('active');
        });
        
        // Ativar links correspondentes
        const activeLinks = document.querySelectorAll(`[onclick*="showSection('${sectionId}')"], [onclick*="goToHome()"]`);
        activeLinks.forEach(link => {
            if (sectionId === 'home' && (link.onclick?.toString().includes('goToHome') || link.onclick?.toString().includes("showSection('home')"))) {
                link.classList.add('active');
            } else if (link.onclick?.toString().includes(`showSection('${sectionId}')`)) {
                link.classList.add('active');
            }
        });
        
        // Fechar menus laterais
        const elementsToClose = [
            'side-menu', 'menu-overlay', 'cart-sidebar', 'cart-overlay'
        ];
        
        elementsToClose.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.remove('active');
        });
        
        console.log('✅ Navegação concluída para:', sectionId);
        return true;
    }
    
    // Função específica para ir ao início
    function goToHomeFinal() {
        console.log('🏠 goToHomeFinal chamada');
        
        // Fechar painel admin se estiver aberto
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel && !adminPanel.classList.contains('hidden')) {
            adminPanel.classList.add('hidden');
        }
        
        // Navegar para home
        return showSectionFinal('home');
    }
    
    // Definir as funções globalmente de forma forçada
    window.showSection = showSectionFinal;
    window.goToHome = goToHomeFinal;
    
    // Também definir no escopo global para compatibilidade
    if (typeof globalThis !== 'undefined') {
        globalThis.showSection = showSectionFinal;
        globalThis.goToHome = goToHomeFinal;
    }
    
    // Aguardar DOM estar pronto
    function initializeNavigation() {
        console.log('🚀 Inicializando navegação final...');
        
        // Garantir que apenas home esteja visível inicialmente
        const allSections = document.querySelectorAll('.section');
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('active');
            homeSection.style.display = 'block';
            homeSection.style.visibility = 'visible';
            homeSection.style.opacity = '1';
        }
        
        console.log('✅ Navegação final inicializada');
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNavigation);
    } else {
        initializeNavigation();
    }
    
    // Executar também no load para garantir
    window.addEventListener('load', function() {
        setTimeout(initializeNavigation, 100);
        
        // Carregar produtos após tudo estar pronto
        setTimeout(() => {
            if (typeof window.reloadProductsFromDatabase === 'function') {
                window.reloadProductsFromDatabase();
            }
        }, 1000);
    });
    
    console.log('✅ Correção final da navegação carregada');
})();