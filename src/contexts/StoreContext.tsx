import React, { useState, useEffect } from 'react';
import type { Store, StoreContextType, StoreProviderProps } from '@/types/store';
import { StoreService } from '@/services/storeService';
import { StoreContext } from './Definitions/StoreContextDefinition';
import { showErrorToast } from '@/utils/toast';



export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Carregar lista de lojas disponíveis
  useEffect(() => {
    const loadStores = async () => {
      try {
        setStoreLoading(true);
        const storesData = await StoreService.getAllStores();
        setStores(storesData);
        setStoreError(null);
        
        // Salvar no localStorage para cache
        localStorage.setItem('available_stores', JSON.stringify({
          stores: storesData,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        setStoreError('Erro ao carregar lojas');
        
        // Mostrar toast de erro
        showErrorToast(error as Error, 'Erro ao carregar lojas');
        
        // Tentar carregar do cache
        const cached = localStorage.getItem('available_stores');
        if (cached) {
          try {
            const cacheData = JSON.parse(cached);
            const isStale = Date.now() - cacheData.timestamp > 10 * 60 * 1000; // 10 minutos
            
            if (!isStale) {
              setStores(cacheData.stores);
              setStoreError(null);
            }
          } catch (cacheErr) {
            console.error('Erro ao ler cache de lojas:', cacheErr);
          }
        }
      } finally {
        setStoreLoading(false);
      }
    };

    loadStores();
  }, []);

  const setStore = (store: Store) => {
    setCurrentStore(store);
    setStoreError(null);
  };

  const getStoreByIdSync = (id: string): Store | null => {
    return stores.find(store => store.id === id || store.slug === id) || null;
  };

  const value: StoreContextType = {
    currentStore,
    stores,
    setStore,
    getStoreById: getStoreByIdSync,
    storeLoading,
    storeError,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};