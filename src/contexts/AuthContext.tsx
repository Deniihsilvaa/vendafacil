import React, { useState, useEffect } from 'react';
import type { AuthContextType, Customer, Merchant, LoginCredentials } from '@/types';
import { AuthContext } from './Definitions/AuthContextDefinition';
import { AuthService } from '@/services/authService';
import { showErrorToast } from '@/utils/toast';
import { useAutoRefreshToken } from '@/hooks/useAutoRefreshToken';

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
    setLoading(true);
    try {
      let response;
      
      if (credentials.email && credentials.password && credentials.storeId) {
        // Login como customer (requer email, password e storeId)
        response = await AuthService.customerLogin(
          credentials.email,
          credentials.password,
          credentials.storeId
        );
      } else if (credentials.email && credentials.password) {
        // Login como merchant (requer apenas email e password)
        response = await AuthService.merchantLogin(credentials.email, credentials.password);
      } else {
        throw new Error('Credenciais inválidas');
      }

      if (response && response.user) {
        setUser(response.user);
        // O token já é salvo pelo AuthService
        if (typeof window !== 'undefined') {
          localStorage.setItem('store-flow-user', JSON.stringify(response.user));
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showErrorToast(error as Error, 'Erro ao fazer login');
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

  // Carregar usuário do localStorage e validar com API
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Tentar carregar do localStorage primeiro (para UX mais rápida)
        const savedUser = localStorage.getItem('store-flow-user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
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
    logout,
    updateUser,
    isCustomer,
    isMerchant,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
