# Solução Rápida: Configurar CORS no Backend Next.js

## Problema Atual
Erro: `CORS Missing Allow Origin - Status code: 204`

O backend está retornando 204 para OPTIONS (preflight), mas **sem os headers CORS necessários**.

## Solução Rápida (5 minutos)

### 1. Criar/Atualizar `middleware.ts` na raiz do backend

Crie o arquivo `middleware.ts` na **raiz do projeto backend** (mesmo nível que `package.json`):

```typescript
// middleware.ts (na RAIZ do projeto backend)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Aplicar CORS apenas para rotas /api
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'http://localhost:5173', // ⚠️ Vite usa porta 5173 por padrão
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Responder ao preflight (OPTIONS) com headers CORS
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    // Para outras requisições (GET, POST, etc), adicionar headers CORS
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

### 2. Ajustar a porta do frontend

Se o frontend estiver rodando em uma porta diferente de `3000`, atualize a linha:

```typescript
'Access-Control-Allow-Origin': 'http://localhost:5173', // ⚠️ Vite usa porta 5173 por padrão
```

Para aceitar múltiplas origens em desenvolvimento:

```typescript
const origin = request.headers.get('origin');
const allowedOrigins = [
  'http://localhost:5173', // Porta padrão do Vite
  'http://localhost:3000', // Porta alternativa se configurada
  'http://127.0.0.1:5173', // localhost alternativo
];

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'http://localhost:5173',
  // ... resto dos headers
};
```

### 3. Reiniciar o servidor backend

⚠️ **IMPORTANTE:** Após criar/atualizar o `middleware.ts`, **reinicie o servidor backend**:

```bash
# Parar o servidor (Ctrl+C) e rodar novamente
npm run dev
```

### 4. Testar

1. Abra o DevTools (F12) no navegador
2. Vá para a aba "Network"
3. Faça uma requisição do frontend
4. Verifique:
   - Requisição OPTIONS retorna **200** (não 204) ✅
   - Headers `Access-Control-Allow-Origin` presentes ✅
   - Requisição GET/POST funciona normalmente ✅

## Verificação no DevTools

Após configurar, você deve ver:

**Requisição OPTIONS (preflight):**
- Status: `200 OK` (não 204)
- Response Headers:
  ```
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Methods: GET,OPTIONS,PATCH,DELETE,POST,PUT
  Access-Control-Allow-Headers: Content-Type, Authorization
  ```

**Requisição GET/POST (real):**
- Status: `200 OK` (ou outro status apropriado)
- Response Headers com os mesmos headers CORS acima

## Solução com Variáveis de Ambiente

Para produção, use variáveis de ambiente:

```typescript
// middleware.ts
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Vite usa 5173 por padrão

const corsHeaders = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  // ... resto dos headers
};
```

E no `.env.local` do backend:

```env
FRONTEND_URL=http://localhost:5173
```

## Troubleshooting

### Ainda recebendo 204?
- ✅ Verifique se o `middleware.ts` está na **raiz** do projeto (não em `src/` ou `app/`)
- ✅ Reinicie o servidor backend após criar/atualizar o middleware
- ✅ Verifique se o `matcher` está correto: `'/api/:path*'`

### Ainda recebendo erro CORS?
- ✅ Verifique se a porta do frontend está correta no `Access-Control-Allow-Origin`
- ✅ Verifique se ambos os servidores estão rodando (frontend e backend)
- ✅ Limpe o cache do navegador (Ctrl+Shift+R)

### Postman funciona mas o navegador não?
- ✅ Isso é **normal**! Postman não aplica CORS, mas o navegador sim
- ✅ Você precisa configurar CORS no backend mesmo que Postman funcione

