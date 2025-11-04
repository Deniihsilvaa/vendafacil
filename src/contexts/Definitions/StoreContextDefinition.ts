import { createContext } from 'react';
import type { StoreContextType } from '@/types';

export const StoreContext = createContext<StoreContextType | undefined>(undefined);
