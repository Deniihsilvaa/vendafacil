# 📦 API de Produtos de Loja - Guia de Implementação

## 📋 Visão Geral

Este documento descreve como usar o endpoint `/api/stores/[storeId]/products` no frontend, incluindo suporte a filtros, paginação e detecção automática de UUID/slug.

---

## 🔗 Endpoint

```
GET /api/stores/[storeId]/products
```

### Parâmetros de URL

- `storeId` (obrigatório): UUID da loja **ou** slug da loja
  - **UUID**: `d3c3d99c-e221-4371-861b-d61743ffb09e`
  - **Slug**: `kampai-sushi`, `vex-sushi`, etc.

### Query Parameters

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `category` (opcional): Filtrar por categoria de produto
- `isActive` (opcional): Filtrar por status (true/false)
- `search` (opcional): Buscar por nome ou descrição do produto

---

## 💻 Implementação no Frontend

### 1. Método Principal: `getStoreProducts`

O método `StoreService.getStoreProducts()` permite buscar produtos com filtros opcionais:

```typescript
import { StoreService, type StoreProductsFilters } from '@/services/stores/storeService';

// Buscar todos os produtos (sem filtros)
const products = await StoreService.getStoreProducts('vex-sushi');

// Buscar produtos com filtros
const filteredProducts = await StoreService.getStoreProducts('vex-sushi', {
  page: 1,
  limit: 20,
  category: 'Temakis',
  isActive: true,
  search: 'salmão'
});
```

### 2. Interface de Filtros

```typescript
interface StoreProductsFilters {
  page?: number;        // Número da página (padrão: 1)
  limit?: number;       // Itens por página (padrão: 20)
  category?: string;    // Filtrar por categoria
  isActive?: boolean;   // Filtrar por status (true/false)
  search?: string;      // Buscar por nome ou descrição
}
```

### 3. Resposta da API

```typescript
interface StoreProductsResponse {
  items: Product[];     // Array de produtos
  pagination?: {        // Informações de paginação (opcional)
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Buscar Todos os Produtos

```typescript
// Buscar todos os produtos ativos de uma loja
const response = await StoreService.getStoreProducts('vex-sushi', {
  isActive: true
});

console.log(`Total de produtos: ${response.items.length}`);
```

### Exemplo 2: Buscar com Paginação

```typescript
// Buscar segunda página com 10 itens por página
const response = await StoreService.getStoreProducts('vex-sushi', {
  page: 2,
  limit: 10,
  isActive: true
});

console.log(`Página ${response.pagination?.page} de ${response.pagination?.totalPages}`);
console.log(`Total: ${response.pagination?.total} produtos`);
```

### Exemplo 3: Filtrar por Categoria

```typescript
// Buscar apenas produtos da categoria "Temakis"
const response = await StoreService.getStoreProducts('vex-sushi', {
  category: 'Temakis',
  isActive: true
});

console.log(`Produtos de Temakis: ${response.items.length}`);
```

### Exemplo 4: Buscar com Termo de Pesquisa

```typescript
// Buscar produtos que contenham "salmão" no nome ou descrição
const response = await StoreService.getStoreProducts('vex-sushi', {
  search: 'salmão',
  isActive: true
});

console.log(`Produtos encontrados: ${response.items.length}`);
```

### Exemplo 5: Combinar Múltiplos Filtros

```typescript
// Buscar produtos ativos da categoria "Temakis" que contenham "salmão"
const response = await StoreService.getStoreProducts('vex-sushi', {
  category: 'Temakis',
  search: 'salmão',
  isActive: true,
  page: 1,
  limit: 20
});
```

---

## 🎯 Casos de Uso no Frontend

### Caso 1: Página de Loja (StorePage)

**Antes (filtragem client-side):**
```typescript
// ❌ Buscava todos os produtos e filtrava no cliente
const { store, products } = await StoreService.getStoreByIdWithProducts(storeId);
const filtered = products.filter(p => p.category === selectedCategory);
```

**Depois (filtragem server-side):**
```typescript
// ✅ Busca apenas produtos filtrados do servidor
const response = await StoreService.getStoreProducts(storeId, {
  category: selectedCategory,
  isActive: true
});
const filtered = response.items;
```

**Benefícios:**
- ✅ Menos dados transferidos
- ✅ Melhor performance
- ✅ Suporte a paginação
- ✅ Busca mais eficiente no servidor

### Caso 2: Busca com Debounce

```typescript
import { useState, useEffect, useCallback } from 'react';
import { StoreService } from '@/services/stores/storeService';

