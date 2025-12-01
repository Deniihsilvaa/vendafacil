// hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { OrdersListParams, OrdersListResponse, OrderListItem } from '@/types/order';
import type { RequestConfig } from '@/types/api';

export const useOrders = (initialParams: OrdersListParams = {}) => {
  const [orders, setOrders] = useState<OrdersListResponse | OrderListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<OrdersListParams>(initialParams);

  const fetchOrders = async (searchParams: OrdersListParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...params, ...searchParams };
      
      // Buscar storeId do localStorage se necessário
      let storeId: string | undefined = mergedParams.storeId;
      if (storeId) {
        const storedData = localStorage.getItem(`store_${storeId}`);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            storeId = parsedData.store?.id || storeId;
          } catch (e) {
            console.error('Erro ao parsear dados da loja:', e);
          }
        }
      }

      // Construir query params
      const queryParams = new URLSearchParams();
      if (mergedParams.page) queryParams.append('page', mergedParams.page.toString());
      if (mergedParams.limit) queryParams.append('limit', mergedParams.limit.toString());
      if (mergedParams.status) queryParams.append('status', mergedParams.status);
      if (storeId) queryParams.append('storeId', storeId);
      if (mergedParams.customerId) queryParams.append('customerId', mergedParams.customerId);

      // Fazer requisição direta à API
      const endpoint = `${API_ENDPOINTS.ORDERS.BASE}?${queryParams.toString()}`;
      const response = await apiClient.get<{ success: boolean; data: OrdersListResponse } | OrdersListResponse | OrderListItem[]>(
        endpoint,
        {
          useCache: true,
        } as RequestConfig
      );

      // Extrair dados da resposta
      let ordersData: OrdersListResponse | OrderListItem[] | null = null;
      
      const responseData = response.data as 
        | { success: boolean; data: OrdersListResponse }
        | OrdersListResponse
        | OrderListItem[];
      
      // Verificar se é objeto com success e data
      if ('success' in responseData && 'data' in responseData && responseData.success) {
        const data = responseData.data;
        if ('items' in data && 'pagination' in data) {
          ordersData = data as OrdersListResponse;
        } else if (Array.isArray(data)) {
          ordersData = data as OrderListItem[];
        }
      } 
      // Verificar se é OrdersListResponse direto
      else if ('items' in responseData && 'pagination' in responseData) {
        ordersData = responseData as OrdersListResponse;
      } 
      // Verificar se é array direto
      else if (Array.isArray(responseData)) {
        ordersData = responseData as OrderListItem[];
      }

      setOrders(ordersData);
      setParams(mergedParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (newParams: Partial<OrdersListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Carregar pedidos quando os parâmetros mudarem
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.status, params.storeId, params.customerId]);

  return {
    orders,
    loading,
    error,
    params,
    fetchOrders,
    updateParams,
    refetch: () => fetchOrders(params),
  };
};