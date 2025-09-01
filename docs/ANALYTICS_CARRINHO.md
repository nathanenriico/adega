# 📊 Sistema de Analytics do Carrinho

## 🎯 Objetivo

Registrar e analisar cada ação do cliente no carrinho de compras, salvando os dados no banco de dados `carrinho_status` e exibindo em tempo real no painel de analytics.

## 🗄️ Estrutura do Banco

### Tabela: `carrinho_status`

```sql
CREATE TABLE carrinho_status (
    id BIGSERIAL PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('adicionado', 'editado', 'confirmado', 'em_preparo', 'em_entrega', 'entregue', 'desistido')),
    valor_total DECIMAL(10,2) DEFAULT 0,
    desistido BOOLEAN DEFAULT FALSE,
    pedido_id TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Fluxo de Funcionamento

### 1. Adicionar Produto ao Carrinho
**Quando:** Cliente clica em "Adicionar ao Carrinho"
**Status:** `adicionado` (primeira vez) ou `editado` (já tinha produtos)
**Dados salvos:**
- Nome do cliente (localStorage ou "Cliente WhatsApp")
- Telefone (localStorage ou padrão)
- Valor total atual do carrinho
- Status da ação

### 2. Editar Quantidade
**Quando:** Cliente altera quantidade de produtos
**Status:** `editado`
**Dados salvos:**
- Novo valor total
- Status de edição

### 3. Visualização no Analytics
**Onde:** `analytics.html`
**Atualização:** A cada 2 segundos
**Dados exibidos:**
- Contadores por status
- Atividades recentes
- Gráficos de conversão

## 📁 Arquivos Modificados

### `js/script.js`
- Função `addToCart()`: Salva no banco quando produto é adicionado
- Função `updateCartQuantity()`: Salva no banco quando quantidade é alterada

### `js/analytics.js`
- Função `loadCarrinhoStatusData()`: Carrega dados do banco
- Atualização automática a cada 2 segundos
- Integração com analytics existente

## 🚀 Como Usar

### 1. Testar Adição de Produtos
1. Acesse `index.html`
2. Adicione produtos ao carrinho
3. Abra `analytics.html` em outra aba
4. Veja os dados atualizando em tempo real

### 2. Verificar no Banco
```sql
SELECT * FROM carrinho_status 
ORDER BY data_criacao DESC 
LIMIT 10;
```

### 3. Monitorar Analytics
- Acesse o painel de analytics
- Veja contadores de "Adicionado" e "Editado"
- Monitore atividades recentes

## 📊 Métricas Disponíveis

### Contadores
- **Adicionado**: Produtos adicionados ao carrinho
- **Editado**: Carrinhos modificados
- **Confirmado**: Pedidos finalizados
- **Entregue**: Pedidos concluídos

### Atividades Recentes
- Lista das últimas 20 ações
- Nome do cliente
- Valor total
- Timestamp da ação

## 🔧 Configuração

### Credenciais do Supabase
As credenciais estão configuradas diretamente no código:
- URL: `https://vtrgtorablofhmhizrjr.supabase.co`
- Key: Chave de serviço configurada

### Dados do Cliente
O sistema busca dados do cliente em:
1. `localStorage.userData` (se logado)
2. Valores padrão se não logado

## 🎨 Interface

### Contadores em Tempo Real
- Animação quando valores mudam
- Cores diferentes por status
- Atualização automática

### Log de Atividades
- Últimas 20 ações
- Detalhes do cliente
- Valor da transação
- Timestamp formatado

## 🔍 Debugging

### Console Logs
```javascript
// Verificar se dados estão sendo salvos
console.log('✅ Carrinho adicionado salvo no banco - Total: R$ X.XX');

// Verificar carregamento do banco
console.log('✅ Dados do carrinho_status carregados:', statusCount);
```

### Verificar localStorage
```javascript
// Ver analytics locais
console.log(JSON.parse(localStorage.getItem('cartAnalytics')));

// Ver eventos recentes
console.log(JSON.parse(localStorage.getItem('cartEvents')));
```

## 🚨 Tratamento de Erros

### Banco Indisponível
- Sistema continua funcionando com localStorage
- Dados são sincronizados quando banco volta

### Dados Inválidos
- Validação de valores numéricos
- Fallbacks para dados obrigatórios

## 📈 Benefícios

1. **Visibilidade Total**: Veja cada ação do cliente
2. **Tempo Real**: Dados atualizados instantaneamente
3. **Histórico Completo**: Todas as ações ficam registradas
4. **Analytics Avançado**: Métricas de conversão e abandono
5. **Recuperação de Carrinho**: Identifique clientes que abandonaram

## 🔄 Próximos Passos

1. **Notificações Push**: Alertas quando carrinho é abandonado
2. **Segmentação**: Análise por tipo de cliente
3. **A/B Testing**: Testar diferentes interfaces
4. **Machine Learning**: Predição de abandono
5. **Integração WhatsApp**: Recuperação automática

O sistema está funcionando e registrando todas as ações do carrinho no banco de dados, permitindo análise completa do comportamento dos clientes!