# 📁 Estrutura do Projeto - Adega do Tio Pancho

## 🎯 **Estrutura Organizada**

```
/Adega/
│
├── index.html                 # Página principal
├── checkout.html             # Página de checkout
├── checkout-callback.html    # Callback PIX
├── gestao.html              # Gestão de pedidos
├── analytics.html           # Analytics do sistema
│
├── /css/                    # Estilos CSS
│   ├── styles.css          # Estilos principais
│   ├── checkout.css        # Estilos do checkout
│   ├── pedidos.css         # Estilos da gestão
│   ├── analytics.css       # Estilos do analytics
│   ├── pix-payment.css     # Estilos PIX
│   ├── animations.css      # Animações
│   └── checkout-tabs.css   # Tabs do checkout
│
├── /js/                     # Scripts JavaScript
│   ├── script.js           # Script principal
│   ├── checkout.js         # Lógica do checkout
│   ├── checkout-updated.js # Checkout atualizado
│   ├── pedidos.js          # Gestão de pedidos
│   ├── analytics.js        # Sistema de analytics
│   ├── loyalty.js          # Sistema de fidelidade
│   ├── whatsapp-bot.js     # Bot WhatsApp
│   └── config.js           # Configurações Supabase
│
├── /img/                    # Imagens do projeto
│   └── (vazio - para futuras imagens)
│
├── /fonts/                  # Fontes personalizadas
│   └── (vazio - usando Google Fonts)
│
├── /assets/                 # Outros arquivos
│   └── (webhooks e arquivos auxiliares)
│
├── /docs/                   # Documentação
│   ├── README.md           # Documentação principal
│   ├── BOT_WHATSAPP.md     # Guia do bot WhatsApp
│   ├── CHATFUEL_INTEGRACAO.md # Integração Chatfuel
│   ├── SISTEMA_FIDELIDADE.md  # Sistema de fidelidade
│   ├── COMO_USAR_ANALYTICS.md # Guia do analytics
│   ├── TESTE_PIX.md        # Testes PIX
│   ├── UPLOAD_IMAGENS.md   # Upload de imagens
│   └── WHATSAPP_BOT_REAL.md # Bot real WhatsApp
│
└── /imagens/               # Imagens dos produtos
    ├── /produtos/          # Produtos da adega
    └── adega.webp         # Foto da fachada
```

## 🔧 **Arquivos Principais**

### **HTML (Páginas)**
- `index.html` - Página inicial com catálogo e fidelidade
- `checkout.html` - Finalização de pedidos
- `gestao.html` - Painel administrativo
- `analytics.html` - Relatórios e métricas

### **CSS (Estilos)**
- `styles.css` - Estilos principais e responsivos
- `checkout.css` - Interface de checkout
- `pedidos.css` - Gestão de pedidos
- `analytics.css` - Dashboard de analytics

### **JavaScript (Funcionalidades)**
- `script.js` - Funcionalidades principais
- `loyalty.js` - Sistema de clube de fidelidade
- `pedidos.js` - Gestão completa de pedidos
- `whatsapp-bot.js` - Bot inteligente WhatsApp
- `config.js` - Integração Supabase

## 📋 **Funcionalidades por Arquivo**

### **Sistema Principal (index.html + script.js)**
- Catálogo de produtos
- Carrinho de compras
- Sistema de fidelidade
- Navegação responsiva

### **Checkout (checkout.html + checkout.js)**
- Finalização de pedidos
- Múltiplas formas de pagamento
- Integração PIX
- Validações de dados

### **Gestão (gestao.html + pedidos.js)**
- Painel administrativo
- Controle de pedidos
- Filtros avançados
- Notificações WhatsApp

### **Analytics (analytics.html + analytics.js)**
- Métricas de vendas
- Relatórios em tempo real
- Gráficos interativos
- Análise de comportamento

## 🎯 **Benefícios da Organização**

✅ **Manutenção fácil** - Arquivos separados por função
✅ **Performance** - CSS e JS organizados
✅ **Escalabilidade** - Estrutura preparada para crescimento
✅ **Colaboração** - Fácil para outros desenvolvedores
✅ **Deploy** - Estrutura padrão para hospedagem

## 🚀 **Como Usar**

1. **Desenvolvimento:** Edite arquivos nas pastas específicas
2. **Deploy:** Faça upload de toda a estrutura
3. **Manutenção:** Localize rapidamente o arquivo necessário
4. **Documentação:** Consulte a pasta `/docs/`

Estrutura profissional e organizada para máxima eficiência!