/**
 * Serviço para gerenciar pedidos (Orders)
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { CACHE_TAGS } from '@/services/cache/CacheService';
import { showErrorToast } from '@/utils/toast';
import type { Order } from '@/types/order';
import type { RequestConfig } from '@/types/api';

// Interface para resposta da API de criação (snake_case)
interface ApiOrderResponse {
  id: string;
  store_id: string;
  customer_id: string;
  delivery_option_id?: string;
  fulfillment_method: 'delivery' | 'pickup';
  pickup_slot?: string | null;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery_time?: string | null;
  observations?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Campos extras da view
  store_name?: string;
  customer_name?: string;
  delivery_street?: string;
  delivery_number?: string;
  delivery_neighborhood?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip_code?: string;
}

// Interface para resposta detalhada da API (GET /orders/:id)
interface ApiOrderDetailResponse {
  order: {
    id: string;
    storeId: string;
    customerId: string;
    fulfillmentMethod: 'delivery' | 'pickup';
    pickupSlot?: string | null;
    totalAmount: number;
    deliveryFee: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    estimatedDeliveryTime?: string | null;
    observations?: string | null;
    cancellationReason?: string | null;
    createdAt: string;
    updatedAt: string;
    store: {
      name: string;
      slug: string;
    };
    customer: {
      name: string;
      phone: string;
    };
    deliveryAddress: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    deliveryOption?: {
      name: string;
      fee: number;
    } | null;
    itemsCount: number;
    totalItems: number;
    statusHistory: Array<{
      status: string;
      changedAt: string;
    }>;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productFamily?: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observations?: string | null;
    customizations?: Array<{
      name: string;
      type: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> | null;
    createdAt: string;
  }>;
}

// Interface estendida para Order com dados detalhados
export interface OrderDetail extends Order {
  store?: {
    name: string;
    slug: string;
  };
  customer?: {
    name: string;
    phone: string;
  };
  deliveryOption?: {
    name: string;
    fee: number;
  } | null;
  itemsCount?: number;
  totalItemsQuantity?: number;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
  }>;
  orderItems?: Array<{
    id: string;
    productId: string;
    productName: string;
    productFamily?: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observations?: string | null;
    customizations?: Array<{
      name: string;
      type: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> | null;
  }>;
}

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
    deliveryAddress: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
      complement?: string;
    };
    paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
    fulfillmentMethod: 'delivery' | 'pickup';
    deliveryOptionId?: string;
    pickupSlot?: string;
    observations?: string;
  }): Promise<Order> {
    try {
      // Mapear dados para o formato da API
      const apiPayload = {
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
        delivery_address: {
          street: orderData.deliveryAddress.street,
          number: orderData.deliveryAddress.number,
          neighborhood: orderData.deliveryAddress.neighborhood,
          city: orderData.deliveryAddress.city,
          state: orderData.deliveryAddress.state,
          zip_code: orderData.deliveryAddress.zip_code,
          complement: orderData.deliveryAddress.complement || undefined,
        },
        delivery_option_id: orderData.deliveryOptionId || undefined,
        pickup_slot: orderData.pickupSlot || undefined,
        observations: orderData.observations || undefined,
      };

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
}

