// Monitor de navegação para detectar problemas
console.log('👁️ Iniciando monitor de navegação...');

window.addEventListener('load', function() {
    setTimeout(() => {
        // Monitorar todos os cliques em botões de navegação
        const navigationButtons = document.querySelectorAll('[onclick*="goToHome"], [onclick*="showSection"]');
        
        navigationButtons.forEach((button, index) => {
            const originalOnclick = button.onclick;
            const buttonText = button.textContent?.trim() || `Botão ${index + 1}`;
            
            button.addEventListener('click', function(event) {
                console.log(`🖱️ Clique detectado em: "${buttonText}"`);
                console.log('   - Elemento:', button);
                console.log('   - onclick original:', button.getAttribute('onclick'));
                
                // Verificar se as funções existem
                if (button.getAttribute('onclick')?.includes('goToHome')) {
                    console.log('   - Verificando window.goToHome:', typeof window.goToHome);
                    if (typeof window.goToHome !== 'function') {
                        console.error('   ❌ window.goToHome não é uma função!');
                        event.preventDefault();
                        // Fallback manual
                        if (typeof window.showSection === 'function') {
                            console.log('   🔄 Usando fallback: window.showSection("home")');
                            window.showSection('home');
                        }
                        return false;
                    }
                } else if (button.getAttribute('onclick')?.includes('showSection')) {
                    const match = button.getAttribute('onclick').match(/showSection\('([^']+)'\)/);
                    const sectionId = match ? match[1] : 'unknown';
                    console.log(`   - Verificando window.showSection para seção: ${sectionId}`);
                    console.log('   - window.showSection:', typeof window.showSection);
                    if (typeof window.showSection !== 'function') {
                        console.error('   ❌ window.showSection não é uma função!');
                        event.preventDefault();
                        return false;
                    }
                }
                
                console.log('   ✅ Função encontrada, prosseguindo...');
            });
        });
        
        console.log(`👁️ Monitor instalado em ${navigationButtons.length} botões de navegação`);
        
        // Teste automático das funções
        console.log('🧪 Testando funções de navegação...');
        console.log('- window.showSection:', typeof window.showSection);
        console.log('- window.goToHome:', typeof window.goToHome);
        
        // Verificar se a seção home está visível
        const homeSection = document.getElementById('home');
        if (homeSection) {
            const isVisible = homeSection.classList.contains('active') && 
                             homeSection.style.display !== 'none';
            console.log('- Seção home visível:', isVisible);
        }
        
    }, 1000);
});