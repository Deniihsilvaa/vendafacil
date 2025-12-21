# Guia de Uso do MerchantAuthContext

## 📚 Visão Geral

Criamos dois contextos de autenticação separados:
- **AuthContext** (AuthProvider): Para **Customers** (clientes)
- **MerchantAuthContext** (MerchantAuthProvider): Para **Merchants** (lojistas)

## 🎯 Por que separar?

1. **Clareza**: Cada contexto tem responsabilidades específicas
2. **Tipo seguro**: Evita confusão entre Customer e Merchant
3. **Manutenção**: Mais fácil de manter e debugar
4. **Escalabilidade**: Permite evoluir cada contexto independentemente

## 📂 Estrutura de Arquivos

```
src/
├── contexts/
│   ├── AuthContext.tsx                 # Para Customers
│   ├── MerchantAuthContext.tsx         # Para Merchants
│   └── Definitions/
│       ├── AuthContextDefinition.ts
│       └── MerchantAuthContextDefinition.ts
├── types/
│   ├── auth.ts                         # Tipos comuns
│   ├── customerAuth.ts                 # Tipos específicos de Customer
│   └── merchantAuth.ts                 # Tipos específicos de Merchant
└── hooks/
    ├── useCustomerAuth.ts              # Hook para Customer
    └── useMerchantAuth.ts              # Hook para Merchant
```

## 🔧 Como Usar

### Para Rotas de Customer (Público)

No `App.tsx`, as rotas públicas continuam usando o `AuthProvider`:

```tsx
import { AuthProvider } from '@/contexts';

function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <AuthProvider>  {/* Para customers */}
          <CartProvider>
            <Router>
              <Routes>
                <Route path="/loja/:storeId" element={<StorePage />} />
                <Route path="/loja/:storeId/checkout" element={<Checkout />} />
                {/* ... outras rotas públicas */}
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
```

**Usando o hook:**

```tsx
import { useAuthContext } from '@/hooks';
// ou
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const MyComponent = () => {
  const { customer, login, logout, loading } = useAuthContext();
  
  // ...
};
```

### Para Rotas de Merchant (Dashboard)

Crie um layout wrapper que fornece o `MerchantAuthProvider`:

```tsx
import { MerchantAuthProvider, useMerchantAuth } from '@/contexts';
import { Outlet, Navigate } from 'react-router-dom';

export const MerchantLayout: React.FC = () => {
  return (
    <MerchantAuthProvider>
      <MerchantLayoutInner />
    </MerchantAuthProvider>
  );
};

const MerchantLayoutInner: React.FC = () => {
  const { merchant, loading } = useMerchantAuth();

  if (loading) return <LoadingSpinner />;
  if (!merchant) return <Navigate to="/merchant/login" />;

  return <Outlet />;
};
```

**No App.tsx:**

```tsx
import { MerchantLayout } from '@/pages/merchant/MerchantLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas com AuthProvider */}
        <Route path="/" element={<StoreFront />} />
        
        {/* Rotas de Merchant com MerchantAuthProvider */}
        <Route path="/merchant/login" element={<MerchantLoginWithContext />} />
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route path="dashboard" element={<MerchantDashboard />} />
          <Route path="products" element={<MerchantProducts />} />
          <Route path="orders" element={<MerchantOrdersPage />} />
          <Route path="settings" element={<MerchantSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}
```

**Usando o hook:**

```tsx
import { useMerchantAuth } from '@/hooks/useMerchantAuth';

const MerchantDashboard = () => {
  const { merchant, logout, loading } = useMerchantAuth();
  
  return (
    <div>
      <h1>Bem-vindo, {merchant?.email}</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

## 📝 API dos Contextos

### CustomerAuthContextType

```typescript
interface CustomerAuthContextType {
  customer: Customer | null;
  login: (credentials: CustomerLoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCustomer: (updatedCustomer: Customer) => Promise<void>;
  loading: boolean;
}

interface CustomerLoginCredentials {
  email: string;
  password: string;
  storeId: string;  // OBRIGATÓRIO para customer
}
```

### MerchantAuthContextType

```typescript
interface MerchantAuthContextType {
  merchant: Merchant | null;
  login: (credentials: MerchantLoginCredentials) => Promise<void>;
  signup: (credentials: MerchantSignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateMerchant: (updatedMerchant: Merchant) => Promise<void>;
  loading: boolean;
}

interface MerchantLoginCredentials {
  email: string;
  password: string;
  // NÃO precisa de storeId
}
```

## 🔑 LocalStorage Keys

Para evitar conflitos, cada contexto usa keys diferentes:

### Customer
- `store-flow-customer`: Dados do customer
- `store-flow-token`: Token de autenticação
- `store-flow-refresh-token`: Token de refresh

### Merchant
- `store-flow-merchant`: Dados do merchant
- `store-flow-merchant-login-result`: Resultado completo do login
- `store-flow-token`: Token de autenticação
- `store-flow-refresh-token`: Token de refresh

## ⚠️ Importante

1. **Não misture os contextos**: Use `AuthProvider` para customers e `MerchantAuthProvider` para merchants
2. **Proteção de rotas**: Sempre verifique o tipo de usuário antes de permitir acesso
3. **Tokens compartilhados**: Ambos usam as mesmas keys de token, então apenas um pode estar logado por vez
4. **Logout completo**: Ao fazer logout, limpe todos os dados relevantes

## 🚀 Exemplo Completo

Veja os arquivos:
- `src/pages/merchant/MerchantLayout.tsx` - Layout com proteção
- `src/pages/merchant/login/MerchantLoginWithContext.tsx` - Login com contexto

## 🔄 Migração

Se você estava usando o `AuthContext` antigo para merchants:

**Antes:**
```tsx
const { user, isMerchant, loginMerchant } = useAuthContext();
```

**Depois:**
```tsx
const { merchant, login } = useMerchantAuth();
```

## 📦 Exports

```typescript
// De @/contexts
export { AuthProvider } from './AuthContext';
export { MerchantAuthProvider } from './MerchantAuthContext';

// De @/hooks
export { useAuthContext } from '@/hooks';
export { useCustomerAuth } from '@/hooks/useCustomerAuth';
export { useMerchantAuth } from '@/hooks/useMerchantAuth';
```

