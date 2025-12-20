/**
 * Hooks relacionados ao Merchant
 * 
 * Para autenticação de merchant, use:
 * - useMerchantAuth (principal) - contém login, signup, logout, merchant, loading e categories
 * 
 * Este arquivo pode conter hooks auxiliares para funcionalidades específicas do merchant
 */

import { MERCHANT_LOGIN_CATEGORIES } from '@/services/merchant/merchantService';

/**
 * Hook para obter as categorias de lojas disponíveis
 * @deprecated Use useMerchantAuth().categories ao invés disso
 */
export const useMerchantCategories = () => {
  return MERCHANT_LOGIN_CATEGORIES;
};

// Exportar constantes úteis
export { MERCHANT_LOGIN_CATEGORIES };
