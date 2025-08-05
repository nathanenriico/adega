// Script de teste para o painel do cliente
console.log('🧪 Script de teste do painel do cliente carregado');

// Função para testar o painel
window.testCustomerPanel = function() {
    console.log('🧪 Testando painel do cliente...');
    
    // Verificar dados no localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRegistered = localStorage.getItem('userRegistered');
    const userId = localStorage.getItem('userId');
    
    console.log('📊 Dados encontrados:');
    console.log('- userRegistered:', userRegistered);
    console.log('- userId:', userId);
    console.log('- userData:', userData);
    
    // Verificar elementos DOM
    const customerPanel = document.getElementById('logged-customer-panel');
    const customerInfo = document.getElementById('customer-info');
    
    console.log('🔍 Elementos DOM:');
    console.log('- customerPanel existe:', !!customerPanel);
    console.log('- customerPanel display:', customerPanel?.style.display);
    console.log('- customerInfo existe:', !!customerInfo);
    console.log('- customerInfo display:', customerInfo?.style.display);
    
    // Forçar exibição se houver dados
    if (userData.nome && customerPanel) {
        console.log('🔧 Forçando exibição do painel...');
        
        if (customerInfo) customerInfo.style.display = 'none';
        customerPanel.style.display = 'block';
        customerPanel.style.visibility = 'visible';
        customerPanel.style.opacity = '1';
        
        // Preencher dados
        const firstName = userData.nome.split(' ')[0];
        const loggedNameEl = document.getElementById('logged-customer-name');
        const fullNameEl = document.getElementById('customer-full-name');
        const whatsappEl = document.getElementById('customer-whatsapp');
        
        if (loggedNameEl) loggedNameEl.textContent = firstName;
        if (fullNameEl) fullNameEl.textContent = userData.nome;
        if (whatsappEl) whatsappEl.textContent = userData.whatsapp;
        
        console.log('✅ Painel forçado a aparecer!');
        
        // Carregar pontos
        if (typeof loadCustomerPoints === 'function') {
            loadCustomerPoints();
        }
        
        return true;
    } else {
        console.log('❌ Não foi possível exibir o painel');
        return false;
    }
};

// Executar teste automaticamente após 3 segundos
setTimeout(() => {
    console.log('🔄 Executando teste automático...');
    window.testCustomerPanel();
}, 3000);

// Executar teste quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🔄 Teste após DOMContentLoaded...');
        window.testCustomerPanel();
    }, 1000);
});

console.log('✅ Script de teste configurado. Use testCustomerPanel() no console para testar manualmente.');