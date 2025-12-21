# 🔒 Guia de Segurança Backend - StoreFlow

## 📋 Visão Geral

Este documento fornece diretrizes detalhadas para implementar segurança adequada no backend, incluindo autenticação, autorização e diferenciação entre Clientes e Lojistas.

---

## 🎯 Diferenciação Cliente vs Lojista

### Estrutura do Token JWT

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

### Verificação de Tipo

```javascript
// Middleware: verifyUserType
function verifyUserType(req, res, next) {
  const user = req.user; // do middleware verifyToken
  
  if (user.type === 'customer') {
    req.userType = 'customer';
    req.isCustomer = true;
    req.isMerchant = false;
  } else if (user.type === 'merchant') {
    req.userType = 'merchant';
    req.isCustomer = false;
    req.isMerchant = true;
  } else {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Tipo de usuário inválido',
        code: 'INVALID_USER_TYPE',
        status: 401
      }
    });
  }
  
  next();
}
```

---

## 🔐 Middleware de Autenticação

### 1. Verificar Token

```javascript
// Middleware: verifyToken
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token não fornecido',
        code: 'NO_TOKEN',
        status: 401
      }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED',
          status: 401
        }
      });
    }
    
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido',
        code: 'INVALID_TOKEN',
        status: 401
      }
    });
  }
}
```

### 2. Requer Cliente

```javascript
// Middleware: requireCustomer
function requireCustomer(req, res, next) {
  if (!req.user || req.user.type !== 'customer') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Acesso negado. Apenas clientes podem acessar este recurso.',
        code: 'CUSTOMER_REQUIRED',
        status: 403
      }
    });
  }
  next();
}
```

### 3. Requer Lojista

```javascript
// Middleware: requireMerchant
function requireMerchant(req, res, next) {
  if (!req.user || req.user.type !== 'merchant') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Acesso negado. Apenas lojistas podem acessar este recurso.',
        code: 'MERCHANT_REQUIRED',
        status: 403
      }
    });
  }
  next();
}
```

### 4. Requer Proprietário da Loja

```javascript
// Middleware: requireStoreOwner
async function requireStoreOwner(req, res, next) {
  const storeId = req.params.storeId || req.params.id;
  const merchantId = req.user.userId;
  
  // Verificar se o merchant possui a loja
  const store = await Store.findOne({
    where: { id: storeId, merchantId: merchantId }
  });
  
  if (!store) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Você não tem permissão para acessar esta loja',
        code: 'STORE_OWNER_REQUIRED',
        status: 403
      }
    });
  }
  
  req.store = store;
  next();
}
```

### 5. Verificar Acesso ao Próprio Recurso

```javascript
// Middleware: requireOwnResource
function requireOwnResource(req, res, next) {
  const resourceUserId = req.params.userId || req.params.customerId;
  const currentUserId = req.user.userId;
  
  // Se for customer, só pode acessar seus próprios recursos
  if (req.user.type === 'customer') {
    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Você não tem permissão para acessar este recurso',
          code: 'FORBIDDEN',
          status: 403
        }
      });
    }
  }
  
  // Se for merchant, pode acessar recursos relacionados às suas lojas
  // (implementar lógica específica conforme necessário)
  
  next();
}
```

---

## 🛡️ Regras de Autorização por Rota

### Rotas Públicas (Sem Autenticação)

- `GET /api/stores`
- `GET /api/stores/:id`
- `GET /api/stores/by-slug/:slug`
- `GET /api/stores/:storeId/products`
- `GET /api/stores/:storeId/categories`
- `GET /api/products/:id`
- `POST /api/auth/customer/login`
- `POST /api/auth/merchant/login`
- `POST /api/auth/refresh`

### Rotas de Cliente (requireCustomer)

- `GET /api/auth/profile` (próprio perfil)
- `PUT /api/auth/profile` (próprio perfil)
- `POST /api/orders` (criar pedido)
- `GET /api/orders` (apenas próprios pedidos)
- `GET /api/orders/:id` (apenas próprio pedido)
- `GET /api/customers/:customerId/addresses` (próprios endereços)
- `POST /api/customers/:customerId/addresses` (próprios endereços)
- `PUT /api/customers/:customerId/addresses/:addressId` (próprio endereço)
- `DELETE /api/customers/:customerId/addresses/:addressId` (próprio endereço)

