document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const generateBtn = document.getElementById('generate-btn');
    const resultsContainer = document.getElementById('results-container');
    const adPreview = document.getElementById('ad-preview');
    const mainTitle = document.getElementById('main-title');
    const description = document.getElementById('description');
    const cta = document.getElementById('cta');
    const adTipsList = document.getElementById('ad-tips-list');
    const newAdBtn = document.getElementById('new-ad-btn');
    
    // Mostrar prévia da imagem quando selecionada
    productImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Gerar anúncio quando o botão for clicado
    generateBtn.addEventListener('click', function() {
        const productName = productNameInput.value.trim();
        const productPrice = productPriceInput.value.trim();
        
        if (!productName || !productPrice || !productImageInput.files[0]) {
            alert('Por favor, preencha todos os campos e selecione uma imagem.');
            return;
        }
        
        // Gerar conteúdo do anúncio
        generateAdContent(productName, productPrice);
        
        // Mostrar resultados
        resultsContainer.style.display = 'block';
        
        // Rolar para os resultados
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Função para gerar o conteúdo do anúncio
    function generateAdContent(productName, productPrice) {
        // Gerar títulos baseados nas diretrizes do Facebook Ads
        const titles = [
            `${productName} por apenas R$ ${productPrice}!`,
            `NOVO: ${productName} - Oferta Especial R$ ${productPrice}`,
            `Descubra o ${productName} - Apenas R$ ${productPrice}`
        ];
        
        // Gerar descrições
        const descriptions = [
            `🔥 PROMOÇÃO IMPERDÍVEL! 🔥\nGaranta já seu ${productName} por apenas R$ ${productPrice}. Produto de alta qualidade com entrega rápida para todo Brasil. Estoque limitado!`,
            `✅ ${productName} com o MELHOR PREÇO do mercado: R$ ${productPrice}!\n✅ Frete GRÁTIS para todo Brasil\n✅ Garantia de satisfação\n✅ Pagamento seguro\nClique agora e aproveite!`,
            `Transforme sua experiência com o incrível ${productName}. Por tempo limitado, apenas R$ ${productPrice}. Não perca esta oportunidade exclusiva!`
        ];
        
        // Gerar CTAs
        const ctas = [
            `COMPRAR AGORA | Últimas unidades por R$ ${productPrice}`,
            `CLIQUE AQUI e garanta seu ${productName}`,
            `APROVEITE JÁ | ${productName} por R$ ${productPrice}`
        ];
        
        // Selecionar aleatoriamente um de cada
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        const randomCta = ctas[Math.floor(Math.random() * ctas.length)];
        
        // Preencher os elementos HTML
        mainTitle.textContent = randomTitle;
        description.textContent = randomDescription;
        cta.textContent = randomCta;
        
        // Criar prévia do anúncio
        adPreview.innerHTML = `
            <div style="border: 1px solid #dddfe2; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', sans-serif;">
                <div style="padding: 12px; background-color: #f5f6f7; border-bottom: 1px solid #dddfe2;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 40px; height: 40px; background-color: #e4e6eb; border-radius: 50%;"></div>
                        <div style="margin-left: 10px;">
                            <div style="font-weight: bold;">Sua Marca</div>
                            <div style="font-size: 12px; color: #65676b;">Patrocinado</div>
                        </div>
                    </div>
                </div>
                <div>
                    <img src="${imagePreview.src}" style="width: 100%; max-height: 300px; object-fit: contain;">
                </div>
                <div style="padding: 12px;">
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${randomTitle}</div>
                    <div style="font-size: 14px; margin-bottom: 12px; white-space: pre-line;">${randomDescription}</div>
                    <div style="background-color: #1877f2; color: white; text-align: center; padding: 8px; border-radius: 4px; font-weight: bold;">${randomCta.split('|')[0].trim()}</div>
                </div>
            </div>
        `;
        
        // Adicionar dicas de otimização
        adTipsList.innerHTML = `
            <li>Use imagens de alta qualidade com proporção 1:1 para melhor desempenho.</li>
            <li>Teste diferentes títulos para encontrar o que gera mais cliques.</li>
            <li>Inclua emojis estrategicamente para chamar atenção.</li>
            <li>Destaque o preço e a oferta limitada para criar urgência.</li>
            <li>Use CTAs claros e diretos que incentivem a ação imediata.</li>
        `;
    }
    
    // Botões para copiar texto
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const textToCopy = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copiado!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    });
    
    // Botão para criar novo anúncio
    newAdBtn.addEventListener('click', function() {
        // Limpar campos
        productNameInput.value = '';
        productPriceInput.value = '';
        productImageInput.value = '';
        imagePreview.style.display = 'none';
        
        // Esconder resultados
        resultsContainer.style.display = 'none';
        
        // Rolar para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});