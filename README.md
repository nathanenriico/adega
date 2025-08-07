# 🍷 Adega do Tio Pancho

Sistema de e-commerce para adega com integração WhatsApp.

## 🚀 Configuração

### 1. Configurar APIs

1. Copie `js/config-template.js` para `js/config.js`
2. Preencha suas chaves de API:
   - Supabase URL e Anon Key
   - Número do WhatsApp

### 2. Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz:
```
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
```

## 🔒 Segurança

- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Chaves de API não são commitadas
- ✅ Template de configuração fornecido
- ✅ Instruções de setup documentadas

## 📁 Estrutura

```
/
├── index.html          # Página principal
├── admin.html          # Painel administrativo
├── css/               # Estilos
├── js/                # Scripts
│   ├── config-template.js  # Template de configuração
│   └── script.js      # Lógica principal
└── README.md          # Este arquivo
```

## 🛠️ Deploy

1. Configure suas chaves no `config.js`
2. Faça upload dos arquivos para seu servidor
3. Teste todas as funcionalidades

## ⚠️ IMPORTANTE

- NUNCA commite o arquivo `config.js` com chaves reais
- Use sempre o template para novos ambientes
- Mantenha o `.gitignore` atualizado