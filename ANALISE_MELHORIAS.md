# 📊 Análise de Melhorias - Venda Fácil

## 🔍 Pontos Críticos Identificados

### 1. **Ausência de Cliente API Centralizado** ❌
- **Problema**: Não existe um cliente HTTP padronizado para todas as requisições
- **Impacto**: Dificulta manutenção, não há tratamento de erros consistente
- **Solução**: Criar `ApiClient` centralizado com interceptors

### 2. **Dados Mockados Espalhados** ⚠️
- **Problema**: Dados mock em múltiplos arquivos (`mockStores.ts`, `mockProducts.ts`, `mockData.ts`)
- **Impacto**: Dificulta migração para API real
- **Solução**: Centralizar mocks e criar camada de abstração

### 3. **Falta de Tratamento de Erros Padronizado** ✅
- **Problema**: Erros apenas logados no console, não há feedback visual consistente
- **Impacto**: Usuário não sabe o que aconteceu quando API falha
- **Solução**: ✅ Implementado com Toast-Sonner do shadcn/ui
  - Componente `Toaster` adicionado ao App
  - Utilitários `showErrorToast`, `showSuccessToast`, etc. em `@/utils/toast`
  - Integração nos services (StoreService, AuthService) para exibir erros automaticamente
  - Mensagens amigáveis baseadas em códigos de erro (NETWORK_ERROR, TIMEOUT, etc.)

### 4. **Services Incompletos** ⚠️
- **Problema**: `StoreApiService` existe mas está todo comentado
- **Impacto**: Não há estrutura pronta para integração
- **Solução**: Implementar serviços completos usando ApiClient

### 5. **Contexts Usando Mocks Diretamente** ✅
- **Problema**: `StoreContext`, `AuthContext` usam funções mock diretamente
- **Impacto**: Dificulta troca para API real
- **Solução**: ✅ Implementado - Contexts agora usam Services que abstraem mock/API
  - `StoreContext` usa `StoreService.getAllStores()`
  - `AuthContext` usa `AuthService.customerLogin()`, `AuthService.merchantLogin()`, `AuthService.logout()`, `AuthService.updateProfile()`
  - `useStoreById` hook usa `StoreService.getStoreById()`, `StoreService.getStoreProducts()`, `StoreService.getStoreCategories()`
  - Erros são exibidos via toast automaticamente

### 6. **Falta de Tipos para Requisições/Respostas** ❌
- **Problema**: Não há interfaces padronizadas para requests/responses da API
- **Impacto**: Dificulta type-safety e manutenção
- **Solução**: Criar tipos em `types/api.ts`

### 7. **Sem Configuração de Ambiente** ❌
- **Problema**: URL da API hardcoded (comentada)
- **Impacto**: Dificulta diferentes ambientes (dev/staging/prod)
- **Solução**: Usar variáveis de ambiente

### 8. **Hooks sem Tratamento de Erro** ⚠️
- **Problema**: `useStoreById` tenta cache mas não mostra erro ao usuário
- **Impacto**: Experiência ruim quando API falha
- **Solução**: Retornar erros estruturados e mostrar na UI

## ✅ Plano de Implementação

### Fase 1: Infraestrutura Base
1. ✅ Criar `ApiClient` centralizado
2. ✅ Criar tipos de API (`ApiResponse`, `ApiError`)
3. ✅ Configurar variáveis de ambiente
4. ✅ Criar utilitários de erro

### Fase 2: Services
5. ✅ Implementar `StoreService`
6. ✅ Implementar `AuthService`
7. ✅ Implementar `ProductService`
8. ✅ Implementar `OrderService`

### Fase 3: UI de Erros
9. ✅ Criar `ErrorBoundary` component
10. ✅ Criar `ErrorDisplay` component
11. ✅ Criar `LoadingState` component

### Fase 4: Integração
12. ✅ Atualizar `StoreContext` para usar `StoreService`
13. ✅ Atualizar `AuthContext` para usar `AuthService`
14. ✅ Atualizar `useStoreById` para usar services
15. ✅ Atualizar páginas para mostrar erros

### Fase 5: Mock/API Toggle
16. ✅ Criar flag para usar mock ou API real
17. ✅ Manter compatibilidade durante transição

## 📁 Estrutura Proposta

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts          # Cliente HTTP centralizado
│   │   ├── types.ts           # Tipos de requisições/respostas
│   │   ├── interceptors.ts    # Interceptors (auth, errors)
│   │   └── endpoints.ts       # URLs da API
│   ├── storeService.ts        # Service para lojas
│   ├── authService.ts         # Service para autenticação
│   ├── productService.ts      # Service para produtos
│   └── orderService.ts        # Service para pedidos
├── components/
│   └── shared/
│       ├── ErrorBoundary/
│       ├── ErrorDisplay/
│       └── LoadingState/
├── types/
│   └── api.ts                 # Tipos da API
└── config/
    └── env.ts                 # Configuração de ambiente
```
