document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const dateRangeSelect = document.getElementById('date-range');
    const customDateRange = document.querySelector('.custom-date-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const metricSelector = document.getElementById('metric-selector');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportPdfBtn = document.getElementById('export-pdf');
    
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
    
    // Inicializar datas
    function initializeDates() {
        const today = new Date();
        
        // Data final (hoje)
        const endDate = today.toISOString().split('T')[0];
        endDateInput.value = endDate;
        
        // Data inicial (30 dias atrás)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDateInput.value = startDate.toISOString().split('T')[0];
    }
    
    initializeDates();
    
    // Mostrar/ocultar seletor de datas personalizado
    dateRangeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            
            // Ajustar datas com base na seleção
            const today = new Date();
            const endDate = today.toISOString().split('T')[0];
            endDateInput.value = endDate;
            
            let startDate = new Date(today);
            
            switch(this.value) {
                case '7days':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case '30days':
                    startDate.setDate(today.getDate() - 30);
                    break;
                case '90days':
                    startDate.setDate(today.getDate() - 90);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1); // 1º de janeiro do ano atual
                    break;
            }
            
            startDateInput.value = startDate.toISOString().split('T')[0];
        }
    });
    
    // Aplicar filtros
    applyFiltersBtn.addEventListener('click', function() {
        // Simular carregamento
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        
        // Simular atualização dos dados após um breve delay
        setTimeout(() => {
            updateCharts();
            this.disabled = false;
            this.innerHTML = 'Aplicar Filtros';
            
            // Mostrar mensagem de sucesso
            alert('Relatório atualizado com sucesso!');
        }, 1000);
    });
    
    // Atualizar gráficos com base na métrica selecionada
    metricSelector.addEventListener('change', function() {
        updatePerformanceChart(this.value);
    });
    
    // Função para atualizar todos os gráficos
    function updateCharts() {
        updatePerformanceChart(metricSelector.value);
        updatePlatformChart();
        updateCampaignChart();
    }
    
    // Função para atualizar o gráfico de desempenho
    function updatePerformanceChart(metric) {
        const performanceChart = document.getElementById('performance-chart');
        
        // Limpar conteúdo atual
        performanceChart.innerHTML = '';
        
        // Criar canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'performance-canvas';
        performanceChart.appendChild(canvas);
        
        // Simular dados para o gráfico
        const days = 30;
        const labels = [];
        const data = [];
        
        // Gerar datas para o eixo X
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
        
        // Gerar dados com base na métrica selecionada
        for (let i = 0; i < days; i++) {
            let value;
            
            switch(metric) {
                case 'impressions':
                    // Valores entre 2000 e 6000
                    value = Math.floor(Math.random() * 4000) + 2000;
                    break;
                case 'clicks':
                    // Valores entre 50 e 200
                    value = Math.floor(Math.random() * 150) + 50;
                    break;
                case 'conversions':
                    // Valores entre 2 e 15
                    value = Math.floor(Math.random() * 13) + 2;
                    break;
                case 'cost':
                    // Valores entre 50 e 150
                    value = Math.floor(Math.random() * 100) + 50;
                    break;
                default:
                    value = Math.floor(Math.random() * 100);
            }
            
            data.push(value);
        }
        
        // Desenhar gráfico placeholder
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4285f4';
        
        // Desenhar barras simples
        const barWidth = canvas.width / days;
        const maxValue = Math.max(...data);
        
        for (let i = 0; i < days; i++) {
            const barHeight = (data[i] / maxValue) * canvas.height * 0.8;
            ctx.fillRect(
                i * barWidth,
                canvas.height - barHeight,
                barWidth - 2,
                barHeight
            );
        }
    }
    
    // Função para atualizar o gráfico de plataformas
    function updatePlatformChart() {
        const platformChart = document.getElementById('platform-chart');
        
        // Limpar conteúdo atual
        platformChart.innerHTML = '';
        
        // Criar canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'platform-canvas';
        platformChart.appendChild(canvas);
        
        // Desenhar gráfico de pizza placeholder
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        // Desenhar fatias
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 0.7, false);
        ctx.fillStyle = '#4285f4';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, Math.PI * 0.7, Math.PI * 2, false);
        ctx.fillStyle = '#1877f2';
        ctx.fill();
        
        // Legenda
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Meta Ads: 60%', 20, 20);
        ctx.fillText('Google Ads: 40%', 20, 40);
    }
    
    // Função para atualizar o gráfico de campanhas
    function updateCampaignChart() {
        const campaignChart = document.getElementById('campaign-chart');
        
        // Limpar conteúdo atual
        campaignChart.innerHTML = '';
        
        // Criar canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'campaign-canvas';
        campaignChart.appendChild(canvas);
        
        // Desenhar gráfico de barras placeholder
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar barras
        const barWidth = canvas.width / 4;
        const barHeight1 = canvas.height * 0.7;
        const barHeight2 = canvas.height * 0.5;
        const barHeight3 = canvas.height * 0.3;
        
        ctx.fillStyle = '#4285f4';
        ctx.fillRect(barWidth * 0.5, canvas.height - barHeight1, barWidth - 10, barHeight1);
        
        ctx.fillStyle = '#34a853';
        ctx.fillRect(barWidth * 1.5, canvas.height - barHeight2, barWidth - 10, barHeight2);
        
        ctx.fillStyle = '#fbbc05';
        ctx.fillRect(barWidth * 2.5, canvas.height - barHeight3, barWidth - 10, barHeight3);
    }
    
    // Exportar para CSV
    exportCsvBtn.addEventListener('click', function() {
        alert('Relatório exportado para CSV com sucesso!');
    });
    
    // Exportar para PDF
    exportPdfBtn.addEventListener('click', function() {
        alert('Relatório exportado para PDF com sucesso!');
    });
    
    // Inicializar gráficos
    updateCharts();
});