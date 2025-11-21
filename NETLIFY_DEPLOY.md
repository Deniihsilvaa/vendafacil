# 🚀 Guia de Deploy no Netlify - StoreFlow

## ✅ Verificações Realizadas

### ✅ Build do Projeto
- ✅ Build executado com sucesso
- ✅ Sem erros de TypeScript
- ✅ Arquivos gerados em `dist/`

### ✅ Configuração do Netlify
- ✅ Arquivo `netlify.toml` criado
- ✅ Build command configurado: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Redirects para SPA configurados
- ✅ Headers de segurança configurados
- ✅ Cache de arquivos estáticos configurado

### ✅ Compatibilidade
- ✅ React Router configurado para SPA
- ✅ localStorage funcionando (compatível com Netlify)
- ✅ Absolute imports funcionando
- ✅ TailwindCSS configurado corretamente

## 📋 Como Fazer o Deploy

### Opção 1: Deploy via Git (Recomendado)

1. **Conecte seu repositório no Netlify:**
   - Acesse [netlify.com](https://www.netlify.com)
   - Faça login com sua conta GitHub
   - Clique em "Add new site" → "Import an existing project"
   - Selecione o repositório `Deniihsilvaa/vendafacil`

2. **Configure as opções de build:**
   - O Netlify detectará automaticamente as configurações do `netlify.toml`
   - Verifique se está configurado:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
     - **Node version:** 18 (ou superior)

3. **Configure variáveis de ambiente (se necessário):**
   - No painel do Netlify, vá em "Site settings" → "Environment variables"
   - Adicione variáveis se necessário (por enquanto não é necessário)

4. **Clique em "Deploy site"**

### Opção 2: Deploy Manual via Netlify CLI

```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod
```

### Opção 3: Deploy via Drag & Drop

1. Execute o build localmente:
```bash
npm run build
```

2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)

3. Arraste a pasta `dist` para a área de upload

## 🔧 Configurações do netlify.toml

O arquivo `netlify.toml` já está configurado com:

### Build Settings
- **Command:** `npm run build`
- **Publish:** `dist`
- **Node Version:** 18

### Redirects (SPA)
- Todas as rotas redirecionam para `/index.html` (status 200)
- Necessário para React Router funcionar corretamente

### Headers de Segurança
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

### Cache
- Arquivos estáticos (JS, CSS, imagens): Cache de 1 ano
- `index.html`: Sem cache (sempre buscar versão mais recente)

## 🌐 URLs Após Deploy

Após o deploy, você receberá:
- **URL padrão:** `https://[nome-aleatorio].netlify.app`
- **URL customizada:** Você pode configurar um domínio personalizado

## 🔍 Verificações Pós-Deploy

1. ✅ Acesse a URL do site
2. ✅ Teste a navegação entre rotas:
   - `/` (página inicial)
   - `/loja/burger-house` (página da loja)
   - `/loja/burger-house/checkout` (checkout)
   - `/loja/burger-house/perfil` (perfil)
3. ✅ Verifique se o localStorage está funcionando (carrinho, autenticação)
4. ✅ Teste em diferentes navegadores
5. ✅ Teste em dispositivos móveis

## 🐛 Troubleshooting

### Problema: Página 404 em rotas específicas
**Solução:** Verifique se o redirect para SPA está funcionando. O `netlify.toml` já está configurado corretamente.

### Problema: Estilos não estão aparecendo
**Solução:** Verifique se o TailwindCSS foi compilado corretamente. Execute `npm run build` localmente e verifique se os CSS estão em `dist/assets/`.

### Problema: localStorage não funciona
**Solução:** O localStorage funciona normalmente no Netlify. Verifique se não há erros no console do navegador.

### Problema: Build falha
**Solução:** 
1. Execute `npm run build` localmente para identificar erros
2. Verifique se todas as dependências estão em `package.json`
3. Verifique se a versão do Node.js está correta (18+)

## 📝 Notas Importantes

- ⚠️ **Não commite** a pasta `dist/` no Git (já está no `.gitignore`)
- ✅ O Netlify faz o build automaticamente a cada push no branch `main`
- ✅ Você pode configurar deploys de branches específicos no painel do Netlify
- ✅ Use preview deploys para testar antes de fazer deploy em produção

## 🚀 Próximos Passos

1. Configurar domínio personalizado (opcional)
2. Configurar variáveis de ambiente para API (quando a API estiver pronta)
3. Configurar CDN e otimizações adicionais (se necessário)
4. Configurar analytics (Google Analytics, etc.)

---

**Status:** ✅ Pronto para deploy no Netlify
