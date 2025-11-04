# 📐 Layout System - Venda Fácil

## 🎯 **Layout Único Configurável**

O sistema agora usa um **Layout único configurável** que unifica `StoreLayout` e `PublicLayout`, reduzindo duplicação de código.

## 🚀 **Uso Recomendado**

### **Layout Principal (Novo)**

```tsx
import { Layout } from '@/components/layout';

// Estilo Store (header colorido, compacto)
<Layout variant="store" showSearch={true} onSearch={handleSearch}>
  {children}
</Layout>

// Estilo Public (header branco, banner, footer)
<Layout variant="public" showBanner={true} showFooter={true}>
  {children}
</Layout>
```

## 📋 **Props Disponíveis**

```typescript
interface LayoutProps {
  children: React.ReactNode;
  variant?: 'store' | 'public';  // Estilo do layout
  
  // Header
  showSearch?: boolean;          // Exibir campo de busca
  onSearch?: (query: string) => void;  // Callback de busca
  showActions?: {               // Botões de ação
    favorites?: boolean;
    cart?: boolean;
    profile?: boolean;
  };
  
  // Banner
  showBanner?: boolean;          // Banner informativo
  
  // Footer
  showFooter?: boolean;         // Footer completo
  
  // Customização
  className?: string;            // Classes customizadas
  mainClassName?: string;        // Classes do main
}
```

## 📝 **Exemplos de Uso**

### **1. Página de Loja (Store Style)**
```tsx
<Layout 
  variant="store"
  showSearch={true}
  onSearch={(query) => setSearchQuery(query)}
  showActions={{
    favorites: true,
    cart: true,
    profile: true,
  }}
>
  <ProductList products={products} />
</Layout>
```

### **2. Página Pública (Public Style)**
```tsx
<Layout 
  variant="public"
  showBanner={true}
  showFooter={true}
  showActions={{ cart: true }}
>
  <ProductDetail product={product} />
</Layout>
```

### **3. Layout Customizado**
```tsx
<Layout 
  variant="store"
  showSearch={false}
  showActions={{ cart: true }}
  showBanner={true}  // Adiciona banner mesmo no estilo store
  className="custom-container"
>
  {children}
</Layout>
```

## 🔄 **Compatibilidade Retroativa**

Os componentes antigos ainda funcionam, mas são apenas wrappers:

```tsx
// Ainda funciona (mas usa Layout internamente)
import { StoreLayout, PublicLayout } from '@/components/layout';

<StoreLayout showSearch={true} onSearch={handleSearch}>
  {children}
</StoreLayout>

<PublicLayout>
  {children}
</PublicLayout>
```

## ⚠️ **Migração Recomendada**

**Antes:**
```tsx
import { StoreLayout } from '@/components/layout';

<StoreLayout showSearch={true} onSearch={handleSearch}>
  {children}
</StoreLayout>
```

**Depois (Recomendado):**
```tsx
import { Layout } from '@/components/layout';

<Layout 
  variant="store" 
  showSearch={true} 
  onSearch={handleSearch}
>
  {children}
</Layout>
```

## 🎨 **Variantes Visuais**

### **`variant="store"`**
- ✅ Header colorido com cor primária da loja
- ✅ Design compacto e focado
- ✅ Botões de ação: Favoritos, Carrinho, Perfil
- ✅ Mostra descrição e status da loja
- ✅ Ideal para: Páginas dentro de uma loja

### **`variant="public"`**
- ✅ Header branco/transparente com backdrop blur
- ✅ Banner informativo com badges
- ✅ Footer completo
- ✅ Carrinho flutuante mobile
- ✅ Ideal para: Landing pages, páginas públicas

## 📊 **Comparação**

| Característica | `variant="store"` | `variant="public"` |
|---------------|------------------|-------------------|
| Header | Colorido (primary) | Branco/transparente |
| Busca | Opcional | Opcional |
| Banner | Opcional | Opcional |
| Footer | Opcional | Opcional |
| Botões | Favoritos, Carrinho, Perfil | Apenas Carrinho |
| Uso | Páginas de loja | Páginas públicas |

## 🛠️ **Benefícios**

1. ✅ **Zero duplicação** - Um único componente
2. ✅ **Flexibilidade** - Configuração granular via props
3. ✅ **Compatibilidade** - Componentes antigos ainda funcionam
4. ✅ **Manutenção** - Uma única fonte de verdade
5. ✅ **TypeScript** - Totalmente tipado

---

**Última atualização:** 2024-11-03
