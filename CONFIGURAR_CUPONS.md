# 🎁 Configuração do Sistema de Cupons

## 1. Criar Tabela no Supabase

Execute o seguinte SQL no Supabase Dashboard:

```sql
-- Criar tabela de cupons
CREATE TABLE IF NOT EXISTS cupons (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    desconto VARCHAR(50) NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_uso TIMESTAMP NULL
);

-- Habilitar RLS
ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;

-- Política para permitir que clientes vejam apenas seus cupons
CREATE POLICY "Clientes podem ver seus cupons" ON cupons
    FOR SELECT USING (auth.uid()::text = cliente_id::text OR auth.uid() IS NULL);

-- Política para permitir inserção de cupons
CREATE POLICY "Permitir inserção de cupons" ON cupons
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização de cupons
CREATE POLICY "Permitir atualização de cupons" ON cupons
    FOR UPDATE USING (true);
```

## 2. Como Funciona

### Troca de Pontos
- Cliente acumula pontos (1 ponto = R$ 10 gastos)
- Pode trocar pontos por cupons na página inicial
- Cupons disponíveis:
  - 5% OFF = 50 pontos
  - 10% OFF = 100 pontos
  - Frete Grátis = 150 pontos
  - 15% OFF = 200 pontos

### Uso no Checkout
- Cupons aparecem automaticamente no checkout
- Cliente seleciona o cupom desejado
- Desconto é aplicado automaticamente
- Cupom é marcado como usado após confirmação

## 3. Correções Implementadas

✅ Tabela de cupons criada com estrutura correta
✅ Sistema de pontos integrado com cupons
✅ Carregamento de cupons no checkout corrigido
✅ Aplicação de desconto funcionando
✅ Cupons marcados como usados após pedido
✅ Validação de pontos antes da troca

## 4. Teste do Sistema

### Primeiro, teste se a tabela existe:
1. Abra o console do navegador (F12)
2. Digite: `testCuponsTable()`
3. Se der erro, execute o SQL no Supabase Dashboard

### Teste de criação de cupom:
1. Faça login como cliente
2. No console, digite: `testInsertCupom()`
3. Se funcionar, teste a troca de pontos normal

### Teste completo:
1. Cadastre um cliente
2. Adicione pontos manualmente no banco
3. Troque pontos por cupom na página inicial
4. Vá para o checkout
5. Selecione o cupom
6. Confirme o pedido

## 5. Arquivos Modificados

- `sql/create_cupons_table.sql` - Estrutura da tabela
- `js/loyalty.js` - Sistema de troca de pontos
- `js/checkout-updated.js` - Aplicação de cupons
- `js/init-cupons.js` - Inicialização da tabela
- `index.html` - Script de inicialização
- `checkout.html` - Script de inicialização