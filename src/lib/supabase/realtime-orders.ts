/**
 * Utilitários para sincronização em tempo real de pedidos via Supabase Realtime
 * 
 * Este módulo gerencia canais e filtros para sincronização de pedidos entre
 * customers e merchants, respeitando as políticas RLS do banco de dados.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseRealtime, isSupabaseConfigured } from './realtime-client';

export type OrderEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface OrderRecord {
  id?: string;
  store_id?: string;
  customer_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface OrderRealtimePayload {
  eventType: OrderEventType;
  new?: OrderRecord; // Novo registro (INSERT ou UPDATE)
  old?: Partial<OrderRecord>; // Registro antigo (UPDATE ou DELETE)
  errors?: unknown[];
}

export type OrderRealtimeCallback = (payload: OrderRealtimePayload) => void;

/**
 * Interface para configuração do canal de realtime
 */
export interface RealtimeChannelConfig {
  channelName: string;
  filter?: {
    event?: OrderEventType | '*';
    schema?: string;
    table?: string;
  };
}

/**
 * Gera nome único para canal de customer
 */
export const getCustomerChannelName = (customerId: string): string => {
  return `customer-orders:${customerId}`;
};

/**
 * Gera nome único para canal de merchant
 */
export const getMerchantChannelName = (merchantId: string): string => {
  return `merchant-orders:${merchantId}`;
};

/**
 * Cria e inscreve em canal de realtime para orders de um customer
 * 
 * IMPORTANTE: As políticas RLS do Supabase garantem que apenas pedidos
 * do customer autenticado sejam retornados. Não precisamos filtrar por customer_id
 * no frontend, mas criamos canais separados para melhor organização.
 * 
 * @param customerId - ID do customer
 * @param callback - Função chamada quando há mudanças
 * @returns Canal do Supabase ou null se não configurado
 */
export const subscribeToCustomerOrders = (
  customerId: string,
  callback: OrderRealtimeCallback
): RealtimeChannel | null => {
  if (!isSupabaseConfigured()) {
    const errorMsg = 'Supabase não configurado. Realtime desabilitado.\n' +
      'Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no arquivo .env\n' +
      'Após adicionar as variáveis, reinicie o servidor de desenvolvimento.';
    console.error('❌', errorMsg);
    return null;
  }

  if (!customerId) {
    console.warn('⚠️ customerId não fornecido. Não é possível criar canal de realtime.');
    return null;
  }

  const channelName = getCustomerChannelName(customerId);
  
  console.log('🔔 Inscrito no canal de realtime:', channelName);

  const channel = supabaseRealtime
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'orders',
        table: 'orders',
        // RLS garante que apenas pedidos do customer autenticado sejam retornados
        // Não precisamos filtrar aqui, mas podemos para melhor performance
        filter: `customer_id=eq.${customerId}`,
      },
      (payload) => {
        const newRecord = payload.new as OrderRecord | undefined;
        const oldRecord = payload.old as Partial<OrderRecord> | undefined;
        const orderId = newRecord?.id || oldRecord?.id;
        console.log('📦 Evento realtime recebido (customer):', {
          event: payload.eventType,
          orderId,
        });

        callback({
          eventType: payload.eventType as OrderEventType,
          new: newRecord,
          old: oldRecord,
          errors: payload.errors,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Inscrito com sucesso no canal:', channelName);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erro ao inscrever no canal:', channelName);
      } else if (status === 'TIMED_OUT') {
        console.warn('⏱️ Timeout ao inscrever no canal:', channelName);
      } else if (status === 'CLOSED') {
        console.log('🔴 Canal fechado:', channelName);
      }
    });

  return channel;
};

/**
 * Cria e inscreve em canal de realtime para orders das lojas de um merchant
 * 
 * IMPORTANTE: As políticas RLS garantem que apenas pedidos das lojas
 * do merchant sejam retornados. Criamos canal com filtro por store_id
 * para melhor organização e performance.
 * 
 * @param merchantId - ID do merchant
 * @param storeIds - Array de IDs das lojas do merchant
 * @param callback - Função chamada quando há mudanças
 * @returns Canal do Supabase ou null se não configurado
 */
export const subscribeToMerchantOrders = (
  merchantId: string,
  storeIds: string[],
  callback: OrderRealtimeCallback
): RealtimeChannel | null => {
  if (!isSupabaseConfigured()) {
    const errorMsg = 'Supabase não configurado. Realtime desabilitado.\n' +
      'Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no arquivo .env\n' +
      'Após adicionar as variáveis, reinicie o servidor de desenvolvimento.';
    console.error('❌', errorMsg);
    return null;
  }

  if (!merchantId) {
    console.warn('⚠️ merchantId não fornecido. Não é possível criar canal de realtime.');
    return null;
  }

  if (!storeIds || storeIds.length === 0) {
    console.warn('⚠️ Nenhuma loja fornecida para o merchant. Não é possível criar canal de realtime.');
    return null;
  }

  const channelName = getMerchantChannelName(merchantId);
  
  console.log('🔔 Inscrito no canal de realtime:', channelName, {
    storeIds,
    storesCount: storeIds.length,
  });

  // Para múltiplas lojas, usar filtro IN
  const filter = storeIds.length === 1
    ? `store_id=eq.${storeIds[0]}`
    : `store_id=in.(${storeIds.join(',')})`;

  const channel = supabaseRealtime
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'orders',
        table: 'orders',
        // Filtrar por store_id (RLS também garante permissão)
        filter: filter,
      },
      (payload) => {
        const newRecord = payload.new as OrderRecord | undefined;
        const oldRecord = payload.old as Partial<OrderRecord> | undefined;
        const orderId = newRecord?.id || oldRecord?.id;
        const storeId = newRecord?.store_id || oldRecord?.store_id;
        console.log('📦 Evento realtime recebido (merchant):', {
          event: payload.eventType,
          orderId,
          storeId,
        });

        callback({
          eventType: payload.eventType as OrderEventType,
          new: newRecord,
          old: oldRecord,
          errors: payload.errors,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Inscrito com sucesso no canal:', channelName);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erro ao inscrever no canal:', channelName);
      } else if (status === 'TIMED_OUT') {
        console.warn('⏱️ Timeout ao inscrever no canal:', channelName);
      } else if (status === 'CLOSED') {
        console.log('🔴 Canal fechado:', channelName);
      }
    });

  return channel;
};

/**
 * Remove inscrição de um canal
 */
export const unsubscribeFromChannel = (channel: RealtimeChannel | null): void => {
  if (!channel) {
    return;
  }

  try {
    const channelName = channel.topic;
    console.log('🔴 Desinscrevendo do canal:', channelName);
    
    supabaseRealtime.removeChannel(channel);
    console.log('✅ Desinscrito com sucesso do canal:', channelName);
  } catch (error) {
    console.error('❌ Erro ao desinscrever do canal:', error);
  }
};

/**
 * Remove todos os canais ativos (útil para cleanup)
 */
export const unsubscribeAllChannels = (): void => {
  try {
    const channels = supabaseRealtime.getChannels();
    console.log(`🔴 Desinscrevendo de ${channels.length} canais...`);
    
    channels.forEach((channel) => {
      supabaseRealtime.removeChannel(channel);
    });
    
    console.log('✅ Todos os canais foram removidos');
  } catch (error) {
    console.error('❌ Erro ao desinscrever canais:', error);
  }
};

