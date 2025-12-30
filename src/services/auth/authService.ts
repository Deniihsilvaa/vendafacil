/**
 * Serviço para autenticação
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import API_CONFIG from '@/config/env';
import { validateUser, validateMerchantLoginResult } from '@/utils/validators/authValidators';
import type { Customer, Merchant, MerchantLoginResult, MerchantSignupCredentials, MerchantSignupResult } from '@/types/auth';
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
      stores?: Array<{ id: string; name: string; slug: string; is_active: boolean; merchant_role: string | null; is_owner: boolean }>;
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
      console.error('Erro no customerLogin:', error);
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
      console.error('Erro no customerSignup:', error);
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
      // Não exibir toast aqui - deixar para o contexto/componente tratar
      console.error('Erro no merchantLogin:', error);
      throw error;
    }
  }

  /**
   * Cadastro de merchant (lojista) com criação automática da primeira loja
   */
  static async merchantSignup(credentials: MerchantSignupCredentials): Promise<MerchantSignupResult> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMerchant = {
        id: 'mock-merchant-id-' + Date.now(),
        email: credentials.email,
      };
      const mockStore = {
        id: 'mock-store-id-' + Date.now(),
        name: credentials.storeName,
        slug: credentials.storeName.toLowerCase().replace(/\s+/g, '-'),
      };

      const mockResult: MerchantSignupResult = {
        success: true,
        merchant: mockMerchant,
        store: mockStore,
      };
      
      return mockResult;
    }

    try {
      // A API retorna: { success: true, data: { success, merchant, store } }
      // O apiClient.formatResponse extrai o .data, então response.data será:
      // { success: true, merchant: {...}, store: {...} }
      const response = await apiClient.post<MerchantSignupResult>(
        API_ENDPOINTS.AUTH.MERCHANT_SIGNUP,
        {
          email: credentials.email,
          password: credentials.password,
          storeName: credentials.storeName,
          storeDescription: credentials.storeDescription || undefined,
          storeCategory: credentials.storeCategory || undefined,
          customCategory: credentials.customCategory || undefined,
        }
      );

      // response.data já é o MerchantSignupResult após o formatResponse
      const result = response.data;
      
      if (!result || !result.merchant || !result.store) {
        throw new Error('Resposta inválida da API');
      }

      return result;
    } catch (error) {
      console.error('Erro no merchantSignup:', error);
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
      // Interface para resposta da API de profile (conforme documentação)
      interface ProfileApiResponse {
        id: string;
        name: string;
        phone: string;
        email: string;
        addresses?: Array<{
          id: string;
          label: string;
          addressType: 'home' | 'work' | 'other';
          street: string;
          number: string;
          neighborhood: string;
          city: string;
          state: string;
          zipCode: string;
          complement?: string | null;
          reference?: string | null;
          isDefault: boolean;
        }>;
      }

      // Verificar se é Merchant (não buscar perfil de customer)
      const savedMerchant = localStorage.getItem('store-flow-merchant');
      if (savedMerchant) {
        const merchant = JSON.parse(savedMerchant) as Merchant;
        return validateUser(merchant);
      }
      
      // Para customers, buscar perfil da API GET /api/auth/profile
      // A resposta vem como { success: true, data: { id, name, phone, email, addresses: [...] } }
      const response = await apiClient.get<{ data: ProfileApiResponse } | ProfileApiResponse>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      console.log('response profile:', response);
      
      // O apiClient retorna ApiResponse<T>, então response.data pode ser ProfileApiResponse diretamente
      // ou pode ter estrutura aninhada { data: ProfileApiResponse }
      let profileData: ProfileApiResponse;
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Resposta inválida da API de perfil');
      }
      
      const responseData = response.data as { data?: ProfileApiResponse } & ProfileApiResponse;
      
      // Se response.data tem 'data' dentro, extrair (estrutura aninhada)
      if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
        profileData = responseData.data;
      } 
      // Se response.data tem 'id', 'name', etc., é o ProfileApiResponse direto
      else if ('id' in responseData && 'name' in responseData) {
        profileData = responseData as ProfileApiResponse;
      } 
      // Fallback: tentar usar response.data diretamente
      else {
        throw new Error('Estrutura de resposta inesperada da API de perfil');
      }
      
      // Transformar endereços de array para objeto { home, work }
      const addresses = profileData.addresses 
        ? this.transformAddressesArrayToObject(profileData.addresses)
        : undefined;
      
      // Buscar storeId do localStorage (salvo no login)
      const savedCustomer = localStorage.getItem('store-flow-customer');
      let storeId = '';
      if (savedCustomer) {
        try {
          const saved = JSON.parse(savedCustomer) as Customer;
          storeId = saved.storeId || '';
        } catch (e) {
          console.error('Erro ao ler storeId do localStorage:', e);
        }
      }
      
      const customer: Customer = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone || '',
        storeId: storeId,
        addresses: addresses,
      };
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-customer', JSON.stringify(customer));
      }
      
      return validateUser(customer);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  }

  /**
   * Transforma array de endereços da API para objeto do frontend
   * Agora suporta addressType e id conforme nova documentação
   */
  private static transformAddressesArrayToObject(
    addressesArray: Array<{
      id?: string;
      label?: string;
      addressType?: 'home' | 'work' | 'other';
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      complement?: string | null;
      reference?: string | null;
      isDefault?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>
  ): { home?: DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string }; work?: DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string } } {
    const addresses: { home?: DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string }; work?: DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string } } = {};
    
    addressesArray.forEach((addr) => {
      const addressData: DeliveryAddress & { id?: string; label?: string; isDefault?: boolean; updatedAt?: string } = {
        street: addr.street,
        number: addr.number,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        complement: addr.complement || undefined,
        reference: addr.reference || undefined,
        id: addr.id,
        label: addr.label,
        isDefault: addr.isDefault || false,
        updatedAt: addr.updatedAt,
      };
      
      // Usar addressType se disponível, senão usar label como fallback
      const addressType = addr.addressType || (addr.label === 'home' ? 'home' : addr.label === 'work' ? 'work' : 'other');
      
      if (addressType === 'home') {
        addresses.home = addressData;
      } else if (addressType === 'work') {
        addresses.work = addressData;
      }
      // Se for 'other', não adiciona ao objeto (ou pode adicionar como 'other' se necessário)
    });
    
    return addresses;
  }

  /**
   * Atualiza perfil do usuário usando PUT (apenas name e phone)
   * Endereços não são mais atualizados através desta rota
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
      // Preparar payload - apenas name e phone (endereços removidos)
      const apiPayload: {
        name?: string;
        phone?: string;
      } = {};
      
      // Adicionar name e phone se for Customer
      if ('name' in user && 'phone' in user) {
        if (user.name) apiPayload.name = user.name;
        if (user.phone) apiPayload.phone = user.phone;
      }
      
      // Interface para resposta da API
      interface UpdateProfileApiResponse {
        id: string;
        name: string;
        phone: string;
        email: string;
        addresses?: Array<{
          id: string;
          label: string;
          addressType: 'home' | 'work' | 'other';
          street: string;
          number: string;
          neighborhood: string;
          city: string;
          state: string;
          zipCode: string;
          complement?: string | null;
          reference?: string | null;
          isDefault: boolean;
        }>;
      }
      
      // Usar PUT (conforme documentação, apenas PUT é usado)
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
          : ('addresses' in user ? (user as Customer).addresses : undefined), // Manter endereços existentes se não vierem na resposta
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
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Cria um novo endereço para o customer autenticado
   */
  static async createAddress(address: {
    label?: string;
    addressType?: 'home' | 'work' | 'other';
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    reference?: string;
    isDefault?: boolean;
  }): Promise<{
    id: string;
    label: string | null;
    addressType: 'home' | 'work' | 'other';
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string | null;
    reference?: string | null;
    isDefault: boolean;
  }> {
    if (API_CONFIG.USE_MOCK) {
      // Simular criação
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: `mock-address-${Date.now()}`,
        label: address.label || null,
        addressType: address.addressType || 'other',
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        complement: address.complement || null,
        reference: address.reference || null,
        isDefault: address.isDefault || false,
      };
    }

    try {
      const payload = {
        label: address.label,
        addressType: address.addressType,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        complement: address.complement && address.complement.trim() !== '' ? address.complement : undefined,
        reference: address.reference && address.reference.trim() !== '' ? address.reference : undefined,
        isDefault: address.isDefault,
      };

      const response = await apiClient.post<{
        id: string;
        label: string | null;
        addressType: 'home' | 'work' | 'other';
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        complement?: string | null;
        reference?: string | null;
        isDefault: boolean;
      }>(
        API_ENDPOINTS.AUTH.ADDRESSES.CREATE,
        payload
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }
  }

  /**
   * Atualiza um endereço existente do customer autenticado
   */
  static async updateAddress(
    addressId: string,
    updates: {
      label?: string;
      addressType?: 'home' | 'work' | 'other';
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      complement?: string;
      reference?: string;
      isDefault?: boolean;
    }
  ): Promise<{
    id: string;
    label: string | null;
    addressType: 'home' | 'work' | 'other';
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string | null;
    reference?: string | null;
    isDefault: boolean;
  }> {
    if (API_CONFIG.USE_MOCK) {
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: addressId,
        label: updates.label || null,
        addressType: updates.addressType || 'other',
        street: updates.street || '',
        number: updates.number || '',
        neighborhood: updates.neighborhood || '',
        city: updates.city || '',
        state: updates.state || '',
        zipCode: updates.zipCode || '',
        complement: updates.complement || null,
        reference: updates.reference || null,
        isDefault: updates.isDefault || false,
      };
    }

    try {
      const payload: {
        label?: string;
        addressType?: 'home' | 'work' | 'other';
        street?: string;
        number?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        complement?: string;
        reference?: string;
        isDefault?: boolean;
      } = {
        label: updates.label,
        addressType: updates.addressType,
        street: updates.street,
        number: updates.number,
        neighborhood: updates.neighborhood,
        city: updates.city,
        state: updates.state,
        zipCode: updates.zipCode,
        complement: updates.complement && updates.complement.trim() !== '' ? updates.complement : undefined,
        reference: updates.reference && updates.reference.trim() !== '' ? updates.reference : undefined,
        isDefault: updates.isDefault,
      };

      // Remover campos undefined do payload
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const response = await apiClient.put<{
        id: string;
        label: string | null;
        addressType: 'home' | 'work' | 'other';
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        complement?: string | null;
        reference?: string | null;
        isDefault: boolean;
      }>(
        API_ENDPOINTS.AUTH.ADDRESSES.UPDATE(addressId),
        payload
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }
  }

  /**
   * Deleta um endereço do customer autenticado
   */
  static async deleteAddress(addressId: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      // Simular deleção
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.AUTH.ADDRESSES.DELETE(addressId));
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
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
