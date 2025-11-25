# Verificação de CORS com Proxy

## Configuração Atual

✅ **Proxy do Vite configurado:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Proxy: `/api/*` → `http://localhost:4000/api/*`

## Como Funciona o Proxy

Com o proxy configurado no `vite.config.ts`, todas as requisições para `/api/*` são redirecionadas pelo servidor Vite para `http://localhost:4000/api/*`.

**Vantagens:**
- ✅ Evita problemas de CORS (requisições parecem vir da mesma origem)
- ✅ Não precisa configurar CORS no backend para desenvolvimento
- ✅ URLs mais simples no código (apenas `/api/...`)

## Verificações Necessárias

### 1. Verificar se o Frontend está enviando o header Origin corretamente

**Como verificar:**
1. Abra o DevTools (F12)
2. Vá para a aba "Network"
3. Faça uma requisição para a API
4. Clique na requisição e veja os "Request Headers"
5. Verifique se existe o header `Origin: http://localhost:3000`

**O que esperar:**
```
Request Headers:
  Origin: http://localhost:3000
  Referer: http://localhost:3000/
  ...
```

**Se não aparecer:**
- Pode ser um problema de configuração do navegador
- Verifique se está fazendo requisição do mesmo domínio (com proxy, deve ser relativa)

### 2. Verificar se há algum proxy ou intermediário alterando os headers

**Verificações:**

#### A. Requisições passam pelo proxy do Vite?
- ✅ Com proxy: Requisição deve ir para `http://localhost:3000/api/...`
- ❌ Sem proxy: Requisição vai para `http://localhost:4000/api/...`

**Como verificar:**
- No DevTools → Network, veja a URL da requisição
- Se mostrar `localhost:3000/api/...` → Proxy funcionando ✅
- Se mostrar `localhost:4000/api/...` → Proxy não está ativo ❌

#### B. Headers estão sendo preservados?
**Verifique se os headers são enviados corretamente:**

No DevTools → Network → Headers → Request Headers:
```
Authorization: Bearer ...
Content-Type: application/json
```

**Se faltar algum header:**
- Verifique o `apiClient` em `src/services/api/client.ts`
- Verifique se o header está sendo adicionado antes do fetch

### 3. Verificar se há cache do navegador interferindo

**Problema comum:** O navegador pode cachear respostas de CORS, causando erros persistentes.

**Solução:**

#### A. Limpar cache do navegador:
1. **Chrome/Edge:** `Ctrl+Shift+Delete` → Marque "Cookies" e "Cached images and files" → Limpar
2. **Firefox:** `Ctrl+Shift+Delete` → Marque "Cookies" e "Cache" → Limpar

#### B. Desabilitar cache durante desenvolvimento:
No DevTools:
1. Abra DevTools (F12)
2. Vá para Network
3. Marque "Disable cache" ✅
4. Mantenha o DevTools aberto

#### C. Modo Anônimo:
Teste em uma janela anônima/privada para evitar cache.

#### D. Hard Refresh:
- **Windows/Linux:** `Ctrl+Shift+R` ou `Ctrl+F5`
- **Mac:** `Cmd+Shift+R`

## Testes de Verificação

### Teste 1: Verificar se o proxy está funcionando

```javascript
// No console do navegador (F12)
fetch('/api/stores/test-id')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Resultado esperado:**
- ✅ Se funcionar: Proxy está ativo
- ❌ Se der erro CORS: Proxy não está funcionando ou URL está errada

### Teste 2: Verificar headers da requisição

No DevTools → Network:
1. Faça uma requisição da aplicação
2. Clique na requisição
3. Veja "Request Headers"
4. Verifique:
   - ✅ `Origin: http://localhost:3000`
   - ✅ `Content-Type: application/json` (se for POST/PUT)
   - ✅ `Authorization: Bearer ...` (se autenticado)

### Teste 3: Verificar resposta do servidor

No DevTools → Network:
1. Faça uma requisição
2. Clique na requisição
3. Veja "Response Headers"
4. Verifique se há headers CORS (mesmo com proxy, podem aparecer):
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`

## Configuração do apiClient

Com o proxy ativo, o `apiClient` deve usar URLs relativas:

```typescript
// ✅ Correto com proxy
const url = `${this.baseURL}${endpoint}`; // baseURL = '' em dev com proxy
// Resultado: '/api/stores/123'

// ❌ Incorreto
const url = `http://localhost:4000/api/stores/123`; // Vai direto ao backend (CORS)
```

## Troubleshooting

### Problema: Ainda recebe erro CORS mesmo com proxy

**Possíveis causas:**
1. **Proxy não está ativo:**
   - Verifique `vite.config.ts` se o proxy está configurado
   - Reinicie o servidor de desenvolvimento (`npm run dev`)

2. **URL está incorreta:**
   - Verifique se está usando `/api/...` (relativa) e não `http://localhost:4000/api/...`
   - Verifique `src/config/env.ts` se `BASE_URL` está vazio em desenvolvimento

3. **Cache do navegador:**
   - Limpe o cache ou use modo anônimo
   - Faça hard refresh (`Ctrl+Shift+R`)

### Problema: Headers não estão sendo enviados

**Verificações:**
1. Verifique `apiClient.ts` se os headers estão sendo adicionados:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`,
   }
   ```

2. Verifique se o token está sendo obtido corretamente:
   ```typescript
   const token = this.getAuthToken();
   ```

### Problema: Requisições vão direto ao backend (sem proxy)

**Causa:** `BASE_URL` está configurado com URL completa.

**Solução:** 
- Em desenvolvimento com proxy, `BASE_URL` deve ser `''` (vazio)
- Verifique `src/config/env.ts`

## Checklist Final

Antes de reportar problemas, verifique:

- [ ] Proxy está configurado em `vite.config.ts`
- [ ] Servidor de desenvolvimento foi reiniciado após mudanças
- [ ] `BASE_URL` está vazio (`''`) em desenvolvimento com proxy
- [ ] Requisições usam URLs relativas (`/api/...`)
- [ ] Cache do navegador foi limpo
- [ ] Headers estão sendo enviados corretamente (verificar no DevTools)
- [ ] Origin header está presente nas requisições
- [ ] Backend está rodando na porta 4000

## Logs de Debug

Para ver logs detalhados, o `apiClient` já loga em desenvolvimento:

```typescript
// Já implementado em src/services/api/client.ts
if (import.meta.env.DEV) {
  console.log(`[API Client] ${method} ${url}`);
}
```

Abra o console do navegador para ver as requisições sendo feitas.

