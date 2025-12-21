import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase APENAS para real-time (sem autenticação)
 * Usado exclusivamente para receber atualizações via WebSocket
 * 
 * NOTA DE SEGURANÇA:
 * As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são públicas por design.
 * A chave ANON do Supabase é projetada para ser exposta no frontend e é protegida
 * por Row Level Security (RLS) no banco de dados. Não é um segredo sensível.
 */
let supabaseRealtimeClient: SupabaseClient | null = null;

export const getSupabaseRealtimeClient = (): SupabaseClient => {
  if (supabaseRealtimeClient) {
    return supabaseRealtimeClient;
  }

  // Variáveis públicas do Supabase (não são secrets sensíveis)
  // A chave ANON é projetada para uso no frontend com proteção via RLS
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

/**
 * Verifica se o Supabase está configurado corretamente
 */
export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
};

