// hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { OrdersListParams, OrdersListResponse, OrderListItem } from '@/types/order';
import type { RequestConfig } from '@/types/api';
import { useOrdersRealtime } from './useOrdersRealtime';
import type { OrderRealtimePayload } from '@/lib/supabase/realtime-orders';

export interface UseOrdersOptions extends OrdersListParams {
  /**
   * Habilitar sincronização em tempo real (padrão: true)
   */
  enableRealtime?: boolean;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const {
    enableRealtime = true,
    ...initialParams
  } = options;

  const [orders, setOrders] = useState<OrdersListResponse | OrderListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<OrdersListParams>(initialParams);

  const fetchOrders = useCallback(async (searchParams: OrdersListParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...params, ...searchParams };
      
      // A API aceita tanto UUID quanto slug, então não precisamos converter
      const storeId: string | undefined = mergedParams.storeId;

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
  }, [params]);

  const updateParams = (newParams: Partial<OrdersListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Carregar pedidos quando os parâmetros mudarem
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.status, params.storeId, params.customerId]);

  /**
   * Handler para atualizações em tempo real
   * Atualiza a lista de pedidos quando há mudanças via realtime
   */
  const handleRealtimeChange = useCallback((payload: OrderRealtimePayload) => {
    console.log('🔄 Atualizando lista de pedidos via realtime:', payload.eventType);

    // Atualizar lista baseado no tipo de evento
    if (payload.eventType === 'INSERT' && payload.new) {
      // Novo pedido criado - adicionar à lista (se passar pelos filtros atuais)
      setOrders((currentOrders) => {
        if (!currentOrders) return null;

        // Se for array simples
        if (Array.isArray(currentOrders)) {
          // Verificar se já existe (evitar duplicatas)
          const exists = currentOrders.some((order) => order.id === payload.new?.id);
          if (exists) return currentOrders;

          // Adicionar novo pedido no início da lista
          // Nota: O formato pode ser diferente, então apenas recarregar é mais seguro
          fetchOrders(params);
          return currentOrders;
        }

        // Se for OrdersListResponse com paginação
        if ('items' in currentOrders) {
          // Verificar se já existe
          const exists = currentOrders.items.some((order: OrderListItem) => order.id === payload.new?.id);
          if (exists) return currentOrders;

          // Recarregar para garantir ordem correta
          fetchOrders(params);
          return currentOrders;
        }

        return currentOrders;
      });
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      // Pedido atualizado - atualizar na lista
      setOrders((currentOrders) => {
        if (!currentOrders) return null;

        // Se for array simples
        if (Array.isArray(currentOrders)) {
          const index = currentOrders.findIndex((order) => order.id === payload.new?.id);
          if (index !== -1) {
            // Atualizar pedido existente
            const updated = [...currentOrders];
            // Nota: payload.new pode ter formato diferente, então recarregar é mais seguro
            fetchOrders(params);
            return updated;
          }
        }

        // Se for OrdersListResponse
        if ('items' in currentOrders) {
          const index = currentOrders.items.findIndex((order: OrderListItem) => order.id === payload.new?.id);
          if (index !== -1) {
            // Recarregar para garantir dados atualizados
            fetchOrders(params);
            return currentOrders;
          }
        }

        return currentOrders;
      });
    } else if (payload.eventType === 'DELETE' && payload.old) {
      // Pedido deletado - remover da lista
      setOrders((currentOrders) => {
        if (!currentOrders) return null;

        // Se for array simples
        if (Array.isArray(currentOrders)) {
          return currentOrders.filter((order) => order.id !== payload.old?.id);
        }

        // Se for OrdersListResponse
        if ('items' in currentOrders) {
          return {
            ...currentOrders,
            items: currentOrders.items.filter((order: OrderListItem) => order.id !== payload.old?.id),
          };
        }

        return currentOrders;
      });
    }

    // Recarregar para garantir consistência (mais seguro)
    // Usar setTimeout para evitar múltiplas chamadas simultâneas
    setTimeout(() => {
      fetchOrders(params);
    }, 500);
  }, [fetchOrders, params]);

  // Configurar realtime sync
  const { isConnected: isRealtimeConnected, userType } = useOrdersRealtime({
    enabled: enableRealtime,
    onOrderChange: handleRealtimeChange,
  });

  return {
    orders,
    loading,
    error,
    params,
    fetchOrders,
    updateParams,
    refetch: () => fetchOrders(params),
    // Informações de realtime
    realtime: {
      isConnected: isRealtimeConnected,
      userType,
    },
  };
};