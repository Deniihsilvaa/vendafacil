import { useEffect, useRef } from 'react';
import { apiClient } from '@/services/api/client';

/**
 * Hook para renovar automaticamente o token a cada 5 minutos
 * Funciona de forma transparente para o usuário
 */
export const useAutoRefreshToken = () => {
  const intervalRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Verificar se há um merchant logado (não fazer auto-refresh no contexto de customer)
    const savedMerchant = typeof window !== 'undefined'
      ? localStorage.getItem('store-flow-merchant')
      : null;
    
    if (savedMerchant) {
      console.log('🔍 useAutoRefreshToken - Merchant detectado, pulando auto-refresh de customer');
      return;
    }

    // Verificar se há refresh token disponível
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('store-flow-refresh-token')
      : null;

    if (!refreshToken) {
      return; // Não há refresh token, não iniciar renovação automática
    }

    // Função para renovar o token
    const refreshTokenSilently = async () => {
      // Evitar múltiplas renovações simultâneas
      if (isRefreshingRef.current) {
        return;
      }

      // Verificar novamente se não há merchant (pode ter sido logado durante o intervalo)
      const currentMerchant = localStorage.getItem('store-flow-merchant');
      if (currentMerchant) {
        console.log('🔍 useAutoRefreshToken - Merchant detectado durante refresh, parando');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      try {
        isRefreshingRef.current = true;
        
        const token = localStorage.getItem('store-flow-token');
        if (token) {
          await refreshTokenProactively();
        }
      } catch (error: any) {
        console.error('Erro ao renovar token automaticamente:', error);
        
        // Apenas limpar tokens se for erro de autenticação (401), não erro de rede
        if (error?.message?.includes('401') || error?.message?.includes('Falha ao renovar')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('store-flow-token');
            localStorage.removeItem('store-flow-refresh-token');
            localStorage.removeItem('store-flow-customer');
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        // Para erros de rede (ECONNREFUSED, etc), apenas logar e continuar tentando
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Renovar imediatamente ao montar (se necessário)
    // E depois a cada 5 minutos (300000 ms)
    refreshTokenSilently();
    intervalRef.current = window.setInterval(refreshTokenSilently, 5 * 60 * 1000); // 5 minutos

    // Limpar intervalo ao desmontar
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Executar apenas uma vez ao montar
};

/**
 * Função auxiliar para renovar o token proativamente
 */
async function refreshTokenProactively(): Promise<void> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('store-flow-refresh-token')
    : null;

  if (!refreshToken) {
    return;
  }

  try {
    // Importar dinamicamente para evitar dependência circular
    const { API_ENDPOINTS } = await import('@/services/api/endpoints');
    const API_CONFIG = (await import('@/config/env')).default;
    
    const refreshEndpoint = API_ENDPOINTS.AUTH.REFRESH;
    const response = await fetch(`${API_CONFIG.BASE_URL}${refreshEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} - Falha ao renovar token: ${errorText}`);
    }

    const responseData = await response.json();
    const data = responseData.success && responseData.data 
      ? responseData.data 
      : responseData;

    const newToken = data.token;
    const newRefreshToken = data.refreshToken;

    if (newToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-token', newToken);
        apiClient.setAuthToken(newToken);
      }
      
      if (newRefreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('store-flow-refresh-token', newRefreshToken);
        }
        apiClient.setRefreshToken(newRefreshToken);
      }
      
      console.log('✅ Token renovado proativamente com sucesso');
    }
  } catch (error: any) {
    // Diferenciar erro de rede de erro de autenticação
    const isNetworkError = error?.message?.includes('Failed to fetch') || 
                           error?.name === 'TypeError' ||
                           error?.message?.includes('ECONNREFUSED');
    
    if (isNetworkError) {
      console.warn('⚠️ Erro de rede ao renovar token, tentará novamente depois');
      // Não propagar erro de rede
      return;
    }
    
    console.error('❌ Erro de autenticação ao renovar token:', error);
    throw error;
  }
}

