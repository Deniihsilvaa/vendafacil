// Futuro: Serviços para integração com API real

import type { Store, ApiStoreResponse, ApiStoresResponse } from '@/types/store';
import type { Product } from '@/types/product';

// Configuração da API (será usado no futuro)
// const API_BASE_URL = (typeof window !== 'undefined' && window.location?.hostname === 'localhost') 
//   ? 'http://localhost:3001/api' 
//   : 'https://api.vendafacil.com.br';

// Headers padrão para requisições
// const getDefaultHeaders = () => ({
//   'Content-Type': 'application/json',
//   // Futuro: Authorization header quando tivermos autenticação
//   // 'Authorization': `Bearer ${getAuthToken()}`,
// });

// Classe de serviços para API da loja
export class StoreApiService {
  // Buscar loja por ID
  static async getStoreById(_storeId: string): Promise<ApiStoreResponse> {
    // Implementação futura:
    // const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
    //   method: 'GET',
    //   headers: getDefaultHeaders(),
    // });
    
    // if (!response.ok) {
    //   throw new Error(`Erro ao buscar loja: ${response.statusText}`);
    // }
    
    // return response.json();

    // Por enquanto, usar dados mock
    throw new Error('API not implemented yet - using mock data');
  }

  // Listar todas as lojas
  static async getAllStores(_page = 1, _limit = 20): Promise<ApiStoresResponse> {
    // Implementação futura:
    // const response = await fetch(`${API_BASE_URL}/stores?page=${page}&limit=${limit}`, {
    //   method: 'GET',
    //   headers: getDefaultHeaders(),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Erro ao buscar lojas: ${response.statusText}`);
    // }
    // 
    // return response.json();

    // Por enquanto, usar dados mock
    throw new Error('API not implemented yet - using mock data');
  }

  // Buscar produtos de uma loja
  static async getStoreProducts(_storeId: string): Promise<Product[]> {
    // Implementação futura:
    // const response = await fetch(`${API_BASE_URL}/stores/${storeId}/products`, {
    //   method: 'GET',
    //   headers: getDefaultHeaders(),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
    // }
    // 
    // return response.json();

    // Por enquanto, usar dados mock
    throw new Error('API not implemented yet - using mock data');
  }

  // Buscar loja por slug/subdomínio
  static async getStoreBySlug(_slug: string): Promise<Store | null> {
    // Implementação futura para subdomínios:
    // const response = await fetch(`${API_BASE_URL}/stores/by-slug/${slug}`, {
    //   method: 'GET',
    //   headers: getDefaultHeaders(),
    // });
    // 
    // if (response.status === 404) {
    //   return null;
    // }
    // 
    // if (!response.ok) {
    //   throw new Error(`Erro ao buscar loja: ${response.statusText}`);
    // }
    // 
    // const data = await response.json();
    // return data.store;

    // Por enquanto, usar dados mock
    throw new Error('API not implemented yet - using mock data');
  }
}

// Helper para detecção de subdomínio (futuro)
export const getStoreFromSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Detectar se é um subdomínio do vendafacil.com.br
  if (parts.length >= 3 && parts[parts.length - 2] === 'vendafacil') {
    return parts[0]; // Retorna o subdomínio (nome da loja)
  }
  
  return null;
};

// Cache service para otimização
export class CacheService {
  private static readonly CACHE_PREFIX = 'vf_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  static set(key: string, data: any, ttl = CacheService.DEFAULT_TTL): void {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    try {
      localStorage.setItem(`${CacheService.CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar no cache:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${CacheService.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;

      if (isExpired) {
        CacheService.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Erro ao ler cache:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(`${CacheService.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Erro ao remover cache:', error);
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CacheService.CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }
}
