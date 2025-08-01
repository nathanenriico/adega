# Sistema de Produtos com Supabase

## Configuração Inicial

### 1. Criar Tabela no Supabase

Execute o script SQL localizado em `sql/create_products_table.sql` no SQL Editor do painel do Supabase:

1. Acesse seu projeto no Supabase
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo do arquivo `sql/create_products_table.sql`

### 2. Verificar Configuração

O arquivo `js/config.js` já está configurado com as funções necessárias:
- `db.saveProduct()` - Salvar novo produto
- `db.updateProduct()` - Atualizar produto existente
- `db.deleteProduct()` - Excluir produto (soft delete)
- `db.getProducts()` - Buscar produtos ativos

## Como Funciona

### Adicionar Produtos
1. Acesse o painel admin (senha: admin123)
2. Preencha o formulário de produto
3. Clique em "Adicionar Produto"
4. O produto será salvo automaticamente no Supabase

### Editar Produtos
1. No painel admin, clique em "Editar" no produto desejado
2. Altere as informações
3. As mudanças são salvas automaticamente no Supabase

### Excluir Produtos
1. No painel admin, clique em "Excluir" no produto desejado
2. Confirme a exclusão
3. O produto será marcado como inativo no Supabase (soft delete)

## Estrutura da Tabela

```sql
products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]',
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

## Sincronização

- Produtos são carregados do Supabase na inicialização
- Novos produtos são salvos automaticamente no banco
- Sistema funciona offline usando produtos locais como fallback
- Função `syncLocalProductsToSupabase()` disponível para migração inicial

## Categorias Disponíveis

- cervejas
- drinks  
- vinhos
- refrigerantes
- aguas
- chopp

## Troubleshooting

### Erro de Conexão
- Verifique se as credenciais do Supabase estão corretas em `js/config.js`
- Confirme se a tabela `products` foi criada corretamente

### Produtos Não Aparecem
- Verifique se o campo `active` está como `true`
- Confirme se a função `loadProductsFromDatabase()` está sendo executada

### Permissões
- Certifique-se de que as políticas RLS estão configuradas corretamente
- A política atual permite todas as operações para facilitar o desenvolvimento