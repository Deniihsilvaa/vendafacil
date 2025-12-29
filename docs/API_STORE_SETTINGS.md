# 📚 Documentação - API Store Settings

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura dos Endpoints](#estrutura-dos-endpoints)
3. [Autenticação](#autenticação)
4. [Endpoints](#endpoints)
   - [1. Informações Básicas](#1-informações-básicas)
   - [2. Endereço](#2-endereço)
   - [3. Horários de Funcionamento](#3-horários-de-funcionamento)
   - [4. Configurações de Entrega](#4-configurações-de-entrega)
   - [5. Métodos de Pagamento](#5-métodos-de-pagamento)
   - [6. Tema](#6-tema)
5. [Respostas da API](#respostas-da-api)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

Esta documentação descreve os endpoints para atualização parcial das configurações de uma loja. Cada endpoint permite atualizar uma seção específica das configurações, proporcionando maior controle e melhor performance.

### Base URL
```
/api/merchant/stores/{storeId}/settings
```

### Método HTTP
Todos os endpoints utilizam o método **`PATCH`** para atualização parcial.

### Status de Implementação

- ✅ `PATCH /api/merchant/stores/[storeId]/settings/basic-info` - Atualizar informações básicas
- ✅ `PATCH /api/merchant/stores/[storeId]/settings/address` - Atualizar endereço
- ✅ `PATCH /api/merchant/stores/[storeId]/settings/working-hours` - Atualizar horários de funcionamento
- ✅ `PATCH /api/merchant/stores/[storeId]/settings/delivery-settings` - Atualizar configurações de entrega
- ✅ `PATCH /api/merchant/stores/[storeId]/settings/payment-methods` - Atualizar métodos de pagamento
- ✅ `PATCH /api/merchant/stores/[storeId]/settings/theme` - Atualizar tema e cores

---

## 📐 Estrutura dos Endpoints

Todos os endpoints seguem o padrão:

```
PATCH /api/merchant/stores/{storeId}/settings/{secao}
```

Onde:
- `{storeId}` é o UUID da loja
- `{secao}` é o nome da seção a ser atualizada

### Seções Disponíveis:

1. `basic-info` - Informações básicas (nome, slug, descrição, categoria)
2. `address` - Endereço da loja
3. `working-hours` - Horários de funcionamento
4. `delivery-settings` - Configurações de entrega
5. `payment-methods` - Métodos de pagamento
6. `theme` - Tema e cores

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via JWT no header:

```
Authorization: Bearer {token}
```

O usuário deve ser:
- ✅ Merchant autenticado
- ✅ Dono da loja OU membro da loja (`store_merchant_members`)
- ✅ Loja deve existir e estar ativa (ou permitir atualização de lojas inativas conforme regra de negócio)

---

## 📡 Endpoints

### 1. Informações Básicas

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/basic-info
```

#### Descrição
Atualiza informações básicas da loja: nome, slug, descrição e categoria.

#### Request Body
```json
{
  "name": "string (opcional)",
  "slug": "string (opcional)",
  "description": "string (opcional)",
  "category": "string (opcional)"
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `name` | string | Não | Nome da loja | Máximo 255 caracteres |
| `slug` | string | Não | Slug único para URL | Apenas letras minúsculas, números e hífens. Deve ser único. |
| `description` | string | Não | Descrição da loja | Máximo 1000 caracteres |
| `category` | string | Não | Categoria da loja | Valores válidos: `hamburgueria`, `pizzaria`, `pastelaria`, `sorveteria`, `cafeteria`, `padaria`, `comida_brasileira`, `comida_japonesa`, `doces`, `mercado`, `outros` |

#### Exemplo de Request
```json
{
  "name": "Vex Sushi",
  "slug": "vex-sushi",
  "description": "Sushi de qualidade premium",
  "category": "comida_japonesa"
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "name": "Vex Sushi",
    "slug": "vex-sushi",
    "description": "Sushi de qualidade premium",
    "category": "comida_japonesa",
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

### 2. Endereço

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/address
```

#### Descrição
Atualiza o endereço físico da loja.

#### Request Body
```json
{
  "address": {
    "street": "string (obrigatório)",
    "number": "string (obrigatório)",
    "neighborhood": "string (obrigatório)",
    "city": "string (obrigatório)",
    "state": "string (obrigatório)",
    "zipCode": "string (obrigatório)"
  }
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `address.street` | string | Sim | Rua | Máximo 255 caracteres |
| `address.number` | string | Sim | Número | Máximo 20 caracteres |
| `address.neighborhood` | string | Sim | Bairro | Máximo 255 caracteres |
| `address.city` | string | Sim | Cidade | Máximo 255 caracteres |
| `address.state` | string | Sim | Estado (UF) | 2 caracteres (ex: "SP", "RJ") |
| `address.zipCode` | string | Sim | CEP | Formato: 00000-000 ou 00000000 (apenas números) |

#### Exemplo de Request
```json
{
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567"
  }
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "info": {
      "address": {
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234567"
      }
    },
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

### 3. Horários de Funcionamento

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/working-hours
```

#### Descrição
Atualiza os horários de funcionamento da loja para todos os dias da semana.

#### Request Body
```json
{
  "workingHours": [
    {
      "week_day": "number (obrigatório)",
      "opens_at": "string | null",
      "closes_at": "string | null",
      "is_closed": "boolean (obrigatório)"
    }
  ]
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `workingHours` | array | Sim | Array com 7 objetos (um para cada dia) | Deve conter exatamente 7 elementos |
| `workingHours[].week_day` | number | Sim | Dia da semana | 0 = Domingo, 1 = Segunda, ..., 6 = Sábado |
| `workingHours[].opens_at` | string \| null | Sim* | Horário de abertura | Formato: "HH:MM:SS" ou null se `is_closed = true` |
| `workingHours[].closes_at` | string \| null | Sim* | Horário de fechamento | Formato: "HH:MM:SS" ou null se `is_closed = true` |
| `workingHours[].is_closed` | boolean | Sim | Se o dia está fechado | Se `true`, `opens_at` e `closes_at` devem ser `null` |

**\* Obrigatório apenas se `is_closed = false`**

#### Exemplo de Request
```json
{
  "workingHours": [
    {
      "week_day": 0,
      "opens_at": null,
      "closes_at": null,
      "is_closed": true
    },
    {
      "week_day": 1,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    },
    {
      "week_day": 2,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    },
    {
      "week_day": 3,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    },
    {
      "week_day": 4,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    },
    {
      "week_day": 5,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    },
    {
      "week_day": 6,
      "opens_at": "12:00:00",
      "closes_at": "21:00:00",
      "is_closed": false
    }
  ]
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "info": {
      "workingHours": [
        // Array com os horários atualizados
      ]
    },
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

### 4. Configurações de Entrega

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/delivery-settings
```

#### Descrição
Atualiza as configurações relacionadas à entrega: status da loja, tempo de entrega, valores mínimos e taxas.

#### Request Body
```json
{
  "settings": {
    "isActive": "boolean (opcional)",
    "deliveryTime": "string (opcional)",
    "minOrderValue": "number (opcional)",
    "deliveryFee": "number (opcional)",
    "freeDeliveryAbove": "number (opcional)"
  }
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `settings.isActive` | boolean | Não | Se a loja está ativa | `true` ou `false` |
| `settings.deliveryTime` | string | Não | Tempo estimado de entrega | Ex: "30-45 min" |
| `settings.minOrderValue` | number | Não | Valor mínimo do pedido | Deve ser >= 0 (em REAIS, não centavos) |
| `settings.deliveryFee` | number | Não | Taxa de entrega | Deve ser >= 0 (em REAIS, não centavos) |
| `settings.freeDeliveryAbove` | number | Não | Valor mínimo para entrega grátis | Deve ser >= 0 (em REAIS, não centavos) |

#### Exemplo de Request
```json
{
  "settings": {
    "isActive": true,
    "deliveryTime": "30-45 min",
    "minOrderValue": 25.00,
    "deliveryFee": 5.90,
    "freeDeliveryAbove": 35.00
  }
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "settings": {
      "isActive": true,
      "deliveryTime": "30-45 min",
      "minOrderValue": 25.00,
      "deliveryFee": 5.90,
      "freeDeliveryAbove": 35.00
    },
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

### 5. Métodos de Pagamento

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/payment-methods
```

#### Descrição
Atualiza os métodos de pagamento aceitos pela loja.

#### Request Body
```json
{
  "acceptsPayment": {
    "creditCard": "boolean (opcional)",
    "debitCard": "boolean (opcional)",
    "pix": "boolean (opcional)",
    "cash": "boolean (opcional)"
  }
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `acceptsPayment.creditCard` | boolean | Não | Aceita cartão de crédito | `true` ou `false` |
| `acceptsPayment.debitCard` | boolean | Não | Aceita cartão de débito | `true` ou `false` |
| `acceptsPayment.pix` | boolean | Não | Aceita PIX | `true` ou `false` |
| `acceptsPayment.cash` | boolean | Não | Aceita dinheiro | `true` ou `false` |

#### Exemplo de Request
```json
{
  "acceptsPayment": {
    "creditCard": true,
    "debitCard": true,
    "pix": true,
    "cash": true
  }
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "settings": {
      "acceptsPayment": {
        "creditCard": true,
        "debitCard": true,
        "pix": true,
        "cash": true
      }
    },
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

### 6. Tema

#### Endpoint
```
PATCH /api/merchant/stores/{storeId}/settings/theme
```

#### Descrição
Atualiza as cores do tema da loja.

#### Request Body
```json
{
  "theme": {
    "primaryColor": "string (opcional)",
    "secondaryColor": "string (opcional)",
    "accentColor": "string (opcional)",
    "textColor": "string (opcional)"
  }
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição | Validações |
|-------|------|-------------|-----------|------------|
| `theme.primaryColor` | string | Não | Cor primária | Formato hexadecimal: "#RRGGBB" |
| `theme.secondaryColor` | string | Não | Cor secundária | Formato hexadecimal: "#RRGGBB" |
| `theme.accentColor` | string | Não | Cor de destaque | Formato hexadecimal: "#RRGGBB" |
| `theme.textColor` | string | Não | Cor do texto | Formato hexadecimal: "#RRGGBB" |

#### Exemplo de Request
```json
{
  "theme": {
    "primaryColor": "#DC2626",
    "secondaryColor": "#2563EB",
    "accentColor": "#059669",
    "textColor": "#FFFFFF"
  }
}
```

#### Resposta de Sucesso (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6625e2da-a77d-4135-92be-44c9de22bc76",
    "theme": {
      "primaryColor": "#DC2626",
      "secondaryColor": "#2563EB",
      "accentColor": "#059669",
      "textColor": "#FFFFFF"
    },
    // ... outros campos da loja
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

## 📦 Respostas da API

### Formato Padrão de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": boolean,
  "data": Store | Error,
  "timestamp": "ISO 8601 string"
}
```

### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "data": {
    // Objeto Store completo
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro",
    "details": {}
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

| Status | Descrição |
|--------|-----------|
| `200 OK` | Atualização realizada com sucesso |
| `400 Bad Request` | Dados inválidos no payload |
| `401 Unauthorized` | Token de autenticação inválido ou ausente |
| `403 Forbidden` | Usuário não tem permissão para atualizar a loja |
| `404 Not Found` | Loja não encontrada |
| `422 Unprocessable Entity` | Erro de validação |
| `500 Internal Server Error` | Erro interno do servidor |

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `STORE_NOT_FOUND` | Loja não encontrada |
| `MERCHANT_NOT_FOUND` | Merchant não encontrado |
| `FORBIDDEN` | Sem permissão para atualizar a loja |
| `VALIDATION_ERROR` | Erro de validação dos dados |
| `DUPLICATE_SLUG` | Slug já está em uso por outra loja |
| `INVALID_UUID` | UUID do storeId inválido |

### Exemplo de Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "slug": ["Slug já está em uso"],
      "address.zipCode": ["CEP inválido"]
    }
  },
  "timestamp": "2025-12-22T10:00:00.000Z"
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Atualizar Informações Básicas

```bash
curl -X PATCH \
  'https://api.example.com/api/merchant/stores/6625e2da-a77d-4135-92be-44c9de22bc76/settings/basic-info' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Vex Sushi",
    "slug": "vex-sushi",
    "description": "Sushi de qualidade premium",
    "category": "comida_japonesa"
  }'
```

### Exemplo 2: Atualizar Endereço

```bash
curl -X PATCH \
  'https://api.example.com/api/merchant/stores/6625e2da-a77d-4135-92be-44c9de22bc76/settings/address' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567"
    }
  }'
```

### Exemplo 3: Atualizar Horários de Funcionamento

```bash
curl -X PATCH \
  'https://api.example.com/api/merchant/stores/6625e2da-a77d-4135-92be-44c9de22bc76/settings/working-hours' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "workingHours": [
      {
        "week_day": 1,
        "opens_at": "12:00:00",
        "closes_at": "21:00:00",
        "is_closed": false
      }
      // ... outros dias
    ]
  }'
```

---

## 🔒 Segurança

### Validações de Segurança (Backend)

Todos os endpoints devem implementar:

1. ✅ **Autenticação obrigatória**: Verificar token JWT válido
2. ✅ **Autorização**: Verificar se o merchant é dono ou membro da loja
3. ✅ **Validação de UUID**: Validar formato do `storeId`
4. ✅ **Validação de dados**: Validar todos os campos conforme especificação
5. ✅ **Transações atômicas**: Garantir consistência dos dados
6. ✅ **Rate limiting**: Limitar requisições por merchant
7. ✅ **Sanitização**: Sanitizar inputs para prevenir SQL injection

### Validações de Negócio

- ✅ Slug deve ser único no sistema
- ✅ CEP deve ser válido (formato brasileiro)
- ✅ Valores monetários devem ser >= 0
- ✅ Horários devem estar no formato correto
- ✅ Cores devem estar em formato hexadecimal válido

---

## 📝 Notas Importantes

1. **Valores Monetários**: Todos os valores monetários são enviados em **REAIS**, não em centavos.

2. **Atualização Parcial**: Cada endpoint atualiza apenas a seção especificada. Os outros campos da loja permanecem inalterados.

3. **Resposta Completa**: Todos os endpoints retornam o objeto `Store` completo atualizado, não apenas os campos alterados.

4. **Horários de Funcionamento**: O array `workingHours` deve conter exatamente 7 elementos (um para cada dia da semana, de domingo a sábado).

5. **Slug Único**: O `slug` deve ser único no sistema. Se já estiver em uso por outra loja, a API retornará erro `DUPLICATE_SLUG`.

6. **Endereço Completo**: Todos os campos do endereço são obrigatórios quando o endpoint é chamado, mas o frontend pode enviar apenas os campos que deseja atualizar (conforme implementação do backend).

---

## 🚀 Implementação no Backend

✅ **Status**: Todos os endpoints estão implementados e funcionando.

### Estrutura de Rotas Implementada

```typescript
// routes/merchant/stores/settings.ts
router.patch('/stores/:storeId/settings/basic-info', updateBasicInfo);
router.patch('/stores/:storeId/settings/address', updateAddress);
router.patch('/stores/:storeId/settings/working-hours', updateWorkingHours);
router.patch('/stores/:storeId/settings/delivery-settings', updateDeliverySettings);
router.patch('/stores/:storeId/settings/payment-methods', updatePaymentMethods);
router.patch('/stores/:storeId/settings/theme', updateTheme);
```

### Middleware Implementado

✅ As seguintes validações estão implementadas:
- ✅ Verifica autenticação via JWT
- ✅ Verifica se merchant é dono ou membro da loja
- ✅ Valida formato UUID do storeId
- ✅ Validação de dados conforme especificação
- ✅ Transações atômicas para garantir consistência

---

## ✅ Status da Implementação

Todos os endpoints documentados estão **implementados e disponíveis** na API.

### Endpoints Disponíveis:

1. ✅ **Informações Básicas** - `PATCH /api/merchant/stores/[storeId]/settings/basic-info`
2. ✅ **Endereço** - `PATCH /api/merchant/stores/[storeId]/settings/address`
3. ✅ **Horários de Funcionamento** - `PATCH /api/merchant/stores/[storeId]/settings/working-hours`
4. ✅ **Configurações de Entrega** - `PATCH /api/merchant/stores/[storeId]/settings/delivery-settings`
5. ✅ **Métodos de Pagamento** - `PATCH /api/merchant/stores/[storeId]/settings/payment-methods`
6. ✅ **Tema** - `PATCH /api/merchant/stores/[storeId]/settings/theme`

---

**Última atualização**: 22 de Dezembro de 2025  
**Status**: ✅ Todos os endpoints implementados

