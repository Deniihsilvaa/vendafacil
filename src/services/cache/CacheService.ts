/**
 * Serviço de cache centralizado com TTL e invalidação por tags
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

export class CacheService {
  private static readonly CACHE_PREFIX = 'vf_cache_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private static readonly TAG_PREFIX = 'vf_tag_';

  /**
   * Salva item no cache
   */
  static set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      tags?: string[];
    } = {}
  ): void {
    const { ttl = CacheService.DEFAULT_TTL, tags = [] } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    try {
      const storageKey = `${CacheService.CACHE_PREFIX}${key}`;
      localStorage.setItem(storageKey, JSON.stringify(cacheItem));

      // Registrar tags para invalidação
      if (tags.length > 0) {
        tags.forEach(tag => {
          const tagKey = `${CacheService.TAG_PREFIX}${tag}`;
          const existingKeys = CacheService.getTagKeys(tag);
          if (!existingKeys.includes(key)) {
            existingKeys.push(key);
            localStorage.setItem(tagKey, JSON.stringify(existingKeys));
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Obtém item do cache
   */
  static get<T>(key: string): T | null {
    try {
      const storageKey = `${CacheService.CACHE_PREFIX}${key}`;
      const cached = localStorage.getItem(storageKey);
      
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

      if (isExpired) {
        CacheService.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Erro ao ler cache:', error);
      CacheService.remove(key);
      return null;
    }
  }

  /**
   * Remove item do cache
   */
  static remove(key: string): void {
    try {
      const storageKey = `${CacheService.CACHE_PREFIX}${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Erro ao remover cache:', error);
    }
  }

  /**
   * Invalida cache por tag (remove todos os itens com essa tag)
   */
  static invalidateByTag(tag: string): void {
    try {
      const tagKey = `${CacheService.TAG_PREFIX}${tag}`;
      const keys = CacheService.getTagKeys(tag);

      keys.forEach(key => {
        CacheService.remove(key);
      });

      localStorage.removeItem(tagKey);
    } catch (error) {
      console.warn('Erro ao invalidar cache por tag:', error);
    }
  }

  /**
   * Invalida múltiplas tags
   */
  static invalidateByTags(tags: string[]): void {
    tags.forEach(tag => CacheService.invalidateByTag(tag));
  }

  /**
   * Limpa todo o cache
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (
          key.startsWith(CacheService.CACHE_PREFIX) ||
          key.startsWith(CacheService.TAG_PREFIX)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }

  /**
   * Obtém todas as chaves de uma tag
   */
  private static getTagKeys(tag: string): string[] {
    try {
      const tagKey = `${CacheService.TAG_PREFIX}${tag}`;
      const stored = localStorage.getItem(tagKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Erro ao ler tags:', error);
      return [];
    }
  }

  /**
   * Verifica se um item está em cache e não está expirado
   */
  static has(key: string): boolean {
    return CacheService.get(key) !== null;
  }
}

// Tags padrão para cache
export const CACHE_TAGS = {
  STORES: 'stores',
  STORE: (id: string) => `store:${id}`,
  PRODUCTS: (storeId: string) => `products:${storeId}`,
  CATEGORIES: (storeId: string) => `categories:${storeId}`,
  ORDERS: (customerId: string) => `orders:${customerId}`,
  PROFILE: (userId: string) => `profile:${userId}`,
} as const;

