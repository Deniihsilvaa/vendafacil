import { useEffect, useRef, useCallback, useState } from 'react';
import { supabaseRealtime, isSupabaseConfigured } from '@/lib/supabase/realtime-client';
import { debugSupabaseEnv } from '@/utils/env-check';
import type { OrderListItem } from '@/types/order';
import { showInfoToast, showSuccessToast } from '@/utils/toast';

interface UseRealtimeOrdersProps {
  userId?: string;
  userType?: 'customer' | 'merchant';
  storeId?: string;
  onOrderUpdated?: (order: OrderListItem) => void;
  onNewOrder?: (order: OrderListItem) => void;
  onOrderDeleted?: (orderId: string) => void;
  enabled?: boolean;
}

/**
 * Hook para monitorar atualizações de pedidos em tempo real via Supabase
 * 
 * @example
 * ```tsx
 * const { isConnected } = useRealtimeOrders({
 *   userId: user?.id,
 *   userType: 'customer',
 *   storeId: currentStore?.id,
 *   onOrderUpdated: (order) => {
 *     // Atualizar lista de pedidos
 *   }
 * });
 * ```
 */
export const useRealtimeOrders = ({
  userId,
  userType = 'customer',
  storeId,
  onOrderUpdated,
  onNewOrder,
  onOrderDeleted,
  enabled = true,
}: UseRealtimeOrdersProps) => {
  const channelRef = useRef<ReturnType<typeof supabaseRealtime.channel> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Função para transformar dados da API para OrderListItem
  const transformOrderData = useCallback((data: any): OrderListItem | null => {
    if (!data) return null;

    // Se já está no formato OrderListItem, retornar direto
    if (data.id && data.status && data.total_amount !== undefined) {
      return data as OrderListItem;
    }

    // Tentar transformar de formato snake_case para OrderListItem
    try {
      return {
        id: data.id || data.order_id,
        store_id: data.store_id || data.storeId,
        customer_id: data.customer_id || data.customerId,
        delivery_option_id: data.delivery_option_id || data.deliveryOptionId || '',
        fulfillment_method: data.fulfillment_method || data.fulfillmentMethod || 'delivery',
        pickup_slot: data.pickup_slot || data.pickupSlot || null,
        total_amount: data.total_amount || data.totalAmount || 0,
        delivery_fee: data.delivery_fee || data.deliveryFee || 0,
        status: data.status || 'pending',
        payment_method: data.payment_method || data.paymentMethod || 'cash',
        payment_status: data.payment_status || data.paymentStatus || 'pending',
        estimated_delivery_time: data.estimated_delivery_time || data.estimatedDeliveryTime || null,
        observations: data.observations || null,
        cancellation_reason: data.cancellation_reason || data.cancellationReason || null,
        deleted_at: data.deleted_at || data.deletedAt || null,
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        updated_at: data.updated_at || data.updatedAt || new Date().toISOString(),
        store_name: data.store_name || data.storeName || '',
        store_slug: data.store_slug || data.storeSlug || '',
        customer_name: data.customer_name || data.customerName || '',
        customer_phone: data.customer_phone || data.customerPhone || '',
        delivery_street: data.delivery_street || data.deliveryStreet || '',
        delivery_number: data.delivery_number || data.deliveryNumber || '',
        delivery_neighborhood: data.delivery_neighborhood || data.deliveryNeighborhood || '',
        delivery_city: data.delivery_city || data.deliveryCity || '',
        delivery_state: data.delivery_state || data.deliveryState || '',
        delivery_zip_code: data.delivery_zip_code || data.deliveryZipCode || '',
        delivery_option_name: data.delivery_option_name || data.deliveryOptionName || '',
        delivery_option_fee: data.delivery_option_fee || data.deliveryOptionFee || 0,
        items_count: data.items_count || data.itemsCount || 0,
        total_items: data.total_items || data.totalItems || 0,
        status_history: data.status_history || data.statusHistory || {},
      } as OrderListItem;
    } catch (error) {
      console.error('Erro ao transformar dados do pedido:', error);
      return null;
    }
  }, []);

  // Função para obter mensagem de status
  const getStatusMessage = useCallback((status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      out_for_delivery: 'Saiu para Entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return statusLabels[status] || status;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Debug: verificar variáveis de ambiente (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      debugSupabaseEnv();
    }

    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      const errorMsg = 'Supabase Realtime não está configurado.\n' +
        'Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no arquivo .env\n' +
        'Após adicionar as variáveis, reinicie o servidor de desenvolvimento.';
      console.error('❌', errorMsg);
      setIsConnected(false);
      return;
    }

    if (!supabaseRealtime) {
      console.error('❌ Cliente Supabase Realtime não disponível');
      setIsConnected(false);
      return;
    }

    // Validar se temos dados suficientes para conectar
    if (userType === 'customer' && !userId) {
      console.warn('useRealtimeOrders: userId necessário para customer');
      return;
    }

    if (userType === 'merchant' && !storeId) {
      console.warn('useRealtimeOrders: storeId necessário para merchant');
      return;
    }

    // Criar canal único baseado no tipo de usuário
    const channelName = userType === 'customer' 
      ? `customer:${userId}` 
      : `store:${storeId}`;

    const channel = supabaseRealtime
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'orders', // Schema correto: orders, não public
          table: 'orders',
          filter: userType === 'customer' 
            ? `customer_id=eq.${userId}`
            : `store_id=eq.${storeId}`,
        },
        (payload) => {
          console.log('Real-time event recebido:', payload);

          if (payload.eventType === 'INSERT') {
            const newOrder = transformOrderData(payload.new);
            if (newOrder && onNewOrder) {
              onNewOrder(newOrder);
              showSuccessToast(
                `Novo pedido #${newOrder.id.slice(0, 8).toUpperCase()} criado!`,
                'Pedido Criado'
              );
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = transformOrderData(payload.new);
            if (updatedOrder && onOrderUpdated) {
              onOrderUpdated(updatedOrder);
              
              // Notificar mudança de status
              if (payload.old?.status !== payload.new?.status) {
                const oldStatus = getStatusMessage(payload.old?.status || '');
                const newStatus = getStatusMessage(updatedOrder.status);
                showInfoToast(
                  `Status do pedido #${updatedOrder.id.slice(0, 8).toUpperCase()} alterado: ${oldStatus} → ${newStatus}`,
                  'Status Atualizado'
                );
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrderId = payload.old?.id || payload.old?.order_id;
            if (deletedOrderId && onOrderDeleted) {
              onOrderDeleted(deletedOrderId);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Conectado ao Supabase Realtime:', channelName);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          const errorMsg = !isSupabaseConfigured()
            ? 'Variáveis de ambiente não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env e reinicie o servidor.'
            : 'Erro ao conectar ao canal. Verifique as configurações do Supabase e as políticas RLS.';
          
          console.error('❌ Erro ao conectar ao Supabase Realtime:', {
            channel: channelName,
            status,
            reason: errorMsg,
          });
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          console.warn('⏱️ Timeout ao conectar ao Supabase Realtime:', channelName);
        } else {
          console.log('📡 Status do Supabase Realtime:', status, channelName);
        }
      });

    channelRef.current = channel;

    // Cleanup ao desmontar
    return () => {
      if (channelRef.current) {
        supabaseRealtime.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [userId, userType, storeId, enabled, onOrderUpdated, onNewOrder, onOrderDeleted, transformOrderData, getStatusMessage]);

  return {
    isConnected,
  };
};

