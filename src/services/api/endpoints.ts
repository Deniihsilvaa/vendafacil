/**
 * Endpoints da API centralizados
 * Baseado na estrutura do frontend
 */

const API_BASE = '/api';

export const API_ENDPOINTS = {
  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================
  AUTH: {
    // Login de cliente (por email/senha)
    CUSTOMER_LOGIN: `${API_BASE}/auth/customer/login`,
    
    // Login de lojista (por email/senha)
    MERCHANT_LOGIN: `${API_BASE}/auth/merchant/login`,
    
    // Refresh token
    REFRESH: `${API_BASE}/auth/refresh`,
    
    // Logout
    LOGOUT: `${API_BASE}/auth/logout`,
    
    // Perfil do usuário autenticado
    PROFILE: `${API_BASE}/auth/profile`,
    
    // Atualizar perfil
    UPDATE_PROFILE: `${API_BASE}/auth/profile`,
  },

  // ============================================================================
  // LOJAS (STORES)
  // ============================================================================
  STORES: {
    // Listar todas as lojas
    BASE: `${API_BASE}/stores`,
    
    // Buscar loja por ID
    BY_ID: (id: string) => `${API_BASE}/stores/${id}`,
    
    // Buscar loja por slug
    BY_SLUG: (slug: string) => `${API_BASE}/stores/by-slug/${slug}`,
    
    // Produtos de uma loja
    PRODUCTS: (storeId: string) => `${API_BASE}/stores/${storeId}/products`,
    
    // Categorias de uma loja
    CATEGORIES: (storeId: string) => `${API_BASE}/stores/${storeId}/categories`,
    
    // Pedidos de uma loja (merchant)
    ORDERS: (storeId: string) => `${API_BASE}/stores/${storeId}/orders`,
    
    // Criar loja (merchant)
    CREATE: `${API_BASE}/stores`,
    
    // Atualizar loja (merchant)
    UPDATE: (id: string) => `${API_BASE}/stores/${id}`,
  },

  // ============================================================================
  // PRODUTOS (PRODUCTS)
  // ============================================================================
  PRODUCTS: {
    // Listar produtos
    BASE: `${API_BASE}/products`,
    
    // Buscar produto por ID
    BY_ID: (id: string) => `${API_BASE}/products/${id}`,
    
    // Buscar produtos por loja
    BY_STORE: (storeId: string) => `${API_BASE}/products?storeId=${storeId}`,
    
    // Criar produto (merchant)
    CREATE: (storeId: string) => `${API_BASE}/stores/${storeId}/products`,
    
    // Atualizar produto (merchant)
    UPDATE: (id: string) => `${API_BASE}/products/${id}`,
    
    // Deletar produto (merchant)
    DELETE: (id: string) => `${API_BASE}/products/${id}`,
  },

  // ============================================================================
  // PEDIDOS (ORDERS)
  // ============================================================================
  ORDERS: {
    // Listar pedidos
    BASE: `${API_BASE}/orders`,
    
    // Buscar pedido por ID
    BY_ID: (id: string) => `${API_BASE}/orders/${id}`,
    
    // Buscar pedidos por cliente
    BY_CUSTOMER: (customerId: string) => `${API_BASE}/orders?customerId=${customerId}`,
    
    // Buscar pedidos por loja
    BY_STORE: (storeId: string) => `${API_BASE}/orders?storeId=${storeId}`,
    
    // Criar pedido
    CREATE: `${API_BASE}/orders`,
    
    // Atualizar status do pedido
    UPDATE_STATUS: (id: string) => `${API_BASE}/orders/${id}/status`,
    
    // Atualizar status de pagamento
    UPDATE_PAYMENT: (id: string) => `${API_BASE}/orders/${id}/payment`,
  },

  // ============================================================================
  // CLIENTES (CUSTOMERS)
  // ============================================================================
  CUSTOMERS: {
    // Listar clientes (admin/merchant)
    BASE: `${API_BASE}/customers`,
    
    // Buscar cliente por ID
    BY_ID: (id: string) => `${API_BASE}/customers/${id}`,
    
    // Endereços de um cliente
    ADDRESSES: (customerId: string) => `${API_BASE}/customers/${customerId}/addresses`,
    
    // Atualizar endereço de um cliente
    UPDATE_ADDRESS: (customerId: string, addressId: string) =>
      `${API_BASE}/customers/${customerId}/addresses/${addressId}`,
    
    // Criar endereço para um cliente
    CREATE_ADDRESS: (customerId: string) =>
      `${API_BASE}/customers/${customerId}/addresses`,
    
    // Deletar endereço de um cliente
    DELETE_ADDRESS: (customerId: string, addressId: string) =>
      `${API_BASE}/customers/${customerId}/addresses/${addressId}`,
  },
} as const;
