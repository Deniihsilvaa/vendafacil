import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { MerchantAuthProvider, useMerchantAuth } from '@/contexts';
import { Toaster } from '@/components/ui/toast';
import { LoadingState } from '@/components/shared/LoadingState';

/**
 * Layout wrapper para rotas de Merchant
 * Fornece o MerchantAuthProvider e proteção de rotas
 */
export const MerchantLayout: React.FC = () => {
  return (
    <MerchantAuthProvider>
      <MerchantLayoutInner />
      <Toaster />
    </MerchantAuthProvider>
  );
};

/**
 * Componente interno que tem acesso ao MerchantAuthContext
 */
const MerchantLayoutInner: React.FC = () => {
  const { merchant, loading } = useMerchantAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Carregando..." size="lg" />
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!merchant) {
    return <Navigate to="/merchant/login" replace />;
  }

  // Renderizar rotas filhas
  return <Outlet />;
};

