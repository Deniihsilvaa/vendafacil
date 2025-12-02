/**
 * Tipos padronizados para API
 */

import type { Store } from './store';
import type { Product, ProductCustomization } from './product';
import type { Customer, Merchant } from './auth';
import type { Order, DeliveryAddress } from './order';

// ============================================================================
// TIPOS GENÉRICOS
// ============================================================================

// Resposta genérica da API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Erro padronizado da API
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>; // Validações de campo
  timestamp?: string;
}

// Resposta de erro da API
export interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

// Parâmetros de paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Configurações de requisição
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  useCache?: boolean; // Usar cache para GET requests
  cacheTags?: string[]; // Tags para invalidação de cache
}

// Métodos HTTP suportados
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Classe de erro customizada
export class ApiException extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    code?: string,
    status?: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.errors = errors;
    
    // Mantém o stack trace correto (Node.js/V8)
    // @ts-ignore - captureStackTrace não está no tipo Error do TypeScript
    if (typeof Error.captureStackTrace === 'function') {
      // @ts-ignore
      Error.captureStackTrace(this, ApiException);
    }
  }
}

// ============================================================================
// TIPOS ESPECÍFICOS - STORES
// ============================================================================

// GET /stores - Listar lojas
export interface GetStoresRequest extends PaginationParams {
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface GetStoresResponse extends ApiResponse<PaginatedResponse<Store>> {}

// GET /stores/:id - Buscar loja por ID
export interface GetStoreByIdResponse extends ApiResponse<Store> {
  data: Store & {
    hasProducts: boolean;
    productCount: number;
  };
}

// GET /stores/:id/products - Buscar produtos da loja
export interface GetStoreProductsRequest extends PaginationParams {
  category?: string;
  search?: string;
  isActive?: boolean;
}

export interface GetStoreProductsResponse extends ApiResponse<PaginatedResponse<Product>> {}

// GET /stores/:id/categories - Buscar categorias da loja
export interface GetStoreCategoriesResponse extends ApiResponse<string[]> {}

// POST /stores - Criar loja (merchant)
export interface CreateStoreRequest {
  name: string;
  slug: string;
  description: string;
  category: string;
  avatar?: string;
  banner?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor?: string;
  };
  settings: {
    isActive: boolean;
    deliveryTime: string;
    minOrderValue: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    acceptsPayment: {
      creditCard: boolean;
      debitCard: boolean;
      pix: boolean;
      cash: boolean;
    };
  };
  info: {
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    workingHours: {
      [key: string]: { open: string; close: string; closed?: boolean };
    };
  };
}

export interface CreateStoreResponse extends ApiResponse<Store> {}

// PUT /stores/:id - Atualizar loja (merchant)
export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {}

export interface UpdateStoreResponse extends ApiResponse<Store> {}

// ============================================================================
// TIPOS ESPECÍFICOS - PRODUCTS
// ============================================================================

// GET /products/:id - Buscar produto por ID
export interface GetProductByIdResponse extends ApiResponse<Product> {}

// POST /stores/:storeId/products - Criar produto (merchant)
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isActive: boolean;
  customizations?: Omit<ProductCustomization, 'id'>[];
  preparationTime: number;
  nutritionalInfo?: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export interface CreateProductResponse extends ApiResponse<Product> {}

// PUT /products/:id - Atualizar produto (merchant)
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface UpdateProductResponse extends ApiResponse<Product> {}

// DELETE /products/:id - Deletar produto (merchant)
export interface DeleteProductResponse extends ApiResponse<{ id: string }> {}

// ============================================================================
// TIPOS ESPECÍFICOS - AUTH
// ============================================================================

// POST /auth/customer/login - Login do cliente
export interface CustomerLoginRequest {
  phone: string;
}

export interface CustomerLoginResponse extends ApiResponse<{
  user: Customer;
  token?: string;
}> {}

// POST /auth/merchant/login - Login do lojista
export interface MerchantLoginRequest {
  email: string;
  password: string;
}

export interface MerchantLoginResponse extends ApiResponse<{
  user: Merchant;
  token?: string;
}> {}

// POST /auth/logout - Logout
export interface LogoutResponse extends ApiResponse<{ success: boolean }> {}

