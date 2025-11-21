import { useState, useEffect } from 'react';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';
import { StoreService } from '@/services/storeService';
import { useStoreContext } from '@/contexts';
import { showErrorToast } from '@/utils/toast';

interface UseStoreByIdResult {
  store: Store | null;
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  hasProducts: boolean;
}

export const useStoreById = (storeId: string): UseStoreByIdResult => {
  const { setStore: setCurrentStore } = useStoreContext();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!storeId) {
      setError('ID da loja não fornecido');
      setLoading(false);
      return;
    }

    let isCancelled = false; // Flag para evitar atualizações após desmontagem

    const fetchStoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados da loja com produtos (espelho da loja - produtos vêm na resposta)
        const { store: storeData, products: productsData } = await StoreService.getStoreByIdWithProducts(storeId);

        // Verificar se o componente foi desmontado
        if (isCancelled) return;

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

        // Extrair categorias dos produtos
        const categoriesSet = new Set(productsData.map(product => product.category));
        const categoriesData = Array.from(categoriesSet);

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
        // Verificar se o componente foi desmontado
        if (isCancelled) return;
        
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
            
            if (!isStale && !isCancelled) {
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
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchStoreData();
    
    // Cleanup: cancelar requisição se o componente for desmontado
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]); // setCurrentStore é estável e não precisa estar nas dependências

  return {
    store,
    products,
    categories,
    loading,
    error,
    hasProducts: products.length > 0,
  };
};
