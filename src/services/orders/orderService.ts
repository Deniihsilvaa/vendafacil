/**
 * Serviço para gerenciar pedidos (Orders)
*/

import type { Order, ApiOrderResponse, ApiOrderDetailResponse, OrderDetail, OrderListItem, OrdersListResponse } from '@/types/order';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { CACHE_TAGS } from '@/services/cache/CacheService';
import { showErrorToast } from '@/utils/toast';
import type { RequestConfig } from '@/types/api';


/**
 * Transforma resposta da API para o formato do frontend
 */
function transformApiOrderToFrontend(apiOrder: ApiOrderResponse): Order {
  return {
    id: apiOrder.id,
    customerId: apiOrder.customer_id,
    storeId: apiOrder.store_id,
    items: [], // Items não vêm na resposta de criação
    totalAmount: apiOrder.total_amount,
    deliveryFee: apiOrder.delivery_fee,
    status: apiOrder.status as Order['status'],
    paymentMethod: apiOrder.payment_method as Order['paymentMethod'],
    paymentStatus: apiOrder.payment_status as Order['paymentStatus'],
    fulfillmentMethod: apiOrder.fulfillment_method,
    deliveryAddress: {
      street: apiOrder.delivery_street || '',
      number: apiOrder.delivery_number || '',
      neighborhood: apiOrder.delivery_neighborhood || '',
      city: apiOrder.delivery_city || '',
      state: apiOrder.delivery_state || '',
      zipCode: apiOrder.delivery_zip_code || '',
    },
    estimatedDeliveryTime: apiOrder.estimated_delivery_time || '',
    observations: apiOrder.observations || undefined,
    createdAt: apiOrder.created_at,
    updatedAt: apiOrder.updated_at,
  };
}