// GET /auth/profile - Buscar perfil do usuário
export interface GetProfileResponse extends ApiResponse<Customer | Merchant> {}

// PUT /auth/profile - Atualizar perfil do usuário
// Suporta dois formatos para addresses:
// 1. Array simples (substituição total)
// 2. Operações parciais (add, update, remove)
export interface AddressInput {
  id?: string; // Obrigatório para update
  label?: string;
  addressType?: 'home' | 'work' | 'other';
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  reference?: string;
  isDefault?: boolean;
}

// Request para PUT /api/auth/profile (aceita array simples ou operações parciais)
export interface UpdateProfileRequest {
  name?: string; // mínimo 2, máximo 100 caracteres
  phone?: string; // mínimo 10, máximo 15 caracteres
  // Formato 1: Array simples (substituição total) OU
  // Formato 2: Operações parciais (recomendado)
  addresses?: AddressInput[] | {
    add?: AddressInput[];
    update?: AddressInput[];
    remove?: string[]; // Array de IDs
  };
}

// Request para PATCH /api/auth/profile (aceita apenas operações parciais)
export interface PatchProfileRequest {
  name?: string; // mínimo 2, máximo 100 caracteres
  phone?: string; // mínimo 10, máximo 15 caracteres
  // Apenas operações parciais (não aceita array simples)
  addresses?: {
    add?: AddressInput[];
    update?: AddressInput[];
    remove?: string[]; // Array de IDs
  };
}

export interface UpdateProfileResponse extends ApiResponse<Customer | Merchant> {}

// ============================================================================
// TIPOS ESPECÍFICOS - ORDERS
// ============================================================================

// GET /orders - Listar pedidos
export interface GetOrdersRequest extends PaginationParams {
  status?: Order['status'];
  storeId?: string;
  customerId?: string;
}

export interface GetOrdersResponse extends ApiResponse<PaginatedResponse<Order>> {}

// GET /orders/:id - Buscar pedido por ID
export interface GetOrderByIdResponse extends ApiResponse<Order> {}

// POST /orders - Criar pedido
export interface CreateOrderRequest {
  storeId: string;
  items: {
    productId: string;
    quantity: number;
    customizations: string[]; // IDs das customizações
    observations?: string;
  }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: Order['paymentMethod'];
  observations?: string;
}

export interface CreateOrderResponse extends ApiResponse<Order> {}

// PUT /orders/:id/status - Atualizar status do pedido
export interface UpdateOrderStatusRequest {
  status: Order['status'];
}

export interface UpdateOrderStatusResponse extends ApiResponse<Order> {}

// PUT /orders/:id/payment - Atualizar status de pagamento
export interface UpdateOrderPaymentRequest {
  paymentStatus: Order['paymentStatus'];
}

export interface UpdateOrderPaymentResponse extends ApiResponse<Order> {}

// ============================================================================
// TIPOS DE UNIÃO PARA FACILITAR USO
// ============================================================================

// Union type para todas as requisições possíveis
export type ApiRequest =
  | GetStoresRequest
  | GetStoreProductsRequest
  | CreateStoreRequest
  | UpdateStoreRequest
  | CreateProductRequest
  | UpdateProductRequest
  | CustomerLoginRequest
  | MerchantLoginRequest
  | UpdateProfileRequest
  | GetOrdersRequest
  | CreateOrderRequest
  | UpdateOrderStatusRequest
  | UpdateOrderPaymentRequest;

// Union type para todas as respostas possíveis
export type ApiResponseType =
  | GetStoresResponse
  | GetStoreByIdResponse
  | GetStoreProductsResponse
  | GetStoreCategoriesResponse
  | CreateStoreResponse
  | UpdateStoreResponse
  | GetProductByIdResponse
  | CreateProductResponse
  | UpdateProductResponse
  | DeleteProductResponse
  | CustomerLoginResponse
  | MerchantLoginResponse
  | LogoutResponse
  | GetProfileResponse
  | UpdateProfileResponse
  | GetOrdersResponse
  | GetOrderByIdResponse
  | CreateOrderResponse
  | UpdateOrderStatusResponse
  | UpdateOrderPaymentResponse;
