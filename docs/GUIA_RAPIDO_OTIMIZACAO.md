# 🚀 Guia Rápido - Implementação de Code Splitting

## ⏱️ Tempo Estimado: 30-45 minutos

---

## 📋 Passo a Passo

### **Passo 1: Backup do App.tsx atual** (2 min)

```bash
# Fazer backup
cp src/App.tsx src/App.backup.tsx
```

---

### **Passo 2: Atualizar imports no App.tsx** (10 min)

**Adicione no topo do arquivo:**

```typescript
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
```

**Adicione o componente de loading:**

```typescript
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);
```

---

### **Passo 3: Converter imports para lazy** (15 min)

**❌ Remova estes imports normais:**
```typescript
import { MerchantDashboard } from '@/pages/merchant/dashboard';
import { MerchantProducts } from '@/pages/merchant/products';
import { MerchantOrdersPage } from '@/pages/merchant/orders';
import { MerchantSettings } from '@/pages/merchant/settings';
import { MerchantLayout } from '@/pages/merchant/MerchantLayout';
import { MerchantLoginWithContext } from '@/pages/merchant/login/MerchantLoginWithContext';
import { Profile } from '@/pages/customer/profile';
import { OrderConfirmation, OrdersList } from '@/pages/customer/orders';
import { Checkout } from '@/pages/public/Checkout';
import { ProductCreate } from '@/pages/merchant/products';
```

**✅ Substitua por lazy imports:**
```typescript
// Merchant
const MerchantLoginWithContext = lazy(() => import('@/pages/merchant/login/MerchantLoginWithContext'));
const MerchantLayout = lazy(() => import('@/pages/merchant/MerchantLayout'));
const MerchantDashboard = lazy(() => import('@/pages/merchant/dashboard/MerchantDashboard'));
const MerchantProducts = lazy(() => import('@/pages/merchant/products/ProductManagement'));
const ProductCreate = lazy(() => import('@/pages/merchant/products/ProductCreate'));
const MerchantOrdersPage = lazy(() => import('@/pages/merchant/orders/MerchantOrders'));
const MerchantSettings = lazy(() => import('@/pages/merchant/settings/MerchantSettings'));

// Customer
const Profile = lazy(() => import('@/pages/customer/profile/Profile'));
const OrderConfirmation = lazy(() => import('@/pages/customer/orders/OrderConfirmation'));
const OrdersList = lazy(() => import('@/pages/customer/orders/ListOrders'));

// Checkout
const Checkout = lazy(() => import('@/pages/public/Checkout/Checkout'));
```

---

### **Passo 4: Envolver rotas com Suspense** (10 min)

**Para cada rota lazy, envolva com Suspense:**

**❌ ANTES:**
```typescript
<Route path="/merchant/login" element={<MerchantLoginWithContext />} />
```

**✅ DEPOIS:**
```typescript
<Route path="/merchant/login" element={
  <Suspense fallback={<PageLoader />}>
    <MerchantLoginWithContext />
  </Suspense>
} />
```

**Faça isso para TODAS as rotas lazy (exceto StoreFront e StorePage).**

---

### **Passo 5: Testar** (5 min)

```bash
# Rodar em desenvolvimento
npm run dev

# Teste cada rota:
# ✓ Página inicial
# ✓ Login do merchant
# ✓ Dashboard do merchant
# ✓ Produtos
# ✓ Checkout
# ✓ Perfil
```

---

### **Passo 6: Build e Comparar** (3 min)

```bash
# Fazer build
npm run build

# Verificar os tamanhos
# Antes: main-*.js ~ 825 KB
# Depois: main-*.js ~ 400-500 KB + chunks adicionais
```

---

## 📊 Resultados Esperados

### Antes:
```
dist/assets/main-*.js   825.67 kB │ gzip: 230.82 kB
```

### Depois:
```
dist/assets/main-*.js        ~450 kB │ gzip: ~130 kB
dist/assets/merchant-*.js    ~150 kB │ gzip:  ~45 kB
dist/assets/customer-*.js    ~100 kB │ gzip:  ~30 kB
dist/assets/checkout-*.js     ~80 kB │ gzip:  ~25 kB
```

**Ganho:** ~45% de redução no bundle inicial! 🎉

---

## ⚠️ Troubleshooting

### Erro: "X is not exported from..."

**Problema:** Named export não encontrado

**Solução 1:** Use default export
```typescript
const MyComponent = lazy(() => import('./MyComponent'));
```

**Solução 2:** Especifique o named export
```typescript
const MyComponent = lazy(() => 
  import('./MyComponent').then(m => ({ default: m.MyComponent }))
);
```

---

### Erro: "Cannot read property of undefined"

**Problema:** Componente não está envolvido com Suspense

**Solução:** Sempre use Suspense com lazy
```typescript
<Suspense fallback={<PageLoader />}>
  <LazyComponent />
</Suspense>
```

---

### Página em branco ou loading infinito

**Problema:** Caminho do import incorreto

**Solução:** Verifique o caminho completo do arquivo
```typescript
// ❌ ERRADO
const MyPage = lazy(() => import('@/pages/MyPage'));

// ✅ CORRETO
const MyPage = lazy(() => import('@/pages/MyPage/MyPage'));
```

---

## 📝 Checklist Final

- [ ] Backup do App.tsx criado
- [ ] Imports lazy configurados
- [ ] PageLoader criado
- [ ] Suspense adicionado em todas as rotas lazy
- [ ] Teste em desenvolvimento funcionando
- [ ] Build concluído com sucesso
- [ ] Tamanhos comparados e reduzidos
- [ ] Todas as páginas carregam corretamente

---

## 🎯 Próximas Otimizações (Opcional)

Após implementar isso, você pode:

1. **Configurar manualChunks** no vite.config.ts
2. **Adicionar Preload** para rotas importantes
3. **Implementar Prefetch** de dados
4. **Usar Bundle Analyzer** para visualizar chunks

Veja `docs/OTIMIZACAO.md` para detalhes completos.

---

## 📚 Arquivos de Referência

- `docs/OTIMIZACAO.md` - Guia completo
- `docs/App.optimized.example.tsx` - Exemplo completo
- `src/App.backup.tsx` - Backup do original

---

**Dúvidas?** Consulte a documentação completa em `docs/OTIMIZACAO.md`

**Sucesso!** 🚀 Seu bundle agora está otimizado!

