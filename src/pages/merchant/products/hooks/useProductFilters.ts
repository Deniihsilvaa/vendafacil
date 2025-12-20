/**
 * Hook para gerenciar filtros e busca de produtos
 */

import { useState, useMemo } from 'react';
import type { ProductApiResponse } from '@/services/products/productService';

export const useProductFilters = (products: ProductApiResponse[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  /**
   * Extrai categorias únicas dos produtos
   */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  /**
   * Filtra produtos localmente
   */
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredProducts,
  };
};

