import React, { useState, useEffect } from 'react';
import type { AuthContextType, Customer, Merchant, LoginCredentials } from '@/types';
import { AuthContext } from './Definitions/AuthContextDefinition';
import { getLocalISOString } from '@/utils/format';

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
      // TODO: Implementar chamada para API de login
      // Simulação para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.phone) {
        // Login como customer
        const customer: Customer = {
          id: '1',
          phone: credentials.phone,
          name: 'Cliente Exemplo',
          storeId: '1',
        };
        setUser(customer);
        localStorage.setItem('venda-facil-user', JSON.stringify(customer));
      } else if (credentials.email && credentials.password) {
        // Login como merchant
        const merchant: Merchant = {
          id: '1',
          email: credentials.email,
          storeId: '1',
          role: 'admin',
        };
        setUser(merchant);
        localStorage.setItem('venda-facil-user', JSON.stringify(merchant));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('venda-facil-user');
  };

  const updateUser = (updatedUser: Customer | Merchant) => {
    setUser(updatedUser);
    localStorage.setItem('venda-facil-user', JSON.stringify(updatedUser));
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
