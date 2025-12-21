# 🛣️ Guia de Rotas - React Router v6

## 📋 Índice

1. [Problema Comum](#problema-comum)
2. [Solução Implementada](#solução-implementada)
3. [Estrutura de Rotas](#estrutura-de-rotas)
4. [Como Criar Novas Rotas](#como-criar-novas-rotas)
5. [Padrões e Boas Práticas](#padrões-e-boas-práticas)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)

---

## ❌ Problema Comum

### Erro: Página em Branco ao Usar Providers em Rotas

**Sintaxe INCORRETA** (causa página em branco):

```tsx
<Route element={
  <AuthProvider>
    <CartProvider>
      <Toaster />
    </CartProvider>
  </AuthProvider>
}>
  <Route path="/" element={<HomePage />} />
</Route>
```

**Por que não funciona?**

- O React Router v6 espera que o `element` de uma rota pai renderize `<Outlet />` para exibir as rotas filhas
- Quando você coloca providers diretamente no `element`, não há `<Outlet />` para renderizar as rotas filhas
- Resultado: página em branco

---

## ✅ Solução Implementada

### Componente Wrapper com `<Outlet />`

Criamos um componente wrapper que:
1. Envolve os providers necessários
2. Renderiza `<Outlet />` para exibir as rotas filhas

**Arquivo:** `src/components/layout/PublicLayoutWrapper.tsx`

```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider, CartProvider } from '@/contexts';
import { Toaster } from '@/components/ui/toast';

export const PublicLayoutWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <Outlet /> {/* ← CRUCIAL: Renderiza as rotas filhas */}
      </CartProvider>
    </AuthProvider>
  );
};
```

**Uso no App.tsx:**

```tsx
<Route element={<PublicLayoutWrapper />}>
  <Route path="/" element={<StoreFront />} />
  <Route path="/loja/:storeId" element={<StorePage />} />
</Route>
```

---

## 📐 Estrutura de Rotas

### Hierarquia de Providers

```
App.tsx
├── StoreProvider (global)
├── ThemeProvider (global)
└── Router
    └── Suspense
        └── Routes
            ├── Rotas Públicas (PublicLayoutWrapper)
            │   ├── AuthProvider
            │   ├── CartProvider
            │   └── Toaster
            │       └── <Outlet /> → Rotas filhas
            │
            └── Rotas Merchant (MerchantLayout)
                ├── MerchantAuthProvider
                └── <Outlet /> → Rotas filhas
```

### Tipos de Rotas no Projeto

#### 1. **Rotas Públicas** (Customer)
- **Wrapper:** `PublicLayoutWrapper`
- **Providers:** `AuthProvider`, `CartProvider`
- **Uso:** Loja pública, checkout, perfil do cliente

#### 2. **Rotas Merchant**
- **Wrapper:** `MerchantLayout`
- **Providers:** `MerchantAuthProvider`
- **Uso:** Dashboard, produtos, pedidos do merchant

#### 3. **Rotas Isoladas**
- **Sem wrapper:** Login, páginas standalone
- **Uso:** Páginas que não precisam de providers específicos

---

## 🚀 Como Criar Novas Rotas

### Passo 1: Identificar o Tipo de Rota

**Perguntas:**
- Precisa de autenticação de customer? → Use `PublicLayoutWrapper`
- Precisa de autenticação de merchant? → Use `MerchantLayout`
- Não precisa de providers? → Rota isolada

### Passo 2: Criar o Componente da Página

```tsx
// src/pages/customer/orders/MyOrders.tsx
export const MyOrders: React.FC = () => {
  return <div>Minhas Compras</div>;
};
```

### Passo 3: Adicionar a Rota no App.tsx

#### Para Rotas Públicas:

```tsx
// Importar o componente (lazy ou normal)
const MyOrders = lazy(() => 
  import('@/pages/customer/orders/MyOrders').then(m => ({ default: m.MyOrders }))
);

// Adicionar dentro de PublicLayoutWrapper
<Route element={<PublicLayoutWrapper />}>
  <Route path="/minhas-compras" element={<MyOrders />} />
</Route>
```

#### Para Rotas Merchant:

```tsx
// Importar o componente (lazy)
const MyMerchantPage = lazy(() => 
  import('@/pages/merchant/my-page/MyMerchantPage').then(m => ({ default: m.MyMerchantPage }))
);

// Adicionar dentro de MerchantLayout
<Route path="/merchant" element={<MerchantLayout />}>
  <Route path="my-page" element={<MyMerchantPage />} />
</Route>
```

#### Para Rotas Isoladas:

```tsx
// Importar o componente
const StandalonePage = lazy(() => 
  import('@/pages/public/StandalonePage').then(m => ({ default: m.StandalonePage }))
);

// Adicionar como rota isolada
<Route path="/standalone" element={<StandalonePage />} />
```

---

## 📚 Padrões e Boas Práticas

### 1. **Lazy Loading**

Use `lazy()` para páginas que não são acessadas imediatamente:

```tsx
// ✅ BOM: Lazy loading para páginas secundárias
const Profile = lazy(() => 
  import('@/pages/customer/profile/Profile').then(m => ({ default: m.Profile }))
);

// ✅ BOM: Import normal para páginas principais (acessadas frequentemente)
import { StoreFront } from '@/pages/public/StoreFront';
```

### 2. **Suspense Boundary**

Envolva todas as rotas com `<Suspense>`:

```tsx
<Suspense fallback={<PageLoader />}>
  <Routes>
    {/* Rotas aqui */}
  </Routes>
</Suspense>
```

### 3. **Rotas Aninhadas**

Use rotas aninhadas para compartilhar providers:

```tsx
// ✅ BOM: Rotas aninhadas compartilham providers
<Route element={<PublicLayoutWrapper />}>
  <Route path="/loja/:storeId" element={<StorePage />} />
  <Route path="/loja/:storeId/checkout" element={<Checkout />} />
</Route>

// ❌ EVITAR: Duplicar providers em cada rota
<Route path="/loja/:storeId" element={
  <AuthProvider><CartProvider><StorePage /></CartProvider></AuthProvider>
} />
```

### 4. **Parâmetros de Rota**

Use `useParams()` para acessar parâmetros:

```tsx
import { useParams } from 'react-router-dom';

export const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  // ...
};
```

### 5. **Navegação**

Use `useNavigate()` para navegação programática:

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/loja/123');
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Nova Página de Produtos Públicos

```tsx
// 1. Criar componente
// src/pages/public/Products/Products.tsx
export const Products: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  return <div>Produtos da Loja {storeId}</div>;
};

// 2. Adicionar lazy import no App.tsx
const Products = lazy(() => 
  import('@/pages/public/Products/Products').then(m => ({ default: m.Products }))
);

// 3. Adicionar rota
<Route element={<PublicLayoutWrapper />}>
  <Route path="/loja/:storeId/produtos" element={<Products />} />
</Route>
```

### Exemplo 2: Nova Página no Dashboard Merchant

```tsx
// 1. Criar componente
// src/pages/merchant/analytics/Analytics.tsx
export const Analytics: React.FC = () => {
  return <div>Analytics</div>;
};

// 2. Adicionar lazy import no App.tsx
const Analytics = lazy(() => 
  import('@/pages/merchant/analytics/Analytics').then(m => ({ default: m.Analytics }))
);

// 3. Adicionar rota dentro de MerchantLayout
<Route path="/merchant" element={<MerchantLayout />}>
  <Route path="analytics" element={<Analytics />} />
</Route>
```

### Exemplo 3: Criar Novo Wrapper para Rotas Especiais

Se precisar de um novo conjunto de providers:

```tsx
// 1. Criar wrapper
// src/components/layout/AdminLayoutWrapper.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider } from '@/contexts';

export const AdminLayoutWrapper: React.FC = () => {
  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
};

// 2. Usar no App.tsx
<Route element={<AdminLayoutWrapper />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

---

## 🔧 Troubleshooting

### Problema: Página em Branco

**Causa:** Falta `<Outlet />` no wrapper

**Solução:**
```tsx
// ❌ ERRADO
export const MyWrapper = () => (
  <AuthProvider>
    <CartProvider />
  </AuthProvider>
);

// ✅ CORRETO
export const MyWrapper = () => (
  <AuthProvider>
    <CartProvider>
      <Outlet /> {/* ← Adicionar Outlet */}
    </CartProvider>
  </AuthProvider>
);
```

### Problema: Providers não funcionam nas rotas filhas

**Causa:** Providers fora do wrapper

**Solução:**
```tsx
// ❌ ERRADO
<Route element={<MyPage />}>
  {/* Providers não disponíveis aqui */}
</Route>

// ✅ CORRETO
<Route element={<PublicLayoutWrapper />}>
  <Route path="/page" element={<MyPage />} />
</Route>
```

### Problema: Rotas não carregam (lazy loading)

**Causa:** Export default incorreto

**Solução:**
```tsx
// ❌ ERRADO
const MyPage = lazy(() => import('@/pages/MyPage'));

// ✅ CORRETO
const MyPage = lazy(() => 
  import('@/pages/MyPage').then(m => ({ default: m.MyPage }))
);
```

### Problema: Rotas não encontradas (404)

**Causa:** Path incorreto ou rota não registrada

**Solução:**
1. Verificar se a rota está dentro do `<Routes>`
2. Verificar se o path está correto
3. Verificar se o componente está exportado corretamente

---

## 📝 Checklist para Novas Rotas

- [ ] Identificar tipo de rota (pública, merchant, isolada)
- [ ] Criar componente da página
- [ ] Adicionar lazy import (se necessário)
- [ ] Adicionar rota no App.tsx dentro do wrapper correto
- [ ] Testar navegação
- [ ] Verificar se providers estão disponíveis (se necessário)
- [ ] Verificar se parâmetros de rota funcionam (se houver)

---

## 🔗 Referências

- [React Router v6 Documentation](https://reactrouter.com/en/main)
- [Outlet Component](https://reactrouter.com/en/main/components/outlet)
- [Lazy Loading Routes](https://reactrouter.com/en/main/route/lazy)

---

## 🔗 Rotas por Slug de Loja

### Acesso Direto por Slug

O sistema suporta acesso direto à loja usando apenas o slug na URL:

- ✅ `/vex-sushi` → Acessa a loja com slug "vex-sushi"
- ✅ `/kampai-sushi` → Acessa a loja com slug "kampai-sushi"
- ✅ `/loja/vex-sushi` → Também funciona (rota alternativa)

### Como Funciona

1. **Detecção Automática**: A API detecta automaticamente se o parâmetro é UUID ou slug
2. **Endpoint Único**: Usa sempre `/api/stores/[storeId]` - a API trata ambos os casos
3. **Ordem de Rotas**: A rota genérica `/:storeId` deve vir **por último** para não capturar outras rotas

### Exemplo de Configuração

```tsx
<Routes>
  {/* Rotas específicas primeiro */}
  <Route path="/merchant/login" element={<MerchantLogin />} />
  <Route path="/merchant" element={<MerchantLayout />}>
    {/* ... */}
  </Route>

  {/* Rotas públicas específicas */}
  <Route element={<PublicLayoutWrapper />}>
    <Route path="/" element={<StoreFront />} />
    <Route path="/loja/:storeId" element={<StorePage />} />
    
    {/* Rota genérica por slug - DEVE VIR POR ÚLTIMO */}
    <Route path="/:storeId" element={<StorePage />} />
  </Route>
</Routes>
```

### Importante

⚠️ **Ordem das Rotas**: A rota `/:storeId` deve sempre vir **depois** de todas as rotas específicas para evitar conflitos.

---

## 📅 Histórico de Alterações

- **2024-12-20**: Criado guia após correção do problema de página em branco nas rotas públicas
- **2024-12-20**: Implementado `PublicLayoutWrapper` para resolver problema de `<Outlet />` ausente
- **2024-12-20**: Adicionado suporte para rotas por slug direto (ex: `/vex-sushi`)

