# 🔗 Integração Chatfuel com Sistema

## 📋 **Passo a Passo Completo**

### **1. Configurar Chatfuel**

1. **Acesse:** https://chatfuel.com
2. **Crie conta** gratuita
3. **Conecte WhatsApp Business:**
   - Vá em "Channels" → "WhatsApp"
   - Conecte seu número WhatsApp Business
   - Verifique a conta

### **2. Criar Fluxo do Bot**

**Menu Principal:**
```
Trigger: Qualquer mensagem
Response: 
🍷 *Olá! Bem-vindo à Adega do Tio Pancho!*

Sou seu assistente virtual especializado em pedidos. Como posso ajudar?

*Menu Principal:*
1️⃣ Ver produtos disponíveis
2️⃣ Fazer pedido
3️⃣ Acompanhar pedido existente
4️⃣ Falar com atendente humano

Digite o número da opção desejada.

Buttons:
- "1" → Ver Produtos
- "2" → Fazer Pedido
- "3" → Acompanhar
- "4" → Humano
```

**Ver Produtos:**
```
Trigger: "1"
Response:
🍷 *Produtos Disponíveis:*

1️⃣ Combo Cerveja Artesanal
R$ 45,90

2️⃣ Vinho Tinto Premium
R$ 89,90

3️⃣ Kit Whisky + Taças
R$ 159,90

4️⃣ Promoção Cerveja Gelada
R$ 12,90

Para fazer pedido, digite *2* no menu principal.

Button: "Voltar ao Menu" → Menu Principal
```

**Fazer Pedido:**
```
Trigger: "2"
Response:
🛒 *Vamos fazer seu pedido!*

1 - Combo Cerveja Artesanal - R$ 45,90
2 - Vinho Tinto Premium - R$ 89,90
3 - Kit Whisky + Taças - R$ 159,90
4 - Promoção Cerveja Gelada - R$ 12,90

*Como pedir:*
Digite o número do produto seguido da quantidade
Exemplo: "1 2" (2 unidades do produto 1)

Ou digite "finalizar" para concluir o pedido.

User Input: Capturar em {{produto_quantidade}}
```

### **3. Configurar Webhook**

**No Chatfuel:**
1. Vá em "Settings" → "Configure Webhook"
2. URL: `https://seusite.com/chatfuel-webhook`
3. Method: POST
4. Ativar para "Order Completion"

### **4. Criar Endpoint no Servidor**

Adicione ao seu servidor:

```javascript
// Endpoint para receber dados do Chatfuel
app.post('/chatfuel-webhook', (req, res) => {
    try {
        const {
            'messenger user id': userId,
            'user_name': userName,
            'produtos': produtos,
            'total': total,
            'pagamento': pagamento
        } = req.body;

        // Criar pedido
        const orderId = Date.now();
        const orderData = {
            id: orderId,
            customer: userName || 'Cliente Chatfuel',
            phone: userId,
            date: new Date().toISOString(),
            status: 'novo',
            total: parseFloat(total),
            paymentMethod: pagamento,
            items: JSON.parse(produtos),
            source: 'chatfuel'
        };

        // Salvar na gestão
        const orders = JSON.parse(fs.readFileSync('orders.json', 'utf8') || '[]');
        orders.push(orderData);
        fs.writeFileSync('orders.json', JSON.stringify(orders));

        // Resposta para o Chatfuel
        res.json({
            messages: [{
                text: `✅ Pedido #${orderId} confirmado!\nTotal: R$ ${total}\nTempo estimado: 45-55 minutos\n\nObrigado pela preferência! 🍷`
            }]
        });

    } catch (error) {
        res.json({
            messages: [{
                text: "Erro ao processar pedido. Tente novamente."
            }]
        });
    }
});
```

### **5. Configurar Variáveis no Chatfuel**

**Carrinho (User Attribute):**
- Nome: `carrinho`
- Tipo: JSON
- Valor inicial: `[]`

**Total (User Attribute):**
- Nome: `total`
- Tipo: Number
- Valor inicial: `0`

### **6. Fluxo de Adicionar Produtos**

```
Trigger: User Input (formato: "1 2")
Action: 
1. Parse input → produto e quantidade
2. Buscar preço do produto
3. Adicionar ao carrinho
4. Calcular novo total
5. Mostrar carrinho atualizado

Response:
✅ {{produto_nome}} ({{quantidade}}x) adicionado!

*Carrinho atual:*
{{carrinho_formatado}}

*Total: R$ {{total}}*

Continue adicionando ou digite "finalizar".
```

### **7. Finalizar Pedido**

```
Trigger: "finalizar"
Action:
1. Mostrar resumo
2. Solicitar forma de pagamento
3. Enviar para webhook
4. Limpar carrinho

Response:
🛒 *Resumo do Pedido:*
{{carrinho_formatado}}

Subtotal: R$ {{subtotal}}
Taxa de entrega: R$ 8,90
*Total: R$ {{total_final}}*

*Formas de pagamento:*
1️⃣ PIX
2️⃣ Dinheiro na entrega
3️⃣ Cartão na entrega

Buttons:
- "PIX" → Webhook
- "Dinheiro" → Webhook  
- "Cartão" → Webhook
```

## 🔧 **Configuração Técnica**

### **Hospedar Webhook:**
1. **Vercel** (gratuito): https://vercel.com
2. **Netlify** (gratuito): https://netlify.com
3. **Heroku** (pago): https://heroku.com

### **Deploy Rápido (Vercel):**
```bash
npm install -g vercel
vercel --prod
```

## ✅ **Resultado Final**

- Cliente manda mensagem → Bot responde automaticamente
- Fluxo completo de pedidos no WhatsApp
- Pedidos aparecem na gestão automaticamente
- Sem código complexo, tudo visual no Chatfuel

**Tempo de implementação: 2-3 horas**