const useStoreProductsSearch = (storeId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm) {
        // Buscar todos os produtos se não houver termo de busca
        const response = await StoreService.getStoreProducts(storeId, {
          isActive: true
        });
        setProducts(response.items);
        return;
      }

      setLoading(true);
      try {
        const response = await StoreService.getStoreProducts(storeId, {
          search: searchTerm,
          isActive: true
        });
        setProducts(response.items);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [storeId, searchTerm]);

  return { products, searchTerm, setSearchTerm, loading };
};
```

### Caso 3: Paginação Infinita

```typescript
import { useState, useCallback } from 'react';
import { StoreService } from '@/services/stores/storeService';

const useInfiniteProducts = (storeId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await StoreService.getStoreProducts(storeId, {
        page,
        limit: 20,
        isActive: true
      });

      setProducts(prev => [...prev, ...response.items]);
      
      if (response.pagination) {
        setHasMore(page < response.pagination.totalPages);
        setPage(prev => prev + 1);
      } else {
        setHasMore(response.items.length === 20);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId, page, loading, hasMore]);

  return { products, loadMore, hasMore, loading };
};
```

---

## 🔄 Migração do Código Existente

### Método Legado: `getStoreByIdWithProducts`

O método `getStoreByIdWithProducts` ainda está disponível para compatibilidade, mas é recomendado usar `getStoreProducts` para melhor performance:

```typescript
// ❌ Método legado (busca todos os produtos)
const { store, products } = await StoreService.getStoreByIdWithProducts(storeId);

// ✅ Método recomendado (com filtros)
const store = await StoreService.getStoreById(storeId);
const productsResponse = await StoreService.getStoreProducts(storeId, {
  isActive: true
});
const products = productsResponse.items;
```

---

## ⚠️ Importante

### Detecção Automática de UUID/Slug

O endpoint detecta automaticamente se o `storeId` é UUID ou slug:

- **UUID**: Formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Slug**: Qualquer outro formato (ex: `vex-sushi`, `kampai-sushi`)

**Exemplos válidos:**
```typescript
// Por UUID
await StoreService.getStoreProducts('d3c3d99c-e221-4371-861b-d61743ffb09e');

// Por slug
await StoreService.getStoreProducts('vex-sushi');
await StoreService.getStoreProducts('kampai-sushi');
```

### Filtros no Servidor vs Cliente

**✅ Use filtros do servidor quando:**
- Há muitos produtos (performance)
- Precisa de paginação
- Busca precisa ser eficiente
- Quer reduzir tráfego de rede

**⚠️ Use filtros do cliente quando:**
- Há poucos produtos (< 50)
- Filtros são muito complexos
- Precisa de filtros em tempo real sem debounce

---

## 📊 Comparação de Performance

### Buscar Todos os Produtos (100 produtos)

**Client-side filtering:**
- Dados transferidos: ~500KB
- Tempo de resposta: ~200ms
- Processamento: Cliente

**Server-side filtering:**
- Dados transferidos: ~50KB (com filtro)
- Tempo de resposta: ~100ms
- Processamento: Servidor

**Economia:** ~90% de dados transferidos

---

## 🔗 Referências

- [Documentação da API - GET /api/stores/[storeId]/products](./API_RECOMMENDATIONS_STORE_STATUS.md)
- [StoreService - src/services/stores/storeService.ts](../src/services/stores/storeService.ts)
- [Guia de Rotas - Rotas por Slug](./GUIA_ROTAS_REACT_ROUTER.md)

---

## 📅 Histórico de Alterações

- **2024-12-20**: Criado guia de implementação do endpoint de produtos
- **2024-12-20**: Adicionado suporte a filtros e paginação no `StoreService.getStoreProducts()`

