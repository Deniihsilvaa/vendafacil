/**
 * Serviço para gerenciar lojas (stores)
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';

export interface UpdateStorePayload {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  workingHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  settings?: {
    isActive?: boolean;
    deliveryTime?: string;
    minOrderValue?: number;
    deliveryFee?: number;
    freeDeliveryAbove?: number;
    acceptsPayment?: {
      creditCard?: boolean;
      debitCard?: boolean;
      pix?: boolean;
      cash?: boolean;
    };
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
  };
}

export class StoreService {
  /**
   * Busca uma loja por ID e transforma resposta snake_case da API para camelCase do frontend
   */
  static async getStoreById(storeId: string): Promise<Store> {
    try {
      // API retorna dados em snake_case
      interface ApiStoreResponse {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        avatar_url?: string | null;
        banner_url?: string | null;
        rating: number;
        review_count: number;
        primary_color: string;
        secondary_color: string;
        accent_color: string;
        text_color: string;
        is_active: boolean;
        delivery_time?: string | null;
        min_order_value: number;
        delivery_fee: number;
        free_delivery_above?: number | null;
        accepts_payment_credit_card: boolean;
        accepts_payment_debit_card: boolean;
        accepts_payment_pix: boolean;
        accepts_payment_cash: boolean;
        address_street: string;
        address_number: string;
        address_neighborhood: string;
        address_city: string;
        address_state: string;
        address_zip_code: string;
        working_hours: Store['info']['workingHours'];
        created_at: string;
        updated_at: string;
      }

      // Detectar se é UUID ou slug
      // UUID pattern: 8-4-4-4-12 caracteres hexadecimais
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidPattern.test(storeId);
      
      console.log('🔍 StoreService.getStoreById - Tipo de identificador:', {
        storeId,
        isUUID,
        endpoint: isUUID ? 'BY_ID' : 'BY_SLUG',
      });

      // Escolher endpoint correto
      const endpoint = isUUID 
        ? API_ENDPOINTS.STORES.BY_ID(storeId)
        : API_ENDPOINTS.STORES.BY_SLUG(storeId);

      const response = await apiClient.get<ApiStoreResponse>(endpoint);

      const apiData = response.data;

      console.log('📦 StoreService.getStoreById - Dados da API:', {
        address_street: apiData.address_street,
        address_number: apiData.address_number,
        min_order_value: apiData.min_order_value,
        delivery_fee: apiData.delivery_fee,
      });

      // Transformar snake_case para camelCase
      const store: Store = {
        id: apiData.id,
        name: apiData.name,
        slug: apiData.slug,
        description: apiData.description,
        category: apiData.category,
        avatar: apiData.avatar_url || undefined,
        banner: apiData.banner_url || undefined,
        rating: apiData.rating,
        reviewCount: apiData.review_count,
        theme: {
          primaryColor: apiData.primary_color,
          secondaryColor: apiData.secondary_color,
          accentColor: apiData.accent_color,
          textColor: apiData.text_color,
        },
        settings: {
          isActive: apiData.is_active,
          deliveryTime: apiData.delivery_time || '',
          minOrderValue: apiData.min_order_value,
          deliveryFee: apiData.delivery_fee,
          freeDeliveryAbove: apiData.free_delivery_above || 0,
          acceptsPayment: {
            creditCard: apiData.accepts_payment_credit_card,
            debitCard: apiData.accepts_payment_debit_card,
            pix: apiData.accepts_payment_pix,
            cash: apiData.accepts_payment_cash,
          },
        },
        info: {
          address: {
            street: apiData.address_street || '',
            number: apiData.address_number || '',
            neighborhood: apiData.address_neighborhood || '',
            city: apiData.address_city || '',
            state: apiData.address_state || '',
            zipCode: apiData.address_zip_code || '',
          },
          workingHours: apiData.working_hours || {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '18:00', closed: true },
            sunday: { open: '09:00', close: '18:00', closed: true },
          },
        },
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
      };

      console.log('✅ Dados transformados para o frontend:', {
        address: store.info.address,
        minOrderValue: store.settings.minOrderValue,
        deliveryFee: store.settings.deliveryFee,
      });
      
      return store;
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      throw error;
    }
  }

  /**
   * Atualiza informações da loja
   * 
   * Endpoint: PATCH /api/merchant/stores/{storeId}
   * 
   * IMPORTANTE:
   * - Valores monetários devem ser enviados em REAIS (não centavos!)
   * - A API retorna snake_case, mas o frontend usa camelCase
   * - O storeId vai no path, não no body
   * 
   * VALIDAÇÕES DE SEGURANÇA (Backend):
   * - ✅ userId validado pelo middleware withAuth (do token JWT)
   * - ✅ Merchant buscado por auth_user_id (nunca aceita do payload)
   * - ✅ Propriedade da loja validada (verifica se é dono ou membro)
   * - ✅ Transação para operações atômicas
   */
  static async updateStore(storeId: string, payload: UpdateStorePayload): Promise<Store> {
    try {
      // Remover o campo 'id' do payload, pois o storeId vai no path
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...restPayload } = payload;
      
      console.log('🔄 StoreService.updateStore - Atualizando loja:', storeId);
      console.log('📤 Payload:', restPayload);
      
      // Usar PATCH /api/merchant/stores/{storeId}
      const response = await apiClient.patch<Store>(
        API_ENDPOINTS.MERCHANT.UPDATE_STORE(storeId),
        restPayload
      );

      // response.data já contém os dados após o formatResponse do apiClient
      // Se a resposta tiver estrutura { success, data: Store }, extrair o Store
      const store = response.data;
      
      if (!store || !store.id) {
        throw new Error('Resposta inválida da API ao atualizar loja');
      }

      console.log('✅ Loja atualizada com sucesso:', store.id);
      return store;
    } catch (error) {
      console.error('❌ Erro ao atualizar loja:', error);
      const { showErrorToast } = await import('@/utils/toast');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Tratamento de erros específicos
      if (errorMessage.includes('STORE_NOT_OWNED') || errorMessage.includes('403')) {
        showErrorToast(
          new Error('Você não tem permissão para atualizar esta loja'),
          'Sem permissão'
        );
      } else if (errorMessage.includes('MERCHANT_NOT_FOUND') || errorMessage.includes('404')) {
        showErrorToast(
          new Error('Merchant ou loja não encontrada'),
          'Não encontrado'
        );
      } else if (errorMessage.includes('VALIDATION_ERROR') || errorMessage.includes('422')) {
        showErrorToast(
          new Error('Dados inválidos. Verifique os campos obrigatórios.'),
          'Erro de validação'
        );
      } else {
        showErrorToast(error as Error, 'Erro ao atualizar loja');
      }
      
      throw error;
    }
  }

  /**
   * Lista todas as lojas disponíveis
   */
  static async getAllStores(): Promise<Store[]> {
    try {
      const response = await apiClient.get<{ stores: Store[] }>(
        API_ENDPOINTS.STORES.BASE
      );
      
      // A API pode retornar { stores: [...] } ou diretamente um array
      if (response.data && 'stores' in response.data) {
        return response.data.stores;
      }
      
      // Se retornar diretamente um array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao listar lojas:', error);
      return [];
    }
  }

  /**
   * Busca uma loja por ID com seus produtos
   */
  static async getStoreByIdWithProducts(storeId: string): Promise<{ store: Store; products: Product[] }> {
    try {
      // Buscar loja
      const store = await this.getStoreById(storeId);
      
      // Buscar produtos da loja
      const productsResponse = await apiClient.get<{ items: Product[] }>(
        API_ENDPOINTS.STORES.PRODUCTS(storeId)
      );
      
      const products = productsResponse.data && 'items' in productsResponse.data
        ? productsResponse.data.items
        : Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];
      
      return { store, products };
    } catch (error) {
      console.error('Erro ao buscar loja com produtos:', error);
      throw error;
    }
  }
}
