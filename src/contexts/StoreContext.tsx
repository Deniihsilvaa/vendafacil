import React, { useState, useEffect } from 'react';
import type { Store, StoreContextType, StoreProviderProps } from '@/types/store';
import { StoreService } from '@/services/stores/storeService';
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
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        setStoreError('Erro ao carregar lojas');
        
        // Mostrar toast de erro
        showErrorToast(error as Error, 'Erro ao carregar lojas');
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