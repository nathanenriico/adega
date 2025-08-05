// Script de debug para testar a navegação
console.log('🔍 Iniciando debug da navegação...');

// Aguardar carregamento completo
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔍 TESTE DE NAVEGAÇÃO:');
        console.log('- window.showSection:', typeof window.showSection);
        console.log('- window.goToHome:', typeof window.goToHome);
        console.log('- showSection (local):', typeof showSection);
        console.log('- goToHome (local):', typeof goToHome);
        
        // Testar se as seções existem
        const homeSection = document.getElementById('home');
        const productsSection = document.getElementById('products');
        console.log('- Seção home existe:', !!homeSection);
        console.log('- Seção products existe:', !!productsSection);
        
        // Testar botões
        const homeButtons = document.querySelectorAll('[onclick*="goToHome"], [onclick*="showSection(\'home\')"]');
        console.log('- Botões de início encontrados:', homeButtons.length);
        
        homeButtons.forEach((btn, index) => {
            console.log(`  Botão ${index + 1}:`, btn.textContent?.trim(), '- onclick:', btn.getAttribute('onclick'));
        });
        
        // Função de teste manual
        window.testNavigation = function() {
            console.log('🧪 Testando navegação manual...');
            
            if (typeof window.showSection === 'function') {
                console.log('✅ Testando window.showSection("home")');
                const result = window.showSection('home');
                console.log('Resultado:', result);
            } else {
                console.log('❌ window.showSection não disponível');
            }
            
            if (typeof window.goToHome === 'function') {
                console.log('✅ Testando window.goToHome()');
                window.goToHome();
            } else {
                console.log('❌ window.goToHome não disponível');
            }
        };
        
        console.log('🔍 Debug concluído. Use testNavigation() no console para testar manualmente.');
        
    }, 2000);
});