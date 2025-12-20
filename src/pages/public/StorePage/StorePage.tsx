import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ProductCustomizerModal } from '@/components/business/product';
import { useStoreById } from '@/hooks/useStoreById';
import { useCartContext } from '@/contexts';
import { ConfirmDialog } from '@/components/ui/dialogs';
import { LoadingState } from '@/components/shared/LoadingState';
import { Store, Package, AlertCircle, Heart } from 'lucide-react';
import { isStoreOpen } from '@/utils/storeHours';
import { formatPrice } from '@/utils';
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
  
  // Debug logs
  console.log('🔍 StorePage - storeId da URL:', storeId);
  console.log('🔍 StorePage - Estado:', { 
    hasStore: !!store, 
    storeData: store ? { id: store.id, name: store.name, slug: store.slug } : null,
    productsCount: products.length,
    loading, 
    error 
  });
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFC107] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <LoadingState size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FFC107] flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white rounded-2xl p-6 max-w-sm">
          <Store className="h-12 w-12 mx-auto text-gray-400" />
          <h2 className="text-xl font-bold">Loja não encontrada</h2>
          <p className="text-gray-500 text-sm">
            A loja que você está procurando não existe ou não está disponível.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="text-[#E53935] hover:underline font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar se a loja está aberta
  const storeStatus = store ? isStoreOpen(store) : null;
  const isStoreCurrentlyOpen = storeStatus?.isOpen ?? false;

  // Filtrar produtos por busca
  const searchFilteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filtrar por categoria selecionada
  const filteredProducts = selectedCategory && selectedCategory !== 'all'
    ? searchFilteredProducts.filter(p => p.category === selectedCategory)
    : searchFilteredProducts;

  // Agrupar produtos por categoria
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const handleProductSelect = (product: Product) => {
    if (!isStoreCurrentlyOpen) return;

    if (!product.customizations || product.customizations.length === 0) {
      const cartItem: CartItem = {
        product,
        quantity: 1,
        customizations: [],
        totalPrice: product.price,
      };
      addItem(cartItem);
      setShowCheckoutDialog(true);
    } else {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleConfirmCheckout = () => {
    setShowCheckoutDialog(false);
    navigate(`/loja/${storeId}/checkout`);
  };

  const handleAddToCart = (item: CartItem, goToCheckout: boolean = false) => {
    addItem(item);
    if (goToCheckout) {
      navigate(`/loja/${storeId}/checkout`);
    } else {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

  // Store sem produtos
  if (!hasProducts) {
    return (
      <Layout variant="store" showSearch={false}>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Cardápio em preparação</h2>
          <p className="text-gray-500 text-center text-sm">
            Esta loja ainda está organizando seu cardápio. Volte em breve!
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="store" showSearch onSearch={setSearchQuery}>
      <div className="pb-24 mx-4 mt-8">
        {/* Notificação de loja fechada */}
        {!isStoreCurrentlyOpen && storeStatus && (
          <div className="mx-4 bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm ">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700 font-medium">Loja fechada</p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {storeStatus.currentDayHours 
                ? `Abre às ${storeStatus.currentDayHours.open}` 
                : storeStatus.nextOpenDay 
                  ? `Próxima abertura: ${storeStatus.nextOpenDay}` 
                  : 'Verifique o horário de funcionamento'}
            </p>
          </div>
        )}

        {/* Categorias */}
        {categories.length > 1 && (
          <div className="px-4 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 mt-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory 
                    ? 'bg-[#E53935] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 mt-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category 
                      ? 'bg-[#E53935] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Produtos agrupados por categoria */}
        <div className="mt-4 space-y-6">
          {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
            <div key={categoryName}>
              {/* Nome da categoria */}
              <div className="px-4 mb-3">
                <h2 className="text-lg font-bold text-gray-900">{categoryName}</h2>
                <p className="text-xs text-gray-500">{categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'itens'}</p>
              </div>

              {/* Grid de produtos da categoria */}
              <div className="px-4 grid grid-cols-2 gap-3">
                {categoryProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 ${
                      isStoreCurrentlyOpen ? 'cursor-pointer active:scale-[0.98] transition-transform' : 'opacity-60'
                    }`}
                  >
                    {/* Imagem */}
                    <div className="relative aspect-square bg-gray-100">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50">
                          🍽️
                        </div>
                      )}
                      <button 
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <Heart className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      {product.preparationTime > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ {product.preparationTime} min
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[#E53935]">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">
              {searchQuery 
                ? `Nenhum produto encontrado para "${searchQuery}"`
                : 'Nenhum produto disponível'
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

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={showCheckoutDialog}
        title="Produto Adicionado!"
        message="Deseja ir para o checkout agora?"
        confirmText="Ir para Checkout"
        cancelText="Continuar"
        onConfirm={handleConfirmCheckout}
        onCancel={() => setShowCheckoutDialog(false)}
      />
    </Layout>
  );
};
