import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase APENAS para real-time (sem autenticação)
 * Usado exclusivamente para receber atualizações via WebSocket
 */
let supabaseRealtimeClient: SupabaseClient | null = null;

export const getSupabaseRealtimeClient = (): SupabaseClient => {
  if (supabaseRealtimeClient) {
    return supabaseRealtimeClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Real-time features will be disabled.');
    // Criar cliente mock para evitar erros
    supabaseRealtimeClient = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 5 } },
      }
    );
    return supabaseRealtimeClient;
  }

  supabaseRealtimeClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }, // Não persistir sessão
    realtime: {
      params: {
        eventsPerSecond: 5, // Limitar eventos por segundo
      },
    },
  });

  return supabaseRealtimeClient;
};

export const supabaseRealtime = getSupabaseRealtimeClient();

