# Changelog - Separação dos Contextos de Autenticação

## 🎯 Objetivo

Separar os contextos de autenticação para Customer e Merchant, evitando conflitos e melhorando a manutenibilidade do código.

## ✅ O que foi feito

### 1. Criação do MerchantAuthContext

**Novos arquivos criados:**
- `src/contexts/MerchantAuthContext.tsx` - Contexto específico para Merchants
- `src/contexts/Definitions/MerchantAuthContextDefinition.ts` - Definição do contexto
- `src/types/merchantAuth.ts` - Tipos específicos para autenticação de Merchants
- `src/hooks/useMerchantAuth.ts` - Hook para acessar o contexto de Merchant

**Características:**
- Login sem necessidade de `storeId` (apenas email e senha)
- Gerencia múltiplas lojas do merchant
- Salva dados em `store-flow-merchant` no localStorage
- Auto-refresh de token compartilhado com Customer

### 2. Refatoração do AuthContext (Customer)

**Arquivos atualizados:**
- `src/contexts/AuthContext.tsx` - Agora focado apenas em Customers
- `src/types/customerAuth.ts` - Tipos específicos para autenticação de Customers
- `src/hooks/useCustomerAuth.ts` - Hook alternativo para Customer

**Características:**
- Login requer `storeId` obrigatório
- Gerencia apenas um customer por vez
- Salva dados em `store-flow-customer` no localStorage
- Mantém compatibilidade com `useAuthContext()`

### 3. Atualização da Estrutura de Rotas

**Arquivo atualizado:**
- `src/App.tsx` - Reestruturado para usar contextos separados

**Nova estrutura:**
```tsx
<Router>
  {/* Rotas públicas/customer com AuthProvider */}
  <Route element={<AuthProvider>...</AuthProvider>}>
    <Route path="/" element={<StoreFront />} />
    <Route path="/loja/:storeId" element={<StorePage />} />
    <Route path="/loja/:storeId/checkout" element={<Checkout />} />
    {/* ... */}
  </Route>
  
  {/* Login do Merchant */}
  <Route path="/merchant/login" element={<MerchantLoginWithContext />} />
  
  {/* Rotas protegidas do Merchant com MerchantAuthProvider */}
  <Route path="/merchant" element={<MerchantLayout />}>
    <Route path="dashboard" element={<MerchantDashboard />} />
    <Route path="orders" element={<MerchantOrdersPage />} />
    <Route path="products" element={<MerchantProducts />} />
    <Route path="settings" element={<MerchantSettings />} />
  </Route>
</Router>
```

### 4. Criação de Componentes de Layout

**Novos arquivos:**
- `src/pages/merchant/MerchantLayout.tsx` - Layout wrapper com proteção de rotas
- `src/pages/merchant/login/MerchantLoginWithContext.tsx` - Wrapper para login

**Características:**
- Proteção automática de rotas (redireciona para login se não autenticado)
- Loading state durante verificação de autenticação
- Fornece `MerchantAuthProvider` para rotas filhas

### 5. Atualização das Páginas de Merchant

**Arquivos atualizados:**
- `src/pages/merchant/login/MerchantLogin.tsx`
- `src/pages/merchant/dashboard/MerchantDashboard.tsx`
- `src/pages/merchant/settings/MerchantSettings.tsx`
- `src/pages/merchant/products/ProductManagement.tsx`

**Mudanças:**
- `useAuthContext()` → `useMerchantAuth()`
- `user` → `merchant`
- `loginMerchant` → `login`
- `signupMerchant` → `signup`
- `isMerchant` → removido (sempre é merchant nesse contexto)
- `store-flow-user` → `store-flow-merchant` no localStorage

## 📦 LocalStorage Keys

### Customer
- `store-flow-customer` - Dados do customer
- `store-flow-token` - Token de autenticação
- `store-flow-refresh-token` - Token de refresh

### Merchant
- `store-flow-merchant` - Dados do merchant
- `store-flow-merchant-login-result` - Resultado completo do login
- `store-flow-token` - Token de autenticação (compartilhado)
- `store-flow-refresh-token` - Token de refresh (compartilhado)

## 🔧 Como Usar

### Para páginas de Customer (público)

```tsx
import { useAuthContext } from '@/hooks';
// ou
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const MyComponent = () => {
  const { customer, login, logout, loading } = useAuthContext();
  
  const handleLogin = async () => {
    await login({
      email: 'customer@example.com',
      password: 'password',
      storeId: 'store-123' // OBRIGATÓRIO
    });
  };
};
```

### Para páginas de Merchant (dashboard)

```tsx
import { useMerchantAuth } from '@/hooks/useMerchantAuth';

const MerchantPage = () => {
  const { merchant, login, logout, loading } = useMerchantAuth();
  
  const handleLogin = async () => {
    await login({
      email: 'merchant@example.com',
      password: 'password'
      // NÃO precisa de storeId
    });
  };
  
  // Acessar lojas do merchant
  const stores = merchant?.stores || [];
  const activeStore = stores.find(s => s.is_active);
};
```

## ⚠️ Breaking Changes

### Para desenvolvedores

1. **Rotas de Merchant**: Agora devem estar dentro de `<Route path="/merchant" element={<MerchantLayout />}>`
2. **Login de Merchant**: Use `MerchantLoginWithContext` no lugar de `MerchantLogin` direto
3. **Hooks**: Use `useMerchantAuth()` para merchant e `useAuthContext()` para customer
4. **Props**: `user` foi renomeado para `customer` ou `merchant` conforme o contexto

### Para usuários finais

- Não há mudanças visíveis
- Merchants precisarão fazer login novamente (tokens antigos não são compatíveis)
- Customers precisarão fazer login novamente

## 🐛 Correções

1. ✅ Login de Customer agora funciona corretamente (não é mais afetado por mudanças do Merchant)
2. ✅ Login de Merchant não requer mais `storeId`
3. ✅ Proteção de rotas automática para páginas de Merchant
4. ✅ Melhor separação de responsabilidades
5. ✅ Tipos mais seguros e específicos para cada contexto

## 📚 Documentação

- `MERCHANT_AUTH_GUIDE.md` - Guia completo de uso dos contextos
- `CHANGELOG_AUTH_CONTEXTS.md` - Este arquivo com o resumo das mudanças

## 🚀 Próximos Passos

1. Testar login de Customer em produção
2. Testar login de Merchant em produção
3. Verificar se há outras páginas que usam `useAuthContext` e precisam ser atualizadas
4. Adicionar testes unitários para os novos contextos
5. Documentar melhor a estrutura de permissões (admin vs manager)

## 📝 Notas

- Os tokens são compartilhados entre Customer e Merchant (mesmo `store-flow-token`)
- Apenas um usuário pode estar logado por vez (Customer OU Merchant)
- O auto-refresh de token funciona para ambos os contextos
- As páginas públicas (StoreFront, StorePage) não precisam de autenticação

