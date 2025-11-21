# 📚 Documentação Backend - StoreFlow

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação e Segurança](#autenticação-e-segurança)
3. [Estrutura de Respostas](#estrutura-de-respostas)
4. [Rotas de Autenticação](#rotas-de-autenticação)
5. [Rotas de Lojas](#rotas-de-lojas)
6. [Rotas de Produtos](#rotas-de-produtos)
7. [Rotas de Pedidos](#rotas-de-pedidos)
8. [Rotas de Clientes](#rotas-de-clientes)
9. [Códigos de Status HTTP](#códigos-de-status-http)
10. [Tratamento de Erros](#tratamento-de-erros)

---

## 🎯 Visão Geral

### Base URL
```
/api
```

### Formato de Dados
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Tipos de Usuário
1. **Customer (Cliente)**: Acessa via telefone, pode fazer pedidos
2. **Merchant (Lojista)**: Acessa via email/senha, gerencia loja/produtos/pedidos

---

## 🔐 Autenticação e Segurança

### JWT Token

Todas as rotas protegidas requerem um **Bearer Token** no header:

```
Authorization: Bearer <token>
```

### Refresh Token

O sistema usa **refresh token** para renovação automática de tokens expirados.

**Token de Acesso (Access Token)**:
- Duração: 15 minutos (recomendado)
- Contém: `userId`, `type` (customer/merchant), `storeId` (se merchant)

**Refresh Token**:
- Duração: 7 dias (recomendado)
- Armazenado em cookie httpOnly ou retornado no body

### Middleware de Autenticação

#### Verificar Token
```javascript
// Middleware: verifyToken
// Verifica se o token é válido e extrai informações do usuário
// Adiciona ao req.user: { id, type, storeId }
```

#### Verificar Tipo de Usuário
```javascript
// Middleware: requireCustomer
// Verifica se o usuário é do tipo "customer"

// Middleware: requireMerchant
// Verifica se o usuário é do tipo "merchant"
```

#### Verificar Propriedade da Loja
```javascript
// Middleware: requireStoreOwner
// Verifica se o merchant possui a loja específica
// Usado em rotas como: PUT /stores/:id, POST /stores/:id/products
```

### Exemplo de Payload do Token

```json
{
  "userId": "user-123",
  "type": "customer", // ou "merchant"
  "storeId": "store-456", // apenas para merchant
  "role": "admin", // apenas para merchant (admin | manager)
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## 📦 Estrutura de Respostas

### Resposta de Sucesso

```json
{
  "success": true,
  "data": { /* dados */ },
  "message": "Operação realizada com sucesso", // opcional
  "timestamp": "2024-01-01T00:00:00.000Z" // opcional
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro amigável",
    "code": "ERROR_CODE",
    "status": 400,
    "errors": { // opcional - para erros de validação
      "field": ["erro 1", "erro 2"]
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Resposta Paginada

```json
{
  "success": true,
  "data": [ /* array de itens */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

- **Importante**: Todos os endpoints de listagem (`GET /stores`, `GET /products`, `GET /orders`, `GET /customers`, etc.) devem usar SEMPRE este envelope paginado, mesmo quando filtros retornarem poucos resultados.

---

## 🔑 Rotas de Autenticação

### POST `/api/auth/customer/login`

**Descrição**: Login de cliente por telefone

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "phone": "11987654321"
}
```

**Validações**:
- `phone`: obrigatório, string, formato válido (10-15 dígitos)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "customer-123",
      "phone": "11987654321",
      "name": "João Silva",
      "storeId": "store-456",
      "addresses": {
        "home": {
          "street": "Rua Exemplo",
          "number": "123",
          "neighborhood": "Centro",
          "city": "São Paulo",
          "zipCode": "01234567",
          "complement": "Apto 45",
          "reference": "Próximo ao mercado",
          "label": "Casa",
          "isDefault": true,
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-abc123..."
  }
}
```

**Response 400** (Telefone inválido):
```json
{
  "success": false,
  "error": {
    "message": "Telefone inválido",
    "code": "INVALID_PHONE",
    "status": 400
  }
}
```

**Response 404** (Cliente não encontrado):
```json
{
  "success": false,
  "error": {
    "message": "Cliente não encontrado",
    "code": "CUSTOMER_NOT_FOUND",
    "status": 404
  }
}
```

---

### POST `/api/auth/merchant/login`

**Descrição**: Login de lojista por email/senha

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "email": "lojista@exemplo.com",
  "password": "senha123"
}
```

**Validações**:
- `email`: obrigatório, string, formato email válido
- `password`: obrigatório, string, mínimo 6 caracteres

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "merchant-123",
      "email": "lojista@exemplo.com",
      "storeId": "store-456",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-abc123..."
  }
}
```

**Response 401** (Credenciais inválidas):
```json
{
  "success": false,
  "error": {
    "message": "Email ou senha incorretos",
    "code": "INVALID_CREDENTIALS",
    "status": 401
  }
}
```

---

### POST `/api/auth/refresh`

**Descrição**: Renovar token de acesso usando refresh token

**Autenticação**: Não requerida (usa refresh token)

**Request Body**:
```json
{
  "refreshToken": "refresh-token-abc123..."
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token-xyz789..." // opcional - pode renovar também
  }
}
```

**Response 401** (Refresh token inválido/expirado):
```json
{
  "success": false,
  "error": {
    "message": "Refresh token inválido ou expirado",
    "code": "INVALID_REFRESH_TOKEN",
    "status": 401
  }
}
```

---

### POST `/api/auth/logout`

**Descrição**: Logout do usuário

**Autenticação**: Requerida (Bearer Token)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

**Nota**: Backend deve invalidar o refresh token no banco de dados.

---

### GET `/api/auth/profile`

**Descrição**: Buscar perfil do usuário autenticado

**Autenticação**: Requerida (Bearer Token)

**Response 200** (Customer):
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "phone": "11987654321",
    "name": "João Silva",
    "storeId": "store-456",
    "addresses": { /* ... */ },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response 200** (Merchant):
```json
{
  "success": true,
  "data": {
    "id": "merchant-123",
    "email": "lojista@exemplo.com",
    "storeId": "store-456",
    "role": "admin"
  }
}
```

---

### PUT `/api/auth/profile`

**Descrição**: Atualizar perfil do usuário autenticado

**Autenticação**: Requerida (Bearer Token)

**Request Body** (Customer):
```json
{
  "name": "João Silva Santos",
  "phone": "11987654321",
  "addresses": {
    "home": {
      "street": "Rua Nova",
      "number": "456",
      "neighborhood": "Bairro Novo",
      "city": "São Paulo",
      "zipCode": "01234567",
      "complement": "Apto 12",
      "reference": "Próximo à escola",
      "label": "Casa",
      "isDefault": true
    },
    "work": {
      "street": "Av. Trabalho",
      "number": "789",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "zipCode": "01234567",
      "isDefault": false
    }
  }
}
```

**Validações**:
- `name`: opcional, string, 2-100 caracteres
- `phone`: opcional, string, formato válido
- `addresses.home`: opcional, objeto válido
- `addresses.work`: opcional, objeto válido
- Se `addresses.home.isDefault` ou `addresses.work.isDefault` for `true`, o outro deve ser `false`
- Para `Merchant`, aceitar apenas campos específicos (`name`, `email`, `role` quando aplicável); campos de endereço devem ser ignorados/retornados com 400 para evitar inconsistências.

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "phone": "11987654321",
    "name": "João Silva Santos",
    "addresses": { /* dados atualizados */ },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🏪 Rotas de Lojas

### GET `/api/stores`

**Descrição**: Listar todas as lojas (público)

**Autenticação**: Não requerida

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)
- `search`: busca por nome/descrição
- `category`: filtrar por categoria
- `isActive`: filtrar por lojas ativas (true/false)

**Exemplo**: `/api/stores?page=1&limit=20&category=restaurante&isActive=true`

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "store-123",
      "name": "Burger House",
      "slug": "burger-house",
      "description": "Melhor hambúrguer da cidade",
      "category": "hamburgueria",                 // categorias padronizadas (ver lista abaixo)
      "avatar": "https://...",
      "banner": "https://...",
      "rating": 4.5,
      "reviewCount": 150,
      "theme": {
        "primaryColor": "#FF5733",
        "secondaryColor": "#33FF57",
        "accentColor": "#3357FF",
        "textColor": "#FFFFFF"
      },
      "settings": {
        "isActive": true,
        "deliveryTime": "30-45 min",
        "minOrderValue": 20.00,
        "deliveryFee": 5.00,                      // valor padrão cobrado quando fulfillment = delivery
        "freeDeliveryAbove": 50.00,
        "fulfillment": {
          "deliveryEnabled": true,
          "pickupEnabled": true,
          "pickupInstructions": "Retirada no balcão, informe o número do pedido",
          "deliveryOptions": [
            {
              "name": "Entrega Padrão",
              "fee": 5.0,
              "estimatedTime": "40-55 min"
            },
            {
              "name": "Entrega Expressa",
              "fee": 12.0,
              "estimatedTime": "20-30 min"
            }
          ]
        },
        "acceptsPayment": {
          "creditCard": true,
          "debitCard": true,
          "pix": true,
          "cash": true
        }
      },
      "info": {
        "phone": "11987654321",
        "email": "contato@burgerhouse.com",
        "address": {
          "street": "Rua Exemplo",
          "number": "123",
          "neighborhood": "Centro",
          "city": "São Paulo",
          "state": "SP",
          "zipCode": "01234567"
        },
        "pickupLocation": {
          "street": "Rua Exemplo",
          "number": "123",
          "neighborhood": "Centro",
          "city": "São Paulo",
          "state": "SP",
          "zipCode": "01234567",
          "reference": "Porta lateral para retirada"
        },
        "workingHours": {
          "monday": { "open": "10:00", "close": "22:00", "closed": false },
          "tuesday": { "open": "10:00", "close": "22:00", "closed": false },
          /* ... outros dias ... */
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET `/api/stores/:id`

**Descrição**: Buscar loja por ID

**Autenticação**: Não requerida

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "store-123",
    "name": "Burger House",
    /* ... todos os campos da loja ... */,
    "hasProducts": true,
    "productCount": 25
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": {
    "message": "Loja não encontrada",
    "code": "STORE_NOT_FOUND",
    "status": 404
  }
}
```

---

### GET `/api/stores/by-slug/:slug`

**Descrição**: Buscar loja por slug

**Autenticação**: Não requerida

**Response 200**: Mesmo formato de GET `/api/stores/:id`

---

### GET `/api/stores/:storeId/products`

**Descrição**: Listar produtos de uma loja

**Autenticação**: Não requerida

**Query Parameters**:
- `page`: número da página
- `limit`: itens por página
- `category`: filtrar por categoria
- `search`: busca por nome/descrição
- `isActive`: filtrar por produtos ativos

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "product-123",
      "name": "Burger Clássico",
      "description": "Hambúrguer com queijo, alface e tomate",
      "price": 28.90,
      "image": "https://...",
      "category": "Hambúrguers",
      "storeId": "store-123",
      "isActive": true,
      "customizations": [
        {
          "id": "custom-1",
          "name": "Ponto da Carne",
          "type": "extra",
          "price": 0,
          "selectionType": "boolean",
          "group": "ponto-carne"
        },
        {
          "id": "custom-2",
          "name": "Mal Passado",
          "type": "extra",
          "price": 0,
          "selectionType": "boolean",
          "group": "ponto-carne"
        },
        {
          "id": "custom-3",
          "name": "Bacon Extra",
          "type": "extra",
          "price": 5.00,
          "selectionType": "boolean"
        }
      ],
      "preparationTime": 20,
      "nutritionalInfo": {
        "calories": 580,
        "proteins": 35,
        "carbs": 45,
        "fats": 25
      }
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET `/api/stores/:storeId/categories`

**Descrição**: Listar categorias de produtos de uma loja

**Autenticação**: Não requerida

**Response 200**:
```json
{
  "success": true,
  "data": [
    "Hambúrguers",
    "Bebidas",
    "Sobremesas",
    "Acompanhamentos"
  ]
}
```

---

### GET `/api/stores/:storeId/orders`

**Descrição**: Listar pedidos de uma loja específica (painel do lojista)

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)
- `status`: filtrar por status do pedido (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
- `paymentStatus`: filtrar por status de pagamento (pending, paid, failed)
- `startDate` / `endDate`: filtro por intervalo de datas (ISO string)
- `customerId`: filtrar pedidos de um cliente específico

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "customerId": "customer-456",
      "storeId": "store-789",
      "items": [ /* ... */ ],
      "totalAmount": 62.8,
      "deliveryFee": 5,
      "status": "preparing",
      "paymentMethod": "pix",
      "paymentStatus": "paid",
      "deliveryAddress": { /* ... */ },
      "estimatedDeliveryTime": "2024-01-01T13:00:00.000Z",
      "observations": "Entregar após 12h",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response 403** (merchant não associado à loja):
```json
{
  "success": false,
  "error": {
    "message": "Você não tem permissão para visualizar os pedidos desta loja",
    "code": "FORBIDDEN",
    "status": 403
  }
}
```

---

### POST `/api/stores`

**Descrição**: Criar nova loja

**Autenticação**: Requerida (Merchant)

**Request Body**: Ver `CreateStoreRequest` em tipos

- **Categorias padronizadas** (campo `category`):
  - `hamburgueria`
  - `pizzaria`
  - `pastelaria`
  - `sorveteria`
  - `cafeteria`
  - `padaria`
  - `comida_brasileira`
  - `comida_japonesa`
  - `doces`
  - `mercado`
  - `outros` (obrigatório acompanhar `customCategory` com descrição)
- **Endereço da loja**: `info.address` é obrigatório e deve refletir o ponto de retirada/entrega. Quando `pickupEnabled = true`, o campo `info.pickupLocation` deve estar preenchido (pode ser igual ao endereço principal ou diferente, mas nunca vazio).
- **Configuração de frete/coleta**:
  - `settings.fulfillment.deliveryEnabled`: define se a loja oferece entrega. Quando `true`, deve haver pelo menos uma entrada em `settings.fulfillment.deliveryOptions` com `name`, `fee` e `estimatedTime`.
  - `settings.fulfillment.pickupEnabled`: define se clientes podem retirar no ponto físico. Quando `true`, deve haver instruções claramente definidas em `pickupInstructions`.
  - `settings.deliveryFee` passa a representar o valor padrão usado quando o cliente não seleciona uma opção diferenciada; recomenda-se alinhar com `deliveryOptions`.

**Response 201**:
```json
{
  "success": true,
  "data": { /* loja criada */ }
}
```

---

### PUT `/api/stores/:id`

**Descrição**: Atualizar loja

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Request Body**: Ver `UpdateStoreRequest` em tipos

**Response 200**:
```json
{
  "success": true,
  "data": { /* loja atualizada */ }
}
```

**Response 403** (Não é o proprietário):
```json
{
  "success": false,
  "error": {
    "message": "Você não tem permissão para atualizar esta loja",
    "code": "FORBIDDEN",
    "status": 403
  }
}
```

---

## 🍔 Rotas de Produtos

### GET `/api/products`

**Descrição**: Listar produtos (contexto administrativo)

**Autenticação**: Requerida (Merchant) ou pública (Store) dependendo do contexto.

**Detecção de contexto**:
- **Contexto lojista (administração)**: Requisição autenticada com token de `merchant`. Retorna todos os produtos da(s) loja(s) vinculada(s), incluindo campos internos (`costPrice`, `family`, `extraLists`, `isActive`, `createdAt`, `updatedAt`).
- **Contexto loja/cliente**: Requisições sem token ou com token de `customer` devem obrigatoriamente informar `storeId`; o backend retorna apenas produtos `isActive: true` dessa loja, ocultando campos sensíveis (custos, listas de extras, etc.).

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)
- `storeId`: filtrar por loja específica
- `category`: filtrar por categoria
- `search`: termo de busca no nome/descrição
- `isActive`: filtrar por status (true/false)

**Resposta padronizada**: Sempre retornar no formato paginado abaixo, mesmo quando não houver filtros.

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "product-123",
      "name": "Burger Clássico",
      "description": "Hambúrguer com queijo, alface e tomate",
      "price": 28.9,
      "costPrice": 18.5,                // apenas contexto lojista
      "family": "finished_product",     // enum
      "image": "https://...",
      "category": "Hambúrguers",
      "storeId": "store-123",
      "isActive": true,
      "customizations": [ /* ... */ ],  // retornado em ambos contextos
      "extraLists": [                   // apenas contexto lojista
        {
          "id": "list-abc",
          "name": "Extras Burger Clássico",
          "items": [
            {
              "id": "extra-bacon",
              "name": "Bacon Crispy",
              "costPrice": 2.5,
              "salePrice": 5
            },
            {
              "id": "extra-cheddar",
              "name": "Cheddar cremoso",
              "costPrice": 1.8,
              "salePrice": 4
            }
          ]
        }
      ],
      "preparationTime": 20,
      "nutritionalInfo": { /* ... */ },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/api/products/:id`

**Descrição**: Buscar produto por ID

**Autenticação**: Não requerida (contexto loja/cliente) ou requerida (Merchant) para dados completos.

**Regras de retorno**:
- **Cliente/Loja**: Retorna somente produtos ativos (`isActive: true`), sem campos internos. Extras retornados apenas com nome e preço de venda.
- **Lojista**: Retorna produto completo, independentemente do status, incluindo `costPrice`, `family`, `extraLists`, indicadores de estoque e flags administrativas.

**Response 200**:
```json
{
  "success": true,
  "data": { /* produto completo */ }
}
```

---

### POST `/api/stores/:storeId/products`

**Descrição**: Criar produto

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Request Body**:
```json
{
  "name": "Burger Especial",
  "description": "Hambúrguer com ingredientes especiais",
  "price": 35.90,
  "costPrice": 20.50,
  "family": "finished_product",            // enum: raw_material | finished_product | addon
  "image": "https://...",
  "category": "hamburgueria",
  "customCategory": null,                  // quando category = "outros", informar descricao aqui
  "isActive": true,
  "customizations": [
    {
      "name": "Bacon Extra",
      "type": "extra",
      "price": 5.00,
      "selectionType": "boolean"
    }
  ],
  "extraListIds": ["list-abc", "list-sauces"], // listas reutilizáveis de extras criadas previamente
  "preparationTime": 25,
  "nutritionalInfo": {
    "calories": 650,
    "proteins": 40,
    "carbs": 50,
    "fats": 30
  }
}
```

**Validações**:
- `name`: obrigatório, string, 2-200 caracteres
- `description`: obrigatório, string, máximo 1000 caracteres
- `price`: obrigatório, number, >= 0
- `costPrice`: obrigatório para families `finished_product` e `addon`; >= 0
- `family`: obrigatório, enum (`raw_material`, `finished_product`, `addon`)
- `category`: obrigatório, string
- `isActive`: obrigatório, boolean
- `preparationTime`: obrigatório, number, >= 0
- `customizations`: opcional, array válido
- `extraListIds`: obrigatório quando `family` for `finished_product`; cada ID deve existir e estar vinculado à loja
- Produtos `addon` (insumos) não podem receber `extraListIds`; devem informar `family = "addon"` e podem ser utilizados em várias listas depois.

**Response 201**:
```json
{
  "success": true,
  "data": { /* produto criado com ID */ }
}
```

**Listas de extras reutilizáveis**:
- Criadas previamente via área administrativa (ex.: `POST /api/products/extra-lists` — definir endpoint no backend).
- Estrutura sugerida:
  ```json
  {
    "id": "list-abc",
    "name": "Base de complementos premium",
    "items": [
      { "id": "extra-bacon", "name": "Bacon Crispy", "costPrice": 2.5, "salePrice": 5 },
      { "id": "extra-cheddar", "name": "Cheddar Cremoso", "costPrice": 1.8, "salePrice": 4 }
    ]
  }
  ```
- Uma mesma lista pode ser vinculada a vários produtos (`extraListIds`), e cada produto pode ter múltiplas listas (ex.: “Proteínas extras”, “Molhos especiais”).
- Produtos da família `raw_material` servem de base para listas de insumos; produtos `addon` representam itens adicionais que podem compor essas listas.

---

### PUT `/api/products/:id`

**Descrição**: Atualizar produto

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Request Body**: Ver `UpdateProductRequest` em tipos

- **Boas práticas**:
  - Permitir atualização parcial via `PATCH /api/products/:id` para evitar sobrescrever dados sensíveis.
  - Validar campos críticos (ex.: `price`, `isActive`) garantindo que o lojista só impacte a própria loja.

**Response 200**:
```json
{
  "success": true,
  "data": { /* produto atualizado */ }
}
```

---

### DELETE `/api/products/:id`

**Descrição**: Deletar produto

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "product-123"
  }
}
```

**Nota**: Recomenda-se soft delete (marcar como `isActive: false`) ao invés de deletar fisicamente.

---

### 📋 Gestão de Listas de Extras Reutilizáveis

As listas centralizam insumos (`family = "addon"`) para facilitar a montagem de produtos acabados. Todas as rotas abaixo exigem autenticação como **Merchant** e validam se a lista pertence à loja do usuário.

#### GET `/api/products/extra-lists`

**Descrição**: Listar todas as listas de extras da loja autenticada.

**Query Parameters**:
- `page`, `limit`: paginação padrão
- `search`: busca por nome

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "list-abc",
      "name": "Extras Premium",
      "description": "Complementos especiais para burgers",
      "storeId": "store-123",
      "items": [
        {
          "id": "addon-bacon",
          "name": "Bacon Crispy",
          "costPrice": 2.5,
          "salePrice": 5,
          "productId": "addon-bacon" // referência ao produto da família addon
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

#### POST `/api/products/extra-lists`

**Descrição**: Criar nova lista de extras.

**Request Body**:
```json
{
  "name": "Extras Burgers Premium",
  "description": "Lista com bacon, cheddar e molhos especiais",
  "items": [
    {
      "productId": "addon-bacon",
      "name": "Bacon Crispy",
      "costPrice": 2.5,
      "salePrice": 5
    },
    {
      "productId": "addon-cheddar",
      "name": "Cheddar Cremoso",
      "costPrice": 1.8,
      "salePrice": 4
    }
  ]
}
```

**Validações**:
- `name`: obrigatório, string, 2-120 caracteres
- `description`: opcional, máximo 255 caracteres
- `items`: opcional no cadastro inicial, pode ser lista vazia
- Cada `item.productId` deve referenciar um produto da família `addon` ou `raw_material`
- `salePrice` ≥ `costPrice` (ou pelo menos documentar regra de negócio)

**Response 201**:
```json
{
  "success": true,
  "data": { /* lista criada */ }
}
```

---

#### GET `/api/products/extra-lists/:id`

**Descrição**: Buscar uma lista específica.

**Response 200**: Mesmo formato de GET `/api/products/extra-lists`.

**Response 404**: Lista não encontrada ou não pertence à loja.

---

#### PUT `/api/products/extra-lists/:id`

**Descrição**: Atualizar nome/descrição ou substituir itens.

**Request Body**:
```json
{
  "name": "Extras Burgers Signature",
  "description": "Atualização de lista",
  "items": [
    {
      "productId": "addon-cheddar",
      "name": "Cheddar Cremoso",
      "costPrice": 2,
      "salePrice": 4.5
    }
  ]
}
```

**Notas**:
- Enviar o array completo para regravar a lista; backend deve substituir, não somar.
- Validar `productId` e permissões como na criação.

---

#### PATCH `/api/products/extra-lists/:id/items`

**Descrição**: Atualização parcial de itens (adicionar/remover/editar) sem sobrescrever a lista inteira.

**Request Body** (exemplo):
```json
{
  "add": [
    {
      "productId": "addon-barbecue",
      "name": "Molho Barbecue",
      "costPrice": 1,
      "salePrice": 2.5
    }
  ],
  "update": [
    {
      "itemId": "addon-cheddar",
      "name": "Cheddar Cremoso Premium",
      "salePrice": 4.8
    }
  ],
  "remove": ["addon-bacon"]
}
```

**Validações**:
- `remove`: arrays de IDs existentes na lista
- `update`: apenas campos permitidos (`name`, `costPrice`, `salePrice`)
- `add`: segue mesmas regras do POST

---

#### DELETE `/api/products/extra-lists/:id`

**Descrição**: Remover uma lista. Deve verificar se existem produtos usando a lista:
- Se houver vínculo ativo, retornar `409 Conflict` com mensagem orientando a desvincular antes.

**Response 200**:
```json
{
  "success": true,
  "data": { "id": "list-abc" }
}
```

---

#### DELETE `/api/products/extra-lists/:id/items/:itemId`

**Descrição**: Remover item específico da lista.

**Response 200**:
```json
{
  "success": true,
  "data": { "itemId": "addon-bacon" }
}
```

**Response 404**: Item não encontrado ou não pertence à lista.

---


## 📦 Rotas de Pedidos

### GET `/api/orders`

**Descrição**: Listar pedidos

**Autenticação**: Requerida

**Query Parameters**:
- `page`: número da página
- `limit`: itens por página
- `status`: filtrar por status (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
- `storeId`: filtrar por loja (merchant)
- `customerId`: filtrar por cliente (customer)

**Comportamento**:
- **Customer**: Retorna apenas seus próprios pedidos (filtro automático por `customerId`)
- **Merchant**: Retorna apenas pedidos de suas lojas (filtro automático por `storeId`)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "customerId": "customer-456",
      "storeId": "store-789",
      "items": [
        {
          "product": { /* produto completo */ },
          "quantity": 2,
          "customizations": [ /* customizações selecionadas */ ],
          "totalPrice": 57.80,
          "observations": "Sem cebola"
        }
      ],
      "totalAmount": 62.80,
      "deliveryFee": 5.00,
      "status": "preparing",
      "paymentMethod": "pix",
      "paymentStatus": "paid",
      "deliveryAddress": {
        "street": "Rua Exemplo",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "zipCode": "01234567",
        "complement": "Apto 45",
        "reference": "Próximo ao mercado"
      },
      "estimatedDeliveryTime": "2024-01-01T13:00:00.000Z",
      "observations": "Entregar após 12h",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:15:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET `/api/orders/:id`

**Descrição**: Buscar pedido por ID

**Autenticação**: Requerida

**Comportamento**:
- **Customer**: Apenas seus próprios pedidos
- **Merchant**: Apenas pedidos de suas lojas

**Response 200**:
```json
{
  "success": true,
  "data": { /* pedido completo */ }
}
```

**Response 403** (Sem permissão):
```json
{
  "success": false,
  "error": {
    "message": "Você não tem permissão para acessar este pedido",
    "code": "FORBIDDEN",
    "status": 403
  }
}
```

---

### POST `/api/orders`

**Descrição**: Criar novo pedido

**Autenticação**: Requerida (Customer)

**Request Body**:
```json
{
  "storeId": "store-123",
  "items": [
    {
      "productId": "product-456",
      "quantity": 2,
      "customizations": ["custom-1", "custom-3"],
      "observations": "Sem cebola"
    }
  ],
  "fulfillmentMethod": "delivery",          // delivery | pickup
  "deliveryOptionId": "standard",           // opcional, aplica-se quando delivery
  "pickupSlot": "2025-11-06T19:00:00Z",     // opcional, quando pickup
  "deliveryAddress": {
    "street": "Rua Exemplo",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "zipCode": "01234567",
    "complement": "Apto 45",
    "reference": "Próximo ao mercado"
  },
  "paymentMethod": "pix",
  "observations": "Entregar após 12h"
}
```

**Validações**:
- `storeId`: obrigatório, string, loja deve existir e estar ativa
- `items`: obrigatório, array não vazio
- `items[].productId`: obrigatório, produto deve existir e estar ativo
- `items[].quantity`: obrigatório, number, >= 1
- `items[].customizations`: opcional, array de IDs válidos
- `fulfillmentMethod`: obrigatório; se `delivery`, `deliveryAddress` e (quando disponível) `deliveryOptionId` são obrigatórios; se `pickup`, `deliveryAddress` pode ser omitido e `pickupSlot` é opcional (conforme regras da loja).
- `deliveryAddress`: obrigatório quando método for entrega.
- `paymentMethod`: obrigatório, enum válido
- Backend deve verificar se loja realmente oferece o método escolhido (`deliveryEnabled` ou `pickupEnabled`) e retornar erro amigável caso contrário.

**Response 201**:
```json
{
  "success": true,
  "data": { /* pedido criado */ }
}
```

**Response 400** (Valor mínimo não atingido):
```json
{
  "success": false,
  "error": {
    "message": "Valor mínimo do pedido não atingido",
    "code": "MIN_ORDER_VALUE",
    "status": 400,
    "errors": {
      "totalAmount": ["Valor mínimo: R$ 20,00"]
    }
  }
}
```

---

### PUT `/api/orders/:id/status`

**Descrição**: Atualizar status do pedido

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Request Body**:
```json
{
  "status": "preparing"
}
```

**Validações**:
- `status`: obrigatório, enum válido
- Transições de status válidas:
  - `pending` → `confirmed` → `preparing` → `ready` → `out_for_delivery` → `delivered`
  - Qualquer status → `cancelled` (apenas antes de sair para entrega)
- Cancelamento por **cliente** permitido enquanto status for `pending`; após `confirmed`, apenas lojista pode cancelar informando motivo (`cancellationReason` opcional no body).

**Response 200**:
```json
{
  "success": true,
  "data": { /* pedido atualizado */ }
}
```

---

### PUT `/api/orders/:id/payment`

**Descrição**: Atualizar status de pagamento

**Autenticação**: Requerida (Merchant - proprietário da loja)

**Request Body**:
```json
{
  "paymentStatus": "paid"
}
```

**Validações**:
- `paymentStatus`: obrigatório, enum válido (pending, paid, failed)

**Response 200**:
```json
{
  "success": true,
  "data": { /* pedido atualizado */ }
}
```

---

## 👤 Rotas de Clientes

### GET `/api/customers`

**Descrição**: Listar clientes (painel do lojista / backoffice)

**Autenticação**: Requerida (Merchant com permissão `admin`)

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)
- `search`: busca por nome/telefone
- `storeId`: filtrar por loja vinculada
- `createdStart` / `createdEnd`: intervalo de data de criação (ISO string)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "customer-123",
      "phone": "11987654321",
      "name": "João Silva",
      "storeId": "store-456",
      "addresses": { /* ... */ },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 320,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET `/api/customers/:id`

**Descrição**: Buscar dados de um cliente específico

**Autenticação**: Requerida (Merchant com permissão `admin` OU Customer dono do recurso)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "phone": "11987654321",
    "name": "João Silva",
    "storeId": "store-456",
    "addresses": { /* ... */ },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response 403** (sem permissão):
```json
{
  "success": false,
  "error": {
    "message": "Você não tem permissão para acessar este cliente",
    "code": "FORBIDDEN",
    "status": 403
  }
}
```

---

### POST `/api/customers`

**Descrição**: Criar cliente (fluxo de onboarding / validação de telefone)

**Autenticação**: Não requerida (primeiro contato) ou Requerida (admin) — definir conforme estratégia de onboarding. Recomenda-se fluxo de verificação multi-etapas:

1. Cliente informa telefone
2. Backend envia código (SMS/WhatsApp)
3. Cliente confirma código → criação do registro

**Request Body**:
```json
{
  "phone": "11987654321",
  "name": "João Silva"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "phone": "11987654321",
    "name": "João Silva",
    "storeId": "store-456"
  },
  "message": "Cliente criado com sucesso"
}
```

**Nota**: Caso o cadastro seja realizado por outra aplicação (ex.: CRM), documentar o fluxo alternativo aqui para manter o front alinhado.

---

### GET `/api/customers/:customerId/addresses`

**Descrição**: Listar endereços de um cliente

**Autenticação**: Requerida (Customer - próprio perfil ou Merchant - lojas relacionadas)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "home": { /* endereço */ },
    "work": { /* endereço */ }
  }
}
```

---

### POST `/api/customers/:customerId/addresses`

**Descrição**: Criar endereço para cliente

**Autenticação**: Requerida (Customer - próprio perfil)

**Request Body**:
```json
{
  "type": "home", // ou "work"
  "street": "Rua Nova",
  "number": "456",
  "neighborhood": "Bairro Novo",
  "city": "São Paulo",
  "zipCode": "01234567",
  "complement": "Apto 12",
  "reference": "Próximo à escola",
  "isDefault": true
}
```

**Response 201**:
```json
{
  "success": true,
  "data": { /* endereço criado */ }
}
```

---

### PUT `/api/customers/:customerId/addresses/:addressId`

**Descrição**: Atualizar endereço

**Autenticação**: Requerida (Customer - próprio perfil)

**Request Body**: Mesmo formato de POST

**Response 200**:
```json
{
  "success": true,
  "data": { /* endereço atualizado */ }
}
```

---

### DELETE `/api/customers/:customerId/addresses/:addressId`

**Descrição**: Deletar endereço

**Autenticação**: Requerida (Customer - próprio perfil)

**Response 200**:
```json
{
  "success": true,
  "data": { "id": "address-123" }
}
```

---

## 📊 Códigos de Status HTTP

| Código | Descrição | Uso |
|--------|-----------|-----|
| 200 | OK | Operação bem-sucedida (GET, PUT) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 400 | Bad Request | Erro de validação ou requisição inválida |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Token válido mas sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 422 | Unprocessable Entity | Erro de validação de dados |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

---

## ⚠️ Tratamento de Erros

### Códigos de Erro Padronizados

| Código | Descrição |
|--------|-----------|
| `INVALID_CREDENTIALS` | Credenciais inválidas |
| `INVALID_TOKEN` | Token inválido |
| `TOKEN_EXPIRED` | Token expirado |
| `INVALID_REFRESH_TOKEN` | Refresh token inválido |
| `UNAUTHORIZED` | Não autenticado |
| `FORBIDDEN` | Sem permissão |
| `NOT_FOUND` | Recurso não encontrado |
| `VALIDATION_ERROR` | Erro de validação |
| `MIN_ORDER_VALUE` | Valor mínimo do pedido não atingido |
| `STORE_NOT_ACTIVE` | Loja inativa |
| `PRODUCT_NOT_ACTIVE` | Produto inativo |
| `NETWORK_ERROR` | Erro de conexão |
| `TIMEOUT` | Timeout na requisição |

### Exemplo de Erro de Validação

```json
{
  "success": false,
  "error": {
    "message": "Erro de validação",
    "code": "VALIDATION_ERROR",
    "status": 422,
    "errors": {
      "phone": ["Telefone inválido"],
      "email": ["Email é obrigatório", "Email inválido"],
      "password": ["Senha deve ter pelo menos 6 caracteres"]
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🔒 Regras de Segurança

### 1. Autenticação
- Todas as rotas protegidas requerem token JWT válido
- Token deve ser verificado em cada requisição
- Token expirado deve retornar 401

### 2. Autorização

#### Customer (Cliente)
- Pode acessar apenas seus próprios dados
- Pode criar pedidos
- Pode atualizar seu próprio perfil e endereços
- **NÃO pode** gerenciar lojas, produtos ou pedidos de outras pessoas

#### Merchant (Lojista)
- Pode gerenciar suas próprias lojas
- Pode gerenciar produtos de suas lojas
- Pode visualizar e atualizar pedidos de suas lojas
- **NÃO pode** acessar dados de outras lojas ou clientes

### 3. Validações
- Validar todos os dados de entrada
- Validar formato de telefone, email, CEP
- Validar valores numéricos (preços, quantidades)
- Validar enums (status, paymentMethod, etc.)

### 4. Rate Limiting
- Implementar rate limiting para evitar abuso
- Limitar tentativas de login (ex: 5 tentativas por 15 minutos)

### 5. CORS
- Configurar CORS adequadamente
- Permitir apenas origens confiáveis

---

## 📝 Notas Importantes

### 1. IDs
- Usar UUIDs ou IDs sequenciais (não expor informações sensíveis)
- IDs devem ser consistentes e não previsíveis

### 2. Datas
- Usar formato ISO 8601: `2024-01-01T00:00:00.000Z`
- Sempre retornar em UTC, frontend converte para local

### 3. Paginação
- Implementar paginação em todas as listagens
- Limite máximo: 100 itens por página
- Padrão: 20 itens por página

### 4. Filtros
- Implementar filtros adequados para cada endpoint
- Validar parâmetros de query

### 5. Performance
- Usar índices no banco de dados
- Implementar cache quando apropriado
- Otimizar queries N+1

### 6. Logs
- Registrar todas as operações importantes
- Registrar erros com detalhes suficientes
- Não registrar informações sensíveis (senhas, tokens)

---

## 🧪 Exemplos de Testes

### Teste de Login de Cliente

```bash
curl -X POST http://localhost:3001/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "11987654321"
  }'
```

### Teste de Login de Lojista

```bash
curl -X POST http://localhost:3001/api/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lojista@exemplo.com",
    "password": "senha123"
  }'
```

### Teste de Listar Lojas

```bash
curl -X GET "http://localhost:3001/api/stores?page=1&limit=20&isActive=true" \
  -H "Content-Type: application/json"
```

### Teste de Criar Pedido (Autenticado)

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "storeId": "store-123",
    "items": [
      {
        "productId": "product-456",
        "quantity": 2,
        "customizations": ["custom-1"],
        "observations": "Sem cebola"
      }
    ],
    "deliveryAddress": {
      "street": "Rua Exemplo",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "zipCode": "01234567"
    },
    "paymentMethod": "pix"
  }'
```

---

## 📚 Referências

- Estrutura de tipos: `src/types/api.ts`
- Endpoints: `src/services/api/endpoints.ts`
- Validações: `src/utils/validation.ts`
- Validadores: `src/utils/validators/*.ts`

---

**Última atualização**: 2025-11-06

