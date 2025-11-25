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
  storeId: string;
  role: 'admin' | 'manager';
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  storeId?: string; // Obrigatório para login de cliente
}

export interface AuthContextType {
  user: Customer | Merchant | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Customer | Merchant) => Promise<void>;
  isCustomer: boolean;
  isMerchant: boolean;
  loading: boolean;
}
