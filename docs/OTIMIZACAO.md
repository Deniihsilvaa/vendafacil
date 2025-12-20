# Guia de Otimização - Code Splitting e Lazy Loading

## 📚 Índice
1. [O que é Code Splitting](#code-splitting)
2. [O que é Lazy Loading](#lazy-loading)
3. [Onde Aplicar no Projeto](#onde-aplicar)
4. [Implementação Prática](#implementação)
5. [Prioridades de Otimização](#prioridades)

---

## 🎯 Code Splitting

### O que é?
Dividir o código em partes menores (chunks) que são carregadas apenas quando necessário, em vez de carregar tudo de uma vez.

### Benefícios:
- ✅ Carregamento inicial mais rápido
- ✅ Menor uso de banda
- ✅ Melhor performance percebida pelo usuário

---

## ⚡ Lazy Loading

### O que é?
Técnica de carregar componentes/módulos apenas quando o usuário realmente precisa deles.

### Benefícios:
- ✅ Bundle inicial menor
- ✅ Páginas carregam mais rápido
- ✅ Economia de recursos

---

## 🎯 Onde Aplicar no Projeto

### 1. **Rotas/Páginas** (PRIORIDADE ALTA 🔴)

**Por quê?** Usuários raramente visitam todas as páginas em uma sessão.

**Onde aplicar:**

#### **Área do Merchant (Lojista)**
```
src/pages/merchant/
├── dashboard/MerchantDashboard.tsx      ← Lazy load
├── products/
│   ├── ProductManagement.tsx            ← Lazy load
│   └── ProductCreate.tsx                ← Lazy load
├── orders/MerchantOrders.tsx            ← Lazy load
├── settings/MerchantSettings.tsx        ← Lazy load
└── login/MerchantLogin.tsx              ← Lazy load
```

#### **Área do Customer (Cliente)**
```
src/pages/customer/
├── profile/Profile.tsx                  ← Lazy load
└── orders/ListOrders.tsx                ← Lazy load
```

#### **Páginas Públicas**
```
src/pages/public/
├── StoreFront/StoreFront.tsx            ← Manter normal (página inicial)
├── StorePage/StorePage.tsx              ← Manter normal (página principal)
└── Checkout/Checkout.tsx                ← Lazy load (só usa quem vai comprar)
```

---

### 2. **Componentes Grandes** (PRIORIDADE MÉDIA 🟡)

**Por quê?** Componentes pesados que não são sempre necessários.

**Onde aplicar:**

```
src/components/
├── business/
│   ├── order/OrderCard.tsx              ← Lazy load (só na lista de pedidos)
│   └── product/ProductCard.tsx          ← Manter normal (usado sempre)
└── layout/
    ├── MerchantLayout.tsx               ← Lazy load
    └── StoreLayout.tsx                  ← Manter normal (layout principal)
```

---

### 3. **Bibliotecas Grandes** (PRIORIDADE ALTA 🔴)

**Por quê?** Bibliotecas pesadas aumentam muito o bundle.

**Onde aplicar:**

```typescript
// Ícones (lucide-react é grande)
// Em vez de importar tudo:
import { Home, User, Settings } from 'lucide-react'; // ❌

// Importe sob demanda:
const HomeIcon = lazy(() => import('lucide-react').then(m => ({ default: m.Home }))); // ✅
```

```typescript
// Charts/Gráficos (se usar)
const Chart = lazy(() => import('react-chartjs-2')); // ✅

// Editores de texto ricos
const RichEditor = lazy(() => import('@/components/RichEditor')); // ✅

// Mapas
const MapComponent = lazy(() => import('@/components/Map')); // ✅
```

---

### 4. **Modais e Overlays** (PRIORIDADE BAIXA 🟢)

**Por quê?** Só são usados em interações específicas.

**Onde aplicar:**

```
src/components/ui/
├── modals/
│   ├── ConfirmDialog.tsx                ← Lazy load
│   └── ImagePreview.tsx                 ← Lazy load
└── overlays/
    └── CheckoutAuthOverlay.tsx          ← Lazy load
```

---

## 💻 Implementação Prática

### 1. Lazy Loading de Rotas (Recomendado - COMECE AQUI)

**Arquivo:** `src/App.tsx`

**❌ ANTES (Atual):**
```typescript
import { MerchantDashboard } from '@/pages/merchant/dashboard';
import { MerchantProducts } from '@/pages/merchant/products';
import { MerchantOrdersPage } from '@/pages/merchant/orders';
import { MerchantSettings } from '@/pages/merchant/settings';
import { Profile } from '@/pages/customer/profile';
import { Checkout } from '@/pages/public/Checkout';
```

**✅ DEPOIS (Otimizado):**
```typescript
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Componente de Loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load das páginas
const MerchantDashboard = lazy(() => import('@/pages/merchant/dashboard/MerchantDashboard'));
const MerchantProducts = lazy(() => import('@/pages/merchant/products/ProductManagement'));
const ProductCreate = lazy(() => import('@/pages/merchant/products/ProductCreate'));
const MerchantOrdersPage = lazy(() => import('@/pages/merchant/orders/MerchantOrders'));
const MerchantSettings = lazy(() => import('@/pages/merchant/settings/MerchantSettings'));
const MerchantLogin = lazy(() => import('@/pages/merchant/login/MerchantLoginWithContext'));
const Profile = lazy(() => import('@/pages/customer/profile/Profile'));
const OrdersList = lazy(() => import('@/pages/customer/orders/ListOrders'));
const Checkout = lazy(() => import('@/pages/public/Checkout/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/customer/orders/OrderConfirmation'));

function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ... suas rotas aqui ... */}
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}
```

---

### 2. Lazy Loading de Componentes Grandes

**❌ ANTES:**
```typescript
import { OrderCard } from '@/components/business/order/OrderCard';

export const OrdersList = () => {
  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
```

**✅ DEPOIS:**
```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const OrderCard = lazy(() => import('@/components/business/order/OrderCard'));

const OrderCardSkeleton = () => (
  <div className="p-4 border rounded">
    <Skeleton className="h-20 w-full" />
  </div>
);

export const OrdersList = () => {
  return (
    <div>
      <Suspense fallback={<OrderCardSkeleton />}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Suspense>
    </div>
  );
};
```

---

### 3. Lazy Loading de Modais

**❌ ANTES:**
```typescript
import { ConfirmDialog } from '@/components/ui/modals/ConfirmDialog';

export const ProductList = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      {showConfirm && <ConfirmDialog onConfirm={...} />}
    </>
  );
};
```

**✅ DEPOIS:**
```typescript
import { lazy, Suspense } from 'react';

const ConfirmDialog = lazy(() => import('@/components/ui/modals/ConfirmDialog'));

export const ProductList = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      {showConfirm && (
        <Suspense fallback={null}>
          <ConfirmDialog onConfirm={...} />
        </Suspense>
      )}
    </>
  );
};
```

---

### 4. Code Splitting Manual (Vite Config)

**Arquivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (bibliotecas externas)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'sonner'],
          
          // Chunks por funcionalidade
          'merchant': [
            './src/pages/merchant/dashboard/MerchantDashboard',
            './src/pages/merchant/products/ProductManagement',
            './src/pages/merchant/orders/MerchantOrders',
            './src/pages/merchant/settings/MerchantSettings',
          ],
          'customer': [
            './src/pages/customer/profile/Profile',
            './src/pages/customer/orders/ListOrders',
          ],
          'checkout': [
            './src/pages/public/Checkout/Checkout',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Avisar se chunks > 500kb
  },
});
```

---

## 🎯 Prioridades de Otimização

### **Fase 1 - Quick Wins** (Implementar AGORA)

1. ✅ **Lazy load de todas as rotas** (`App.tsx`)
   - **Impacto:** Alto
   - **Esforço:** Baixo
   - **Tempo:** 30 minutos

2. ✅ **Lazy load do Checkout**
   - **Impacto:** Médio
   - **Esforço:** Baixo
   - **Tempo:** 10 minutos

3. ✅ **Lazy load das páginas de Merchant**
   - **Impacto:** Alto
   - **Esforço:** Baixo
   - **Tempo:** 20 minutos

**Ganho esperado:** ~40% de redução no bundle inicial

---

### **Fase 2 - Otimizações Médias** (Implementar depois)

4. ⚠️ **Code splitting manual (vite.config.ts)**
   - **Impacto:** Médio
   - **Esforço:** Médio
   - **Tempo:** 1 hora

5. ⚠️ **Lazy load de componentes grandes**
   - **Impacto:** Médio
   - **Esforço:** Médio
   - **Tempo:** 2 horas

**Ganho esperado:** ~20% adicional de redução

---

### **Fase 3 - Refinamento** (Opcional)

6. 🔵 **Preload de rotas importantes**
7. 🔵 **Prefetch de dados**
8. 🔵 **Service Worker para cache**

---

## 📊 Medindo o Impacto

### Antes da Otimização:
```
Main bundle: 825.67 kB (comprimido: 230.82 kB)
```

### Após Fase 1 (esperado):
```
Main bundle: ~400-500 kB (comprimido: ~120-140 kB)
Merchant chunk: ~150 kB
Customer chunk: ~100 kB
Checkout chunk: ~80 kB
```

### Ferramentas para Medir:
- **Lighthouse** (Chrome DevTools)
- **Bundle Analyzer**: `npm install --save-dev rollup-plugin-visualizer`

---

## ⚠️ Cuidados Importantes

### ❌ NÃO faça Lazy Loading de:

1. **Componentes de Layout principais** (Header, Footer)
2. **Página inicial/Home**
3. **Componentes usados em TODAS as páginas**
4. **Componentes muito pequenos** (< 10 KB)
5. **Hooks e utilitários**

### ✅ SEMPRE use Suspense com:

```typescript
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### ✅ Use Named Exports corretamente:

```typescript
// ❌ ERRADO
export default function MyComponent() { ... }
const Lazy = lazy(() => import('./MyComponent'));

// ✅ CORRETO
export function MyComponent() { ... }
const Lazy = lazy(() => import('./MyComponent').then(m => ({ default: m.MyComponent })));

// OU mantenha default export
export default function MyComponent() { ... }
const Lazy = lazy(() => import('./MyComponent'));
```

---

## 🚀 Próximos Passos

### Comece por aqui:

1. **Crie o componente de Loading**
   ```bash
   # Criar em src/components/shared/PageLoader.tsx
   ```

2. **Atualize App.tsx com lazy loading**
   ```bash
   # Modificar src/App.tsx
   ```

3. **Teste cada rota**
   ```bash
   npm run dev
   # Navegue por todas as páginas
   ```

4. **Faça build e compare**
   ```bash
   npm run build
   # Compare os tamanhos antes e depois
   ```

---

## 📚 Recursos Adicionais

- [React Docs - Code Splitting](https://react.dev/reference/react/lazy)
- [Vite Docs - Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [Web.dev - Code Splitting](https://web.dev/code-splitting-suspense/)

---

## ✅ Checklist de Implementação

- [ ] Criar componente PageLoader
- [ ] Converter rotas para lazy loading
- [ ] Adicionar Suspense em todas as rotas
- [ ] Testar navegação em todas as páginas
- [ ] Fazer build e comparar tamanhos
- [ ] Configurar manualChunks (opcional)
- [ ] Medir com Lighthouse
- [ ] Documentar ganhos obtidos

---

**Última atualização:** 20/12/2025
**Status:** Pronto para implementação

