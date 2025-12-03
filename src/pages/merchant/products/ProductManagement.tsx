/**
 * Componente de gestão de produtos
 * Divide a tela em duas colunas: lista de produtos (esquerda) e painel de edição (direita)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { ProductService, type ProductApiResponse } from '@/services/products/productService';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { showErrorToast, showInfoToast } from '@/utils/toast';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';

export const ProductManagement: React.FC = () => {
  const { merchant, loading: authLoading } = useMerchantAuth();
  const [products, setProducts] = useState<ProductApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductApiResponse | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Obter storeId do merchant (do localStorage ou do contexto)
  const storeId = useMemo(() => {
    // Tentar obter do localStorage primeiro (mais confiável)
    try {
      const savedMerchantStr = localStorage.getItem('store-flow-merchant');
      if (savedMerchantStr) {
        const savedMerchant = JSON.parse(savedMerchantStr);
        console.log('🔍 ProductManagement - Merchant do localStorage:', {
          id: savedMerchant?.id,
          email: savedMerchant?.email,
          hasStores: 'stores' in savedMerchant,
          stores: 'stores' in savedMerchant ? savedMerchant.stores : 'N/A',
          storesLength: 'stores' in savedMerchant && savedMerchant.stores ? savedMerchant.stores.length : 0,
          storeId: savedMerchant?.storeId,
        });

        // Se é merchant e tem stores
        if ('role' in savedMerchant && 'stores' in savedMerchant && savedMerchant.stores) {
          if (savedMerchant.stores.length > 0) {
            // Se houver apenas uma loja, usar ela
            if (savedMerchant.stores.length === 1) {
              console.log('✅ ProductManagement - Usando única loja do localStorage:', savedMerchant.stores[0].id);
              return savedMerchant.stores[0].id;
            }
            // Caso contrário, usar a primeira ativa
            const activeStore = savedMerchant.stores.find((store: { is_active: boolean }) => store.is_active);
            if (activeStore) {
              console.log('✅ ProductManagement - Usando primeira loja ativa do localStorage:', activeStore.id);
              return activeStore.id;
            }
            // Se não há loja ativa, usar a primeira disponível
            console.log('✅ ProductManagement - Usando primeira loja disponível do localStorage:', savedMerchant.stores[0].id);
            return savedMerchant.stores[0]?.id || null;
          }
        }

        // Se tem storeId direto no merchant (para merchants com uma única loja)
        if (savedMerchant?.storeId) {
          console.log('✅ ProductManagement - Usando storeId direto do localStorage:', savedMerchant.storeId);
          return savedMerchant.storeId;
        }
      }
    } catch (error) {
      console.error('❌ ProductManagement - Erro ao ler localStorage:', error);
    }

    // Fallback: tentar obter do contexto (merchant)
    if (authLoading) {
      console.log('⏳ ProductManagement - Auth ainda carregando...');
      return null;
    }

    if (!merchant) {
      console.warn('⚠️ ProductManagement - Merchant é null (authLoading:', authLoading, ')');
      return null;
    }

    if (!merchant.stores || merchant.stores.length === 0) {
      console.warn('⚠️ ProductManagement - Merchant não tem stores válidas');
      return null;
    }

    // Se houver apenas uma loja, usar ela. Caso contrário, usar a primeira ativa
    if (merchant.stores.length === 1) {
      console.log('✅ ProductManagement - Usando única loja do contexto:', merchant.stores[0].id);
      return merchant.stores[0].id;
    }

    const activeStore = merchant.stores.find(store => store.is_active);
    if (activeStore) {
      console.log('✅ ProductManagement - Usando primeira loja ativa do contexto:', activeStore.id);
      return activeStore.id;
    }

    console.log('✅ ProductManagement - Usando primeira loja disponível do contexto:', merchant.stores[0].id);
    return merchant.stores[0]?.id || null;
  }, [merchant, authLoading]);

  // Carregar produtos
  const loadProducts = async () => {
    console.log('🔄 ProductManagement - loadProducts chamado, storeId:', storeId);
    
    if (!storeId) {
      console.warn('⚠️ ProductManagement - storeId é null, não carregando produtos');
      setLoading(false);
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      console.log('📡 ProductManagement - Fazendo requisição com storeId:', storeId);
      
      const response = await ProductService.getProducts({
        storeId,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      console.log('✅ ProductManagement - Resposta recebida:', {
        itemsCount: response.data.items.length,
        pagination: response.data.pagination,
      });

      setProducts(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('❌ ProductManagement - Erro ao carregar produtos:', error);
      showErrorToast(error as Error, 'Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, searchTerm, selectedCategory, pagination.page]);

  // Obter categorias únicas dos produtos
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filtrar produtos localmente (para busca em tempo real)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleProductSelect = (product: ProductApiResponse) => {
    setSelectedProduct(product);
    showInfoToast('Produto selecionado para edição', 'Editar Produto');
  };

  const handleProductUpdate = () => {
    // TODO: Implementar quando a API estiver pronta
    showInfoToast('Funcionalidade de edição será implementada em breve', 'Em Desenvolvimento');
  };

  // Mostrar loading enquanto autenticação está carregando
  if (authLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Carregando informações do usuário...</p>
      </div>
    );
  }

  // Se não há usuário autenticado
  if (!user) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Você precisa estar autenticado para acessar esta página.</p>
        <p className="text-sm text-gray-500">Faça login como merchant para continuar.</p>
      </div>
    );
  }

  // Se não é merchant
  if (!('role' in user)) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Acesso negado. Esta página é apenas para merchants.</p>
      </div>
    );
  }

  // Se não tem lojas associadas
  if (!storeId) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Nenhuma loja encontrada.</p>
        <p className="text-sm text-gray-500">
          {!merchant.stores || merchant.stores.length === 0
            ? 'Você não possui lojas associadas à sua conta.'
            : 'Nenhuma loja ativa encontrada.'}
        </p>
        <p className="text-sm text-gray-500 mt-2">Entre em contato com o suporte para mais informações.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Coluna Esquerda - Lista de Produtos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Produtos da Loja</h3>
              <Button size="sm" variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Busca */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro de Categoria */}
            {categories.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Produtos */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={cn(
                      'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedProduct?.id === product.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          {!product.is_active && (
                            <Badge variant="outline" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                          {product.preparation_time && (
                            <span className="text-gray-500">
                              {product.preparation_time} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductSelect(product);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implementar delete
                            showInfoToast('Funcionalidade de exclusão será implementada', 'Em Desenvolvimento');
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} produtos)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.hasPrev || loading}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.hasNext || loading}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Painel de Edição */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {selectedProduct ? 'Editar Produto' : 'Selecione um Produto'}
            </h3>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                {/* Preview do Produto */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  {selectedProduct.image_url && (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-semibold text-lg mb-2">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    <Badge variant={selectedProduct.is_active ? 'default' : 'secondary'}>
                      {selectedProduct.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                {/* Placeholder para Formulário de Edição */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Edit2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Formulário de edição</p>
                  <p className="text-sm text-gray-500 mb-4">
                    A funcionalidade de edição será implementada em breve
                  </p>
                  <Button onClick={handleProductUpdate} disabled>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p>Selecione um produto da lista para editar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

