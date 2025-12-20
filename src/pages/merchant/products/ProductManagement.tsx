/**
 * Componente de gestão de produtos
 * Divide a tela em duas colunas: lista de produtos (esquerda) e painel de edição (direita)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Package, Loader2, Save } from 'lucide-react';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { ProductService, type ProductApiResponse } from '@/services/products/productService';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingState } from '@/components/shared/LoadingState';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toast';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';
import { MerchantLayout } from '@/components/layout/MerchantLayout';

export const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
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

  // Estados para edição rápida
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Estados para exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductApiResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    console.log('🔍 Produto selecionado:', {
      id: product.id,
      name: product.name,
      price: product.price,
      costPrice: product.cost_price,
      imageUrl: product.image_url,
      hasImage: !!product.image_url,
    });
    
    setSelectedProduct(product);
    setEditPrice(product.price);
    setEditCostPrice(product.cost_price || 0);
    showInfoToast('Produto selecionado para edição', 'Editar Produto');
  };

  const handleProductUpdate = async () => {
    if (!selectedProduct || !storeId) {
      showErrorToast(new Error('Produto não selecionado'), 'Erro');
      return;
    }

    // Validar preço
    if (editPrice <= 0) {
      showErrorToast(new Error('Preço deve ser maior que zero'), 'Erro');
      return;
    }

    try {
      setSaving(true);

      // Atualização parcial - apenas preço e custo
      const updatePayload = {
        price: editPrice,
        costPrice: editCostPrice || 0,
      };

      const updatedProduct = await ProductService.updateProduct(
        storeId,
        selectedProduct.id,
        updatePayload
      );

      // Atualizar produto na lista
      setProducts(products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));
      
      // Atualizar produto selecionado
      setSelectedProduct(updatedProduct);
      setEditPrice(updatedProduct.price);
      setEditCostPrice(updatedProduct.cost_price || 0);

      showSuccessToast('Produto atualizado com sucesso!', 'Sucesso');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showErrorToast(error as Error, 'Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Abre o modal de confirmação para deletar produto
   */
  const handleDeleteClick = (product: ProductApiResponse) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  /**
   * Deleta um produto permanentemente
   */
  const handleProductDelete = async () => {
    if (!productToDelete || !storeId) {
      showErrorToast(new Error('Produto não selecionado'), 'Erro');
      return;
    }

    try {
      setDeleting(true);

      await ProductService.deleteProduct(storeId, productToDelete.id);

      // Remover produto da lista
      setProducts(products.filter(p => p.id !== productToDelete.id));
      
      // Se era o produto selecionado, limpar seleção
      if (selectedProduct?.id === productToDelete.id) {
        setSelectedProduct(null);
        setEditPrice(0);
        setEditCostPrice(0);
      }

      showSuccessToast('Produto deletado com sucesso');
      
      // Fechar modal
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      // O erro já foi tratado pelo service
    } finally {
      setDeleting(false);
    }
  };

  // Mostrar loading enquanto autenticação está carregando
  if (authLoading) {
    return <LoadingState message="Carregando informações do usuário..." size="lg" className="py-12" />;
  }

  // Se não há merchant autenticado
  if (!merchant) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Você precisa estar autenticado para acessar esta página.</p>
        <p className="text-sm text-gray-500">Faça login como merchant para continuar.</p>
      </div>
    );
  }

  // Se não é merchant
  if (!('role' in merchant)) {
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
    <MerchantLayout>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Coluna Esquerda - Lista de Produtos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Produtos da Loja</h3>
              <Button 
                size="sm" 
                variant="default" 
                onClick={() => navigate('/merchant/products/new')}
              >
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
                <div className="text-center py-12 px-4">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  {products.length === 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum produto cadastrado
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Comece criando seu primeiro produto para sua loja
                      </p>
                      <Button 
                        onClick={() => navigate('/merchant/products/new')}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Produto
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2">Nenhum produto encontrado</p>
                      <p className="text-sm text-gray-500">
                        Tente ajustar os filtros ou termo de busca
                      </p>
                    </>
                  )}
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
                            handleDeleteClick(product);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <div className="border rounded-lg overflow-hidden bg-white">
                  {/* Imagem do Produto ou Placeholder */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Erro ao carregar imagem:', selectedProduct.image_url);
                          // Mostrar placeholder em caso de erro
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                                <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p class="text-xs text-gray-500 mt-2">Imagem não disponível</p>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Sem imagem</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {selectedProduct.description || 'Sem descrição'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">💵 Preço Atual</p>
                        <span className="font-bold text-primary text-lg block">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <Badge variant={selectedProduct.is_active ? 'default' : 'secondary'}>
                          {selectedProduct.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedProduct.cost_price && selectedProduct.cost_price > 0 && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">💰 Custo Atual</p>
                        <span className="font-semibold text-gray-900 text-base block mb-1">
                          {formatPrice(selectedProduct.cost_price)}
                        </span>
                        <p className="text-xs text-blue-700 font-medium">
                          Margem: {((selectedProduct.price - selectedProduct.cost_price) / selectedProduct.price * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulário de Edição Rápida */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h4 className="font-semibold text-sm text-gray-900">Edição Rápida</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Atualize preço e custo do produto
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Preço de Venda */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Preço de Venda (R$) <span className="text-destructive">*</span>
                        </label>
                        {editPrice !== selectedProduct.price && (
                          <Badge variant="outline" className="text-xs">
                            Alterado
                          </Badge>
                        )}
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={editPrice || ''}
                        onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                      />
                      {editPrice !== selectedProduct.price && editPrice > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Anterior: {formatPrice(selectedProduct.price)}
                          </span>
                          <span className="font-medium text-primary">
                            Novo: {formatPrice(editPrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Preço de Custo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Preço de Custo (R$)
                        </label>
                        {editCostPrice !== (selectedProduct.cost_price || 0) && (
                          <Badge variant="outline" className="text-xs">
                            Alterado
                          </Badge>
                        )}
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={editCostPrice || ''}
                        onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
                      />
                      {editCostPrice !== (selectedProduct.cost_price || 0) && editCostPrice >= 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Anterior: {formatPrice(selectedProduct.cost_price || 0)}
                          </span>
                          <span className="font-medium text-primary">
                            Novo: {formatPrice(editCostPrice)}
                          </span>
                        </div>
                      )}
                      {editCostPrice > 0 && editPrice > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                          <p className="text-xs font-medium text-blue-900">
                            💰 Nova Margem de Lucro: {((editPrice - editCostPrice) / editPrice * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditPrice(selectedProduct.price);
                          setEditCostPrice(selectedProduct.cost_price || 0);
                        }}
                        disabled={saving}
                        className="flex-1"
                      >
                        Resetar
                      </Button>
                      <Button 
                        onClick={handleProductUpdate} 
                        loading={saving}
                        disabled={
                          saving || 
                          editPrice <= 0 || 
                          (editPrice === selectedProduct.price && editCostPrice === (selectedProduct.cost_price || 0))
                        }
                        className="flex-1 gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Aviso de mudanças não salvas */}
                    {(editPrice !== selectedProduct.price || editCostPrice !== (selectedProduct.cost_price || 0)) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-xs font-medium text-yellow-800">
                          ⚠️ Você tem alterações não salvas
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 text-center">
                      💡 Para editar outros campos (nome, descrição, categoria, etc.), crie uma página de edição completa.
                    </p>
                  </div>
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

      {/* Modal de Confirmação de Exclusão */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            {/* Cabeçalho */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Deletar Produto</h3>
                <p className="text-sm text-gray-500 mt-1">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {productToDelete.image_url ? (
                    <img
                      src={productToDelete.image_url}
                      alt={productToDelete.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{productToDelete.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(productToDelete.price)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs font-medium text-yellow-800">
                  ⚠️ O produto será deletado permanentemente e não poderá ser recuperado.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Se o produto estiver em pedidos ativos, a exclusão será bloqueada.
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                disabled={deleting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleProductDelete}
                disabled={deleting}
                className="flex-1 gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Deletar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </MerchantLayout>
  );
};

