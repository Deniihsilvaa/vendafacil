/**
 * Serviço para autenticação
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import API_CONFIG from '@/config/env';
import { validateUser, validateMerchantLoginResult } from '@/utils/validators/authValidators';
import type { Customer, Merchant, MerchantLoginResult } from '@/types/auth';
import type { DeliveryAddress } from '@/types/order';

export interface LoginResponse {
  user: Customer | Merchant;
  token: string;
  refreshToken?: string;
}

// Resposta da API de login do cliente
interface CustomerLoginApiResponse {
  success: boolean;
  data: {
    identities: {
      id: string;
      email: string;
      name: string;
      phone: string;
      deleted_at: string | null;
    };
    store_active: {
      id: string;
      user_id: string;
      store: string;
      active: boolean;
      stores?: any;
    };
    token: string;
    refreshToken: string;
  };
  timestamp?: string;
}

export class AuthService {
  /**
   * Login de cliente por email/senha/storeId
   */
  static async customerLogin(
    email: string,
    password: string,
    storeId: string
  ): Promise<LoginResponse> {
    // if (API_CONFIG.USE_MOCK) {
    //   // Simular delay de API
    //   await new Promise(resolve => setTimeout(resolve, 1000));
      
    //   const customer: Customer = {
    //     id: '1',
    //     email,
    //     phone: '11999999999',
    //     name: 'Cliente Exemplo',
    //     storeId,
    //   };
      
    //   const token = 'mock-token-' + Date.now();
      
    //   // Salvar token
    //   if (typeof window !== 'undefined') {
    //     localStorage.setItem('store-flow-token', token);
    //     apiClient.setAuthToken(token);
    //   }
      
    //   return {
    //     user: customer,
    //     token,
    //   };
    // }

    try {
      const response = await apiClient.post<CustomerLoginApiResponse['data']>(
        API_ENDPOINTS.AUTH.CUSTOMER_LOGIN,
        { email, password, storeId }
      );

      // Verificar se a resposta foi bem-sucedida
      if (!response.success || !response.data) {
        throw new Error('Resposta inválida da API');
      }

      // response.data já contém o objeto data da API
      const { identities, token, refreshToken, store_active } = response.data;

      // Transformar resposta da API para formato do frontend
      const customer: Customer = {
        id: identities.id,
        email: identities.email,
        phone: identities.phone,
        name: identities.name,
        storeId: store_active.store,
      };

      // Validar resposta em runtime
      const user = validateUser(customer);

      // Salvar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-token', token);
        apiClient.setAuthToken(token);
        if (refreshToken) {
          localStorage.setItem('store-flow-refresh-token', refreshToken);
          apiClient.setRefreshToken(refreshToken);
        }
      }

      return { user, token, refreshToken };
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao fazer login');
      throw error;
    }
  }

  /**
   * Cadastro de cliente
   */
  static async customerSignup(
    email: string,
    password: string,
    storeId: string,
    name: string,
    phone: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        API_ENDPOINTS.AUTH.CUSTOMER_SIGNUP,
        { email, password, storeId, name, phone }
      );

      return { success: response.success };
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao criar conta');
      throw error;
    }
  }

  /**
   * Login de lojista por email/senha
   */
  static async merchantLogin(email: string, password: string): Promise<MerchantLoginResult> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult: MerchantLoginResult = {
        user: {
          id: '1',
          email,
          role: 'admin',
        },
        stores: [
          {
            id: 'burger-house-id',
            name: 'Burger House',
            slug: 'burger-house',
            is_active: true,
            merchant_role: 'owner',
            is_owner: true,
          },
        ],
        token: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-token', mockResult.token);
        apiClient.setAuthToken(mockResult.token);
        if (mockResult.refreshToken) {
          localStorage.setItem('store-flow-refresh-token', mockResult.refreshToken);
          apiClient.setRefreshToken(mockResult.refreshToken);
        }
      }
      
      return mockResult;
    }

    try {
      const response = await apiClient.post<MerchantLoginResult>(
        API_ENDPOINTS.AUTH.MERCHANT_LOGIN,
        { email, password }
      );

      // Validar resposta com Zod
      const validatedResult = validateMerchantLoginResult(response.data);

      // Salvar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-token', validatedResult.token);
        apiClient.setAuthToken(validatedResult.token);
        if (validatedResult.refreshToken) {
          localStorage.setItem('store-flow-refresh-token', validatedResult.refreshToken);
          apiClient.setRefreshToken(validatedResult.refreshToken);
        }
      }

      return validatedResult;
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

    // Limpar tokens localmente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('store-flow-token');
      localStorage.removeItem('store-flow-refresh-token');
      apiClient.setAuthToken(null);
      apiClient.setRefreshToken(null);
    }
  }

  /**
   * Busca perfil do usuário autenticado
   * Nota: A API retorna apenas id, email, name. 
   * Usamos dados do localStorage (salvos no login) para completar o perfil.
   */
  static async getProfile(): Promise<Customer | Merchant> {
    
    try {
      if (API_CONFIG.USE_MOCK) {
        const user = localStorage.getItem('store-flow-user');
        if (user) {
          return JSON.parse(user);
        }
        throw new Error('Usuário não autenticado');
      }
      // Interface para resposta da API de profile (pode incluir endereços)
      interface ProfileApiResponse {
        id: string;
        email: string;
        name: string;
        phone?: string;
        addresses?: Array<{
          label: string;
          street: string;
          number: string;
          neighborhood: string;
          city: string;
          state: string;
          zipCode: string;
          complement?: string | null;
          reference?: string | null;
          isDefault?: boolean;
          updatedAt?: string;
        }>;
        updatedAt?: string;
      }

      const response = await apiClient.get<ProfileApiResponse>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      
      // Buscar dados completos do localStorage (salvos durante o login)
      const savedUser = localStorage.getItem('store-flow-user');
      
      if (savedUser) {
        try {
          const fullUser = JSON.parse(savedUser) as Customer | Merchant;
          
          // Se o ID do usuário salvo corresponde ao da API, usar dados completos
          // e atualizar apenas os campos que a API retornou
          if (fullUser.id === response.data.id) {
            // Verificar se é Customer (tem addresses)
            const isCustomer = 'phone' in fullUser && 'name' in fullUser && !('role' in fullUser);
            
            if (isCustomer) {
              // Transformar endereços se vierem da API
              const addresses = response.data.addresses 
                ? this.transformAddressesArrayToObject(response.data.addresses)
                : (fullUser as Customer).addresses; // Manter endereços do localStorage se API não retornar
              
              const updatedUser: Customer = {
                ...(fullUser as Customer),
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
                phone: response.data.phone || (fullUser as Customer).phone || '',
                addresses: addresses || (fullUser as Customer).addresses,
                updatedAt: response.data.updatedAt || (fullUser as Customer).updatedAt,
              };
              
              // Salvar usuário atualizado
              if (typeof window !== 'undefined') {
                localStorage.setItem('store-flow-user', JSON.stringify(updatedUser));
              }
              
              return validateUser(updatedUser);
            } else {
              // É Merchant, não tem addresses
              const updatedUser: Merchant = {
                ...(fullUser as Merchant),
                id: response.data.id,
                email: response.data.email,
              };
              
              // Salvar usuário atualizado
              if (typeof window !== 'undefined') {
                localStorage.setItem('store-flow-user', JSON.stringify(updatedUser));
              }
              
              return validateUser(updatedUser);
            }
          }
        } catch (e) {
          console.error('Erro ao parsear usuário do localStorage:', e);
        }
      }

      // Se não temos dados salvos ou IDs não correspondem,
      // criar um Customer com os dados da API (incluindo endereços se disponíveis)
      const addresses = response.data.addresses 
        ? this.transformAddressesArrayToObject(response.data.addresses)
        : undefined;
      
      const customer: Customer = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        phone: response.data.phone || '', // Será preenchido no próximo login se não vier
        storeId: '', // Será preenchido no próximo login
        addresses: addresses,
        updatedAt: response.data.updatedAt,
      };
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-user', JSON.stringify(customer));
      }
      
      return validateUser(customer);
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao buscar perfil');
      throw error;
    }
  }

  /**
   * Transforma array de endereços da API para objeto do frontend
   */
  private static transformAddressesArrayToObject(
    addressesArray: Array<{
      label: string;
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      complement?: string | null;
      reference?: string | null;
      isDefault?: boolean;
      updatedAt?: string;
    }>
  ): { home?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string }; work?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string } } {
    const addresses: { home?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string }; work?: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string } } = {};
    
    addressesArray.forEach((addr) => {
      const addressData: DeliveryAddress & { label?: string; isDefault?: boolean; updatedAt?: string } = {
        street: addr.street,
        number: addr.number,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        complement: addr.complement || undefined,
        reference: addr.reference || undefined,
        label: addr.label,
        isDefault: addr.isDefault || false,
        updatedAt: addr.updatedAt,
      };
      
      if (addr.label === 'home') {
        addresses.home = addressData;
      } else if (addr.label === 'work') {
        addresses.work = addressData;
      }
    });
    
    return addresses;
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
        localStorage.setItem('store-flow-user', JSON.stringify(user));
      }
      
      return user;
    }

    try {
      // Converter formato de endereços de objeto para array (formato esperado pela API)
      const apiPayload: any = { ...user };
      
      // Se for Customer e tiver addresses, converter para array
      if ('addresses' in user && user.addresses) {
        const addressesArray: any[] = [];
        
        // Converter home
        if (user.addresses.home) {
          addressesArray.push({
            label: 'home',
            street: user.addresses.home.street,
            number: user.addresses.home.number,
            neighborhood: user.addresses.home.neighborhood,
            city: user.addresses.home.city,
            state: user.addresses.home.state || '', // Garantir que state existe
            zipCode: user.addresses.home.zipCode,
            complement: user.addresses.home.complement || '',
            reference: user.addresses.home.reference || '',
            isDefault: user.addresses.home.isDefault || false,
          });
        }
        
        // Converter work
        if (user.addresses.work) {
          addressesArray.push({
            label: 'work',
            street: user.addresses.work.street,
            number: user.addresses.work.number,
            neighborhood: user.addresses.work.neighborhood,
            city: user.addresses.work.city,
            state: user.addresses.work.state || '', // Garantir que state existe
            zipCode: user.addresses.work.zipCode,
            complement: user.addresses.work.complement || '',
            reference: user.addresses.work.reference || '',
            isDefault: user.addresses.work.isDefault || false,
          });
        }
        
        apiPayload.addresses = addressesArray;
      }
      
      // Remover campos que não devem ser enviados
      delete apiPayload.id;
      delete apiPayload.email;
      delete apiPayload.storeId;
      delete apiPayload.updatedAt;
      
      // Interface para resposta da API (endereços vêm como array)
      interface UpdateProfileApiResponse {
        id: string;
        email: string;
        name: string;
        phone: string;
        addresses?: Array<{
          label: string;
          street: string;
          number: string;
          neighborhood: string;
          city: string;
          state: string;
          zipCode: string;
          complement?: string | null;
          reference?: string | null;
          isDefault?: boolean;
          updatedAt?: string;
        }>;
        updatedAt?: string;
      }

      const response = await apiClient.put<UpdateProfileApiResponse>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        apiPayload
      );
      
      // Transformar resposta da API para formato do frontend
      const transformedUser: Customer | Merchant = {
        ...response.data,
        storeId: user.storeId || (user as Customer).storeId || '', // Manter storeId do usuário atual
        addresses: response.data.addresses 
          ? this.transformAddressesArrayToObject(response.data.addresses)
          : undefined,
      } as Customer | Merchant;
      
      // Validar resposta em runtime
      const validatedUser = validateUser(transformedUser);
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-user', JSON.stringify(validatedUser));
      }
      
      // Invalidar cache de perfil se necessário
      if (typeof window !== 'undefined') {
        const { CacheService, CACHE_TAGS } = await import('@/services/cache/CacheService');
        CacheService.invalidateByTag(CACHE_TAGS.PROFILE(validatedUser.id));
      }
      
      return validatedUser;
    } catch (error) {
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao atualizar perfil');
      throw error;
    }
  }

  /**
   * Verifica se está autenticado (tem token válido)
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('store-flow-token');
    return !!token;
  }

  /**
   * Inicializa token do localStorage
   */
  static initializeAuth(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('store-flow-token');
      if (token) {
        apiClient.setAuthToken(token);
      }
    }
  }
}
