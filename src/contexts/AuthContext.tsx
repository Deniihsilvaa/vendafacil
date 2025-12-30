import React, { useState, useEffect } from 'react';
import type { Customer, SignupCredentials } from '@/types';
import type { CustomerAuthContextType, CustomerLoginCredentials } from '@/types/customerAuth';
import { AuthContext } from './Definitions/AuthContextDefinition';
import { AuthService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useAutoRefreshToken } from '@/hooks/useAutoRefreshToken';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Contexto de autenticação para CUSTOMERS
 * Para Merchants, use MerchantAuthProvider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Renovar token automaticamente a cada 5 minutos
  useAutoRefreshToken();
  
  /**
   * Login do Customer
   */
  const login = async (credentials: CustomerLoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Tentar obter storeId das credentials ou da URL
      let storeId = credentials.storeId;
      
      // Se não foi fornecido, tentar obter da URL atual
      if (!storeId && typeof window !== 'undefined') {
        const pathMatch = window.location.pathname.match(/\/loja\/([^/]+)/);
        if (pathMatch && pathMatch[1]) {
          storeId = pathMatch[1];
        }
      }

      if (!storeId) {
        throw new Error('ID da loja é obrigatório. Acesse a página através de uma loja (ex: /loja/nome-da-loja/perfil)');
      }

      // A API aceita tanto UUID quanto slug, então não precisamos converter
      // Login como customer (requer email, password e storeId)
      const response = await AuthService.customerLogin(
        credentials.email,
        credentials.password,
        storeId
      );
      
      if (response && response.user) {
        setCustomer(response.user as Customer);
        // O token já é salvo pelo AuthService
        if (typeof window !== 'undefined') {
          localStorage.setItem('store-flow-customer', JSON.stringify(response.user));
        }
        showSuccessToast('Login realizado com sucesso!', 'Bem-vindo!');
      }
    } catch (error) {
      console.error('Erro no login do customer:', error);
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout do Customer
   */
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setCustomer(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('store-flow-customer');
        localStorage.removeItem('store-flow-token');
        localStorage.removeItem('store-flow-refresh-token');
      }
    }
  };

  /**
   * Atualizar perfil do Customer
   */
  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      // Atualizar via service (que pode fazer chamada à API)
      const updated = await AuthService.updateProfile(updatedCustomer);
      setCustomer(updated as Customer);
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-customer', JSON.stringify(updated));
      }
      showSuccessToast('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar customer:', error);
      showErrorToast(error as Error, 'Erro ao atualizar perfil');
      // Mesmo com erro, atualizar localmente como fallback
      setCustomer(updatedCustomer);
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-customer', JSON.stringify(updatedCustomer));
      }
    }
  };

  /**
   * Cadastro do Customer
   */
  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await AuthService.customerSignup(
        credentials.email, 
        credentials.password, 
        credentials.storeId, 
        credentials.name, 
        credentials.phone
      );
      
      if (response && response.success) {
        // Após cadastro, fazer login automaticamente
        await login({
          email: credentials.email,
          password: credentials.password,
          storeId: credentials.storeId,
        });
        showSuccessToast('Conta criada com sucesso!', 'Bem-vindo!');
        return true;
      } else {
        throw new Error('Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      showErrorToast(error as Error, 'Erro ao criar conta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Carregar customer do localStorage e validar com API
  useEffect(() => {
    const loadCustomer = async () => {
      // Verificar se há um merchant logado (não tentar carregar customer nesse caso)
      const savedMerchant = localStorage.getItem('store-flow-merchant');
      if (savedMerchant) {
        console.log('🔍 AuthContext - Merchant detectado, pulando carregamento de customer');
        setCustomer(null);
        setLoading(false);
        return;
      }

      // Tentar carregar do localStorage primeiro (para UX mais rápida)
      const savedCustomer = localStorage.getItem('store-flow-customer');
      
      try {
        if (savedCustomer) {
          try {
            const customerData = JSON.parse(savedCustomer);
            console.log('🔍 AuthContext - Customer carregado do localStorage:', {
              id: customerData?.id,
              email: customerData?.email,
              name: customerData?.name,
              storeId: customerData?.storeId,
            });
            setCustomer(customerData);
          } catch (error) {
            console.error('Erro ao carregar customer do localStorage:', error);
          }
        }

        // Buscar perfil atualizado da API se houver token
        const token = localStorage.getItem('store-flow-token');
        if (token) {
          try {
            const profile = await AuthService.getProfile();
            console.log('profile:', profile);
            
            // Verificar se é realmente um customer (não tem role)
            if (profile && !('role' in profile)) {
              console.log('🔍 AuthContext - Perfil customer carregado da API:', {
                id: profile?.id,
                email: profile?.email,
                name: (profile as Customer)?.name,
                storeId: (profile as Customer)?.storeId,
                hasAddresses: !!(profile as Customer)?.addresses,
              });
              setCustomer(profile as Customer);
              localStorage.setItem('store-flow-customer', JSON.stringify(profile));
            } else {
              // Se for merchant, limpar dados de customer
              console.warn('⚠️ AuthContext - Perfil não é de customer, limpando dados de customer');
              localStorage.removeItem('store-flow-customer');
              setCustomer(null);
            }
          } catch (error) {
            // Se falhar ao buscar perfil da API, manter dados do localStorage se existirem
            console.error('Erro ao buscar perfil customer da API:', error);
            // Não limpar customer se já tiver no localStorage (pode ser erro temporário da API)
            if (!savedCustomer) {
              // Só limpar se não tiver dados salvos
              localStorage.removeItem('store-flow-customer');
              setCustomer(null);
            }
            // Se já tinha dados salvos, manter (pode ser erro temporário)
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, []);

  const value: CustomerAuthContextType = {
    customer,
    login,
    logout,
    updateCustomer,
    signup,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
