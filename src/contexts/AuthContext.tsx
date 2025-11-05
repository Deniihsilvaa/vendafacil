import React, { useState, useEffect } from 'react';
import type { AuthContextType, Customer, Merchant, LoginCredentials } from '@/types';
import { AuthContext } from './Definitions/AuthContextDefinition';
import { AuthService } from '@/services/authService';
import { getLocalISOString } from '@/utils/format';
import { showErrorToast } from '@/utils/toast';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Customer | Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se é customer (tem phone) ou merchant (tem email)
  const isCustomer = user ? 'phone' in user : false;
  const isMerchant = user ? 'email' in user : false;

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      let response;
      
      if (credentials.phone) {
        // Login como customer
        response = await AuthService.customerLogin(credentials.phone);
      } else if (credentials.email && credentials.password) {
        // Login como merchant
        response = await AuthService.merchantLogin(credentials.email, credentials.password);
      } else {
        throw new Error('Credenciais inválidas');
      }

      if (response && response.user) {
        setUser(response.user);
        // O token já é salvo pelo AuthService
        if (typeof window !== 'undefined') {
          localStorage.setItem('venda-facil-user', JSON.stringify(response.user));
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
        localStorage.removeItem('venda-facil-user');
      }
    }
  };

  const updateUser = async (updatedUser: Customer | Merchant) => {
    try {
      // Atualizar via service (que pode fazer chamada à API)
      const updated = await AuthService.updateProfile(updatedUser);
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-user', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showErrorToast(error as Error, 'Erro ao atualizar perfil');
      // Mesmo com erro, atualizar localmente como fallback
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-user', JSON.stringify(updatedUser));
      }
    }
  };

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('venda-facil-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
      }
    } else {
      // Para desenvolvimento: criar usuário mockado automaticamente
      const mockCustomer: Customer = {
        id: '1',
        phone: '(11) 98765-4321',
        name: 'Cliente Exemplo',
        storeId: 'burger-house',
        addresses: {
          home: {
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            zipCode: '01234-567',
            complement: 'Apto 45',
            isDefault: true,
            updatedAt: getLocalISOString(),
          },
          work: {
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            zipCode: '01310-100',
            complement: 'Sala 501',
            isDefault: false,
            updatedAt: getLocalISOString(),
          },
        },
        updatedAt: getLocalISOString(),
      };
      setUser(mockCustomer);
      localStorage.setItem('venda-facil-user', JSON.stringify(mockCustomer));
    }
    setLoading(false);
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
