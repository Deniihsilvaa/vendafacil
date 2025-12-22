/**
 * Serviço para gerenciar lojas (stores)
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Store } from '@/types/store';
import type { Product, ProductCustomization } from '@/types/product';

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

/**
 * Status da loja retornado pelo endpoint otimizado
 */
export interface StoreStatus {
  isOpen: boolean;
  currentDay: string;
  currentDayHours: {
    open: string;
    close: string;
    closed?: boolean;
  } | null;
  nextOpenDay?: string | null;
  nextOpenHours?: {
    open: string;
    close: string;
  } | null;
  isTemporarilyClosed?: boolean;
  isInactive?: boolean;
  lastUpdated: string;
}

/**
 * Interface para filtros de produtos
 */
export interface StoreProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Interface para resposta paginada de produtos
 */
export interface StoreProductsResponse {
  items: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface para produto retornado pela API (snake_case)
 */
interface ApiProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  store_id: string;
  is_active?: boolean;
  preparation_time?: number | null;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;
  available_customizations?: ProductCustomization[];
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
        // Status da loja (calculado automaticamente pela API)
        isOpen?: boolean;              // Calculado automaticamente baseado nos horários
        isTemporarilyClosed?: boolean; // Indica se está temporariamente fechada
        temporarily_closed?: boolean;  // Campo booleano do banco de dados
        created_at: string;
        updated_at: string;
      }

      // A API detecta automaticamente se é UUID ou slug
      // Endpoint único: /api/stores/[storeId] aceita ambos
      // UUID pattern: 8-4-4-4-12 caracteres hexadecimais
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidPattern.test(storeId);
      
      console.log('🔍 StoreService.getStoreById - Tipo de identificador:', {
        storeId,
        isUUID: isUUID ? 'UUID' : 'Slug',
        endpoint: 'BY_ID (aceita UUID e slug)',
      });

      // Usar sempre BY_ID - a API detecta automaticamente UUID ou slug
      const endpoint = API_ENDPOINTS.STORES.BY_ID(storeId);

      const response = await apiClient.get<ApiStoreResponse>(endpoint, { useCache: false });

      const apiData = response.data;

      console.log('📦 StoreService.getStoreById - Dados da API:', {
        address_street: apiData.address_street,
        address_number: apiData.address_number,
        min_order_value: apiData.min_order_value,
        delivery_fee: apiData.delivery_fee,
        isOpen: apiData.isOpen,
        isTemporarilyClosed: apiData.isTemporarilyClosed,
        temporarily_closed: apiData.temporarily_closed,
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
        // Status da loja (vem calculado da API)
        isOpen: apiData.isOpen,
        isTemporarilyClosed: apiData.isTemporarilyClosed,
        temporarilyClosed: apiData.temporarily_closed,
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
      };

      console.log('✅ Dados transformados para o frontend:', {
        address: store.info.address,
        minOrderValue: store.settings.minOrderValue,
        deliveryFee: store.settings.deliveryFee,
        isOpen: store.isOpen,
        isTemporarilyClosed: store.isTemporarilyClosed,
        temporarilyClosed: store.temporarilyClosed,
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
        API_ENDPOINTS.STORES.BASE,
        { useCache: false }
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
   * Transforma produto da API (snake_case) para formato do frontend (camelCase)
   */
  private static transformProduct(apiProduct: ApiProduct): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description || '',
      price: apiProduct.price,
      image: apiProduct.image_url || undefined, // Transformar image_url para image
      category: apiProduct.category || '',
      storeId: apiProduct.store_id,
      isActive: apiProduct.is_active ?? true,
      customizations: apiProduct.available_customizations || [],
      preparationTime: apiProduct.preparation_time || 0,
      nutritionalInfo: apiProduct.nutritional_info ? {
        calories: apiProduct.nutritional_info.calories || 0,
        proteins: apiProduct.nutritional_info.protein || 0,
        carbs: apiProduct.nutritional_info.carbs || 0,
        fats: apiProduct.nutritional_info.fat || 0,
      } : undefined,
    };
  }

  /**
   * Busca produtos de uma loja com filtros opcionais
   * @param storeId - UUID ou slug da loja
   * @param filters - Filtros opcionais (page, limit, category, isActive, search)
   * @returns Lista de produtos e informações de paginação
   */
  static async getStoreProducts(
    storeId: string,
    filters?: StoreProductsFilters
  ): Promise<StoreProductsResponse> {
    try {
      const endpoint = API_ENDPOINTS.STORES.PRODUCTS(storeId);
      
      // Construir query parameters apenas se houver filtros
      let url = endpoint;
      if (filters && Object.keys(filters).length > 0) {
        const params = new URLSearchParams();
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        if (queryString) {
          url = `${endpoint}?${queryString}`;
        }
      }
      
      console.log('🔍 StoreService.getStoreProducts - URL:', url);
      console.log('🔍 StoreService.getStoreProducts - Filtros:', filters);
      
      const response = await apiClient.get<StoreProductsResponse | ApiProduct[]>(url, { useCache: false });
      
      // Transformar produtos de snake_case para camelCase
      let items: Product[] = [];
      let pagination: StoreProductsResponse['pagination'] | undefined;
      
      if (Array.isArray(response.data)) {
        // Se for array direto, transformar cada item
        items = response.data.map((product: ApiProduct) => this.transformProduct(product));
      } else if (response.data && typeof response.data === 'object' && 'items' in response.data) {
        // Se for objeto com items, transformar os items
        const data = response.data as { items: unknown[]; pagination?: StoreProductsResponse['pagination'] };
        items = data.items.map((product: unknown) => this.transformProduct(product as ApiProduct));
        pagination = data.pagination;
      }
      
      return {
        items,
        ...(pagination && { pagination }),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar produtos da loja:', error);
      throw error;
    }
  }

  /**
   * Busca uma loja por ID com seus produtos (método legado - busca todos os produtos)
   * @deprecated Para melhor performance, use getStoreById() + getStoreProducts() com filtros
   */
  static async getStoreByIdWithProducts(storeId: string): Promise<{ store: Store; products: Product[] }> {
    try {
      // Buscar loja
      const store = await this.getStoreById(storeId);
      
      // Buscar produtos da loja (sem filtros - busca todos)
      const productsResponse = await this.getStoreProducts(storeId);
      
      return { store, products: productsResponse.items };
    } catch (error) {
      console.error('Erro ao buscar loja com produtos:', error);
      throw error;
    }
  }

  /**
   * Busca o status otimizado da loja (endpoint otimizado)
   * Retorna apenas status (aberta/fechada) e informações básicas de horário
   * @param storeId - ID da loja
   * @returns Status da loja
   */
  static async getStoreStatus(storeId: string): Promise<StoreStatus> {
    try {
      const url = API_ENDPOINTS.MERCHANT.STORE_STATUS(storeId);
      const response = await apiClient.get<StoreStatus>(url, { useCache: false });
      
      console.log('📥 StoreService.getStoreStatus - Resposta recebida:', {
        url,
        responseCompleta: response,
        responseData: response.data,
        responseDataType: typeof response.data,
        temData: response.data && typeof response.data === 'object' && 'data' in response.data,
        temSuccess: response.data && typeof response.data === 'object' && 'success' in response.data,
        isTemporarilyClosed: (response.data as any)?.data?.isTemporarilyClosed ?? (response.data as any)?.isTemporarilyClosed,
        isOpen: (response.data as any)?.data?.isOpen ?? (response.data as any)?.isOpen,
      });
      
      // response.data é ApiResponse<StoreStatus> = { data: StoreStatus, success: boolean }
      // Precisamos extrair response.data.data para obter o StoreStatus
      let statusData: StoreStatus;
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Se tem a estrutura ApiResponse, extrair o data
        const apiResponse = response.data as { data: StoreStatus; success?: boolean };
        statusData = apiResponse.data;
        console.log('🔧 getStoreStatus - Extraído de ApiResponse');
      } else {
        // Se já é StoreStatus diretamente (não deveria acontecer, mas por segurança)
        statusData = response.data as StoreStatus;
        console.log('🔧 getStoreStatus - Usando response.data diretamente');
      }
      
      console.log('✅ getStoreStatus - Status final:', {
        statusData,
        isTemporarilyClosed: statusData?.isTemporarilyClosed,
        isOpen: statusData?.isOpen,
      });
      
      return statusData;
    } catch (error) {
      console.error('❌ StoreService.getStoreStatus - Erro:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao buscar status da loja');
      throw error;
    }
  }

  /**
   * Abre ou fecha a loja temporariamente
   * @param storeId - ID da loja
   * @param closed - true para fechar, false para abrir
   * @returns Status atualizado da loja
   */
  static async toggleStoreStatus(storeId: string, closed: boolean): Promise<StoreStatus> {
    try {
      const url = API_ENDPOINTS.MERCHANT.TOGGLE_STORE_STATUS(storeId);
      
      console.log('📤 StoreService.toggleStoreStatus - Enviando requisição:', {
        url,
        storeId,
        closed,
        payload: { closed },
      });
      
      const response = await apiClient.patch<StoreStatus>(url, { closed });
      
      console.log('📥 StoreService.toggleStoreStatus - Resposta completa:', {
        response,
        responseData: response.data,
        responseDataType: typeof response.data,
        temSuccess: 'success' in (response.data || {}),
        temData: 'data' in (response.data || {}),
      });
      
      // response.data é ApiResponse<StoreStatus> = { data: StoreStatus, success: boolean }
      // Precisamos extrair response.data.data para obter o StoreStatus
      let statusData: StoreStatus;
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Se tem a estrutura ApiResponse, extrair o data
        const apiResponse = response.data as { data: StoreStatus; success?: boolean };
        statusData = apiResponse.data;
        console.log('🔧 toggleStoreStatus - Extraído de ApiResponse');
      } else {
        // Se já é StoreStatus diretamente (não deveria acontecer, mas por segurança)
        statusData = response.data as StoreStatus;
        console.log('🔧 toggleStoreStatus - Usando response.data diretamente');
      }
      
      console.log('📥 StoreService.toggleStoreStatus - Status final:', {
        statusData,
        isTemporarilyClosed: statusData?.isTemporarilyClosed,
        isOpen: statusData?.isOpen,
      });
      
      return statusData;
    } catch (error) {
      console.error('❌ StoreService.toggleStoreStatus - Erro:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao alterar status da loja');
      throw error;
    }
  }
}
