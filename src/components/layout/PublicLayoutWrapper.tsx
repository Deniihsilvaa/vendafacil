/**
 * PublicLayoutWrapper
 * Wrapper para rotas públicas que fornece AuthProvider e CartProvider
 * Renderiza <Outlet /> para exibir as rotas filhas
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider, CartProvider } from '@/contexts';
import { Toaster } from '@/components/ui/toast';

/**
 * Wrapper para rotas públicas
 * Fornece AuthProvider e CartProvider para todas as rotas filhas
 */
export const PublicLayoutWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <Outlet />
      </CartProvider>
    </AuthProvider>
  );
};

