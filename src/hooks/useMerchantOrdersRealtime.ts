/**
 * Hook específico para sincronização em tempo real de pedidos de merchants
 * 
 * Este hook é mais específico e focado apenas em merchants.
 * Para detecção automática de customer/merchant, use useOrdersRealtime.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToMerchantOrders,
  unsubscribeFromChannel,
  type OrderRealtimePayload,
} from '@/lib/supabase/realtime-orders';
import { useMerchantAuth } from './useMerchantAuth';

export interface UseMerchantOrdersRealtimeOptions {
  /**
   * ID do merchant (se não fornecido, tenta obter do contexto)
   */
  merchantId?: string;
  /**
   * IDs das lojas do merchant (se não fornecido, tenta obter do contexto)
   */
  storeIds?: string[];
  /**
   * Callback chamado quando há mudanças nos pedidos
   */
  onOrderChange?: (payload: OrderRealtimePayload) => void;
  /**
   * Se deve desabilitar o realtime
   */
  enabled?: boolean;
}

export interface UseMerchantOrdersRealtimeResult {
  /**
   * Se está conectado ao canal de realtime
   */
  isConnected: boolean;
  /**
   * ID do merchant usado
   */
  merchantId: string | null;
  /**
   * IDs das lojas usadas
   */
  storeIds: string[];
  /**
   * Reconectar manualmente ao canal
   */
  reconnect: () => void;
}

/**
 * Hook para realtime sync de pedidos de merchants
 * 
 * @example
 * ```tsx
 * const { isConnected, storeIds } = useMerchantOrdersRealtime({
 *   onOrderChange: (payload) => {
 *     if (payload.eventType === 'INSERT') {
 *       console.log('Novo pedido na loja!', payload.new);
 *     } else if (payload.eventType === 'UPDATE') {
 *       console.log('Pedido atualizado!', payload.new);
 *       if (payload.new?.status !== payload.old?.status) {
 *         console.log('Status mudou:', payload.old?.status, '->', payload.new?.status);
 *       }
 *     }
 *     refetchOrders();
 *   }
 * });
 * ```
 */
export const useMerchantOrdersRealtime = (
  options: UseMerchantOrdersRealtimeOptions = {}
): UseMerchantOrdersRealtimeResult => {
  const {
    merchantId: providedMerchantId,
    storeIds: providedStoreIds,
    onOrderChange,
    enabled = true,
  } = options;
  const { merchant } = useMerchantAuth();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectKeyRef = useRef(0);

  // Usar merchantId fornecido ou do contexto
  const merchantId = providedMerchantId || merchant?.id || null;
  
  // Usar storeIds fornecidos ou do contexto
  const storeIds =
    providedStoreIds ||
    merchant?.stores?.map((store) => store.id) ||
    [];

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
      console.log('🔕 Realtime desabilitado para merchant');
      return;
    }

    if (!merchantId) {
      console.log('🚫 merchantId não disponível. Realtime não será iniciado.');
      // Desconectar canal se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (!storeIds || storeIds.length === 0) {
      console.log(
        '🚫 Nenhuma loja disponível para o merchant. Realtime não será iniciado.'
      );
      // Desconectar canal se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    console.log('🔔 Configurando realtime para merchant:', merchantId, {
      storesCount: storeIds.length,
      storeIds,
    });

    // Desconectar canal anterior se existir
    if (channelRef.current) {
      unsubscribeFromChannel(channelRef.current);
      channelRef.current = null;
    }

    // Criar canal para merchant
    const channel = subscribeToMerchantOrders(merchantId, storeIds, (payload) => {
      console.log('📦 Evento realtime recebido (merchant):', {
        event: payload.eventType,
        orderId: payload.new?.id || payload.old?.id,
        storeId: payload.new?.store_id || payload.old?.store_id,
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
  }, [merchantId, storeIds.join(','), enabled, onOrderChange, reconnectKeyRef.current]);

  return {
    isConnected,
    merchantId,
    storeIds,
    reconnect,
  };
};

