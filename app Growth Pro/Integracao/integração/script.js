document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const demoBtn = document.getElementById('demo-btn');
    const demoContainer = document.getElementById('demo-container');
    const steps = document.querySelectorAll('.step');
    
    // Adicionar animação de entrada aos passos
    steps.forEach((step, index) => {
        step.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Demonstração interativa
    demoBtn.addEventListener('click', function() {
        if (demoContainer.classList.contains('active')) {
            demoContainer.classList.remove('active');
            demoBtn.textContent = 'Ver Demonstração';
            demoContainer.innerHTML = '';
        } else {
            demoContainer.classList.add('active');
            demoBtn.textContent = 'Fechar Demonstração';
            
            // Criar conteúdo da demonstração
            const demoContent = document.createElement('div');
            demoContent.innerHTML = `
                <div class="demo-tabs">
                    <button class="demo-tab active" data-step="1">Login</button>
                    <button class="demo-tab" data-step="2">Campanha</button>
                    <button class="demo-tab" data-step="3">Público</button>
                    <button class="demo-tab" data-step="4">Anúncios</button>
                    <button class="demo-tab" data-step="5">Análise</button>
                </div>
                <div class="demo-content">
                    <div class="demo-step active" id="demo-step-1">
                        <h3>Autenticação OAuth</h3>
                        <div class="demo-animation">
                            <div class="oauth-flow">
                                <div class="oauth-app">Growth Pro</div>
                                <div class="oauth-arrow">→</div>
                                <div class="oauth-platform">Meta/Google</div>
                                <div class="oauth-arrow">→</div>
                                <div class="oauth-token">Token de Acesso</div>
                            </div>
                        </div>
                        <p>O Growth Pro utiliza OAuth 2.0 para autenticação segura com as plataformas de anúncios.</p>
                    </div>
                </div>
            `;
            
            demoContainer.appendChild(demoContent);
            
            // Adicionar estilos para a demonstração
            const style = document.createElement('style');
            style.textContent = `
                .demo-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .demo-tab {
                    padding: 8px 16px;
                    background: #e4e6eb;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .demo-tab.active {
                    background: var(--primary);
                    color: white;
                }
                
                .demo-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    height: 280px;
                }
                
                .demo-step {
                    display: none;
                }
                
                .demo-step.active {
                    display: block;
                }
                
                .demo-animation {
                    margin: 30px 0;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .oauth-flow {
                    display: flex;
                    align-items: center;
                    animation: pulse 2s infinite;
                }
                
                .oauth-app, .oauth-platform, .oauth-token {
                    padding: 10px 15px;
                    background: #f0f2f5;
                    border-radius: 8px;
                    border: 1px solid #dddfe2;
                }
                
                .oauth-arrow {
                    margin: 0 15px;
                    font-size: 20px;
                    color: var(--primary);
                }
                
                @keyframes pulse {
                    0% { opacity: 0.7; }
                    50% { opacity: 1; }
                    100% { opacity: 0.7; }
                }
            `;
            
            document.head.appendChild(style);
            
            // Adicionar funcionalidade às abas
            const tabs = document.querySelectorAll('.demo-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const step = this.getAttribute('data-step');
                    
                    // Atualizar abas ativas
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Atualizar conteúdo da demonstração
                    const demoContent = document.querySelector('.demo-content');
                    
                    // Conteúdo específico para cada etapa
                    let stepContent = '';
                    
                    switch(step) {
                        case '1':
                            stepContent = `
                                <h3>Autenticação OAuth</h3>
                                <div class="demo-animation">
                                    <div class="oauth-flow">
                                        <div class="oauth-app">Growth Pro</div>
                                        <div class="oauth-arrow">→</div>
                                        <div class="oauth-platform">Meta/Google</div>
                                        <div class="oauth-arrow">→</div>
                                        <div class="oauth-token">Token de Acesso</div>
                                    </div>
                                </div>
                                <p>O Growth Pro utiliza OAuth 2.0 para autenticação segura com as plataformas de anúncios.</p>
                            `;
                            break;
                        case '2':
                            stepContent = `
                                <h3>Criação de Campanha</h3>
                                <div class="demo-animation">
                                    <div class="campaign-form">
                                        <div class="form-field">Nome: Campanha Verão</div>
                                        <div class="form-field">Objetivo: Conversões</div>
                                        <div class="form-field">Orçamento: R$ 50/dia</div>
                                        <div class="form-button">Criar Campanha</div>
                                    </div>
                                </div>
                                <p>O sistema envia os dados via API e cria a campanha automaticamente nas plataformas.</p>
                            `;
                            break;
                        case '3':
                            stepContent = `
                                <h3>Definição de Público</h3>
                                <div class="demo-animation">
                                    <div class="audience-targeting">
                                        <div class="audience-item">Idade: 25-45</div>
                                        <div class="audience-item">Localização: Brasil</div>
                                        <div class="audience-item">Interesses: Esportes, Fitness</div>
                                        <div class="audience-item">Posicionamentos: Feed, Stories</div>
                                    </div>
                                </div>
                                <p>A segmentação é enviada via API para criar conjuntos de anúncios otimizados.</p>
                            `;
                            break;
                        case '4':
                            stepContent = `
                                <h3>Criação de Anúncios</h3>
                                <div class="demo-animation">
                                    <div class="ad-preview">
                                        <div class="ad-image"></div>
                                        <div class="ad-text">
                                            <div class="ad-headline">Oferta Especial de Verão!</div>
                                            <div class="ad-description">Aproveite nossos produtos com 30% OFF</div>
                                        </div>
                                    </div>
                                </div>
                                <p>Os criativos são validados e publicados automaticamente nas plataformas.</p>
                            `;
                            break;
                        case '5':
                            stepContent = `
                                <h3>Monitoramento em Tempo Real</h3>
                                <div class="demo-animation">
                                    <div class="analytics-dashboard">
                                        <div class="metric">Impressões: 12.450</div>
                                        <div class="metric">Cliques: 843</div>
                                        <div class="metric">CTR: 6.77%</div>
                                        <div class="metric">Conversões: 37</div>
                                    </div>
                                </div>
                                <p>Dados em tempo real são coletados via API para otimização contínua.</p>
                            `;
                            break;
                    }
                    
                    demoContent.innerHTML = `<div class="demo-step active">${stepContent}</div>`;
                    
                    // Adicionar estilos específicos para cada etapa
                    const additionalStyles = document.createElement('style');
                    
                    switch(step) {
                        case '2':
                            additionalStyles.textContent = `
                                .campaign-form {
                                    background: #f0f2f5;
                                    padding: 15px;
                                    border-radius: 8px;
                                    border: 1px solid #dddfe2;
                                    width: 300px;
                                }
                                
                                .form-field {
                                    padding: 8px;
                                    margin-bottom: 8px;
                                    background: white;
                                    border-radius: 4px;
                                }
                                
                                .form-button {
                                    background: var(--primary);
                                    color: white;
                                    padding: 8px;
                                    text-align: center;
                                    border-radius: 4px;
                                    margin-top: 10px;
                                    animation: pulse 2s infinite;
                                }
                            `;
                            break;
                        case '3':
                            additionalStyles.textContent = `
                                .audience-targeting {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 10px;
                                    width: 400px;
                                }
                                
                                .audience-item {
                                    background: #f0f2f5;
                                    padding: 10px;
                                    border-radius: 6px;
                                    border: 1px solid #dddfe2;
                                }
                            `;
                            break;
                        case '4':
                            additionalStyles.textContent = `
                                .ad-preview {
                                    width: 300px;
                                    border: 1px solid #dddfe2;
                                    border-radius: 8px;
                                    overflow: hidden;
                                }
                                
                                .ad-image {
                                    height: 150px;
                                    background: linear-gradient(45deg, #4f46e5, #10b981);
                                    position: relative;
                                }
                                
                                .ad-image::after {
                                    content: '📷';
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    font-size: 40px;
                                }
                                
                                .ad-text {
                                    padding: 15px;
                                    background: white;
                                }
                                
                                .ad-headline {
                                    font-weight: bold;
                                    margin-bottom: 5px;
                                }
                                
                                .ad-description {
                                    font-size: 14px;
                                    color: var(--gray);
                                }
                            `;
                            break;
                        case '5':
                            additionalStyles.textContent = `
                                .analytics-dashboard {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 15px;
                                    width: 400px;
                                }
                                
                                .metric {
                                    background: #f0f2f5;
                                    padding: 15px;
                                    border-radius: 8px;
                                    text-align: center;
                                    font-weight: bold;
                                    border: 1px solid #dddfe2;
                                    position: relative;
                                    overflow: hidden;
                                }
                                
                                .metric::after {
                                    content: '';
                                    position: absolute;
                                    bottom: 0;
                                    left: 0;
                                    height: 3px;
                                    width: 100%;
                                    background: var(--gradient);
                                }
                            `;
                            break;
                    }
                    
                    document.head.appendChild(additionalStyles);
                });
            });
        }
    });
});