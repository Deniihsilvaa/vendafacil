/**
 * Serviço para gerenciar produtos
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface ProductApiResponse {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  family?: string;
  image_url?: string;
  category: string;
  custom_category?: string | null;
  is_active: boolean;
  preparation_time: number;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  store_name?: string;
  store_slug?: string;
  store_category?: string;
  customizations_count?: number;
  extra_lists_count?: number;
  available_customizations?: {
    sizes?: string[];
    toppings?: string[];
  };
}

export interface ProductsListParams {
  storeId: string; // Obrigatório
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsListResponse {
  success: boolean;
  data: {
    items: ProductApiResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
}

export class ProductService {
  /**
   * Lista produtos com filtros opcionais
   * @param params - Parâmetros de busca (storeId é obrigatório)
   */
  static async getProducts(params: ProductsListParams): Promise<ProductsListResponse> {
    try {
      // Validar que storeId foi fornecido
      if (!params.storeId) {
        throw new Error('storeId é obrigatório para buscar produtos');
      }
      console.log('response.data',params);

      const queryParams = new URLSearchParams();
      
      // storeId é obrigatório
      queryParams.append('storeId', params.storeId);
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.category) {
        queryParams.append('category', params.category);
      }
      if (params.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.PRODUCTS.BASE}?${queryParams.toString()}`;
     
      const response = await apiClient.get<ProductsListResponse['data']>(url);
      // A API retorna { success: true, data: { items: [...], pagination: {...} } }
      // O apiClient já formata para { data: ..., success: true }
      // Então response.data pode ser ProductsListResponse['data'] diretamente ou { success, data: ProductsListResponse['data'] }
      let productsData: ProductsListResponse['data'];
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Resposta vazia da API');
      }

      const responseData = response.data as Record<string, unknown>;
      
      // Se response.data já é ProductsListResponse['data'] (tem 'items' e 'pagination')
      if ('items' in responseData && 'pagination' in responseData) {
        productsData = responseData as ProductsListResponse['data'];
      }
      // Se response.data tem 'data' dentro, extrair
      else if ('data' in responseData && typeof responseData.data === 'object' && responseData.data !== null) {
        const nestedData = responseData.data as Record<string, unknown>;
        if ('items' in nestedData && 'pagination' in nestedData) {
          productsData = nestedData as ProductsListResponse['data'];
        } else {
          throw new Error('Formato de resposta inválido: data não contém items e pagination');
        }
      } else {
        throw new Error('Formato de resposta inválido da API');
      }

      return {
        success: true,
        data: productsData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  /**
   * Busca produto por ID
   */
  static async getProductById(productId: string): Promise<ProductApiResponse> {
    try {
      const response = await apiClient.get<ProductApiResponse>(
        API_ENDPOINTS.PRODUCTS.BY_ID(productId)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  /**
   * Cria um novo produto
   * Aceita FormData (com upload de imagem) ou JSON simples
   */
  static async createProduct(storeId: string, data: FormData | Record<string, unknown>): Promise<ProductApiResponse> {
    try {
      const url = API_ENDPOINTS.MERCHANT.CREATE_PRODUCT(storeId);
      
      let response;
      
      // Se for FormData, usar multipart/form-data
      if (data instanceof FormData) {
        response = await apiClient.postFormData<ProductApiResponse>(url, data);
      } else {
        // Caso contrário, usar JSON
        response = await apiClient.post<ProductApiResponse>(url, data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao criar produto');
      throw error;
    }
  }

  /**
   * Atualiza um produto existente
   * Permite atualização parcial (apenas campos enviados serão atualizados)
   */
  static async updateProduct(
    storeId: string,
    productId: string,
    data: Record<string, unknown>
  ): Promise<ProductApiResponse> {
    try {
      const url = API_ENDPOINTS.MERCHANT.UPDATE_PRODUCT(storeId, productId);
      
      const response = await apiClient.patch<ProductApiResponse>(url, data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao atualizar produto');
      throw error;
    }
  }

  /**
   * Deleta um produto permanentemente (soft delete)
   * @param storeId - ID da loja
   * @param productId - ID do produto
   * @returns Produto deletado
   */
  static async deleteProduct(
    storeId: string,
    productId: string
  ): Promise<ProductApiResponse> {
    try {
      const url = API_ENDPOINTS.MERCHANT.DELETE_PRODUCT(storeId, productId);
      
      const response = await apiClient.delete<ProductApiResponse>(url);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao deletar produto');
      throw error;
    }
  }

  /**
   * Ativa um produto (endpoint otimizado)
   * @param storeId - ID da loja
   * @param productId - ID do produto
   * @returns Produto ativado
   */
  static async activateProduct(
    storeId: string,
    productId: string
  ): Promise<ProductApiResponse> {
    try {
      // Usar mesmo padrão dos outros endpoints
      const url = `${API_ENDPOINTS.MERCHANT.UPDATE_PRODUCT(storeId, productId)}/activate`;
      
      const response = await apiClient.patch<ProductApiResponse>(url);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao ativar produto');
      throw error;
    }
  }

  /**
   * Desativa um produto (endpoint otimizado)
   * @param storeId - ID da loja
   * @param productId - ID do produto
   * @returns Produto desativado
   */
  static async deactivateProduct(
    storeId: string,
    productId: string
  ): Promise<ProductApiResponse> {
    try {
      // Usar mesmo padrão dos outros endpoints
      const url = `${API_ENDPOINTS.MERCHANT.UPDATE_PRODUCT(storeId, productId)}/deactivate`;
      
      const response = await apiClient.patch<ProductApiResponse>(url);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar produto:', error);
      const { showErrorToast } = await import('@/utils/toast');
      showErrorToast(error as Error, 'Erro ao desativar produto');
      throw error;
    }
  }
}

