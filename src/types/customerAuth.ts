import type { Customer, SignupCredentials } from './auth';

/**
 * Credenciais de login específicas para Customer
 * Customer precisa de storeId no login
 */
export interface CustomerLoginCredentials {
  email: string;
  password: string;
  storeId: string;
}

/**
 * Tipo do contexto de autenticação para Customer
 */
export interface CustomerAuthContextType {
  customer: Customer | null;
  login: (credentials: CustomerLoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCustomer: (updatedCustomer: Customer) => Promise<void>;
  loading: boolean;
}

