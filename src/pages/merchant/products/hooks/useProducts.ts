/**
 * Hook para gerenciar produtos do merchant
 * Centraliza toda a lógica de CRUD de produtos
 */

import { useState, useCallback } from 'react';
import { ProductService } from '@/services/products/productService';
import type { ProductApiResponse } from '@/services/products/productService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

interface UseProductsParams {
  storeId: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useProducts = ({ storeId }: UseProductsParams) => {
  const [products, setProducts] = useState<ProductApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  /**
   * Carrega produtos com filtros
   */
  const loadProducts = useCallback(async (filters?: {
    search?: string;
    category?: string;
    page?: number;
  }) => {
    if (!storeId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await ProductService.getProducts({
        storeId,
        search: filters?.search || undefined,
        category: filters?.category !== 'all' ? filters?.category : undefined,
        page: filters?.page || pagination.page,
        limit: pagination.limit,
      });

      setProducts(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showErrorToast(error as Error, 'Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, pagination.page, pagination.limit]);

  /**
   * Atualiza um produto (edição rápida ou completa)
   */
  const updateProduct = useCallback(async (
    productId: string,
    updateData: Partial<{
      name: string;
      description: string;
      price: number;
      costPrice: number;
      family: string;
      category: string;
      customCategory: string;
      imageUrl: string;
      isActive: boolean;
      preparationTime: number;
      nutritionalInfo: Record<string, unknown>;
    }>
  ) => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return null;
    }

    try {
      // Mapear os campos para o formato esperado pela API
      const apiPayload: Record<string, unknown> = {};
      
      if (updateData.name !== undefined) apiPayload.name = updateData.name;
      if (updateData.description !== undefined) apiPayload.description = updateData.description;
      if (updateData.price !== undefined) apiPayload.price = updateData.price;
      if (updateData.costPrice !== undefined) apiPayload.costPrice = updateData.costPrice;
      if (updateData.family !== undefined) apiPayload.family = updateData.family;
      if (updateData.category !== undefined) apiPayload.category = updateData.category;
      if (updateData.customCategory !== undefined) apiPayload.customCategory = updateData.customCategory;
      if (updateData.imageUrl !== undefined) apiPayload.imageUrl = updateData.imageUrl;
      if (updateData.isActive !== undefined) apiPayload.isActive = updateData.isActive;
      if (updateData.preparationTime !== undefined) apiPayload.preparationTime = updateData.preparationTime;
      if (updateData.nutritionalInfo !== undefined) apiPayload.nutritionalInfo = updateData.nutritionalInfo;

      const updatedProduct = await ProductService.updateProduct(
        storeId,
        productId,
        apiPayload
      );

      // Atualizar produto na lista local
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === updatedProduct.id ? updatedProduct : p
        )
      );

      showSuccessToast('Produto atualizado com sucesso!', 'Sucesso');
      return updatedProduct;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showErrorToast(error as Error, 'Erro ao atualizar produto');
      return null;
    }
  }, [storeId]);

  /**
   * Deleta um produto
   */
  const deleteProduct = useCallback(async (productId: string) => {
    if (!storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return false;
    }

    try {
      await ProductService.deleteProduct(storeId, productId);

      // Remover produto da lista local
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== productId)
      );

      showSuccessToast('Produto deletado com sucesso', 'Sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      // Erro já tratado pelo service
      return false;
    }
  }, [storeId]);

  /**
   * Ativa um produto
   */
  const activateProduct = useCallback(async (productId: string) => {
    return await updateProduct(productId, { isActive: true });
  }, [updateProduct]);

  /**
   * Desativa um produto
   */
  const deactivateProduct = useCallback(async (productId: string) => {
    return await updateProduct(productId, { isActive: false });
  }, [updateProduct]);

  /**
   * Muda página
   */
  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  return {
    products,
    loading,
    pagination,
    loadProducts,
    updateProduct,
    deleteProduct,
    activateProduct,
    deactivateProduct,
    changePage,
  };
};

