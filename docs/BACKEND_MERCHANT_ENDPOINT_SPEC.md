# 📋 Especificação: Endpoint para Atualização de Loja por Merchant

## ✅ Status: IMPLEMENTADO

**Endpoint**: `PATCH /api/merchant/stores/{storeId}`

Este documento serve como referência da especificação do endpoint que está implementado no backend e já integrado ao frontend.

---

## 📝 Histórico

### Problema Original

O endpoint `PATCH /api/auth/profile` buscava apenas por **customers** no banco, causando o erro "Cliente não encontrado" para merchants.

### Solução Implementada

Foi criado o endpoint específico **`PATCH /api/merchant/stores/{storeId}`** que:
- ✅ Busca merchant por `auth_user_id` do token JWT
- ✅ Valida propriedade da loja (se pertence ao merchant)
- ✅ Atualiza informações de forma atômica (transação)
- ✅ Retorna a loja atualizada completa

---

## 📝 Especificação do Endpoint

### **PATCH /api/merchant/stores/{storeId}**

Atualiza as informações da loja do merchant autenticado.

#### **Headers**
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### **Path Parameters**
- `storeId` (string, UUID): ID da loja a ser atualizada

#### **Body Parameters**

```typescript
{
  // Informações básicas
  "name"?: string,              // Nome da loja (mínimo 2 caracteres)
  "description"?: string,       // Descrição da loja
  "category"?: string,          // Categoria (restaurante, lanchonete, etc)
  
  // Endereço da loja
  "address"?: {
    "street": string,           // Rua (obrigatório se address enviado)
    "number": string,           // Número (obrigatório se address enviado)
    "neighborhood": string,     // Bairro (obrigatório se address enviado)
    "city": string,             // Cidade (obrigatório se address enviado)
    "state": string,            // Estado (obrigatório se address enviado)
    "zipCode": string           // CEP (obrigatório se address enviado)
  },
  
  // Horários de funcionamento
  "workingHours"?: {
    "monday"?: { "open": string, "close": string, "closed"?: boolean },
    "tuesday"?: { "open": string, "close": string, "closed"?: boolean },
    "wednesday"?: { "open": string, "close": string, "closed"?: boolean },
    "thursday"?: { "open": string, "close": string, "closed"?: boolean },
    "friday"?: { "open": string, "close": string, "closed"?: boolean },
    "saturday"?: { "open": string, "close": string, "closed"?: boolean },
    "sunday"?: { "open": string, "close": string, "closed"?: boolean }
  },
  
  // Configurações de entrega
  "settings"?: {
    "isActive"?: boolean,       // Loja ativa/inativa
    "deliveryTime"?: string,    // Tempo de entrega (ex: "30-40 min")
    "minOrderValue"?: number,   // Valor mínimo do pedido (em centavos)
    "deliveryFee"?: number,     // Taxa de entrega (em centavos)
    "freeDeliveryAbove"?: number, // Entrega grátis acima de (em centavos)
    "acceptsPayment"?: {
      "creditCard"?: boolean,
      "debitCard"?: boolean,
      "pix"?: boolean,
      "cash"?: boolean
    }
  },
  
  // Tema e cores
  "theme"?: {
    "primaryColor"?: string,    // Cor primária (hex)
    "secondaryColor"?: string,  // Cor secundária (hex)
    "accentColor"?: string,     // Cor de destaque (hex)
    "textColor"?: string        // Cor do texto (hex)
  }
}
```

#### **Exemplo de Request**

```json
{
  "name": "Pizzaria do João",
  "description": "As melhores pizzas da região",
  "category": "restaurante",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567"
  },
  "workingHours": {
    "monday": { "open": "18:00", "close": "23:00" },
    "tuesday": { "open": "18:00", "close": "23:00" },
    "wednesday": { "open": "18:00", "close": "23:00" },
    "thursday": { "open": "18:00", "close": "23:00" },
    "friday": { "open": "18:00", "close": "00:00" },
    "saturday": { "open": "18:00", "close": "00:00" },
    "sunday": { "closed": true }
  },
  "settings": {
    "isActive": true,
    "deliveryTime": "30-45 min",
    "minOrderValue": 2000,
    "deliveryFee": 500,
    "freeDeliveryAbove": 5000,
    "acceptsPayment": {
      "creditCard": true,
      "debitCard": true,
      "pix": true,
      "cash": true
    }
  },
  "theme": {
    "primaryColor": "#DC2626",
    "secondaryColor": "#2563EB",
    "accentColor": "#059669",
    "textColor": "#FFFFFF"
  }
}
```

