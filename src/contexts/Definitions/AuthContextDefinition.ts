import { createContext } from 'react';
import type { CustomerAuthContextType } from '@/types/customerAuth';

export const AuthContext = createContext<CustomerAuthContextType | undefined>(undefined);
