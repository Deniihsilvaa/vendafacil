# 🐛 Debug - Endpoint de Produtos

## ❌ Erro Encontrado

```
GET http://localhost:3000/api/stores/vex-sushi/products

{
  "success": false,
  "error": {
    "message": "Cannot read properties of undefined (reading 'searchParams')",
    "code": "INTERNAL_SERVER_ERROR",
    "status": 500,
    "timestamp": "2025-12-21T05:36:24.556Z",
    "details": {}
  }
}
```

## 🔍 Análise

O erro indica que o backend está tentando acessar `searchParams` de algo que é `undefined`. Isso geralmente acontece quando:

1. O objeto `request` não está sendo passado corretamente para a função
2. O framework está tentando acessar `request.searchParams` mas `request` é `undefined`
3. Há um problema na forma como a URL está sendo parseada

## ✅ Requisição do Frontend

O frontend está enviando a requisição corretamente:

```typescript
// URL gerada: /api/stores/vex-sushi/products
// Sem query parameters (quando não há filtros)

// Ou com query parameters (quando há filtros):
// /api/stores/vex-sushi/products?page=1&limit=20&category=Temakis
```

### Código do Frontend

```typescript
// src/services/stores/storeService.ts
static async getStoreProducts(
  storeId: string,
  filters?: StoreProductsFilters
): Promise<StoreProductsResponse> {
  const endpoint = API_ENDPOINTS.STORES.PRODUCTS(storeId);
  // endpoint = "/api/stores/vex-sushi/products"
  
  let url = endpoint;
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    // ... adiciona parâmetros
    url = `${endpoint}?${params.toString()}`;
  }
  
  const response = await apiClient.get(url);
  // Requisição: GET /api/stores/vex-sushi/products
}
```

## 🔧 Possíveis Causas no Backend

### 1. Next.js API Route

Se estiver usando Next.js, verifique se o handler está recebendo os parâmetros corretamente:

```typescript
// ❌ ERRADO - Pode causar o erro
export async function GET(request: Request) {
  const { searchParams } = request; // request pode ser undefined
  // ...
}

// ✅ CORRETO
export async function GET(request: Request) {
  if (!request) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Request is required' } 
      }),
      { status: 400 }
    );
  }
  
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  // ...
}
```

### 2. Express.js

Se estiver usando Express.js:

```typescript
// ✅ CORRETO
app.get('/api/stores/:storeId/products', (req, res) => {
  const { storeId } = req.params;
  const { page, limit, category, isActive, search } = req.query;
  // req.query já contém os query parameters
});
```

### 3. Hono / Elysia / Outros Frameworks

Verifique se o framework está passando o objeto `request` corretamente:

```typescript
// ✅ CORRETO para Hono
app.get('/api/stores/:storeId/products', async (c) => {
  const storeId = c.req.param('storeId');
  const { page, limit, category, isActive, search } = c.req.query();
  // ...
});
```

## 🧪 Teste Manual

Teste a requisição diretamente no navegador ou com curl:

```bash
# Sem query parameters
curl http://localhost:3000/api/stores/vex-sushi/products

# Com query parameters
curl "http://localhost:3000/api/stores/vex-sushi/products?page=1&limit=20"
```

## 📋 Checklist para Backend

- [ ] Verificar se o handler está recebendo o objeto `request` corretamente
- [ ] Verificar se `request` não é `undefined` antes de acessar `searchParams`
- [ ] Verificar se a rota está configurada corretamente
- [ ] Verificar se o middleware está processando a requisição corretamente
- [ ] Adicionar logs para debugar:
  ```typescript
  console.log('Request:', request);
  console.log('Request URL:', request?.url);
  console.log('Request method:', request?.method);
  ```

## 🔗 Referências

- [Documentação da API - GET /api/stores/[storeId]/products](./API_PRODUTOS_LOJA.md)
- [StoreService - src/services/stores/storeService.ts](../src/services/stores/storeService.ts)

---

## 📝 Nota

Este erro é do **backend**, não do frontend. O frontend está enviando a requisição corretamente. O problema está na forma como o backend está processando a requisição.

