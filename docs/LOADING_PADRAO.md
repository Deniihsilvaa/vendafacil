# Padrão de Loading no Projeto

## 📋 Visão Geral

Este documento define o padrão de exibição de estados de loading (carregamento) no projeto. Todos os componentes devem seguir este padrão para garantir uma experiência de usuário consistente.

## 🎯 Componente Padrão

O projeto possui um componente centralizado para estados de loading:

**Localização:** `src/components/shared/LoadingState/LoadingState.tsx`

### Propriedades

```typescript
interface LoadingStateProps {
  message?: string;        // Mensagem a ser exibida (padrão: "Carregando informações...")
  className?: string;      // Classes CSS adicionais
  size?: 'sm' | 'md' | 'lg'; // Tamanho do spinner (padrão: 'md')
  fullScreen?: boolean;    // Se deve ocupar tela cheia com overlay (padrão: false)
}
```

### Tamanhos Disponíveis

- **sm**: `h-4 w-4` - Para loadings pequenos (botões, cards)
- **md**: `h-8 w-8` - Para loadings médios (conteúdo padrão)
- **lg**: `h-12 w-12` - Para loadings grandes (páginas principais)

## 📖 Exemplos de Uso

### 1. Loading de Página Completa

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Carregando informações..." size="lg" />
    </div>
  );
}
```

**Exemplos no projeto:**
- `src/pages/merchant/MerchantLayout.tsx:25-32`
- `src/pages/merchant/login/MerchantLogin.tsx:147-153`

### 2. Loading com Overlay (Full Screen)

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

{loading && (
  <LoadingState 
    message="Salvando... Por favor, aguarde."
    size="lg"
    fullScreen
  />
)}
```

**Exemplos no projeto:**
- `src/pages/merchant/products/ProductCreate.tsx:276-282`
- `src/pages/merchant/settings/MerchantSettings.tsx:364-372`

### 3. Loading em Seção Específica

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

if (loadingSection) {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingState size="lg" />
    </div>
  );
}
```

**Exemplos no projeto:**
- `src/pages/merchant/settings/MerchantSettings.tsx:340-348`

### 4. Loading em Card ou Container

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

if (loading) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <LoadingState size="lg" />
    </div>
  );
}
```

**Exemplos no projeto:**
- `src/pages/public/StorePage/StorePage.tsx:35-42`

### 5. Loading em Contexto de Layout

```tsx
import { LoadingState } from '@/components/shared/LoadingState';
import { MerchantLayout } from '@/components/layout/MerchantLayout';

if (loading) {
  return (
    <MerchantLayout>
      <div className="flex items-center justify-center h-64">
        <LoadingState size="lg" />
      </div>
    </MerchantLayout>
  );
}
```

### 6. Loading Pequeno (Botões)

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

<Button disabled={loading}>
  {loading ? (
    <LoadingState size="sm" className="inline-flex" />
  ) : (
    "Salvar"
  )}
</Button>
```

## ❌ O Que Evitar

### ❌ NÃO criar spinners customizados

```tsx
// ❌ ERRADO
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600">
</div>

// ✅ CORRETO
<LoadingState size="lg" />
```

### ❌ NÃO usar Loader2 diretamente

```tsx
// ❌ ERRADO
import { Loader2 } from 'lucide-react';
<Loader2 className="h-8 w-8 animate-spin text-primary" />

// ✅ CORRETO
import { LoadingState } from '@/components/shared/LoadingState';
<LoadingState size="md" />
```

### ❌ NÃO criar estruturas complexas manualmente

```tsx
// ❌ ERRADO
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
  <div className="bg-white rounded-lg p-8 shadow-2xl">
    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
    <h3>Salvando...</h3>
  </div>
</div>

// ✅ CORRETO
<LoadingState 
  message="Salvando..." 
  size="lg" 
  fullScreen 
/>
```

## 🎨 Personalização

Se você precisa de um estilo específico, use a prop `className`:

```tsx
<LoadingState 
  message="Processando..." 
  size="lg"
  className="py-12 bg-gray-50 rounded-lg"
/>
```

## 📂 Arquivos Padronizados

Todos os arquivos a seguir já utilizam o componente `LoadingState`:

1. ✅ `src/pages/merchant/products/ProductManagement.tsx`
2. ✅ `src/pages/merchant/products/ProductCreate.tsx`
3. ✅ `src/pages/merchant/MerchantLayout.tsx`
4. ✅ `src/pages/merchant/login/MerchantLogin.tsx`
5. ✅ `src/pages/public/StorePage/StorePage.tsx`
6. ✅ `src/pages/merchant/settings/MerchantSettings.tsx`
7. ✅ `src/pages/customer/orders/OrderConfirmation.tsx`
8. ✅ `src/pages/customer/orders/ListOrders.tsx`

## 🔍 Verificação

Para verificar se há algum spinner não padronizado no projeto:

```bash
# Buscar por Loader2 sendo usado diretamente
grep -r "Loader2.*animate-spin" src/

# Buscar por spinners customizados
grep -r "animate-spin rounded-full" src/
```

## 📝 Checklist para Novos Componentes

Ao criar um novo componente com loading:

- [ ] Importei `LoadingState` de `@/components/shared/LoadingState`?
- [ ] Usei o tamanho apropriado (`sm`, `md`, `lg`)?
- [ ] Adicionei uma mensagem descritiva quando necessário?
- [ ] Para operações longas, usei `fullScreen={true}`?
- [ ] Removi qualquer uso direto de `Loader2` ou spinners customizados?

## 🚀 Benefícios

- **Consistência**: Todos os loadings têm a mesma aparência e comportamento
- **Manutenção**: Alterações no estilo são feitas em um único lugar
- **Acessibilidade**: O componente pode ser facilmente adaptado para incluir atributos de acessibilidade
- **Performance**: Componente otimizado e reutilizável
- **DX (Developer Experience)**: API simples e intuitiva

## 📚 Referências

- Componente: `src/components/shared/LoadingState/LoadingState.tsx`
- Exports: `src/components/shared/LoadingState/index.ts`
- Exemplos: Ver seção "Exemplos de Uso" acima

