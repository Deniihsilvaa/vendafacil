import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui';
import { Search } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  categories: Array<{ id: string; name: string; icon: string }>;
  onProductSelect?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onProductSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar produtos por categoria e busca
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => product.isActive);

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Agrupar produtos por categoria para exibição
  const productsByCategory = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {};
    
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    return grouped;
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      {/* Filtro por categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap flex items-center gap-2 min-w-fit"
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Lista de produtos */}
      {selectedCategory === 'all' ? (
        // Exibir por categorias quando "Todos" estiver selecionado
        <div className="space-y-8">
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>
                  {categories.find(c => c.name === category)?.icon || '🍽️'}
                </span>
                {category}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onProductSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Exibir apenas a categoria selecionada
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      )}

      {/* Mensagem quando não há produtos */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Não encontramos produtos para "${searchTerm}"`
              : 'Não há produtos nesta categoria'
            }
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Limpar busca
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
