# 📡 Guia de Sincronização em Tempo Real (Realtime Sync)

Este documento explica como usar o sistema de sincronização em tempo real para pedidos (orders) usando Supabase Realtime.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Hooks Disponíveis](#hooks-disponíveis)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema de realtime sync permite que:
- **Customers** vejam seus pedidos atualizados em tempo real
- **Merchants** vejam pedidos de suas lojas em tempo real
- Mudanças (INSERT, UPDATE, DELETE) sejam refletidas instantaneamente
- Cada usuário veja apenas o que tem permissão (via RLS do Supabase)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  useOrders   │  │ useOrders    │  │ useCustomer  │    │
│  │              │  │ Realtime     │  │ Orders       │    │
│  │ (integração) │──│ (automático) │  │ Realtime     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                    │          │
│         └──────────────────┼────────────────────┘          │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │ realtime-orders │                      │
│                   │   (utilitário)  │                      │
│                   └────────┬────────┘                      │
└────────────────────────────┼───────────────────────────────┘
                             │
                             │ WebSocket
                             │
┌────────────────────────────▼───────────────────────────────┐
│                 Supabase Realtime                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Políticas RLS                          │  │
│  │  • Customers: apenas seus pedidos                  │  │
│  │  • Merchants: apenas pedidos de suas lojas         │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │  Database       │                      │
│                   │  (orders table) │                      │
│                   └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎣 Hooks Disponíveis

### 1. `useOrdersRealtime` (Principal - Recomendado)

Hook que detecta automaticamente se o usuário é customer ou merchant e configura o canal apropriado.

```typescript
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';

const { isConnected, userType, userId, reconnect } = useOrdersRealtime({
  enabled: true,
  onOrderChange: (payload) => {
    console.log('Pedido atualizado:', payload);
    // Atualizar lista de pedidos
    refetchOrders();
  }
});
```

**Retorna:**
- `isConnected`: boolean - Se está conectado ao canal
- `userType`: 'customer' | 'merchant' | null - Tipo de usuário detectado
- `userId`: string | null - ID do usuário
- `reconnect`: () => void - Função para reconectar manualmente

### 2. `useOrders` (Com Realtime Integrado)

Hook existente que agora inclui realtime sync automaticamente.

```typescript
import { useOrders } from '@/hooks/useOrders';

const { orders, loading, error, realtime } = useOrders({
  enableRealtime: true, // Padrão: true
  customerId: 'customer-123', // Opcional
  storeId: 'store-456', // Opcional
});

// Informações de realtime
console.log(realtime.isConnected); // boolean
console.log(realtime.userType); // 'customer' | 'merchant' | null
```

### 3. `useCustomerOrdersRealtime` (Específico para Customers)

Hook específico para customers.

```typescript
import { useCustomerOrdersRealtime } from '@/hooks/useCustomerOrdersRealtime';

const { isConnected, customerId, reconnect } = useCustomerOrdersRealtime({
  customerId: 'customer-123', // Opcional - usa do contexto se não fornecido
  enabled: true,
  onOrderChange: (payload) => {
    if (payload.eventType === 'INSERT') {
      console.log('Novo pedido criado!', payload.new);
    } else if (payload.eventType === 'UPDATE') {
      console.log('Pedido atualizado!', payload.new);
    }
  }
});
```

### 4. `useMerchantOrdersRealtime` (Específico para Merchants)

Hook específico para merchants.

```typescript
import { useMerchantOrdersRealtime } from '@/hooks/useMerchantOrdersRealtime';

const { isConnected, merchantId, storeIds, reconnect } = useMerchantOrdersRealtime({
  merchantId: 'merchant-123', // Opcional - usa do contexto se não fornecido
  storeIds: ['store-1', 'store-2'], // Opcional - usa do contexto se não fornecido
  enabled: true,
  onOrderChange: (payload) => {
    console.log('Pedido atualizado nas lojas:', payload);
  }
});
```

## 📝 Exemplos de Uso

### Exemplo 1: Lista de Pedidos com Realtime (Customer)

```tsx
import { useOrders } from '@/hooks/useOrders';
import { useAuthContext } from '@/hooks/useTheme';

function CustomerOrdersPage() {
  const { customer } = useAuthContext();
  
  const { orders, loading, error, realtime } = useOrders({
    customerId: customer?.id,
    enableRealtime: true, // Habilitar realtime
  });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <div>
        Status Realtime: {realtime.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        Tipo: {realtime.userType}
      </div>
      
      <h1>Meus Pedidos</h1>
      {Array.isArray(orders) ? (
        orders.map(order => (
          <div key={order.id}>
            <h2>Pedido #{order.id}</h2>
            <p>Status: {order.status}</p>
            <p>Total: R$ {order.totalAmount}</p>
          </div>
        ))
      ) : (
        <div>Nenhum pedido encontrado</div>
      )}
    </div>
  );
}
```

### Exemplo 2: Lista de Pedidos com Realtime (Merchant)

```tsx
import { useOrders } from '@/hooks/useOrders';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';

function MerchantOrdersPage() {
  const { merchant } = useMerchantAuth();
  const storeIds = merchant?.stores?.map(s => s.id) || [];
  
  const { orders, loading, error, realtime } = useOrders({
    storeId: storeIds[0], // Ou filtrar por todas as lojas
    enableRealtime: true,
  });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <div>
        Status Realtime: {realtime.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        Tipo: {realtime.userType}
      </div>
      
      <h1>Pedidos das Minhas Lojas</h1>
      {Array.isArray(orders) ? (
        orders.map(order => (
          <div key={order.id}>
            <h2>Pedido #{order.id}</h2>
            <p>Status: {order.status}</p>
            <p>Cliente: {order.customerName}</p>
            <p>Total: R$ {order.totalAmount}</p>
          </div>
        ))
      ) : (
        <div>Nenhum pedido encontrado</div>
      )}
    </div>
  );
}
```

### Exemplo 3: Uso Avançado com Callback Personalizado

```tsx
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { useOrders } from '@/hooks/useOrders';
import type { OrderRealtimePayload } from '@/lib/supabase/realtime-orders';

function OrdersWithCustomHandling() {
  const { orders, refetch } = useOrders();
  
  const { isConnected, userType } = useOrdersRealtime({
    onOrderChange: (payload: OrderRealtimePayload) => {
      switch (payload.eventType) {
        case 'INSERT':
          console.log('✅ Novo pedido criado:', payload.new?.id);
          // Mostrar notificação
          showNotification('Novo pedido recebido!');
          refetch();
          break;
          
        case 'UPDATE':
          console.log('🔄 Pedido atualizado:', payload.new?.id);
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;
          
          if (oldStatus !== newStatus) {
            console.log(`Status mudou: ${oldStatus} → ${newStatus}`);
            showNotification(`Pedido ${payload.new?.id} atualizado: ${newStatus}`);
          }
          refetch();
          break;
          
        case 'DELETE':
          console.log('🗑️ Pedido removido:', payload.old?.id);
          refetch();
          break;
      }
    }
  });

  return (
    <div>
      {isConnected ? (
        <div className="text-green-600">🟢 Conectado (Tipo: {userType})</div>
      ) : (
        <div className="text-red-600">🔴 Desconectado</div>
      )}
      
      {/* Lista de pedidos */}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Problema: Realtime não está conectando

**Soluções:**
1. Verificar se as variáveis de ambiente estão configuradas:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```

2. Verificar se o usuário está autenticado (customer ou merchant)

3. Verificar se o Supabase Realtime está habilitado para a tabela `orders`

4. Verificar console do navegador para erros

### Problema: Recebendo eventos de pedidos que não deveria ver

**Solução:** Isso não deveria acontecer se as políticas RLS estiverem corretas. Verificar:
- Políticas RLS no Supabase
- Se o usuário está autenticado corretamente
- Se os filtros estão sendo aplicados

### Problema: Múltiplas atualizações para o mesmo evento

**Solução:** O hook `useOrders` já faz debounce automático. Se ainda houver problemas, adicionar debounce no callback:

```typescript
import { debounce } from 'lodash';

const debouncedRefetch = debounce(() => {
  refetch();
}, 500);

useOrdersRealtime({
  onOrderChange: () => debouncedRefetch()
});
```

### Problema: Canal não está sendo limpo ao desmontar componente

**Solução:** O hook já faz cleanup automático. Se houver problemas, verificar se está usando o hook corretamente dentro de componentes funcionais.

## 🔐 Segurança

- **RLS (Row Level Security)** é aplicado automaticamente pelo Supabase
- Customers só veem seus próprios pedidos
- Merchants só veem pedidos de suas lojas
- Não há necessidade de filtros adicionais no frontend (mas são aplicados para melhor performance)

## 📚 Referências

- [Documentação do Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Políticas RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- Código fonte:
  - `src/lib/supabase/realtime-orders.ts` - Utilitários de realtime
  - `src/hooks/useOrdersRealtime.ts` - Hook principal
  - `src/hooks/useOrders.ts` - Hook com realtime integrado