### Rotas de Lojista (requireMerchant)

- `GET /api/auth/profile` (próprio perfil)
- `PUT /api/auth/profile` (próprio perfil)
- `POST /api/stores` (criar loja)
- `PUT /api/stores/:id` (requireStoreOwner)
- `POST /api/stores/:storeId/products` (requireStoreOwner)
- `PUT /api/products/:id` (requireStoreOwner)
- `DELETE /api/products/:id` (requireStoreOwner)
- `GET /api/orders` (apenas pedidos de suas lojas)
- `GET /api/orders/:id` (apenas pedido de sua loja)
- `PUT /api/orders/:id/status` (requireStoreOwner)
- `PUT /api/orders/:id/payment` (requireStoreOwner)
- `GET /api/stores/:storeId/orders` (requireStoreOwner)

---

## 🔄 Refresh Token

### Implementação

```javascript
// POST /api/auth/refresh
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Refresh token não fornecido',
        code: 'NO_REFRESH_TOKEN',
        status: 400
      }
    });
  }
  
  try {
    // Verificar refresh token no banco
    const tokenData = await RefreshToken.findOne({
      where: { token: refreshToken, isActive: true }
    });
    
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token inválido ou expirado',
          code: 'INVALID_REFRESH_TOKEN',
          status: 401
        }
      });
    }
    
    // Buscar usuário
    const user = await User.findByPk(tokenData.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
          status: 401
        }
      });
    }
    
    // Gerar novo access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        type: user.type,
        storeId: user.storeId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Opcional: Renovar refresh token também
    const newRefreshToken = generateRefreshToken();
    await RefreshToken.update(
      { token: newRefreshToken, expiresAt: addDays(new Date(), 7) },
      { where: { id: tokenData.id } }
    );
    
    return res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken // opcional
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erro ao renovar token',
        code: 'REFRESH_ERROR',
        status: 500
      }
    });
  }
}
```

### Estrutura da Tabela RefreshToken

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔍 Validações de Segurança

### 1. Validação de Input

```javascript
// Usar biblioteca de validação (ex: Joi, Yup, Zod)
const { body, validationResult } = require('express-validator');

// Exemplo: Validação de login de cliente
const validateCustomerLogin = [
  body('phone')
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^[\d\s\(\)\-\+]+$/).withMessage('Telefone inválido')
    .custom((value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) {
        throw new Error('Telefone deve ter 10 ou 11 dígitos');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Erro de validação',
          code: 'VALIDATION_ERROR',
          status: 422,
          errors: errors.mapped()
        }
      });
    }
    next();
  }
];
```

### 2. Sanitização

```javascript
// Sanitizar dados de entrada
const validator = require('validator');

function sanitizeInput(req, res, next) {
  // Sanitizar strings
  if (req.body.name) {
    req.body.name = validator.escape(req.body.name.trim());
  }
  
  if (req.body.email) {
    req.body.email = validator.normalizeEmail(req.body.email);
  }
  
  // Remover caracteres perigosos
  // ...
  
  next();
}
```

### 3. Rate Limiting

```javascript
// Usar express-rate-limit
const rateLimit = require('express-rate-limit');

// Rate limit para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    success: false,
    error: {
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'TOO_MANY_REQUESTS',
      status: 429
    }
  }
});

// Aplicar em rotas de login
app.post('/api/auth/customer/login', loginLimiter, ...);
app.post('/api/auth/merchant/login', loginLimiter, ...);
```

---

## 🛡️ Proteção contra Ataques Comuns

### 1. SQL Injection

- Usar query builders (ex: Sequelize, TypeORM) ou prepared statements
- Nunca concatenar strings em queries SQL
- Validar e sanitizar todos os inputs

### 2. XSS (Cross-Site Scripting)

