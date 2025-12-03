// Store types
export type {
  Store,
  StoreContextType,
  StoreProviderProps,
  ApiStoreResponse,
  ApiStoresResponse,
} from './store';

// Auth types
export type {
  Customer,
  Merchant,
  LoginCredentials,
  MerchantSignupCredentials,
  MerchantSignupResult,
  SignupCredentials,
} from './auth';

// Customer Auth types
export type {
  CustomerAuthContextType,
  CustomerLoginCredentials,
} from './customerAuth';

// Merchant Auth types
export type {
  MerchantAuthContextType,
  MerchantLoginCredentials,
} from './merchantAuth';

// Product types
export type {
  Product,
  ProductCustomization,
  CartItem,
  ProductCardProps,
} from './product';

// Order types
export type {
  Order,
  DeliveryAddress,
  CartContextType,
} from './order';

// Layout types
export type {
  LayoutVariant,
  LayoutProps,
  Category,
  CategoryCarouselProps,
} from './layout';

// API types - Genéricos
export type {
  ApiResponse,
  ApiError,
  ApiErrorResponse,
  PaginationParams,
  PaginatedResponse,
  RequestConfig,
  HttpMethod,
  ApiRequest,
  ApiResponseType,
} from './api';

export { ApiException } from './api';

// API types - Stores
export type {
  GetStoresRequest,
  GetStoresResponse,
  GetStoreByIdResponse,
  GetStoreProductsRequest,
  GetStoreProductsResponse,
  GetStoreCategoriesResponse,
  CreateStoreRequest,
  CreateStoreResponse,
  UpdateStoreRequest,
  UpdateStoreResponse,
} from './api';

// API types - Products
export type {
  GetProductByIdResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  DeleteProductResponse,
} from './api';

// API types - Auth
export type {
  CustomerLoginRequest,
  CustomerLoginResponse,
  MerchantLoginRequest,
  MerchantLoginResponse,
  LogoutResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './api';

// API types - Orders
export type {
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderByIdResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  UpdateOrderPaymentRequest,
  UpdateOrderPaymentResponse,
} from './api';

// Theme types
import type { Store } from './store';

export interface ThemeConfig {
  store: Store | null;
}

export interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
}
