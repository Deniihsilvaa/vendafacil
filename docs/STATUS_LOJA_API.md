# 🏪 Status da Loja - Integração com API

## 📋 Visão Geral

O endpoint `GET /api/stores/[storeId]` retorna automaticamente campos calculados de status da loja. O frontend deve **priorizar esses dados** em vez de calcular localmente.

---

## 🔑 Campos de Status da API

### Campos Retornados pela API

```typescript
{
  isOpen: boolean;              // Calculado automaticamente baseado nos horários
  isTemporarilyClosed: boolean; // Indica se está temporariamente fechada
  temporarily_closed: boolean;  // Campo booleano do banco de dados
}
```

### Descrição dos Campos

1. **`isOpen`** (boolean)
   - Calculado automaticamente pela API
   - Baseado nos horários de funcionamento e hora atual
   - Considera `temporarily_closed` (se `true`, sempre retorna `false`)
   - **Sempre usar este valor** quando disponível

2. **`isTemporarilyClosed`** (boolean)
   - Indica se a loja está temporariamente fechada
   - Sobrescreve os horários normais
   - Quando `true`, a loja está fechada independente dos horários

3. **`temporarily_closed`** (boolean)
   - Campo do banco de dados
   - Quando `true`, `isOpen` será sempre `false`

---

## 💻 Implementação no Frontend

### 1. Interface Store

A interface `Store` inclui os campos de status:

```typescript
export interface Store {
  // ... outros campos
  isOpen?: boolean;              // Status calculado pela API
  isTemporarilyClosed?: boolean;  // Indica fechamento temporário
  temporarilyClosed?: boolean;   // Campo do banco de dados
}
```

### 2. Transformação no StoreService

O `StoreService.getStoreById()` mapeia os campos automaticamente:

```typescript
const store: Store = {
  // ... outros campos
  isOpen: apiData.isOpen,
  isTemporarilyClosed: apiData.isTemporarilyClosed,
  temporarilyClosed: apiData.temporarily_closed,
};
```

### 3. Uso nos Componentes

**✅ CORRETO - Priorizar dados da API:**

```typescript
// Priorizar dados da API
const isStoreOpen = store?.isTemporarilyClosed 
  ? false 
  : (store?.isOpen ?? false);

// Usar cálculo local apenas para informações de horário (fallback)
const storeStatus = store ? isStoreOpen(store) : null;
```

**❌ ERRADO - Calcular sempre localmente:**

```typescript
// Não fazer isso - ignora dados da API
const storeStatus = isStoreOpen(store);
const isStoreOpen = storeStatus.isOpen;
```

---

## 📝 Exemplo de Uso

### StorePage.tsx

```typescript
export const StorePage: React.FC = () => {
  const { store } = useStoreById(storeId);
  
  // Priorizar dados da API
  const isStoreCurrentlyOpen = store 
    ? (store.isTemporarilyClosed ? false : (store.isOpen ?? false))
    : false;
  
  // Status calculado localmente (apenas para exibir detalhes de horário)
  const storeStatus = store ? isStoreOpen(store) : null;

  return (
    <div>
      {!isStoreCurrentlyOpen && (
        <div className="alert">
          {store?.isTemporarilyClosed 
            ? 'Loja fechada temporariamente' 
            : 'Loja fechada'}
        </div>
      )}
    </div>
  );
};
```

---

## 🔄 Fluxo de Dados

```
API Response (snake_case)
  ↓
StoreService.getStoreById()
  ↓
Transformação (snake_case → camelCase)
  ↓
Store (com isOpen, isTemporarilyClosed, temporarilyClosed)
  ↓
Componentes (usam dados da API)
```

---

## ⚠️ Regras Importantes

### 1. Prioridade dos Dados

1. **Primeiro**: Usar `store.isTemporarilyClosed` (sobrescreve tudo)
2. **Segundo**: Usar `store.isOpen` (calculado pela API)
3. **Terceiro**: Calcular localmente com `isStoreOpen()` (fallback)

### 2. Lógica de Status

```typescript
// Se está temporariamente fechada, sempre fechada
if (store.isTemporarilyClosed) {
  return false;
}

// Se a API calculou, usar esse valor
if (store.isOpen !== undefined) {
  return store.isOpen;
}

// Fallback: calcular localmente
return isStoreOpen(store).isOpen;
```

### 3. Mensagens ao Usuário

- **`isTemporarilyClosed = true`**: "Loja fechada temporariamente"
- **`isOpen = false`**: "Loja fechada" (com informações de horário)
- **`isOpen = true`**: Loja aberta normalmente

---

## 🧪 Testes

### Cenário 1: Loja Aberta Normalmente

```json
{
  "isOpen": true,
  "isTemporarilyClosed": false,
  "temporarily_closed": false
}
```

**Resultado esperado:** Loja aberta, produtos disponíveis

### Cenário 2: Loja Fechada Temporariamente

```json
{
  "isOpen": false,
  "isTemporarilyClosed": true,
  "temporarily_closed": true
}
```

**Resultado esperado:** Mensagem "Loja fechada temporariamente", produtos não disponíveis

### Cenário 3: Loja Fechada (Fora do Horário)

```json
{
  "isOpen": false,
  "isTemporarilyClosed": false,
  "temporarily_closed": false
}
```

**Resultado esperado:** Mensagem "Loja fechada" com informações de horário

---

## 🔗 Referências

- [API Documentation - GET /api/stores/[storeId]](../docs/API_RECOMMENDATIONS_STORE_STATUS.md)
- [StoreService - src/services/stores/storeService.ts](../src/services/stores/storeService.ts)
- [Store Type - src/types/store.ts](../src/types/store.ts)
- [StorePage - src/pages/public/StorePage/StorePage.tsx](../src/pages/public/StorePage/StorePage.tsx)

---

## 📅 Histórico de Alterações

- **2024-12-21**: Adicionados campos `isOpen`, `isTemporarilyClosed` e `temporarilyClosed` à interface `Store`
- **2024-12-21**: Atualizado `StoreService` para mapear campos de status da API
- **2024-12-21**: Atualizado `StorePage` para priorizar dados da API

