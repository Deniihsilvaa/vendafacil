import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreLayout, CategoryCarousel } from '@/components/layout';
import { ProductCard, ProductCustomizerModal } from '@/components/business/product';
import { EmptyState } from '@/components/shared';
import { useStoreById } from '@/hooks/useStoreById';
import { useCartContext } from '@/contexts';
import { Badge } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/dialogs';
import { Loader2, Store, Package } from 'lucide-react';
import type { Product, CartItem } from '@/types';

export const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { store, products, categories, loading, error, hasProducts } = useStoreById(storeId || '');
  const { addItem } = useCartContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Carregando loja...</h2>
            <p className="text-muted-foreground">Aguarde enquanto buscamos os dados</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - loja não encontrada
  if (error || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="space-y-4">
            <Store className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Loja não encontrada</h2>
              <p className="text-muted-foreground">
                A loja que você está procurando não existe ou não está disponível no momento.
              </p>
            </div>
          </div>
          
          {error && (
            <Badge variant="destructive" className="mx-auto">
              {error}
            </Badge>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Verifique se o link está correto ou</p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline font-medium"
            >
              volte para a página anterior
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar produtos por categoria e busca
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || 
      selectedCategory === 'all' || 
      product.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Agrupar produtos por categoria
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Abrir modal de personalização ou adicionar diretamente
  const handleProductSelect = (product: Product) => {
    // Se não tem customizações, adicionar direto ao carrinho
    if (!product.customizations || product.customizations.length === 0) {
      const cartItem: CartItem = {
        product,
        quantity: 1,
        customizations: [],
        totalPrice: product.price,
      };
      
      addItem(cartItem);
      // Mostrar diálogo perguntando se quer ir para checkout
      setShowCheckoutDialog(true);
    } else {
      // Se tem customizações, abrir modal
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  // Confirmar ir para checkout
  const handleConfirmCheckout = () => {
    setShowCheckoutDialog(false);
    navigate(`/loja/${storeId}/checkout`);
  };

  // Adicionar ao carrinho e decidir próxima ação
  const handleAddToCart = (item: CartItem, goToCheckout: boolean = false) => {
    addItem(item);
    
    if (goToCheckout) {
      // Navegar direto para checkout
      navigate(`/loja/${storeId}/checkout`);
    } else {
      // Fechar modal e continuar navegando
      setIsModalOpen(false);
      setSelectedProduct(null);
      // Poderia mostrar um toast aqui: "Produto adicionar ao carrinho!"
    }
  };

  // Store sem produtos cadastrados
  if (!loading && !hasProducts) {
    return (
      <StoreLayout showSearch={false}>
        <EmptyState
          icon={Package}
          title="Cardápio em preparação"
          description="Esta loja ainda está organizando seu cardápio. Em breve você poderá fazer seus pedidos aqui!"
          actions={[
            { label: 'Salvar esta loja nos seus favoritos' },
            { label: `Entrar em contato via ${store.info.phone}` },
            { label: 'Acompanhar as novidades em breve' },
          ]}
          footer={
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(store.updatedAt).toLocaleDateString('pt-BR')}
            </p>
          }
        />
      </StoreLayout>
    );
  }

  // Transformar array de strings em array de Category para o CategoryCarousel
  const categoryObjects = categories.map((category) => ({
    id: category,
    name: category,
    icon: '🍽️', // Ícone padrão, pode ser customizado no futuro
  }));

  // Store com produtos - renderizar normalmente
  return (
    <StoreLayout onSearch={setSearchQuery}>
      {/* Carousel de Categorias */}
      <CategoryCarousel
        categories={[{ id: 'all', name: 'Todos', icon: '🍽️' }, ...categoryObjects]}
        selectedCategory={selectedCategory || 'all'}
        onSelectCategory={setSelectedCategory}
      />

      {/* Lista de Produtos por Categoria */}
      <div className="space-y-6 px-2 py-2">
        {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
          <div key={categoryName} className="space-y-4">
            {/* Título da Categoria */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase text-primary">
                {categoryName}
              </h2>
              {categoryProducts.length > 0 && (
                <Badge variant="secondary" className="font-semibold">
                  {categoryProducts.length}
                </Badge>
              )}
            </div>

            {/* Lista de Produtos */}
            <div className="space-y-2">
              {categoryProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isNew={index === 0} // Primeiro produto de cada categoria é "novo"
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Nenhum produto encontrado para "${searchQuery}"`
                : 'Nenhum produto nesta categoria'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Personalização */}
      <ProductCustomizerModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Diálogo de Confirmação para Checkout */}
      <ConfirmDialog
        isOpen={showCheckoutDialog}
        title="Produto Adicionado!"
        message="Produto adicionado ao carrinho com sucesso. Deseja ir para o checkout agora?"
        confirmText="Ir para Checkout"
        cancelText="Continuar Comprando"
        onConfirm={handleConfirmCheckout}
        onCancel={() => setShowCheckoutDialog(false)}
      />
    </StoreLayout>
  );
};
