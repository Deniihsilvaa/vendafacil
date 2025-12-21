# Correção de Erro CORS

## Problema
Erro: `Cross-Origin Request Blocked: CORS Missing Allow Origin - Status code: 204`

O servidor está respondendo ao OPTIONS (preflight) com status 204, mas **não está incluindo os headers CORS necessários** (`Access-Control-Allow-Origin`, etc).

## Diagnóstico
Este erro indica que a requisição do frontend não está conseguindo chegar ao backend. Isso pode acontecer por:

1. **Backend não está rodando** na porta 4000
2. **CORS não está configurado** no backend Next.js
3. **URL incorreta** ou problema de rede

## Correções Aplicadas no Frontend

### 1. Melhor Tratamento de Erros CORS
- Adicionado tratamento específico para erros de CORS no `apiClient`
- Mensagens de erro mais claras indicando o problema
- Logs de debug em desenvolvimento

### 2. Configuração de URL
- URL base configurada em `src/config/env.ts`
- Padrão: `http://localhost:4000` em desenvolvimento
- Pode ser sobrescrita com variável `VITE_API_BASE_URL` no `.env.local`

## Verificações no Backend (Next.js)

### 1. Verificar se o Backend está Rodando
```bash
# No diretório do backend
npm run dev
# Deve estar rodando em http://localhost:4000
```

### 2. Configurar CORS no Backend Next.js

No backend Next.js, você precisa configurar CORS para aceitar requisições do frontend.

#### Opção A: Usando `next.config.js` (se usar API Routes)
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:5173' }, // ⚠️ Vite usa porta 5173 por padrão
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};
```

#### Opção B: Usando Middleware (Recomendado para Next.js 13+)

**⚠️ IMPORTANTE: Esta é a solução mais robusta e recomendada!**

Crie ou atualize o arquivo `middleware.ts` na **raiz do projeto backend**:

```typescript
// middleware.ts (na raiz do projeto backend Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS apenas para rotas /api
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'http://localhost:5173', // ⚠️ Vite usa porta 5173 por padrão
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    };
    
    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    // Para outras requisições, adicionar headers CORS à resposta
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Pontos importantes:**
1. ✅ O middleware deve estar na **raiz** do projeto backend, não em `src/` ou `app/`
2. ✅ Deve responder a **OPTIONS** com status 200 e os headers CORS
3. ✅ Deve adicionar headers CORS em **todas** as respostas de `/api/*`
4. ✅ Ajuste `http://localhost:5173` para a porta onde seu frontend está rodando (Vite usa 5173 por padrão)

#### Opção C: Usando um Handler de API em cada rota (não recomendado - muito repetitivo)

⚠️ **Não recomendado** pois você precisaria adicionar isso em TODAS as rotas.

Se preferir essa abordagem, crie um helper primeiro:

```typescript
// lib/cors.ts (na raiz do projeto backend)
import { NextResponse } from 'next/server';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Vite usa 5173 por padrão

export function corsHeaders() {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function corsResponse(data?: any, status = 200) {
  const response = data 
    ? NextResponse.json(data, { status })
    : new NextResponse(null, { status });
  
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export async function handleOptions() {
  return corsResponse(null, 200);
}
```

Depois use em cada rota:

```typescript
// app/api/stores/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsResponse, handleOptions } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... sua lógica ...
  return corsResponse({ /* seus dados */ });
}

export async function OPTIONS() {
  return handleOptions();
}
```

### 3. Verificar Porta do Frontend

**⚠️ IMPORTANTE:** O Vite usa a porta `5173` por padrão (não `3000` como o Create React App).

Se você estiver usando a porta padrão do Vite (`5173`), o `Access-Control-Allow-Origin` deve ser `http://localhost:5173`.

Se você configurou uma porta diferente no `vite.config.ts` ou via variável de ambiente `PORT`, ajuste o `Access-Control-Allow-Origin` no backend para a porta correta.

**Como verificar a porta do frontend:**
1. Execute `npm run dev` no frontend
2. Veja no terminal qual porta está sendo usada (ex: `Local: http://localhost:5173/`)
3. Use essa porta no `Access-Control-Allow-Origin` do backend

## Teste Manual

### 1. Verificar se o Backend Responde
```bash
# No terminal
curl http://localhost:4000/api/stores/45319ec5-7cb8-499b-84b0-896e812dfd2e
```

### 2. Verificar CORS no Navegador
1. Abra o DevTools (F12)
2. Vá para a aba "Network"
3. Faça uma requisição do frontend
4. Verifique se os headers CORS estão presentes na resposta

### 3. Verificar Console do Frontend
Com as mudanças aplicadas, o frontend agora mostra mensagens de erro mais claras:
- Se o backend não estiver rodando: "Erro de conexão: Não foi possível conectar ao servidor..."
- Se CORS não estiver configurado: "Erro de CORS: Não foi possível conectar ao servidor..."

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend (se ainda não existir):

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_USE_MOCK=false
```

**Nota:** O arquivo `.env.local` está no `.gitignore` e não será commitado.

## Próximos Passos

1. ✅ Frontend atualizado com melhor tratamento de erros CORS
2. ⏳ **Configurar CORS no backend Next.js usando Middleware (Opção B - Recomendada)**
3. ⏳ Verificar se o backend está rodando na porta 4000
4. ⏳ Verificar se o frontend está rodando na porta 5173 (ou ajustar no middleware se usar outra porta)
5. ⏳ **Reiniciar o servidor backend** após criar/atualizar o `middleware.ts`
6. ⏳ Testar a requisição novamente

## Checklist de Verificação

Após configurar o middleware, verifique:

- [ ] Arquivo `middleware.ts` criado na **raiz** do projeto backend (mesmo nível que `package.json`)
- [ ] Porta do frontend está correta no `Access-Control-Allow-Origin`
- [ ] Método OPTIONS está sendo tratado e retornando headers CORS
- [ ] Servidor backend foi **reiniciado** após criar/atualizar o middleware
- [ ] Requisição OPTIONS está retornando status 200 (não 204) com headers CORS

## Debug

Para ver logs de debug no frontend:
- Abra o console do navegador (F12)
- As requisições serão logadas como: `[API Client] GET http://localhost:4000/api/stores/...`

