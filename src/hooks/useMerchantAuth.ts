import { useContext } from 'react';
import { MerchantAuthContext } from '@/contexts/Definitions/MerchantAuthContextDefinition';
import { MERCHANT_LOGIN_CATEGORIES } from '@/services/merchant/merchantService';

/**
 * Hook para acessar o contexto de autenticação do Merchant
 * Deve ser usado dentro de MerchantAuthProvider
 * 
 * Retorna:
 * - merchant: dados do merchant logado
 * - login: função para fazer login
 * - signup: função para criar conta
 * - logout: função para sair
 * - updateMerchant: função para atualizar dados
 * - loading: estado de carregamento
 * - categories: lista de categorias disponíveis para cadastro
 */
export const useMerchantAuth = () => {
  const context = useContext(MerchantAuthContext);
  if (context === undefined) {
    throw new Error('useMerchantAuth must be used within a MerchantAuthProvider');
  }
  
  // Adicionar as categorias ao contexto
  return {
    ...context,
    categories: MERCHANT_LOGIN_CATEGORIES,
  };
};

