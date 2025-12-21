# 📋 Recomendações de API - Status da Loja

## 🎯 Objetivo

Criar um endpoint otimizado para retornar apenas o status da loja (aberta/fechada) sem precisar buscar todos os dados da loja.

## 🚀 Endpoint Recomendado

### `GET /api/merchant/stores/[storeId]/status`

Retorna apenas o status atual da loja (aberta/fechada) e informações básicas de horário.

#### Headers
```
Authorization: Bearer {token}
```

#### Path Parameters
- `storeId` (string, UUID): ID da loja

#### Exemplo de Request
```
GET /api/merchant/stores/d3c3d99c-e221-4371-861b-d61743ffb09e/status
```

#### Exemplo de Response (200)
```json
{
  "success": true,
  "data": {
    "isOpen": true,
    "currentDay": "Segunda-feira",
    "currentDayHours": {
      "open": "08:00",
      "close": "22:00",
      "closed": false
    },
    "nextOpenDay": null,
    "nextOpenHours": null,
    "lastUpdated": "2025-12-20T10:30:00Z"
  },
  "timestamp": "2025-12-20T10:30:00Z"
}
```

#### Exemplo de Response (200) - Loja Fechada
```json
{
  "success": true,
  "data": {
    "isOpen": false,
    "currentDay": "Domingo",
    "currentDayHours": null,
    "nextOpenDay": "Segunda-feira",
    "nextOpenHours": {
      "open": "08:00",
      "close": "22:00"
    },
    "lastUpdated": "2025-12-20T10:30:00Z"
  },
  "timestamp": "2025-12-20T10:30:00Z"
}
```

## 💡 Benefícios

1. **Performance**: Retorna apenas dados necessários (~200 bytes vs ~5KB)
2. **Cache**: Pode ser cacheado por 1 minuto (status muda pouco)
3. **Simplicidade**: Frontend não precisa calcular horários
4. **Consistência**: Backend é a fonte única da verdade

## 🔄 Implementação no Backend

```typescript
// routes/merchant/stores/[storeId]/status.ts
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const storeId = params.storeId;
  
  // Buscar apenas workingHours da loja (query otimizada)
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      working_hours: true, // Apenas horários
    },
  });

  if (!store) {
    return NextResponse.json(
      { success: false, error: { message: 'Loja não encontrada', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  // Calcular status (mesma lógica do frontend, mas no backend)
  const status = calculateStoreStatus(store.working_hours);

  return NextResponse.json({
    success: true,
    data: status,
    timestamp: new Date().toISOString(),
  });
}
```

## 📊 Comparação

| Aspecto | `GET /stores/[id]` (completo) | `GET /stores/[id]/status` (otimizado) |
|---------|-------------------------------|--------------------------------------|
| **Tamanho** | ~5KB | ~200 bytes |
| **Tempo** | ~150ms | ~50ms |
| **Dados** | Tudo da loja | Apenas status |
| **Cache** | Difícil (muitos dados) | Fácil (poucos dados) |
| **Uso** | Quando precisa de tudo | Quando só precisa do status |

## ✅ Implementação no Frontend (Já Feito)

O frontend já está preparado para usar este endpoint quando estiver disponível:

```typescript
// services/stores/storeService.ts
static async getStoreStatus(storeId: string): Promise<StoreStatus> {
  const url = `${API_ENDPOINTS.MERCHANT.BASE}/stores/${storeId}/status`;
  const response = await apiClient.get<StoreStatus>(url);
  return response.data;
}
```

## 🎯 Prioridade

**Alta** - Melhora significativamente a performance do dashboard e reduz carga no servidor.