#### **Exemplo de Response (200)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Pizzaria do João",
    "slug": "pizzaria-do-joao",
    "description": "As melhores pizzas da região",
    "category": "restaurante",
    "avatar": null,
    "banner": null,
    "rating": 4.5,
    "reviewCount": 120,
    "theme": {
      "primaryColor": "#DC2626",
      "secondaryColor": "#2563EB",
      "accentColor": "#059669",
      "textColor": "#FFFFFF"
    },
    "settings": {
      "isActive": true,
      "deliveryTime": "30-45 min",
      "minOrderValue": 2000,
      "deliveryFee": 500,
      "freeDeliveryAbove": 5000,
      "acceptsPayment": {
        "creditCard": true,
        "debitCard": true,
        "pix": true,
        "cash": true
      }
    },
    "info": {
      "address": {
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234567"
      },
      "workingHours": {
        "monday": { "open": "18:00", "close": "23:00" },
        "tuesday": { "open": "18:00", "close": "23:00" },
        "wednesday": { "open": "18:00", "close": "23:00" },
        "thursday": { "open": "18:00", "close": "23:00" },
        "friday": { "open": "18:00", "close": "00:00" },
        "saturday": { "open": "18:00", "close": "00:00" },
        "sunday": { "closed": true }
      }
    },
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-12-02T10:00:00Z"
  },
  "timestamp": "2024-12-02T10:00:00Z"
}
```

---

## 🔐 Validações de Segurança (CRÍTICAS)

### 1. **Validar userId do Token JWT**
```typescript
// ✅ CORRETO - userId vem do middleware withAuth
const userId = context.user.id; // Extraído do token JWT validado
```

### 2. **Buscar Merchant por auth_user_id**
```typescript
// ✅ CORRETO - Sempre buscar merchant pelo auth_user_id do token
const merchant = await prisma.merchants.findFirst({
  where: {
    auth_user_id: userId, // Do token JWT, não do payload
    deleted_at: null,
  },
  include: {
    stores: true, // Incluir lojas do merchant
  },
});

if (!merchant) {
  throw ApiError.notFound("Merchant não encontrado", "MERCHANT_NOT_FOUND");
}
```

### 3. **Validar Propriedade da Loja**
```typescript
// ✅ CORRETO - Validar que a loja pertence ao merchant
const store = merchant.stores.find(s => s.id === storeId);

if (!store) {
  throw ApiError.forbidden(
    "Você não tem permissão para atualizar esta loja",
    "STORE_NOT_OWNED"
  );
}

