import { useState, useEffect } from 'react';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';
import { StoreService } from '@/services/storeService';
import { useStoreContext } from '@/contexts';
import { showErrorToast } from '@/utils/toast';

interface UseStoreByIdResult {
  store: Store | null;
  products: Product[];
  categories: any[];
  loading: boolean;
  error: string | null;
  hasProducts: boolean;
}

export const useStoreById = (storeId: string): UseStoreByIdResult => {
  const { setStore: setCurrentStore } = useStoreContext();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setError('ID da loja não fornecido');
      setLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados da loja usando StoreService
        const storeData = await StoreService.getStoreById(storeId);
        
        if (!storeData) {
          setError('Loja não encontrada');
          setStore(null);
          setProducts([]);
          setCategories([]);
          return;
        }

        setStore(storeData);
        
        // Atualizar currentStore no contexto para aplicar o tema
        setCurrentStore(storeData);

        // Buscar produtos e categorias da loja usando StoreService
        const [productsData, categoriesData] = await Promise.all([
          StoreService.getStoreProducts(storeId),
          StoreService.getStoreCategories(storeId)
        ]);

        setProducts(productsData);
        setCategories(categoriesData);

        // Salvar no localStorage para cache
        const cacheData = {
          store: storeData,
          products: productsData,
          categories: categoriesData,
          timestamp: Date.now(),
        };
        localStorage.setItem(`store_${storeId}`, JSON.stringify(cacheData));

      } catch (err) {
        console.error('Erro ao buscar dados da loja:', err);
        setError('Erro ao carregar dados da loja');
        
        // Mostrar toast de erro
        showErrorToast(err as Error, 'Erro ao carregar loja');
        
        // Tentar carregar do cache em caso de erro
        const cached = localStorage.getItem(`store_${storeId}`);
        if (cached) {
          try {
            const cacheData = JSON.parse(cached);
            const isStale = Date.now() - cacheData.timestamp > 5 * 60 * 1000; // 5 minutos
            
            if (!isStale) {
              setStore(cacheData.store);
              setProducts(cacheData.products);
              setCategories(cacheData.categories);
              setError('Dados carregados do cache');
            }
          } catch (cacheErr) {
            console.error('Erro ao ler cache:', cacheErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  return {
    store,
    products,
    categories,
    loading,
    error,
    hasProducts: products.length > 0,
  };
};
