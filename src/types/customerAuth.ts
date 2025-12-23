import type { Customer, SignupCredentials } from './auth';

/**
 * Credenciais de login específicas para Customer
 * Customer precisa de storeId no login (pode vir da URL ou ser fornecido)
 */
export interface CustomerLoginCredentials {
  email: string;
  password: string;
  storeId?: string; // Opcional - pode ser obtido da URL quando disponível
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

