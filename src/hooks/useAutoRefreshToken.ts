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

      try {
        isRefreshingRef.current = true;
        
        // Usar o método privado através de uma chamada à API
        // Como o refreshAccessToken é privado, vamos fazer uma chamada que vai acionar o refresh
        // ou criar um método público para isso
        
        // Por enquanto, vamos fazer uma chamada simples que vai acionar o refresh se necessário
        // Na prática, o refresh já acontece automaticamente quando há um 401
        // Mas precisamos forçar a renovação proativa
        
        // Criar um método público no apiClient para refresh proativo
        const token = localStorage.getItem('store-flow-token');
        if (token) {
          // Verificar se o token está próximo de expirar (opcional)
          // Por enquanto, apenas renovar a cada 5 minutos
          await refreshTokenProactively();
        }
      } catch (error) {
        console.error('Erro ao renovar token automaticamente:', error);
        // Se falhar, limpar tokens e parar a renovação automática
        if (typeof window !== 'undefined') {
          localStorage.removeItem('store-flow-token');
          localStorage.removeItem('store-flow-refresh-token');
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
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
      throw new Error('Falha ao renovar token');
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
    }
  } catch (error) {
    console.error('Erro ao renovar token proativamente:', error);
    throw error;
  }
}

