/**
 * Componente de lista de produtos
 * Exibe produtos em cards com busca e filtros
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Package, DollarSign, Copy } from 'lucide-react';
import type { ProductApiResponse } from '@/services/products/productService';
import { Card, CardContent, CardHeader } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch/Switch';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';

interface ProductListProps {
  products: ProductApiResponse[];
  filteredProducts: ProductApiResponse[];
  selectedProduct: ProductApiResponse | null;
  loading: boolean;
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onProductSelect: (product: ProductApiResponse) => void;
  onProductEdit: (product: ProductApiResponse) => void;
  onProductDelete: (product: ProductApiResponse) => void;
  onProductToggleActive: (product: ProductApiResponse) => void;
  onProductDuplicate: (product: ProductApiResponse) => void;
  onPageChange: (page: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  filteredProducts,
  selectedProduct,
  loading,
  searchTerm,
  selectedCategory,
  categories,
  pagination,
  onSearchChange,
  onCategoryChange,
  onProductSelect,
  onProductEdit,
  onProductDelete,
  onProductToggleActive,
  onProductDuplicate,
  onPageChange,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold">Produtos da Loja</h3>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total > 0 ? (
                <>
                  <span className="font-semibold text-primary">{pagination.total}</span> {pagination.total === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                </>
              ) : (
                'Nenhum produto cadastrado'
              )}
            </p>
          </div>
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtro de Categoria */}
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onCategoryChange('all')}
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
                  onClick={() => onCategoryChange(category)}
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
                onClick={() => onProductSelect(product)}
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
                      <Badge 
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={cn(
                          'text-xs',
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {product.description || 'Sem descrição'}
                    </p>
                    
                    {/* Informações detalhadas */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Preços */}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-bold text-green-700">Venda:</span>
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                      </div>
                      {product.cost_price !== null && product.cost_price !== undefined && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-orange-600" />
                          <span className="font-bold text-orange-700">Custo:</span>
                          <span className="font-semibold">{formatPrice(product.cost_price)}</span>
                        </div>
                      )}
                      
                      {/* Categoria */}
                      {product.category && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Categoria:</span>
                          <Badge variant="secondary" className="text-xs py-0 h-5">
                            {product.category}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Categoria Customizada */}
                      {product.custom_category && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Tag:</span>
                          <Badge variant="outline" className="text-xs py-0 h-5 border-purple-300 text-purple-700">
                            {product.custom_category}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Tempo de preparação */}
                      {product.preparation_time && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Preparo:</span>
                          <span className="font-medium">{product.preparation_time} min</span>
                        </div>
                      )}
                      
                      {/* Margem (se tiver custo) */}
                      {product.cost_price !== null && product.cost_price !== undefined && product.cost_price > 0 && product.price > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Margem:</span>
                          <span className="font-medium text-primary">
                            {((product.price - product.cost_price) / product.price * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductEdit(product);
                        }}
                        title="Editar produto"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductDuplicate(product);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Duplicar produto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductDelete(product);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Deletar produto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Switch para ativar/desativar */}
                    <div 
                      className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => onProductToggleActive(product)}
                        className="scale-75"
                      />
                    </div>
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
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.hasNext || loading}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

