/**
 * Serviço para gerenciar pedidos (Orders)
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { CACHE_TAGS } from '@/services/cache/CacheService';
import { validateOrders, validateOrder } from '@/utils/validators/orderValidators';
import { showErrorToast } from '@/utils/toast';
import type { Order } from '@/types/order';
import type { RequestConfig } from '@/types/api';

export class OrderService {
  /**
   * Busca pedidos do cliente autenticado
   */
  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>(
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

      // Se for array direto, validar
      if (Array.isArray(response.data)) {
        return validateOrders(response.data);
      }

      // Se for objeto com array (paginação), extrair o array
      if (typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as { data: unknown }).data)) {
        return validateOrders((response.data as { data: Order[] }).data);
      }

      // Se for objeto com 'orders', extrair
      if (typeof response.data === 'object' && 'orders' in response.data && Array.isArray((response.data as { orders: unknown }).orders)) {
        return validateOrders((response.data as { orders: Order[] }).orders);
      }

      // Caso padrão: tentar validar como array vazio
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      showErrorToast(error as Error, 'Erro ao carregar pedidos');
      throw error;
    }
  }

  /**
   * Busca pedido por ID
   */
  static async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(
        API_ENDPOINTS.ORDERS.BY_ID(orderId),
        {
          useCache: true,
          cacheTags: [CACHE_TAGS.ORDER(orderId)],
        } as RequestConfig
      );

      if (!response.data) {
        throw new Error('Pedido não encontrado: resposta vazia da API');
      }

      return validateOrder(response.data);
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

      const response = await apiClient.post<Order>(
        API_ENDPOINTS.ORDERS.CREATE,
        apiPayload
      );

      if (!response.data) {
        throw new Error('Erro ao criar pedido: resposta vazia da API');
      }

      // Invalidar cache de pedidos após criar novo pedido
      const { CacheService } = await import('@/services/cache/CacheService');
      CacheService.invalidateByTag(CACHE_TAGS.ORDERS('*'));

      return validateOrder(response.data);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showErrorToast(error as Error, 'Erro ao criar pedido');
      throw error;
    }
  }
}

