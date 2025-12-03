import React, { useState, useEffect } from 'react';
import type { Merchant, MerchantSignupCredentials } from '@/types';
import type { MerchantAuthContextType, MerchantLoginCredentials } from '@/types/merchantAuth';
import { MerchantAuthContext } from './Definitions/MerchantAuthContextDefinition';
import { AuthService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useAutoRefreshToken } from '@/hooks/useAutoRefreshToken';

interface MerchantAuthProviderProps {
  children: React.ReactNode;
}

export const MerchantAuthProvider: React.FC<MerchantAuthProviderProps> = ({ children }) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Renovar token automaticamente a cada 5 minutos
  useAutoRefreshToken();

  /**
   * Login do Merchant
   */
  const login = async (credentials: MerchantLoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Login como merchant (requer apenas email e password)
      const response = await AuthService.merchantLogin(
        credentials.email,
        credentials.password
      );

      // Transformar MerchantLoginResult em Merchant para o contexto
      // Validar role para garantir que seja 'admin' ou 'manager'
      const role = response.user.role === 'admin' || response.user.role === 'manager' 
        ? response.user.role 
        : 'admin'; // Default para 'admin' se não for válido
      
      const merchantData: Merchant = {
        id: response.user.id,
        email: response.user.email,
        role: role as 'admin' | 'manager',
        stores: response.stores,
        // Se houver apenas uma loja, definir como storeId padrão
        storeId: response.stores.length === 1 ? response.stores[0].id : undefined,
      };

      setMerchant(merchantData);
      
      // Salvar dados do merchant no localStorage
      if (typeof window !== 'undefined') {
        // Salvar como 'store-flow-user' para consistência com authService.getProfile()
        localStorage.setItem('store-flow-user', JSON.stringify(merchantData));
        // Manter backward compatibility
        localStorage.setItem('store-flow-merchant', JSON.stringify(merchantData));
        // Salvar também o resultado completo para referência futura
        localStorage.setItem('store-flow-merchant-login-result', JSON.stringify(response));
      }

      showSuccessToast('Login realizado com sucesso!', 'Bem-vindo!');
    } catch (error) {
      console.error('Erro no login do merchant:', error);
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cadastro do Merchant
   */
  const signup = async (credentials: MerchantSignupCredentials): Promise<void> => {
    setLoading(true);
    try {
      const result = await AuthService.merchantSignup(credentials);
      
      // Após cadastro bem-sucedido, fazer login automaticamente
      await login({
        email: credentials.email,
        password: credentials.password,
      });
      
      showSuccessToast(
        `Conta criada com sucesso! Loja "${result.store.name}" foi criada.`,
        'Bem-vindo!'
      );
    } catch (error) {
      console.error('Erro no cadastro do merchant:', error);
      showErrorToast(error as Error, 'Erro ao criar conta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout do Merchant
   */
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setMerchant(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('store-flow-user');
        localStorage.removeItem('store-flow-merchant');
        localStorage.removeItem('store-flow-merchant-login-result');
        localStorage.removeItem('store-flow-token');
        localStorage.removeItem('store-flow-refresh-token');
      }
    }
  };

  /**
   * Atualizar dados do Merchant
   */
  const updateMerchant = async (updatedMerchant: Merchant) => {
    try {
      // Para merchant, normalmente não há endpoint de update de perfil como customer
      // Apenas atualizar localmente
      setMerchant(updatedMerchant);
      if (typeof window !== 'undefined') {
        // Salvar como 'store-flow-user' para consistência com authService.getProfile()
        localStorage.setItem('store-flow-user', JSON.stringify(updatedMerchant));
        // Manter backward compatibility
        localStorage.setItem('store-flow-merchant', JSON.stringify(updatedMerchant));
      }
      showSuccessToast('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar merchant:', error);
      showErrorToast(error as Error, 'Erro ao atualizar perfil');
      throw error;
    }
  };

  // Carregar merchant do localStorage e validar
  useEffect(() => {
    const loadMerchant = async () => {
      try {
        // Tentar carregar do localStorage primeiro
        // Verificar 'store-flow-user' primeiro (padrão do authService)
        let savedMerchant = localStorage.getItem('store-flow-user');
        // Fallback para 'store-flow-merchant' (backward compatibility)
        if (!savedMerchant) {
          savedMerchant = localStorage.getItem('store-flow-merchant');
        }
        
        if (savedMerchant) {
          try {
            const merchantData = JSON.parse(savedMerchant);
            console.log('🔍 MerchantAuthContext - Merchant carregado do localStorage:', {
              id: merchantData?.id,
              email: merchantData?.email,
              role: merchantData?.role,
              storesLength: merchantData?.stores?.length || 0,
            });
            
            // Validar se o role é válido para merchant
            if (merchantData.role === 'admin' || merchantData.role === 'manager') {
              setMerchant(merchantData);
              // Garantir que esteja salvo com a chave correta
              localStorage.setItem('store-flow-user', JSON.stringify(merchantData));
            } else {
              console.warn('⚠️ MerchantAuthContext - Role inválido no localStorage, limpando dados', {
                role: merchantData?.role,
              });
              localStorage.removeItem('store-flow-user');
              localStorage.removeItem('store-flow-merchant');
              localStorage.removeItem('store-flow-merchant-login-result');
            }
          } catch (error) {
            console.error('Erro ao carregar merchant do localStorage:', error);
            localStorage.removeItem('store-flow-user');
            localStorage.removeItem('store-flow-merchant');
            localStorage.removeItem('store-flow-merchant-login-result');
          }
        }

        // Buscar perfil atualizado da API se houver token
        const token = localStorage.getItem('store-flow-token');
        if (token) {
          try {
            const profile = await AuthService.getProfile();
            
            // Verificar se é realmente um merchant (role deve ser 'admin' ou 'manager')
            const isMerchant = profile && 'role' in profile && 
              (profile.role === 'admin' || profile.role === 'manager');
            
            if (isMerchant) {
              console.log('🔍 MerchantAuthContext - Perfil merchant carregado da API:', {
                id: profile?.id,
                email: profile?.email,
                role: (profile as Merchant).role,
                storesLength: (profile as Merchant).stores?.length || 0,
              });
              setMerchant(profile as Merchant);
              // Salvar como 'store-flow-user' para consistência
              localStorage.setItem('store-flow-user', JSON.stringify(profile));
              // Manter backward compatibility
              localStorage.setItem('store-flow-merchant', JSON.stringify(profile));
            } else {
              // Se não for merchant, limpar dados
              const profileRole = 'role' in profile ? (profile as Merchant).role : 'unknown';
              console.warn('⚠️ MerchantAuthContext - Perfil não é de merchant, limpando dados', {
                role: profileRole,
              });
              localStorage.removeItem('store-flow-user');
              localStorage.removeItem('store-flow-merchant');
              localStorage.removeItem('store-flow-merchant-login-result');
              setMerchant(null);
            }
          } catch (error) {
            // Se falhar, limpar dados inválidos
            console.error('Erro ao buscar perfil merchant da API:', error);
            localStorage.removeItem('store-flow-token');
            localStorage.removeItem('store-flow-user');
            localStorage.removeItem('store-flow-merchant');
            localStorage.removeItem('store-flow-merchant-login-result');
            setMerchant(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadMerchant();
  }, []);

  const value: MerchantAuthContextType = {
    merchant,
    login,
    signup,
    logout,
    updateMerchant,
    loading,
  };

  return (
    <MerchantAuthContext.Provider value={value}>
      {children}
    </MerchantAuthContext.Provider>
  );
};

