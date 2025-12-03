import type { Merchant, MerchantSignupCredentials } from './auth';

/**
 * Credenciais de login específicas para Merchant
 * Merchant não precisa de storeId no login
 */
export interface MerchantLoginCredentials {
  email: string;
  password: string;
}

/**
 * Tipo do contexto de autenticação para Merchant
 */
export interface MerchantAuthContextType {
  merchant: Merchant | null;
  login: (credentials: MerchantLoginCredentials) => Promise<void>;
  signup: (credentials: MerchantSignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateMerchant: (updatedMerchant: Merchant) => Promise<void>;
  loading: boolean;
}

