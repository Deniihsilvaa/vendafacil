import type { DeliveryAddress } from './order';

export interface Customer {
  id: string;
  email: string;
  phone: string;
  name: string;
  storeId: string;
  addresses?: {
    home?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string };
    work?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string };
  };
  updatedAt?: string;
}

export interface Merchant {
  id: string;
  email: string;
  storeId?: string; // Opcional, pois pode ter múltiplas lojas
  role: 'admin' | 'manager';
  stores?: MerchantStore[];
}

export interface MerchantStore {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  merchant_role: string | null; // Role do merchant na loja (owner ou member role)
  is_owner: boolean; // Se é dono da loja
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export type MerchantLoginResult = {
  user: {
    id: string;
    email: string;
    role: string;
  };
  stores: MerchantStore[];
} & AuthTokens;

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  storeId?: string; // Obrigatório para login de cliente
}

export interface SignupCredentials {
  email: string;
  password: string;
  storeId: string;
  name: string;
  phone: string;
}

export interface MerchantSignupCredentials {
  email: string;
  password: string;
  storeName: string;
  storeDescription?: string;
  storeCategory?: 'hamburgueria' | 'pizzaria' | 'pastelaria' | 'sorveteria' | 'cafeteria' | 'padaria' | 'comida_brasileira' | 'comida_japonesa' | 'doces' | 'mercado' | 'outros';
  customCategory?: string;
}

export interface MerchantSignupResult {
  success: boolean;
  merchant: {
    id: string;
    email: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AuthContextType {
  user: Customer | Merchant | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginMerchant: (credentials: LoginCredentials) => Promise<void>;
  signupMerchant: (credentials: MerchantSignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Customer | Merchant) => Promise<void>;
  isCustomer: boolean;
  isMerchant: boolean;
  loading: boolean;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
}
