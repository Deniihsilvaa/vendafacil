import React, { useState, useEffect } from 'react';
import type { AuthContextType, Customer, Merchant, LoginCredentials, MerchantSignupCredentials } from '@/types';
import { AuthContext } from './Definitions/AuthContextDefinition';
import { AuthService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useAutoRefreshToken } from '@/hooks/useAutoRefreshToken';
import type { SignupCredentials } from '../types/auth';
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Customer | Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Renovar token automaticamente a cada 5 minutos
  useAutoRefreshToken();

  // Verificar se é customer (tem phone e name) ou merchant (tem role)
  const isCustomer = user ? 'phone' in user && 'name' in user && !('role' in user) : false;
  const isMerchant = user ? 'role' in user : false;
  
  const login = async (credentials: LoginCredentials): Promise<void> => {
    let storeId: string | undefined

    setLoading(true);
    try {
      // buscando id do slug
      const storedData  = localStorage.getItem(`store_${credentials.storeId}`)
      if (storedData ){
        const parsedData = JSON.parse(storedData )
        storeId = parsedData.store.id;
  
        console.log("id do slug:", storeId )
      }
      let response;
      
      if (credentials.email && credentials.password && credentials.storeId) {
        // Login como customer (requer email, password e storeId)
        response = await AuthService.customerLogin(
          credentials.email,
          credentials.password,
          storeId || credentials.storeId
        );
        
        if (response && response.user) {
          setUser(response.user);
          // O token já é salvo pelo AuthService
          if (typeof window !== 'undefined') {
            localStorage.setItem('store-flow-user', JSON.stringify(response.user));
          }
        }
      } else if (credentials.email && credentials.password) {
        // Login como merchant - usar loginMerchant ao invés de merchantLogin diretamente
        // Isso garante que a transformação seja feita corretamente
        await loginMerchant(credentials);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const loginMerchant = async (credentials: LoginCredentials): Promise<void> => {
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
      
      const merchant: Merchant = {
        id: response.user.id,
        email: response.user.email,
        role: role as 'admin' | 'manager',
        stores: response.stores,
        // Se houver apenas uma loja, definir como storeId padrão
        storeId: response.stores.length === 1 ? response.stores[0].id : undefined,
      };

      setUser(merchant);
      
      // Salvar dados do merchant no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-user', JSON.stringify(merchant));
        // Salvar também o resultado completo para referência futura
        localStorage.setItem('store-flow-merchant-login-result', JSON.stringify(response));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupMerchant = async (credentials: MerchantSignupCredentials): Promise<void> => {
    setLoading(true);
    try {
      const result = await AuthService.merchantSignup(credentials);
      
      // Após cadastro bem-sucedido, fazer login automaticamente
      // A API de signup não retorna token, então precisamos fazer login
      await loginMerchant({
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

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('store-flow-user');
      }
    }
  };

  const updateUser = async (updatedUser: Customer | Merchant) => {
    try {
      // Atualizar via service (que pode fazer chamada à API)
      const updated = await AuthService.updateProfile(updatedUser);
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-user', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showErrorToast(error as Error, 'Erro ao atualizar perfil');
      // Mesmo com erro, atualizar localmente como fallback
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-user', JSON.stringify(updatedUser));
      }
    }
  };
  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await AuthService.customerSignup(credentials.email, credentials.password, credentials.storeId, credentials.name, credentials.phone);
      if (response){
        if (typeof window !== 'undefined') {
          localStorage.setItem('store-flow-user', JSON.stringify(response.success));
        }
        return response.success;
      } else {
        throw new Error('Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      showErrorToast(error as Error, 'Erro ao criar conta');
      throw error;
    }
  };

  // Carregar usuário do localStorage e validar com API
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Tentar carregar do localStorage primeiro (para UX mais rápida)
        const savedUser = localStorage.getItem('store-flow-user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log('🔍 AuthContext - Usuário carregado do localStorage:', {
              id: user?.id,
              email: user?.email,
              isMerchant: 'role' in user,
              hasStores: 'stores' in user,
              stores: 'stores' in user ? user.stores : 'N/A',
              storesLength: 'stores' in user && user.stores ? user.stores.length : 0,
            });
            setUser(user);
          } catch (error) {
            console.error('Erro ao carregar usuário do localStorage:', error);
          }
        }

        // Buscar perfil atualizado da API se houver token
        const token = localStorage.getItem('store-flow-token');
        if (token) {
          try {
            const profile = await AuthService.getProfile();
            if (profile) {
              console.log('🔍 AuthContext - Perfil carregado da API:', {
                id: profile?.id,
                email: profile?.email,
                isMerchant: 'role' in profile,
                hasStores: 'stores' in profile,
                stores: 'stores' in profile ? profile.stores : 'N/A',
                storesLength: 'stores' in profile && profile.stores ? profile.stores.length : 0,
              });
              setUser(profile);
              localStorage.setItem('store-flow-user', JSON.stringify(profile));
            }
          } catch (error) {
            // Se falhar, limpar dados inválidos
            console.error('Erro ao buscar perfil da API:', error);
            localStorage.removeItem('store-flow-token');
            localStorage.removeItem('store-flow-user');
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    loginMerchant,
    signupMerchant,
    logout,
    updateUser,
    isCustomer,
    isMerchant,
    loading,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
