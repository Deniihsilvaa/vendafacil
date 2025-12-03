import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { MerchantAuthProvider, useMerchantAuth } from '@/contexts';

/**
 * Layout wrapper para rotas de Merchant
 * Fornece o MerchantAuthProvider e proteção de rotas
 */
export const MerchantLayout: React.FC = () => {
  return (
    <MerchantAuthProvider>
      <MerchantLayoutInner />
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
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

