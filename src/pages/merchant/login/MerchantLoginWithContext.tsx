import React from 'react';
import { MerchantAuthProvider } from '@/contexts';
import { MerchantLogin } from './MerchantLogin';
import { Toaster } from '@/components/ui/toast';

/**
 * Wrapper para a página de login do Merchant
 * Fornece o MerchantAuthProvider para a página de login
 */
export const MerchantLoginWithContext: React.FC = () => {
  return (
    <MerchantAuthProvider>
      <MerchantLogin />
      <Toaster />
    </MerchantAuthProvider>
  );
};

