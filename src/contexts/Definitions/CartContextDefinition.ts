import { createContext } from 'react';
import type { CartContextType } from '@/types';

export const CartContext = createContext<CartContextType | undefined>(undefined);
