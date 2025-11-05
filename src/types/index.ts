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
  AuthContextType,
} from './auth';

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

// API types
export type {
  ApiResponse,
  ApiError,
  ApiErrorResponse,
  PaginationParams,
  PaginatedResponse,
  RequestConfig,
  HttpMethod,
} from './api';

export { ApiException } from './api';

// Theme types
import type { Store } from './store';

export interface ThemeConfig {
  store: Store | null;
}

export interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
}
