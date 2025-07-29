# 📱 Estrutura Mobile - Inspirada no Zé Delivery

## 🎯 **Análise da Estrutura Mobile Típica**

### **Layout Principal:**
```
┌─────────────────────────┐
│ Header Fixo (Logo + 🛒) │
├─────────────────────────┤
│ Barra de Busca          │
├─────────────────────────┤
│ Categorias Horizontais  │
├─────────────────────────┤
│ Banner Promocional      │
├─────────────────────────┤
│ Grid de Produtos        │
│ (2 colunas mobile)      │
├─────────────────────────┤
│ Menu Fixo Inferior      │
└─────────────────────────┘
```

## 🔧 **Componentes Essenciais**

### **1. Header Mobile:**
- Logo compacto
- Carrinho com contador
- Ícone de menu (hamburger)
- Localização atual

### **2. Navegação:**
- Menu inferior fixo (5 ícones)
- Categorias horizontais scrolláveis
- Breadcrumb para navegação

### **3. Produtos:**
- Grid 2 colunas em mobile
- Cards compactos com imagem
- Preço destacado
- Botão "+" para adicionar

### **4. Carrinho:**
- Slide-up modal
- Resumo rápido
- Botão finalizar destacado

## 📐 **Breakpoints Recomendados**

```css
/* Mobile First */
@media (max-width: 480px) { /* Mobile */ }
@media (min-width: 481px) and (max-width: 768px) { /* Tablet */ }
@media (min-width: 769px) { /* Desktop */ }
```

## 🎨 **Design System Mobile**

### **Cores:**
- Primária: #CFAA33 (dourado)
- Secundária: #2C3E50 (escuro)
- Sucesso: #27AE60
- Erro: #E74C3C
- Background: #F8F9FA

### **Tipografia:**
- Títulos: 18px-24px
- Texto: 14px-16px
- Botões: 16px bold
- Preços: 18px bold

### **Espaçamentos:**
- Padding: 16px
- Margin: 8px, 16px, 24px
- Border-radius: 8px, 12px

## 📱 **Implementação Sugerida**