export class OrderService {
  /**
   * Busca pedidos do cliente autenticado
   */
  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.ORDERS.BY_CUSTOMER(customerId),
        {
          useCache: true,
          cacheTags: [CACHE_TAGS.ORDERS(customerId)],
        } as RequestConfig
      );

      // Verificar se a resposta tem dados
      if (!response.data) {
        return [];
      }

      // A API retorna { success: true, data: { items: [...], pagination: {...} } }
      let ordersArray: ApiOrderResponse[] = [];
      
      if (response.data.data?.items && Array.isArray(response.data.data.items)) {
        ordersArray = response.data.data.items;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        ordersArray = response.data.items;
      } else if (Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        ordersArray = response.data.data;
      }

      // Transformar cada pedido para o formato do frontend
      return ordersArray.map(transformApiOrderToFrontend);
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      showErrorToast(error as Error, 'Erro ao carregar pedidos');
      throw error;
    }
  }

  /**
   * Busca pedido por ID (retorna detalhes completos)
   */
  static async getOrderById(orderId: string): Promise<OrderDetail> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ApiOrderDetailResponse }>(
        API_ENDPOINTS.ORDERS.BY_ID(orderId),
        {
          useCache: true,
          cacheTags: [CACHE_TAGS.ORDER(orderId)],
        } as RequestConfig
      );

      // A API retorna { success: true, data: { order: {...}, items: [...] } }
      // O apiClient pode retornar response.data como o objeto completo ou já extraído
      let apiData: ApiOrderDetailResponse | undefined;
      
      const resData = response.data as any;
      
      if (resData?.data?.order) {
        // Estrutura: { success, data: { order, items } }
        apiData = resData.data;
      } else if (resData?.order) {
        // Estrutura já extraída: { order, items }
        apiData = resData;
      }
      
      if (!apiData?.order) {
        throw new Error('Pedido não encontrado: resposta vazia da API');
      }

      const { order, items } = apiData;

      return {
        id: order.id,
        customerId: order.customerId,
        storeId: order.storeId,
        items: [], // Mantido para compatibilidade
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        status: order.status as Order['status'],
        paymentMethod: order.paymentMethod as Order['paymentMethod'],
        paymentStatus: order.paymentStatus as Order['paymentStatus'],
        fulfillmentMethod: order.fulfillmentMethod,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryTime: order.estimatedDeliveryTime || '',
        observations: order.observations || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        // Dados extras
        store: order.store,
        customer: order.customer,
        deliveryOption: order.deliveryOption,
        itemsCount: order.itemsCount,
        totalItemsQuantity: order.totalItems,
        statusHistory: order.statusHistory,
        orderItems: items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productFamily: item.productFamily,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          observations: item.observations,
          customizations: item.customizations,
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      showErrorToast(error as Error, 'Erro ao carregar pedido');
      throw error;
    }
  }

  /**
   * Cria um novo pedido
   */
  static async createOrder(orderData: {
    storeId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      customizations?: Array<{
        customization_id: string;
        value: string | number;
      }>;
      observations?: string;
    }>;
    deliveryAddress?: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
      complement?: string;
    } | null;
    paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
    fulfillmentMethod: 'delivery' | 'pickup';
    deliveryOptionId?: string;
    pickupSlot?: string;
    observations?: string;
  }): Promise<Order> {
    try {
      // Mapear dados para o formato da API
      const apiPayload: any = {
        store_id: orderData.storeId,
        fulfillment_method: orderData.fulfillmentMethod,
        payment_method: orderData.paymentMethod,
        items: orderData.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          observations: item.observations || undefined,
          customizations: item.customizations?.map(custom => ({
            customization_id: custom.customization_id,
            value: custom.value,
          })) || undefined,
        })),
        delivery_option_id: orderData.deliveryOptionId || undefined,
        pickup_slot: orderData.pickupSlot || undefined,
        observations: orderData.observations || undefined,
      };

      // Incluir delivery_address apenas se for delivery e se o endereço foi fornecido
      // Para pickup, não incluir o campo delivery_address no payload
      if (orderData.fulfillmentMethod === 'delivery' && orderData.deliveryAddress) {
        apiPayload.delivery_address = {
          street: orderData.deliveryAddress.street,
          number: orderData.deliveryAddress.number,
          neighborhood: orderData.deliveryAddress.neighborhood,
          city: orderData.deliveryAddress.city,
          state: orderData.deliveryAddress.state,
          zip_code: orderData.deliveryAddress.zip_code,
          complement: orderData.deliveryAddress.complement || undefined,
        };
      }
      // Se for pickup, simplesmente não incluir delivery_address no payload

      const response = await apiClient.post<{ success: boolean; data: ApiOrderResponse }>(
        API_ENDPOINTS.ORDERS.CREATE,
        apiPayload
      );

      // A API retorna { success: true, data: {...} }
      const apiData = response.data?.data || response.data;
      
      if (!apiData || !('id' in apiData)) {
        throw new Error('Erro ao criar pedido: resposta vazia da API');
      }

      // Invalidar cache de pedidos após criar novo pedido
      const { CacheService } = await import('@/services/cache/CacheService');
      CacheService.invalidateByTag(CACHE_TAGS.ORDERS('*'));

      return transformApiOrderToFrontend(apiData as ApiOrderResponse);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showErrorToast(error as Error, 'Erro ao criar pedido');
      throw error;
    }
  }

  /**
   * Lista pedidos com filtros (para merchants e customers)
   */
  static async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
  } = {}): Promise<{ success: boolean; data: { items: OrderListItem[]; pagination: OrdersListResponse['pagination'] } }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.storeId) queryParams.append('storeId', params.storeId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.customerId) queryParams.append('customerId', params.customerId);

      const endpoint = `${API_ENDPOINTS.ORDERS.BASE}?${queryParams.toString()}`;
      const response = await apiClient.get<OrdersListResponse>(
        endpoint
      );

      // A API retorna { success: true, data: { items: [...], pagination: {...} } }
      // O apiClient já formata para { data: ..., success: true }
      // Então response.data pode ser OrdersListResponse diretamente ou { success, data: OrdersListResponse }
      let ordersData: OrdersListResponse;
      
      if (response.data && typeof response.data === 'object') {
        // Se response.data tem 'data' dentro, extrair
        if ('data' in response.data && typeof (response.data as any).data === 'object') {
          ordersData = (response.data as any).data as OrdersListResponse;
        } 
        // Se response.data já é OrdersListResponse (tem 'items' e 'pagination')
        else if ('items' in response.data && 'pagination' in response.data) {
          ordersData = response.data as OrdersListResponse;
        }
        // Se response.data tem 'success' e 'data'
        else if ('success' in response.data && 'data' in response.data) {
          ordersData = (response.data as any).data as OrdersListResponse;
        } else {
          throw new Error('Formato de resposta inválido da API');
        }
      } else {
        throw new Error('Resposta vazia da API');
      }

      return {
        success: true,
        data: ordersData,
      };
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      showErrorToast(error as Error, 'Erro ao carregar pedidos');
      throw error;
    }
  }

  /**
   * Confirma um pedido pendente (merchant)
   */
  static async confirmOrder(storeId: string, orderId: string, data?: {
    estimated_delivery_time?: string;
    observations?: string;
  }): Promise<ApiOrderResponse> {
    try {
      const endpoint = `${API_ENDPOINTS.STORES.BASE}/${storeId}/orders/${orderId}/confirm`;
      const response = await apiClient.post<{ success: boolean; data: ApiOrderResponse }>(
        endpoint,
        data || {}
      );

      const { CacheService } = await import('@/services/cache/CacheService');
      CacheService.invalidateByTag(CACHE_TAGS.ORDER(orderId));
      CacheService.invalidateByTag(CACHE_TAGS.ORDERS('*'));

      const orderData = response.data?.data || response.data;
      if (!orderData || typeof orderData !== 'object' || !('id' in orderData)) {
        throw new Error('Resposta inválida da API');
      }
      return orderData as ApiOrderResponse;
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      showErrorToast(error as Error, 'Erro ao confirmar pedido');
      throw error;
    }
  }

  /**
   * Rejeita um pedido pendente (merchant)
   */
  static async rejectOrder(storeId: string, orderId: string, data: {
    reason: string;
    observations?: string;
  }): Promise<ApiOrderResponse> {
    try {
      const endpoint = `${API_ENDPOINTS.STORES.BASE}/${storeId}/orders/${orderId}/reject`;
      const response = await apiClient.post<{ success: boolean; data: ApiOrderResponse }>(
        endpoint,
        data
      );

      const { CacheService } = await import('@/services/cache/CacheService');
      CacheService.invalidateByTag(CACHE_TAGS.ORDER(orderId));
      CacheService.invalidateByTag(CACHE_TAGS.ORDERS('*'));

      const orderData = response.data?.data || response.data;
      if (!orderData || typeof orderData !== 'object' || !('id' in orderData)) {
        throw new Error('Resposta inválida da API');
      }
      return orderData as ApiOrderResponse;
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      showErrorToast(error as Error, 'Erro ao rejeitar pedido');
      throw error;
    }
  }

  /**
   * Atualiza o status de um pedido (merchant)
   */
  static async updateOrderStatus(storeId: string, orderId: string, data: {
    status: 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
    estimated_delivery_time?: string;
    observations?: string;
  }): Promise<ApiOrderResponse> {
    try {
      const endpoint = `${API_ENDPOINTS.STORES.BASE}/${storeId}/orders/${orderId}`;
      const response = await apiClient.put<{ success: boolean; data: ApiOrderResponse }>(
        endpoint,
        data
      );

      const { CacheService } = await import('@/services/cache/CacheService');
      CacheService.invalidateByTag(CACHE_TAGS.ORDER(orderId));
      CacheService.invalidateByTag(CACHE_TAGS.ORDERS('*'));

      const orderData = response.data?.data || response.data;
      if (!orderData || typeof orderData !== 'object' || !('id' in orderData)) {
        throw new Error('Resposta inválida da API');
      }
      return orderData as ApiOrderResponse;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      showErrorToast(error as Error, 'Erro ao atualizar status');
      throw error;
    }
  }
}

