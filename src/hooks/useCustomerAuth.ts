import { useContext } from 'react';
import { AuthContext } from '@/contexts/Definitions/AuthContextDefinition';

/**
 * Hook para acessar o contexto de autenticação do Customer
 * Deve ser usado dentro de AuthProvider
 */
export const useCustomerAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within an AuthProvider');
  }
  return context;
};

