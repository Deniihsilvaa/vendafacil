import { createContext } from 'react';
import type { MerchantAuthContextType } from '@/types/merchantAuth';

export const MerchantAuthContext = createContext<MerchantAuthContextType | undefined>(undefined);

