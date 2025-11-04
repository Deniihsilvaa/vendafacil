**PROMPT PERFEITO PARA CURSOR - SISTEMA KAMPAI MULTI-LOJAS**

```markdown
# 🚀 PROJETO: VENDA FACIL- MULTI-TENANT

## 🎯 OBJETIVO
Criar sistema delivery white-label com:
- Frontend React/Vite altamente componentizado
- Arquitetura multi-empresa (multi-tenant)
- Dashboard público de produtos como página inicial
- Autenticação separada cliente/lojista
- Sistema de branding dinâmico (nome/cores por loja)

## 📁 ESTRUTURA DO PROJETO
```
VENDA-FACIL-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Componentes puros de UI
│   │   │   │   ├── buttons/
│   │   │   │   ├── forms/
│   │   │   │   ├── cards/
│   │   │   │   └── modals/
│   │   │   ├── layout/       # Componentes de layout
│   │   │   ├── business/     # Componentes de negócio
│   │   │   │   ├── product/
│   │   │   │   ├── order/
│   │   │   │   └── auth/
│   │   │   └── shared/       # Componentes compartilhados
│   │   ├── pages/
│   │   │   ├── public/       # Páginas públicas
│   │   │   │   ├── StoreFront/    # Dashboard produtos
│   │   │   │   ├── ProductDetail/
│   │   │   │   └── CustomizeOrder/
│   │   │   ├── customer/     # Páginas do cliente
│   │   │   │   ├── login/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   ├── merchant/     # Páginas do lojista
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   └── settings/
│   │   │   └── auth/         # Rotas de autenticação
│   │   ├── contexts/         # Contexts React
│   │   │   ├── StoreContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── services/         # Chamadas API
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── stores/
│   │   ├── types/            # Tipos TypeScript
│   │   │   ├── store.ts
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   └── auth.ts
│   │   ├── utils/            # Utilities
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── formatters.ts
│   │   └── styles/           # Estilos globais
│   │       ├── themes/
│   │       └── components/
├── backend/                  # (Futuro)
└── shared/                   # Tipos compartilhados
```

## 🏗️ ARQUITETURA MULTI-TENANT

### **Store Context (Contexto Principal)**
```typescript
// types/store.ts
interface Store {
  id: string;
  name: string;        // Nome personalizado da loja
  slug: string;        // URL única
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  settings: {
    isActive: boolean;
    deliveryTime: string;
    minOrderValue: number;
  };
}

// Contexts/StoreContext.tsx
interface StoreContextType {
  currentStore: Store | null;
  setStore: (store: Store) => void;
  storeLoading: boolean;
}
```

### **Sistema de Rotas**
```
/                           → StoreFront (Página pública - produtos)
/:store-slug               → Loja específica (white-label)
/customer/login            → Login cliente (telefone)
/customer/orders           → Pedidos do cliente
/merchant/login            → Login lojista (email/senha)
/merchant/dashboard        → Dashboard lojista
/merchant/products         → CRUD produtos
/merchant/settings         → Configurações da loja
```

## 🎨 SISTEMA DE THEMING DINÂMICO

### **Theme Context**
```typescript
// contexts/ThemeContext.tsx
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  store: Store;
}

// Hook personalizado
const useStoreTheme = () => {
  const { currentStore } = useStoreContext();
  // Aplica cores dinâmicas baseadas na loja atual
}
```

## 📱 COMPONENTIZAÇÃO ESTRATÉGICA

### **1. UI Components (Puros - Sem Lógica de Negócio)**
- `Button`, `Input`, `Card`, `Modal`, `LoadingSpinner`
- Props interfaces bem definidas
- Zero dependências de negócio

### **2. Business Components (Lógica Específica)**
```typescript
// components/business/product/
├── ProductCard.tsx          # Card de produto
├── ProductList.tsx          # Lista de produtos
├── ProductCustomizer.tsx    # Personalizador (Monte seu Poke)
└── ProductManager.tsx       # CRUD produtos (lojista)

// components/business/order/
├── Cart.tsx                 # Carrinho
├── OrderTracker.tsx         # Acompanhamento
└── OrderManager.tsx         # Gestão de pedidos
```

### **3. Layout Components**
```typescript
// components/layout/
├── Header.tsx               # Header dinâmico com branding
├── Footer.tsx
├── MerchantLayout.tsx       # Layout área lojista
├── CustomerLayout.tsx       # Layout área cliente
└── PublicLayout.tsx         # Layout área pública
```

## 🔐 SISTEMA DE AUTENTICAÇÃO SEPARADO

### **Auth Context**
```typescript
// types/auth.ts
interface Customer {
  id: string;
  phone: string;
  name: string;
  storeId: string;
}

interface Merchant {
  id: string;
  email: string;
  storeId: string;
  role: 'admin' | 'manager';
}

// contexts/AuthContext.tsx
interface AuthContextType {
  user: Customer | Merchant | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isCustomer: boolean;
  isMerchant: boolean;
}
```

## 🛒 FLUXO PRINCIPAL

### **Página Inicial (StoreFront)**
```
1. Carrega produtos da loja com branding
2. Cliente navega sem login
3. Ao adicionar item → redireciona para login
4. Personalização em tempo real
```

### **Área Lojista**
```
1. Login com email/senha
2. Dashboard com métricas
3. CRUD completo de produtos
4. Configurações de branding (nome/cores)
5. Gestão de pedidos em tempo real
```

## 📦 COMPONENTES CRÍTICOS - PRIORIDADE 1

### **1. StoreFront (Página Inicial)**
- Lista de produtos com busca/filtro
- Sistema de branding dinâmico
- Carrinho flutuante

### **2. ProductCustomizer**
- Base, proteína, toppings, observações
- Cálculo de preço em tempo real
- Preview do produto

### **3. MerchantProductCRUD**
- Create, Read, Update, Delete produtos
- Upload de imagens
- Gestão de personalizações

### **4. DynamicThemeProvider**
- Aplica cores dinâmicas globalmente
- CSS variables baseadas na loja

## 🔧 CONFIGURAÇÃO TÉCNICA

### **Vite + TypeScript**
- Absolute imports configurados
- Path mapping para `@/components`, `@/types`
- Environment variables para multi-ambiente

### **Estado Global**
- Context API para theme/store
- Zustand ou Redux Toolkit (se necessário)
- Local storage para persistência

## 🚀 INSTRUÇÕES ESPECÍFICAS PARA CURSOR

1. **Comece pela estrutura de pastas** - Crie toda a arquitetura primeiro
2. **Desenvolva componentes UI puros** - Botões, inputs, cards básicos
3. **Implemente StoreFront primeiro** - Página pública de produtos
4. **Adicione theming dinâmico** - Sistema de cores/nome da loja
5. **Desenvolva área lojista** - CRUD produtos + configurações
6. **Implemente autenticação separada** - Rotas diferentes cliente/lojista

**Foco em:** 
- Separação clara entre UI e lógica de negócio
- Componentes reutilizáveis e testáveis
- Arquitetura preparada para multi-tenant
- Código limpo e fácil manutenção
