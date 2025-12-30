/**
 * Hook principal para sincronização em tempo real de pedidos
 * 
 * Este hook detecta automaticamente se o usuário é customer ou merchant
 * e cria o canal apropriado para sincronização em tempo real.
 * 
 * IMPORTANTE: As políticas RLS do Supabase garantem que apenas dados
 * autorizados sejam retornados. Este hook apenas organiza os canais.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToCustomerOrders,
  subscribeToMerchantOrders,
  unsubscribeFromChannel,
  type OrderRealtimePayload,
} from '@/lib/supabase/realtime-orders';
import { useAuthContext } from './useTheme';
import type { Customer } from '@/types/auth';
import type { Merchant } from '@/types/auth';

export interface UseOrdersRealtimeOptions {
  /**
   * Callback chamado quando há mudanças nos pedidos
   */
  onOrderChange?: (payload: OrderRealtimePayload) => void;
  /**
   * Se deve desabilitar o realtime (útil para testes ou condições específicas)
   */
  enabled?: boolean;
}

export interface UseOrdersRealtimeResult {
  /**
   * Se está conectado ao canal de realtime
   */
  isConnected: boolean;
  /**
   * Tipo de usuário detectado ('customer', 'merchant', ou null)
   */
  userType: 'customer' | 'merchant' | null;
  /**
   * ID do usuário (customer_id ou merchant_id)
   */
  userId: string | null;
  /**
   * Reconectar manualmente ao canal
   */
  reconnect: () => void;
}

/**
 * Hook principal para realtime sync de pedidos
 * 
 * Detecta automaticamente se é customer ou merchant e configura o canal apropriado
 * 
 * @example
 * ```tsx
 * const { isConnected, userType } = useOrdersRealtime({
 *   onOrderChange: (payload) => {
 *     console.log('Pedido atualizado:', payload);
 *     // Atualizar lista de pedidos
 *     refetchOrders();
 *   }
 * });
 * ```
 */
export const useOrdersRealtime = (
  options: UseOrdersRealtimeOptions = {}
): UseOrdersRealtimeResult => {
  const { onOrderChange, enabled = true } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isConnectedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'merchant' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Obter dados do customer (pode falhar se não estiver no contexto)
  let customer: Customer | null = null;
  try {
    const authContext = useAuthContext();
    customer = authContext.customer;
  } catch {
    // Não está no contexto de customer, ok
    customer = null;
  }

  // Obter dados do merchant do localStorage (mais confiável que tentar hook condicional)
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  
  useEffect(() => {
    // Tentar obter merchant do localStorage primeiro
    const savedMerchant = localStorage.getItem('store-flow-merchant') || 
                         localStorage.getItem('store-flow-user');
    
    if (savedMerchant) {
      try {
        const merchantData = JSON.parse(savedMerchant) as Merchant;
        // Validar se é realmente um merchant (deve ter role)
        if (merchantData.role === 'admin' || merchantData.role === 'manager') {
          setMerchant(merchantData);
          return;
        }
      } catch {
        // Ignorar erro de parsing
      }
    }
    
    setMerchant(null);
  }, []);

  /**
   * Reconectar ao canal
   */
  const reconnect = useCallback(() => {
    // Desconectar do canal atual
    if (channelRef.current) {
      unsubscribeFromChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
      isConnectedRef.current = false;
    }

    // Reconectar (será feito no useEffect)
    if (enabled) {
      // Forçar re-execução do useEffect removendo e adicionando dependências
      setUserId((prev) => prev);
    }
  }, [enabled]);

  /**
   * Setup do canal de realtime
   */
  useEffect(() => {
    if (!enabled) {
      console.log('🔕 Realtime desabilitado');
      return;
    }

    // Verificar se é customer
    if (customer?.id) {
      console.log('👤 Detectado como customer:', customer.id);
      setUserType('customer');
      setUserId(customer.id);

      // Desconectar canal anterior se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
      }

      // Criar canal para customer
      const channel = subscribeToCustomerOrders(customer.id, (payload) => {
        console.log('📦 Evento recebido (customer):', payload.eventType);
        onOrderChange?.(payload);
      });

      channelRef.current = channel;

      // Verificar status da conexão
      if (channel) {
        channel.on('broadcast', { event: 'presence' }, () => {
          setIsConnected(true);
          isConnectedRef.current = true;
        });

        // Timeout para verificar conexão
        setTimeout(() => {
          if (channel.state === 'joined') {
            setIsConnected(true);
            isConnectedRef.current = true;
          }
        }, 1000);
      }

      return () => {
        if (channelRef.current) {
          unsubscribeFromChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
          isConnectedRef.current = false;
        }
      };
    }
    // Verificar se é merchant
    else if (merchant?.id && merchant.stores && merchant.stores.length > 0) {
      console.log('🏪 Detectado como merchant:', merchant.id, {
        storesCount: merchant.stores.length,
      });
      setUserType('merchant');
      setUserId(merchant.id);

      // Extrair IDs das lojas
      const storeIds = merchant.stores.map((store) => store.id);

      // Desconectar canal anterior se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
      }

      // Criar canal para merchant
      const channel = subscribeToMerchantOrders(
        merchant.id,
        storeIds,
        (payload) => {
          console.log('📦 Evento recebido (merchant):', payload.eventType);
          onOrderChange?.(payload);
        }
      );

      channelRef.current = channel;

      // Verificar status da conexão
      if (channel) {
        channel.on('broadcast', { event: 'presence' }, () => {
          setIsConnected(true);
          isConnectedRef.current = true;
        });

        // Timeout para verificar conexão
        setTimeout(() => {
          if (channel.state === 'joined') {
            setIsConnected(true);
            isConnectedRef.current = true;
          }
        }, 1000);
      }

      return () => {
        if (channelRef.current) {
          unsubscribeFromChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
          isConnectedRef.current = false;
        }
      };
    }
    // Nenhum usuário autenticado
    else {
      console.log('🚫 Nenhum usuário autenticado. Realtime não será iniciado.');
      setUserType(null);
      setUserId(null);
      
      // Desconectar canal se existir
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
        isConnectedRef.current = false;
      }
    }
  }, [customer?.id, merchant?.id, merchant?.stores, enabled, onOrderChange]);

  return {
    isConnected,
    userType,
    userId,
    reconnect,
  };
};

