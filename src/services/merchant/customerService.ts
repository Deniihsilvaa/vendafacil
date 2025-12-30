/**
 * Serviço para gerenciar clientes do Merchant
 */

import type { MerchantCustomer, MerchantCustomersResponse } from '@/types/merchant/customer';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { showErrorToast } from '@/utils/toast';

export class CustomerService {
  /**
   * Lista todos os clientes associados à loja
   * @param storeId UUID da loja ou slug
   * @returns Lista de clientes da loja
   */
  static async getStoreCustomers(storeId: string): Promise<MerchantCustomer[]> {
    try {
      const response = await apiClient.get<MerchantCustomersResponse>(
        API_ENDPOINTS.MERCHANT.GET_CUSTOMERS(storeId)
      );

      // A resposta da API vem como { success: true, data: { customers: [...], total: ... }, timestamp: ... }
      // O apiClient retorna ApiResponse<T> onde T é MerchantCustomersResponse
      // Então response.data é MerchantCustomersResponse { success, data, timestamp }
      // E precisamos acessar response.data.data.customers
      let customers: MerchantCustomer[] = [];

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Se tem a estrutura ApiResponse aninhada
        const apiResponse = response.data as MerchantCustomersResponse;
        if (apiResponse.data && apiResponse.data.customers) {
          customers = apiResponse.data.customers;
        }
      } else if (response.data && typeof response.data === 'object' && 'customers' in response.data) {
        // Fallback: tentar acesso direto caso a estrutura seja diferente
        const directResponse = response.data as { customers: MerchantCustomer[] };
        customers = directResponse.customers;
      }

      if (!customers || !Array.isArray(customers)) {
        console.error('Estrutura de resposta inesperada:', response);
        throw new Error('Resposta inválida da API');
      }

      return customers;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      showErrorToast(error as Error, 'Erro ao carregar clientes');
      throw error;
    }
  }
}

