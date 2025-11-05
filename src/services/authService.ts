/**
 * Serviço para autenticação
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import API_CONFIG from '@/config/env';
import type { Customer, Merchant } from '@/types/auth';

export interface LoginResponse {
  user: Customer | Merchant;
  token: string;
  refreshToken?: string;
}

export class AuthService {
  /**
   * Login de cliente por telefone
   */
  static async customerLogin(phone: string): Promise<LoginResponse> {
    if (API_CONFIG.USE_MOCK) {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const customer: Customer = {
        id: '1',
        phone,
        name: 'Cliente Exemplo',
        storeId: 'burger-house',
      };
      
      const token = 'mock-token-' + Date.now();
      
      // Salvar token
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-token', token);
        apiClient.setAuthToken(token);
      }
      
      return {
        user: customer,
        token,
      };
    }

    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.CUSTOMER_LOGIN,
        { phone }
      );

      const { user, token, refreshToken } = response.data;

      // Salvar token
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-token', token);
        apiClient.setAuthToken(token);
      }

      return { user, token, refreshToken };
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    }
  }

  /**
   * Login de lojista por email/senha
   */
  static async merchantLogin(email: string, password: string): Promise<LoginResponse> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const merchant: Merchant = {
        id: '1',
        email,
        storeId: 'burger-house',
        role: 'admin',
      };
      
      const token = 'mock-token-' + Date.now();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-token', token);
        apiClient.setAuthToken(token);
      }
      
      return {
        user: merchant,
        token,
      };
    }

    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.MERCHANT_LOGIN,
        { email, password }
      );

      const { user, token, refreshToken } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-token', token);
        apiClient.setAuthToken(token);
      }

      return { user, token, refreshToken };
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    if (!API_CONFIG.USE_MOCK) {
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        console.error('Erro ao fazer logout na API:', error);
      }
    }

    // Limpar token localmente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('venda-facil-token');
      apiClient.setAuthToken(null);
    }
  }

  /**
   * Busca perfil do usuário autenticado
   */
  static async getProfile(): Promise<Customer | Merchant> {
    if (API_CONFIG.USE_MOCK) {
      const user = localStorage.getItem('venda-facil-user');
      if (user) {
        return JSON.parse(user);
      }
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await apiClient.get<Customer | Merchant>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateProfile(
    user: Customer | Merchant
  ): Promise<Customer | Merchant> {
    if (API_CONFIG.USE_MOCK) {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('venda-facil-user', JSON.stringify(user));
      }
      
      return user;
    }

    try {
      const response = await apiClient.put<Customer | Merchant>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        user
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica se está autenticado (tem token válido)
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('venda-facil-token');
    return !!token;
  }

  /**
   * Inicializa token do localStorage
   */
  static initializeAuth(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('venda-facil-token');
      if (token) {
        apiClient.setAuthToken(token);
      }
    }
  }
}
