/**
 * Endpoints da API centralizados
 */

const API_BASE = '';

export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    CUSTOMER_LOGIN: `${API_BASE}/auth/customer/login`,
    MERCHANT_LOGIN: `${API_BASE}/auth/merchant/login`,
    PROFILE: `${API_BASE}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE}/auth/profile`,
  },

  // Lojas
  STORES: {
    BASE: `${API_BASE}/stores`,
    BY_ID: (id: string) => `${API_BASE}/stores/${id}`,
    BY_SLUG: (slug: string) => `${API_BASE}/stores/by-slug/${slug}`,
    PRODUCTS: (storeId: string) => `${API_BASE}/stores/${storeId}/products`,
    CATEGORIES: (storeId: string) => `${API_BASE}/stores/${storeId}/categories`,
    ORDERS: (storeId: string) => `${API_BASE}/stores/${storeId}/orders`,
  },

  // Produtos
  PRODUCTS: {
    BASE: `${API_BASE}/products`,
    BY_ID: (id: string) => `${API_BASE}/products/${id}`,
    BY_STORE: (storeId: string) => `${API_BASE}/products?storeId=${storeId}`,
  },

  // Pedidos
  ORDERS: {
    BASE: `${API_BASE}/orders`,
    BY_ID: (id: string) => `${API_BASE}/orders/${id}`,
    BY_CUSTOMER: (customerId: string) => `${API_BASE}/orders?customerId=${customerId}`,
    BY_STORE: (storeId: string) => `${API_BASE}/orders?storeId=${storeId}`,
    CREATE: `${API_BASE}/orders`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/orders/${id}/status`,
  },

  // Clientes
  CUSTOMERS: {
    BASE: `${API_BASE}/customers`,
    BY_ID: (id: string) => `${API_BASE}/customers/${id}`,
    ADDRESSES: (customerId: string) => `${API_BASE}/customers/${customerId}/addresses`,
    UPDATE_ADDRESS: (customerId: string, addressId: string) =>
      `${API_BASE}/customers/${customerId}/addresses/${addressId}`,
  },
} as const;
