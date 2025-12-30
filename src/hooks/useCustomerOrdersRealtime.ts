/**
 * Hook específico para sincronização em tempo real de pedidos de customers
 * 
 * Este hook é mais específico e focado apenas em customers.
 * Para detecção automática de customer/merchant, use useOrdersRealtime.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToCustomerOrders,
  unsubscribeFromChannel,
  type OrderRealtimePayload,
} from '@/lib/supabase/realtime-orders';
import { useAuthContext } from './useTheme';

export interface UseCustomerOrdersRealtimeOptions {
  /**
   * ID do customer (se não fornecido, tenta obter do contexto)
   */
  customerId?: string;
  /**
   * Callback chamado quando há mudanças nos pedidos
   */
  onOrderChange?: (payload: OrderRealtimePayload) => void;
  /**
   * Se deve desabilitar o realtime
   */
  enabled?: boolean;
}

export interface UseCustomerOrdersRealtimeResult {
  /**
   * Se está conectado ao canal de realtime
   */
  isConnected: boolean;
  /**
   * ID do customer usado
   */
  customerId: string | null;
  /**
   * Reconectar manualmente ao canal
   */
  reconnect: () => void;
}

/**
 * Hook para realtime sync de pedidos de customers
 * 
 * @example
 * ```tsx
 * const { isConnected } = useCustomerOrdersRealtime({
 *   onOrderChange: (payload) => {
 *     if (payload.eventType === 'INSERT') {
 *       console.log('Novo pedido criado!', payload.new);
 *     } else if (payload.eventType === 'UPDATE') {
 *       console.log('Pedido atualizado!', payload.new);
 *     }
 *     refetchOrders();
 *   }
 * });
 * ```
 */
export const useCustomerOrdersRealtime = (
  options: UseCustomerOrdersRealtimeOptions = {}
): UseCustomerOrdersRealtimeResult => {
  const { customerId: providedCustomerId, onOrderChange, enabled = true } = options;
  const { customer } = useAuthContext();
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectKeyRef = useRef(0);

  // Usar customerId fornecido ou do contexto
  const customerId = providedCustomerId || customer?.id || null;

  /**
   * Reconectar ao canal
   */
  const reconnect = useCallback(() => {
    reconnectKeyRef.current += 1;
    // Forçar re-execução do useEffect
    if (channelRef.current) {
      unsubscribeFromChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Setup do canal de realtime
   */
  useEffect(() => {
    if (!enabled) {
      console.log('🔕 Realtime desabilitado para customer');
      return;
    }

    if (!customerId) {
      console.log('🚫 customerId não disponível. Realtime não será iniciado.');
      // Desconectar canal se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    console.log('🔔 Configurando realtime para customer:', customerId);

    // Desconectar canal anterior se existir
    if (channelRef.current) {
      unsubscribeFromChannel(channelRef.current);
      channelRef.current = null;
    }

    // Criar canal para customer
    const channel = subscribeToCustomerOrders(customerId, (payload) => {
      console.log('📦 Evento realtime recebido (customer):', {
        event: payload.eventType,
        orderId: payload.new?.id || payload.old?.id,
      });
      onOrderChange?.(payload);
    });

    channelRef.current = channel;

    // Verificar status da conexão
    if (channel) {
      // Verificar status periodicamente
      const checkConnection = () => {
        // Verificar se o canal está conectado
        // O estado do canal pode ser: 'closed', 'errored', 'joined', 'joining', 'leaving'
        const isJoined = channel.state === 'joined';
        setIsConnected(isJoined);
      };

      // Verificar imediatamente
      checkConnection();

      // Verificar após um tempo (para dar tempo de conectar)
      const timeoutId = setTimeout(checkConnection, 1000);

      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        if (channelRef.current) {
          unsubscribeFromChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
        }
      };
    }

    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [customerId, enabled, onOrderChange, reconnectKeyRef.current]);

  return {
    isConnected,
    customerId,
    reconnect,
  };
};

