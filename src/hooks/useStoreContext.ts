import { useContext } from 'react';
import { StoreContext } from '@/contexts/Definitions/StoreContextDefinition';
import type { StoreContextType } from '@/types';

export const useStoreContext = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
