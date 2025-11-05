/**
 * Serviço para gerenciamento de lojas
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import API_CONFIG from '@/config/env';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';
import { getStoreById as getMockStoreById, getAllStores as getMockAllStores } from '@/data/mockStores';
import { getProductsByStoreId as getMockProductsByStoreId } from '@/data/mockProducts';

export class StoreService {
  /**
   * Busca loja por ID
   */
  static async getStoreById(storeId: string): Promise<Store> {
    if (API_CONFIG.USE_MOCK) {
      const store = await getMockStoreById(storeId);
      if (!store) {
        throw new Error('Loja não encontrada');
      }
      return store;
    }

    try {
      const response = await apiClient.get<Store>(
        API_ENDPOINTS.STORES.BY_ID(storeId)
      );
      return response.data;
         } catch (error) {
       // Fallback para mock em caso de erro
       console.warn('Erro ao buscar loja da API, usando mock:', error);
       const store = await getMockStoreById(storeId);
       if (!store) {
         // Mostrar toast de erro apenas se mock também falhar
         const { showErrorToast } = await import('@/utils/toast');
         showErrorToast(error as Error, 'Erro ao carregar loja');
         throw error;
       }
       return store;
     }
  }

  /**
   * Busca loja por slug
   */
  static async getStoreBySlug(slug: string): Promise<Store | null> {
    if (API_CONFIG.USE_MOCK) {
      return await getMockStoreById(slug);
    }

    try {
      const response = await apiClient.get<Store>(
        API_ENDPOINTS.STORES.BY_SLUG(slug)
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && (error as { status?: number }).status === 404) {
        return null;
      }
      // Fallback para mock
      console.warn('Erro ao buscar loja por slug, usando mock:', error);
      return await getMockStoreById(slug);
    }
  }

  /**
   * Lista todas as lojas
   */
  static async getAllStores(): Promise<Store[]> {
    if (API_CONFIG.USE_MOCK) {
      return await getMockAllStores();
    }

    try {
      const response = await apiClient.get<Store[]>(
        API_ENDPOINTS.STORES.BASE
      );
      
      // Se a resposta for paginada
      if ('pagination' in response.data) {
        return (response.data as unknown as PaginatedResponse<Store>).data;
      }
      
      // Se for array direto
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      // Fallback para mock
      console.warn('Erro ao buscar lojas da API, usando mock:', error);
      return await getMockAllStores();
    }
  }

  /**
   * Busca produtos de uma loja
   */
  static async getStoreProducts(storeId: string): Promise<Product[]> {
    if (API_CONFIG.USE_MOCK) {
      return await getMockProductsByStoreId(storeId);
    }

    try {
      const response = await apiClient.get<Product[]>(
        API_ENDPOINTS.STORES.PRODUCTS(storeId)
      );
      
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      // Fallback para mock
      console.warn('Erro ao buscar produtos da API, usando mock:', error);
      return await getMockProductsByStoreId(storeId);
    }
  }

  /**
   * Busca categorias de uma loja
   */
  static async getStoreCategories(storeId: string): Promise<string[]> {
    if (API_CONFIG.USE_MOCK) {
      const products = await getMockProductsByStoreId(storeId);
      const categories = new Set(products.map(p => p.category));
      return Array.from(categories);
    }

    try {
      const response = await apiClient.get<string[]>(
        API_ENDPOINTS.STORES.CATEGORIES(storeId)
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // Fallback para mock
      console.warn('Erro ao buscar categorias da API, usando mock:', error);
      const products = await getMockProductsByStoreId(storeId);
      const categories = new Set(products.map(p => p.category));
      return Array.from(categories);
    }
  }
}
