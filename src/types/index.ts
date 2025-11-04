// Store types
export type { Store, StoreContextType } from './store';

// Auth types
export type { Customer, Merchant, LoginCredentials, AuthContextType } from './auth';

// Product types
export type { Product, ProductCustomization, CartItem } from './product';

// Order types
export type { Order, DeliveryAddress, CartContextType } from './order';

// Layout types
export type { LayoutVariant, LayoutProps } from './layout';

// Theme types
import type { Store } from './store';

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  store: Store | null;
}

export interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
}
