/**
 * Hook para gerenciar clientes do merchant
 * Centraliza toda a lógica de busca de clientes
 */

import { useState, useEffect, useCallback } from 'react';
import { CustomerService } from '@/services/merchant/customerService';
import type { MerchantCustomer } from '@/types/merchant/customer';

interface UseCustomersParams {
  storeId: string | null;
}

export const useCustomers = ({ storeId }: UseCustomersParams) => {
  const [customers, setCustomers] = useState<MerchantCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carrega clientes da loja
   */
  const loadCustomers = useCallback(async () => {
    if (!storeId) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await CustomerService.getStoreCustomers(storeId);
      setCustomers(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err as Error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Carregar clientes quando o storeId mudar
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    loading,
    error,
    reload: loadCustomers,
  };
};