- Sanitizar todos os dados de entrada
- Usar CSP (Content Security Policy) headers
- Escapar dados antes de renderizar no frontend

### 3. CSRF (Cross-Site Request Forgery)

- Usar tokens CSRF para operações sensíveis
- Validar origem das requisições
- Usar SameSite cookies

### 4. Sensitive Data Exposure

- Nunca retornar senhas ou tokens completos
- Usar HTTPS em produção
- Armazenar senhas com hash (bcrypt, argon2)
- Não logar informações sensíveis

### 5. Broken Authentication

- Implementar expiração de tokens
- Invalidar tokens em logout
- Usar refresh tokens
- Implementar rate limiting em login

---

## 📝 Exemplo de Implementação Completa

### Rota de Criar Pedido (Customer)

```javascript
// POST /api/orders
const express = require('express');
const router = express.Router();
const { verifyToken, requireCustomer } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validation');

router.post(
  '/',
  verifyToken,
  requireCustomer,
  validateCreateOrder,
  async (req, res) => {
    try {
      const customerId = req.user.userId;
      const { storeId, items, deliveryAddress, paymentMethod, observations } = req.body;
      
      // Verificar se a loja existe e está ativa
      const store = await Store.findByPk(storeId);
      if (!store || !store.settings.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Loja não encontrada ou inativa',
            code: 'STORE_NOT_FOUND',
            status: 400
          }
        });
      }
      
      // Calcular total
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product || !product.isActive || product.storeId !== storeId) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Produto ${item.productId} não encontrado ou inativo`,
              code: 'PRODUCT_NOT_FOUND',
              status: 400
            }
          });
        }
        
        // Calcular preço com customizações
        let itemTotal = product.price * item.quantity;
        if (item.customizations && item.customizations.length > 0) {
          const customizations = await ProductCustomization.findAll({
            where: { id: item.customizations }
          });
          itemTotal += customizations.reduce((sum, c) => sum + c.price, 0) * item.quantity;
        }
        
        totalAmount += itemTotal;
        
        orderItems.push({
          product,
          quantity: item.quantity,
          customizations: item.customizations || [],
          totalPrice: itemTotal,
          observations: item.observations
        });
      }
      
      // Verificar valor mínimo
      if (totalAmount < store.settings.minOrderValue) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Valor mínimo do pedido não atingido',
            code: 'MIN_ORDER_VALUE',
            status: 400,
            errors: {
              totalAmount: [`Valor mínimo: R$ ${store.settings.minOrderValue.toFixed(2)}`]
            }
          }
        });
      }
      
      // Calcular taxa de entrega
      const deliveryFee = totalAmount >= store.settings.freeDeliveryAbove
        ? 0
        : store.settings.deliveryFee;
      
      // Criar pedido
      const order = await Order.create({
        customerId,
        storeId,
        items: orderItems,
        totalAmount: totalAmount + deliveryFee,
        deliveryFee,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        deliveryAddress,
        observations,
        estimatedDeliveryTime: calculateDeliveryTime(store.settings.deliveryTime)
      });
      
      return res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      });
    }
  }
);

module.exports = router;
```

---

## 🔐 Variáveis de Ambiente

```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vendafacil

# CORS
CORS_ORIGIN=http://localhost:3000,https://vendarapido.netlify.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## ✅ Checklist de Segurança

- [ ] Tokens JWT com expiração adequada
- [ ] Refresh tokens implementados
- [ ] Middleware de autenticação em todas as rotas protegidas
- [ ] Verificação de tipo de usuário (customer/merchant)
- [ ] Verificação de propriedade de recursos
- [ ] Validação de todos os inputs
- [ ] Sanitização de dados
- [ ] Rate limiting em login
- [ ] Senhas hasheadas (bcrypt/argon2)
- [ ] HTTPS em produção
- [ ] CORS configurado
- [ ] Headers de segurança (CSP, X-Frame-Options, etc.)
- [ ] Logs de segurança
- [ ] Tratamento de erros sem expor informações sensíveis
- [ ] Validação de permissões em cada operação

---

**Última atualização**: 2024-01-01

