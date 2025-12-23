/**
 * Hook para gerenciar status da loja
 * Usa endpoint otimizado para buscar e atualizar status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StoreService, type StoreStatus } from '@/services/stores/storeService';

interface UseStoreStatusProps {
  storeId: string | null;
  enabled?: boolean;
}

export const useStoreStatus = ({ storeId, enabled = true }: UseStoreStatusProps) => {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Carrega o status da loja (endpoint otimizado)
   */
  const loadStatus = useCallback(async () => {
    if (!storeId || !enabled) {
      setStatus(null);
      return;
    }

    try {
      setLoading(true);
      const storeStatus = await StoreService.getStoreStatus(storeId);
      setStatus(storeStatus);
    } catch (error) {
      console.error('Erro ao carregar status da loja:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [storeId, enabled]);

  // Carregar status inicialmente e quando storeId mudar
  useEffect(() => {
    if (!storeId || !enabled) {
      setStatus(null);
      return;
    }
    
    // Carregar status inicial
    let cancelled = false;
    
    const fetchInitialStatus = async () => {
      try {
        setLoading(true);
        const storeStatus = await StoreService.getStoreStatus(storeId);
        if (!cancelled) {
          setStatus(storeStatus);
        }
      } catch (error) {
        console.error('Erro ao carregar status da loja:', error);
        if (!cancelled) {
          setStatus(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchInitialStatus();
    
    return () => {
      cancelled = true;
    };
  }, [storeId, enabled]);

  // Recarregar status a cada 1 minuto (cache de 1 minuto no backend)
  useEffect(() => {
    if (!storeId || !enabled) return;

    const interval = setInterval(async () => {
      try {
        const storeStatus = await StoreService.getStoreStatus(storeId);
        setStatus(storeStatus);
      } catch (error) {
        console.error('Erro ao recarregar status da loja:', error);
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [storeId, enabled]);

  return {
    status,
    loading,
    loadStatus,
    isOpen: status?.isOpen ?? false,
    isTemporarilyClosed: status?.isTemporarilyClosed ?? false,
    isInactive: status?.isInactive ?? false,
  };
};

