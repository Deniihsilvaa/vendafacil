# Porta do Frontend - Verificação

## Porta Configurada

✅ **Porta padrão do Vite: `5173`**

O frontend está configurado para rodar na porta **5173** (porta padrão do Vite).

## Configuração Atual

### Frontend (Vite)
- **Porta padrão:** `5173`
- **URL:** `http://localhost:5173`
- **Arquivo:** `vite.config.ts` (linha 21)

```typescript
server: {
  port: 5173, // Porta padrão do Vite
  host: true,
  // ...
}
```

### Backend (Next.js)
- **Porta:** `4000`
- **URL:** `http://localhost:4000`
- **API:** `http://localhost:4000/api/*`

## Configuração CORS no Backend

⚠️ **IMPORTANTE:** No backend Next.js, configure o `Access-Control-Allow-Origin` para:

```typescript
'Access-Control-Allow-Origin': 'http://localhost:5173' // ⚠️ Porta 5173, não 3000!
```

## Como Verificar a Porta do Frontend

1. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Veja no terminal:**
   ```
   VITE v7.1.7  ready in XXX ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

3. **Se aparecer uma porta diferente**, use essa porta no backend.

## Diferença entre Portas

- **Porta 3000:** Usada pelo Create React App (CRA)
- **Porta 5173:** Usada pelo Vite (este projeto)
- **Porta 4000:** Usada pelo backend Next.js

## Exemplo de Middleware Correto

```typescript
// middleware.ts (no backend Next.js)
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:5173', // ✅ Porta 5173
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  return NextResponse.next();
}
```

## Se Precisar Aceitar Múltiplas Portas

Se você quiser aceitar requisições de múltiplas origens em desenvolvimento:

```typescript
const origin = request.headers.get('origin');
const allowedOrigins = [
  'http://localhost:5173', // Vite (padrão)
  'http://localhost:3000', // CRA (alternativo)
  'http://127.0.0.1:5173', // localhost alternativo
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') 
    ? origin! 
    : 'http://localhost:5173',
  // ... resto dos headers
};
```

