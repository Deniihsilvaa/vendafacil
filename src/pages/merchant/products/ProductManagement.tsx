/**
 * Gerenciamento de Produtos - Versão Refatorada
 * Componente principal dividido em módulos menores
 * 
 * Features:
 * - Edição Rápida: Atualiza apenas preço e custo
 * - Edição Completa: Modal com todos os campos
 * - Exclusão com confirmação
 * - Busca e filtros
 * - Paginação
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { showInfoToast } from '@/utils/toast';
import { cn } from '@/utils';
import type { ProductApiResponse } from '@/services/products/productService';

// Hooks personalizados
import { useProducts, useProductFilters } from './hooks';

// Componentes modulares
import { ProductList, QuickEditPanel, DeleteConfirmModal, FullEditModal } from './components';

export const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { merchant, loading: authLoading } = useMerchantAuth();
  
  // Ref para rastrear a última key de navegação
  const lastLocationKey = useRef<string>(location.key);

  // Estado do produto selecionado
  const [selectedProduct, setSelectedProduct] = useState<ProductApiResponse | null>(null);
  
  // Estado da edição completa
  const [fullEditProduct, setFullEditProduct] = useState<ProductApiResponse | null>(null);
  
  // Estado da exclusão
  const [productToDelete, setProductToDelete] = useState<ProductApiResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estado de salvamento
  const [saving, setSaving] = useState(false);

  // Obter storeId do merchant
  const storeId = useMemo(() => {
    try {
      const savedMerchantStr = localStorage.getItem('store-flow-merchant');
      if (savedMerchantStr) {
        const savedMerchant = JSON.parse(savedMerchantStr);
        if ('role' in savedMerchant && 'stores' in savedMerchant && savedMerchant.stores) {
          if (savedMerchant.stores.length > 0) {
            if (savedMerchant.stores.length === 1) {
              return savedMerchant.stores[0].id;
            }
            const activeStore = savedMerchant.stores.find((store: { is_active: boolean }) => store.is_active);
            if (activeStore) return activeStore.id;
            return savedMerchant.stores[0]?.id || null;
          }
        }
        if (savedMerchant?.storeId) {
          return savedMerchant.storeId;
        }
      }
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
    }

    if (authLoading || !merchant) return null;
    if (!merchant.stores || merchant.stores.length === 0) return null;
    if (merchant.stores.length === 1) return merchant.stores[0].id;

    const activeStore = merchant.stores.find(store => store.is_active);
    return activeStore?.id || merchant.stores[0]?.id || null;
  }, [merchant, authLoading]);

  // Hook de gerenciamento de produtos
  const {
    products,
    loading,
    pagination,
    loadProducts,
    updateProduct,
    deleteProduct,
    activateProduct,
    deactivateProduct,
    changePage,
  } = useProducts({ storeId });

  // Hook de filtros
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useProductFilters(products);

  // Debounce para a busca (aguardar 500ms após o usuário parar de digitar)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carregar produtos quando storeId ou filtros mudarem
  useEffect(() => {
    if (storeId) {
      loadProducts({
        search: debouncedSearchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: pagination.page,
      });
    }
  }, [storeId, debouncedSearchTerm, selectedCategory, pagination.page, loadProducts]);

  // Recarregar produtos quando navegamos de volta para esta página
  useEffect(() => {
    // Se a location.key mudou, significa que houve uma navegação
    if (lastLocationKey.current !== location.key) {
      lastLocationKey.current = location.key;
      
      // Se estamos na página de produtos, recarregar
      if (storeId && location.pathname === '/merchant/products') {
        loadProducts({
          search: debouncedSearchTerm || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          page: pagination.page,
        });
      }
    }
  }, [location.key, location.pathname, storeId, debouncedSearchTerm, selectedCategory, pagination.page, loadProducts]);

  /**
   * Seleciona produto para edição rápida
   */
  const handleProductSelect = (product: ProductApiResponse) => {
    setSelectedProduct(product);
    showInfoToast('Produto selecionado para edição', 'Editar Produto');
  };

  /**
   * Fecha o painel de edição rápida
   */
  const handleCloseQuickEdit = () => {
    setSelectedProduct(null);
  };

  /**
   * Edição rápida: atualiza apenas preço e custo
   */
  const handleQuickSave = async (productId: string, price: number, costPrice: number) => {
    setSaving(true);
    try {
      const updated = await updateProduct(productId, { price, costPrice });
      if (updated) {
        setSelectedProduct(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Edição completa: abre modal
   */
  const handleFullEdit = (product: ProductApiResponse) => {
    setFullEditProduct(product);
  };

  /**
   * Salva edição completa
   */
  const handleFullSave = async (productId: string, updateData: Parameters<typeof updateProduct>[1]) => {
    setSaving(true);
    try {
      const updated = await updateProduct(productId, updateData);
      if (updated) {
        // Atualizar produto selecionado se for o mesmo
        if (selectedProduct?.id === productId) {
          setSelectedProduct(updated);
        }
        // Fechar modal
        setFullEditProduct(null);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Fecha modal de edição completa
   */
  const handleFullEditClose = () => {
    setFullEditProduct(null);
  };

  /**
   * Abre modal de confirmação de exclusão
   */
  const handleDeleteClick = (product: ProductApiResponse) => {
    setProductToDelete(product);
  };

  /**
   * Confirma exclusão do produto
   */
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
      // Se era o produto selecionado, limpar seleção
      if (selectedProduct?.id === productToDelete.id) {
        setSelectedProduct(null);
      }
      setProductToDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Cancela exclusão
   */
  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  /**
   * Ativa/Desativa produto rapidamente (usa endpoints otimizados)
   */
  const handleToggleActive = async (product: ProductApiResponse) => {
    const newStatus = !product.is_active;
    
    try {
      // Usar endpoint otimizado específico
      const updatedProduct = newStatus 
        ? await activateProduct(product.id)
        : await deactivateProduct(product.id);

      // Atualizar produto selecionado se for o mesmo
      if (updatedProduct && selectedProduct?.id === product.id) {
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Erro ao alternar status do produto:', error);
    }
  };

  /**
   * Duplica produto (navega para página de criação com dados preenchidos)
   */
  const handleDuplicateProduct = (product: ProductApiResponse) => {
    // Preparar dados para duplicação (sem o ID)
    const duplicateData = {
      name: `${product.name} (Cópia)`,
      description: product.description,
      price: product.price,
      costPrice: product.cost_price,
      family: product.family,
      category: product.category,
      customCategory: product.custom_category,
      imageUrl: product.image_url,
      isActive: false, // Produto duplicado começa desativado
      preparationTime: product.preparation_time,
      nutritionalInfo: product.nutritional_info,
    };

    // Navegar para página de criação com dados preenchidos
    navigate('/merchant/products/new', {
      state: { duplicateData },
    });

    showInfoToast('Produto pronto para duplicação', 'Preencha os campos e salve');
  };

  // Loading de autenticação
  if (authLoading) {
    return <LoadingState size="lg" className="py-12" />;
  }

  // Sem merchant
  if (!merchant) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Você precisa estar autenticado para acessar esta página.</p>
        <p className="text-sm text-gray-500">Faça login como merchant para continuar.</p>
      </div>
    );
  }

  // Sem lojas
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
      <div className={cn(
        'grid gap-6 h-full transition-all duration-300',
        selectedProduct ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      )}>
      {/* Coluna Esquerda - Lista de Produtos */}
        <div>
          <ProductList
            products={products}
            filteredProducts={products}
            selectedProduct={selectedProduct}
            loading={loading}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            pagination={pagination}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onProductSelect={handleProductSelect}
            onProductEdit={handleFullEdit}
            onProductDelete={handleDeleteClick}
            onProductToggleActive={handleToggleActive}
            onProductDuplicate={handleDuplicateProduct}
            onPageChange={changePage}
          />
            </div>

        {/* Coluna Direita - Painel de Edição Rápida */}
        {selectedProduct && (
          <div>
            <QuickEditPanel
              product={selectedProduct}
              saving={saving}
              onSave={handleQuickSave}
              onFullEdit={handleFullEdit}
              onClose={handleCloseQuickEdit}
            />
              </div>
            )}

        {/* Modal de Confirmação de Exclusão */}
        {productToDelete && (
          <DeleteConfirmModal
            product={productToDelete}
            deleting={deleting}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}

        {/* Modal de Edição Completa */}
        {fullEditProduct && (
          <FullEditModal
            product={fullEditProduct}
            saving={saving}
            onSave={handleFullSave}
            onClose={handleFullEditClose}
          />
      )}
    </div>
  </MerchantLayout>
  );
};
