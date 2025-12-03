import { useContext } from 'react';
import { MerchantAuthContext } from '@/contexts/Definitions/MerchantAuthContextDefinition';

/**
 * Hook para acessar o contexto de autenticação do Merchant
 * Deve ser usado dentro de MerchantAuthProvider
 */
export const useMerchantAuth = () => {
  const context = useContext(MerchantAuthContext);
  if (context === undefined) {
    throw new Error('useMerchantAuth must be used within a MerchantAuthProvider');
  }
  return context;
};

