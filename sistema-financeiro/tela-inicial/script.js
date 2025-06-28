document.addEventListener('DOMContentLoaded', function() {
    const calcularBtn = document.getElementById('calcular');
    const resultadoDiv = document.getElementById('resultado');
    
    // Frases motivacionais
    const frases = [
        "Desafios constroem vitórias. Com organização, você chega lá.",
        "Cada centavo economizado é um passo em direção aos seus sonhos.",
        "Disciplina financeira hoje, liberdade financeira amanhã.",
        "Pequenas mudanças diárias criam grandes transformações.",
        "Sua determinação vale mais que qualquer dinheiro no mundo.",
        "O sucesso financeiro não é um destino, é uma jornada diária.",
        "Economizar não é se privar, é investir no seu futuro.",
        "Planeje como se fosse viver para sempre, economize como se fosse morrer amanhã."
    ];
    
    calcularBtn.addEventListener('click', function() {
        // Obter valores dos inputs
        const renda = parseFloat(document.getElementById('renda').value) || 0;
        const contas = parseFloat(document.getElementById('contas').value) || 0;
        const cartao = parseFloat(document.getElementById('cartao').value) || 0;
        const objetivosDesc = document.getElementById('objetivos').value || "Seus objetivos";
        const valorObjetivos = parseFloat(document.getElementById('valor-objetivos').value) || 0;
        const rendaExtra = parseFloat(document.getElementById('renda-extra').value) || 0;
        const diasUteis = parseInt(document.getElementById('dias-uteis').value) || 22;
        
        // Calcular valores
        const rendaTotal = renda + rendaExtra;
        const despesasFixas = contas + cartao;
        const saldoRestante = rendaTotal - despesasFixas;
        
        // Definir meta mensal (50% do saldo restante ou mínimo de 10% da renda)
        let metaMensal = Math.max(saldoRestante * 0.5, rendaTotal * 0.1);
        metaMensal = Math.min(metaMensal, saldoRestante); // Não pode ser maior que o saldo restante
        
        // Calcular meta diária
        const metaDiaria = metaMensal / diasUteis;
        
        // Calcular tempo estimado (em meses)
        const tempoEstimado = valorObjetivos / metaMensal;
        
        // Formatar valores para exibição
        const formatarMoeda = (valor) => {
            return `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
        };
        
        // Preencher tabela de resumo
        document.getElementById('resumo-renda').textContent = formatarMoeda(rendaTotal);
        document.getElementById('resumo-contas').textContent = formatarMoeda(contas);
        document.getElementById('resumo-cartao').textContent = formatarMoeda(cartao);
        document.getElementById('resumo-objetivos').textContent = `${objetivosDesc} → ${formatarMoeda(valorObjetivos)}`;
        document.getElementById('resumo-renda-extra').textContent = formatarMoeda(rendaExtra);
        document.getElementById('resumo-saldo').textContent = formatarMoeda(saldoRestante);
        
        // Preencher tabela de metas
        document.getElementById('meta-mensal').textContent = formatarMoeda(metaMensal);
        document.getElementById('meta-diaria').textContent = `${formatarMoeda(metaDiaria)} (considerando ${diasUteis} dias úteis)`;
        
        // Formatar tempo estimado
        let tempoFormatado;
        if (tempoEstimado < 1) {
            tempoFormatado = "Menos de 1 mês";
        } else if (tempoEstimado >= 12) {
            const anos = Math.floor(tempoEstimado / 12);
            const meses = Math.round(tempoEstimado % 12);
            tempoFormatado = `${anos} ano(s) e ${meses} mese(s)`;
        } else {
            tempoFormatado = `${Math.round(tempoEstimado)} mese(s)`;
        }
        document.getElementById('tempo-estimado').textContent = tempoFormatado;
        
        // Gerar dicas personalizadas
        const listaDicas = document.getElementById('lista-dicas');
        listaDicas.innerHTML = '';
        
        // Dica sobre cartão de crédito
        if (cartao > 0) {
            const li = document.createElement('li');
            li.textContent = "Priorize quitar o cartão de crédito para evitar juros altos.";
            listaDicas.appendChild(li);
        }
        
        // Dica sobre economia
        const li1 = document.createElement('li');
        li1.textContent = `Tente aumentar sua meta mensal de economia para ${formatarMoeda(metaMensal * 1.2)} para alcançar seus objetivos mais rapidamente.`;
        listaDicas.appendChild(li1);
        
        // Dica sobre renda extra
        if (rendaExtra === 0) {
            const li2 = document.createElement('li');
            li2.textContent = "Considere buscar fontes de renda extra como freelance ou trabalhos temporários.";
            listaDicas.appendChild(li2);
        }
        
        // Dica sobre tempo
        if (tempoEstimado > 24) {
            const li3 = document.createElement('li');
            li3.textContent = "O tempo para alcançar seu objetivo é longo. Considere dividir em metas menores ou aumentar sua economia mensal.";
            listaDicas.appendChild(li3);
        }
        
        // Selecionar frase motivacional aleatória
        const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
        document.getElementById('frase-motivacional').textContent = fraseAleatoria;
        
        // Mostrar resultado
        resultadoDiv.style.display = 'block';
        
        // Rolar para o resultado
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    });
});