// ❌ ERRADO - NUNCA aceitar merchant_id do payload
// const merchantId = input.merchantId; // PERIGOSO!
```

### 4. **Usar Transação para Atomicidade**
```typescript
// ✅ CORRETO - Todas as operações dentro de uma transação
const updatedStore = await prisma.$transaction(async (tx) => {
  // Atualizar store
  const store = await tx.stores.update({
    where: { id: storeId },
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      // ... demais campos
    },
  });

  // Atualizar store_info (endereço, horários)
  await tx.store_info.update({
    where: { store_id: storeId },
    data: {
      address: input.address,
      working_hours: input.workingHours,
    },
  });

  return store;
});
```

### 5. **Validar Nome Único (Opcional)**
```typescript
// Se o nome da loja deve ser único por merchant
if (input.name && input.name !== store.name) {
  const nameExists = await prisma.stores.findFirst({
    where: {
      name: input.name,
      merchant_id: merchant.id,
      id: { not: storeId },
      deleted_at: null,
    },
  });

  if (nameExists) {
    throw ApiError.unprocessable({
      name: ["Este nome já está em uso para outra loja"],
    });
  }
}
```

---

## 📋 Checklist de Implementação

- [ ] Criar route handler: `PATCH /api/merchant/stores/:storeId`
- [ ] Aplicar middleware `withAuth` para validar token JWT
- [ ] Buscar merchant por `auth_user_id` (do token, não do payload)
- [ ] Validar que `storeId` pertence ao merchant autenticado
- [ ] Validar campos obrigatórios (se `address` enviado, todos os campos de endereço são obrigatórios)
- [ ] Usar transação Prisma para operações atômicas
- [ ] Atualizar tabelas: `stores`, `store_info`, `store_settings`, `store_theme`
- [ ] Retornar loja atualizada com estrutura completa
- [ ] Adicionar testes de segurança:
  - [ ] Merchant não pode atualizar loja de outro merchant
  - [ ] Campos obrigatórios são validados
  - [ ] Nome único por merchant (se aplicável)
- [ ] Adicionar logging de auditoria para mudanças em lojas
- [ ] Considerar rate limiting para prevenir abuso

---

## ⚠️ Erros Possíveis

| Status | Code | Mensagem | Causa |
|--------|------|----------|-------|
| 400 | BAD_REQUEST | Content-Type inválido | Header `Content-Type` não é `application/json` |
| 401 | UNAUTHORIZED | Não autenticado | Token JWT inválido ou ausente |
| 403 | FORBIDDEN | Sem permissão para atualizar esta loja | `storeId` não pertence ao merchant |
| 404 | MERCHANT_NOT_FOUND | Merchant não encontrado | `auth_user_id` não encontrado na tabela `merchants` |
| 404 | STORE_NOT_FOUND | Loja não encontrada | `storeId` não existe ou foi deletado |
| 422 | VALIDATION_ERROR | Dados inválidos | Campos obrigatórios ausentes ou formato inválido |
| 422 | STORE_NAME_EXISTS | Nome já cadastrado | Nome da loja já existe para o merchant |

---

## 🔍 Exemplo de Implementação (Backend)

```typescript
// routes/api/merchant/stores/[storeId].ts
import { withAuth } from '@/middleware/auth';
import { ApiError } from '@/utils/ApiError';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (req, context) => {
  const { storeId } = context.params;
  const userId = context.user.id; // Do token JWT
  
  // 1. Buscar merchant pelo auth_user_id
  const merchant = await prisma.merchants.findFirst({
    where: {
      auth_user_id: userId,
      deleted_at: null,
    },
    include: { stores: true },
  });

  if (!merchant) {
    throw ApiError.notFound("Merchant não encontrado", "MERCHANT_NOT_FOUND");
  }

  // 2. Validar propriedade da loja
  const storeExists = merchant.stores.some(s => s.id === storeId);
  if (!storeExists) {
    throw ApiError.forbidden(
      "Você não tem permissão para atualizar esta loja",
      "STORE_NOT_OWNED"
    );
  }

  // 3. Validar input
  const input = await req.json();
  // ... validações de campos obrigatórios ...

  // 4. Atualizar loja (com transação)
  const updatedStore = await prisma.$transaction(async (tx) => {
    const store = await tx.stores.update({
      where: { id: storeId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        updated_at: new Date(),
      },
    });

    if (input.address || input.workingHours) {
      await tx.store_info.update({
        where: { store_id: storeId },
        data: {
          address: input.address,
          working_hours: input.workingHours,
        },
      });
    }

    if (input.settings) {
      await tx.store_settings.update({
        where: { store_id: storeId },
        data: { ...input.settings },
      });
    }

    if (input.theme) {
      await tx.store_theme.update({
        where: { store_id: storeId },
        data: { ...input.theme },
      });
    }

    return store;
  });

  // 5. Retornar loja atualizada
  return Response.json({
    success: true,
    data: updatedStore,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 📚 Referências

- **Análise de Segurança**: `PATCH /api/auth/profile` (endpoint existente para customers)
- **Padrões de Validação**: `withAuth` middleware, validação de propriedade, transações Prisma
- **Estrutura de Dados**: Tabelas `stores`, `store_info`, `store_settings`, `store_theme`

