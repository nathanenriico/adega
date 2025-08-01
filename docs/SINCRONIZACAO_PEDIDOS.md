# 🔄 Sincronização de Pedidos com Supabase

## Visão Geral

Esta funcionalidade permite sincronizar todos os pedidos armazenados no localStorage da gestão de pedidos com o banco de dados Supabase.

## Como Usar

### 1. Acessar a Gestão de Pedidos
- Abra o arquivo `gestao.html` no navegador
- Ou acesse através do painel admin do site principal

### 2. Sincronizar Pedidos
- Na barra de filtros, clique no botão **"💾 Sincronizar com BD"**
- O sistema irá:
  - Verificar todos os pedidos no localStorage
  - Comparar com os pedidos já existentes no Supabase
  - Salvar apenas os pedidos que ainda não estão no banco
  - Mostrar um relatório do processo

### 3. Estrutura dos Dados

Os pedidos são salvos na tabela `pedidos` com a seguinte estrutura:

```sql
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id INT,
    valor_total DECIMAL(10,2) NOT NULL,
    pontos_ganhos INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'novo',
    forma_pagamento VARCHAR(100),
    endereco TEXT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Mapeamento de Campos

| localStorage | Supabase | Descrição |
|-------------|----------|-----------|
| `id` | `id` | ID único do pedido |
| `total` | `valor_total` | Valor total do pedido |
| `status` | `status` | Status atual do pedido |
| `paymentMethod` | `forma_pagamento` | Forma de pagamento |
| `address` | `endereco` | Endereço de entrega |
| `date` | `data_pedido` | Data/hora do pedido |
| - | `pontos_ganhos` | Calculado automaticamente (total ÷ 10) |
| - | `cliente_id` | Sempre NULL por enquanto |

## Teste da Funcionalidade

### Arquivo de Teste
Use o arquivo `teste-sincronizacao.html` para:
1. Testar a conexão com Supabase
2. Criar pedidos de teste
3. Visualizar pedidos locais
4. Sincronizar com o banco
5. Verificar dados no Supabase
6. Limpar dados (se necessário)

### Passos para Testar
1. Abra `teste-sincronizacao.html`
2. Clique em "Testar Conexão com Supabase"
3. Clique em "Criar 3 Pedidos de Teste"
4. Clique em "Mostrar Pedidos no localStorage"
5. Clique em "Sincronizar Pedidos com Supabase"
6. Clique em "Verificar Pedidos no Supabase"

## Recursos da Funcionalidade

### ✅ Verificação de Duplicatas
- O sistema verifica se um pedido já existe no banco antes de inserir
- Evita duplicação de dados

### ✅ Tratamento de Erros
- Mostra relatório detalhado de sucessos e erros
- Continua o processo mesmo se alguns pedidos falharem

### ✅ Mapeamento Inteligente
- Converte automaticamente os campos do localStorage para o formato do Supabase
- Calcula pontos de fidelidade automaticamente

### ✅ Feedback Visual
- Botão com estilo diferenciado
- Mensagens de status durante o processo
- Relatório final com estatísticas

## Configuração do Banco

### Tabela Pedidos
A tabela já deve estar criada no Supabase com as políticas RLS:

```sql
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON pedidos FOR ALL USING (true);
```

### Conexão
A conexão é configurada no arquivo `js/config.js`:
- URL do Supabase
- Chave de API (service_role)

## Monitoramento

### Console do Navegador
O processo é logado no console com:
- ✅ Sucessos
- ❌ Erros
- 📊 Estatísticas

### Exemplo de Log
```
Iniciando salvamento de 5 pedidos no Supabase...
✅ Pedido #1703123456 salvo no Supabase
Pedido #1703123457 já existe no banco, pulando...
✅ Pedido #1703123458 salvo no Supabase
❌ Erro ao salvar pedido #1703123459: duplicate key value
✅ Pedido #1703123460 salvo no Supabase
```

## Solução de Problemas

### Erro de Conexão
- Verifique se a URL e chave do Supabase estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Permissão
- Verifique se as políticas RLS estão configuradas
- Confirme se está usando a chave `service_role`

### Pedidos Não Aparecem
- Verifique se há pedidos no localStorage
- Confirme se a estrutura dos dados está correta

### Duplicatas
- O sistema previne duplicatas automaticamente
- Pedidos existentes são ignorados

## Backup e Segurança

### Antes de Sincronizar
- Faça backup dos dados do localStorage
- Teste em ambiente de desenvolvimento primeiro

### Dados Sensíveis
- Não inclua informações pessoais sensíveis
- Use apenas dados necessários para o negócio

## Próximos Passos

1. **Sincronização Bidirecional**: Carregar pedidos do banco para o localStorage
2. **Sincronização Automática**: Executar automaticamente em intervalos
3. **Histórico de Sincronização**: Registrar quando e quantos pedidos foram sincronizados
4. **Validação de Dados**: Verificar integridade dos dados antes de salvar

---

**Desenvolvido para Adega do Tio Pancho** 🍷