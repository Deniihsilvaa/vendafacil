/**
 * Hook para gerenciar status da loja
 * Usa endpoint otimizado para buscar e atualizar status
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  // Ref para rastrear quando o último toggle aconteceu
  // Isso previne recarregamentos automáticos que podem sobrescrever o estado após um toggle
  const lastToggleTimeRef = React.useRef<number>(0);
  const SKIP_RELOAD_AFTER_TOGGLE_MS = 5000; // Pular recarregamento por 5 segundos após toggle

  /**
   * Carrega o status da loja (endpoint otimizado)
   */
  const loadStatus = useCallback(async (skipIfRecentToggle = false) => {
    if (!storeId || !enabled) {
      setStatus(null);
      return;
    }

    // Se acabou de fazer toggle, pular recarregamento automático por alguns segundos
    if (skipIfRecentToggle) {
      const timeSinceLastToggle = Date.now() - lastToggleTimeRef.current;
      if (timeSinceLastToggle < SKIP_RELOAD_AFTER_TOGGLE_MS) {
        console.log('⏭️ Pulando recarregamento - toggle recente');
        return;
      }
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

    console.log('🔄 useStoreStatus.toggleStatus - Iniciando toggle:', {
      storeId,
      closed,
      statusAntes: status,
    });

    try {
      setToggling(true);
      // Registrar o tempo do toggle
      lastToggleTimeRef.current = Date.now();
      
      const updatedStatus = await StoreService.toggleStoreStatus(storeId, closed);
      
      console.log('✅ useStoreStatus.toggleStatus - Status atualizado:', {
        closed,
        updatedStatus,
        isTemporarilyClosed: updatedStatus.isTemporarilyClosed,
        isOpen: updatedStatus.isOpen,
      });
      
      // Atualizar status diretamente após toggle bem-sucedido
      setStatus(updatedStatus);
      
      showSuccessToast(
        closed 
          ? 'Loja fechada temporariamente' 
          : 'Loja aberta - voltou ao horário normal',
        'Status Atualizado'
      );
    } catch (error) {
      console.error('❌ useStoreStatus.toggleStatus - Erro:', error);
      // Erro já tratado pelo service
    } finally {
      setToggling(false);
    }
  }, [storeId, status]);

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
  // Mas pular se houve toggle recente
  useEffect(() => {
    if (!storeId || !enabled) return;

    const interval = setInterval(() => {
      // Verificar se houve toggle recente antes de recarregar
      const timeSinceLastToggle = Date.now() - lastToggleTimeRef.current;
      if (timeSinceLastToggle < SKIP_RELOAD_AFTER_TOGGLE_MS) {
        console.log('⏭️ Pulando recarregamento automático - toggle recente');
        return;
      }
      
      loadStatus(true); // Pular se houve toggle recente
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

