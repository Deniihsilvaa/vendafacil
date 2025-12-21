/**
 * Hook para gerenciar status da loja
 * Usa endpoint otimizado para buscar e atualizar status
 */

import { useState, useEffect, useCallback } from 'react';
import { StoreService, type StoreStatus } from '@/services/stores/storeService';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

interface UseStoreStatusProps {
  storeId: string | null;
  enabled?: boolean;
}

export const useStoreStatus = ({ storeId, enabled = true }: UseStoreStatusProps) => {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

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

  /**
   * Abre ou fecha a loja temporariamente
   */
  const toggleStatus = useCallback(async (closed: boolean) => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    try {
      setToggling(true);
      const updatedStatus = await StoreService.toggleStoreStatus(storeId, closed);
      setStatus(updatedStatus);
      
      showSuccessToast(
        closed 
          ? 'Loja fechada temporariamente' 
          : 'Loja aberta - voltou ao horário normal',
        'Status Atualizado'
      );
    } catch (error) {
      console.error('Erro ao alterar status da loja:', error);
      // Erro já tratado pelo service
    } finally {
      setToggling(false);
    }
  }, [storeId]);

  // Carregar status inicialmente e quando storeId mudar
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Recarregar status a cada 1 minuto (cache de 1 minuto no backend)
  useEffect(() => {
    if (!storeId || !enabled) return;

    const interval = setInterval(() => {
      loadStatus();
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [storeId, enabled, loadStatus]);

  return {
    status,
    loading,
    toggling,
    loadStatus,
    toggleStatus,
    isOpen: status?.isOpen ?? false,
    isTemporarilyClosed: status?.isTemporarilyClosed ?? false,
    isInactive: status?.isInactive ?? false,
  };
};

