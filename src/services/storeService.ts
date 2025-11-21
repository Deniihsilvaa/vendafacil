/**
 * Serviço para gerenciamento de lojas
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { CACHE_TAGS } from '@/services/cache/CacheService';
import { validateStores, validateStoreWithProducts } from '@/utils/validators/storeValidators';
import { validateProducts } from '@/utils/validators/productValidators';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';
import type { PaginatedResponse, RequestConfig } from '@/types/api';

export class StoreService {
  /**
   * Busca loja por ID com produtos (espelho da loja)
   * Retorna tanto a Store quanto os produtos em uma única chamada
   */
  static async getStoreByIdWithProducts(storeId: string): Promise<{ store: Store; products: Product[] }> {
    const response = await apiClient.get<Store>(
      API_ENDPOINTS.STORES.BY_ID(storeId),
      {
        useCache: true,
        cacheTags: [CACHE_TAGS.STORE(storeId), CACHE_TAGS.STORES, CACHE_TAGS.PRODUCTS(storeId)],
      } as RequestConfig
    );
    
    // Verificar se a resposta tem dados
    if (!response.data) {
      throw new Error('Loja não encontrada: resposta vazia da API');
    }
    
    // Validar resposta com produtos (espelho da loja sempre vem com produtos)
    return validateStoreWithProducts(response.data);
  }

  /**
   * Busca loja por ID (apenas store, sem produtos)
   * Use getStoreByIdWithProducts para obter produtos também
   */
  static async getStoreById(storeId: string): Promise<Store> {
    const { store } = await this.getStoreByIdWithProducts(storeId);
    return store;
  }

  /**
   * Busca loja por slug
   */
  static async getStoreBySlug(slug: string): Promise<Store | null> {
    try {
      const response = await apiClient.get<Store>(
        API_ENDPOINTS.STORES.BY_SLUG(slug)
      );
      return response.data || null;
    } catch (error: unknown) {
      // Se for 404, retornar null (loja não encontrada)
      if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 404) {
        return null;
      }
      // Outros erros: re-lançar
      throw error;
    }
  }

  /**
   * Lista todas as lojas
   */
  static async getAllStores(): Promise<Store[]> {
    const response = await apiClient.get<Store[] | PaginatedResponse<Store>>(
      API_ENDPOINTS.STORES.BASE,
      {
        useCache: true,
        cacheTags: [CACHE_TAGS.STORES],
      } as RequestConfig
    );
    
    // Garantir que sempre temos um array
    let stores: Store[] = [];
    
    // Verificar se response.data existe
    if (!response.data) {
      console.warn('Resposta da API vazia para getAllStores');
      return [];
    }
    
    // Se a resposta for paginada
    if (typeof response.data === 'object' && 'pagination' in response.data) {
      const paginatedResponse = response.data as PaginatedResponse<Store>;
      stores = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : [];
    } else if (Array.isArray(response.data)) {
      // Se a resposta for um array direto
      stores = response.data;
    } else {
      console.warn('Formato de resposta inesperado para getAllStores:', response.data);
      return [];
    }
    
    // Validar respostas em runtime - garantir que stores não é undefined
    if (!Array.isArray(stores)) {
      console.error('stores não é um array antes da validação:', stores);
      return [];
    }
    
    return validateStores(stores);
  }

  /**
   * Busca produtos de uma loja
   */
  static async getStoreProducts(storeId: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      API_ENDPOINTS.STORES.PRODUCTS(storeId),
      {
        useCache: true,
        cacheTags: [CACHE_TAGS.PRODUCTS(storeId), CACHE_TAGS.STORE(storeId)],
      } as RequestConfig
    );
    console.log('response.data getStoreProducts:', response.data);
    // Verificar se a resposta tem dados e é um array
    if (!response.data) {
      return [];
    }
    
    if (!Array.isArray(response.data)) {
      console.warn('Resposta de produtos não é um array:', response.data);
      return [];
    }
    
    // Validar respostas em runtime
    return validateProducts(response.data);
  }

  /**
   * Busca categorias de uma loja
   */
  static async getStoreCategories(storeId: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      API_ENDPOINTS.STORES.CATEGORIES(storeId)
    );
    
    // Garantir que sempre retornamos um array
    if (!response.data) {
      return [];
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }
}
