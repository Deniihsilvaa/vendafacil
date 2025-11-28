import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Search,
  Home,
  HeartOff,
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  Avatar, 
  AvatarFallback, 
  Input,
  Modal
} from '@/components/ui';
import { useStoreTheme, useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { cn, formatPrice } from '@/utils';
import type { Product } from '@/types/product';
import { InputWithLabel } from '@/components/ui/forms';
import type { LayoutProps } from '@/types';

export const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'public',
  showSearch = false,
  onSearch,
  showActions = {
    favorites: variant === 'store',
    cart: true,
    profile: variant === 'store',
  },
  className,
  mainClassName,
}) => {
  const {
    storeName,
    deliveryTime,
    avatar,
  } = useStoreTheme();
  const { currentStore } = useStoreContext();
  const { totalItems, totalAmount, items } = useCartContext();
  const { user, isCustomer, login, loading: authLoading } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'cart' | 'profile'>('home');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  // Estado temporário para favoritos (futuramente virá da API)
  const [favorites] = useState<Product[]>([]);
  
  const navigate = useNavigate();
  const params = useParams<{ storeId?: string }>();
  const storeId = params.storeId || currentStore?.id || currentStore?.slug;
  
  const handleCartClick = () => {
    if (!user || !isCustomer) {
      setShowLoginModal(true);
      return;
    }
    if (storeId) {
      navigate(`/loja/${storeId}/checkout`);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) return;
    if (loginPassword.length < 6) return;
    if (!storeId) return;

    setLoginLoading(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword, storeId });
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleTabClick = (tab: 'home' | 'favorites' | 'cart' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'home') {
      if (storeId) navigate(`/loja/${storeId}`);
    } else if (tab === 'favorites') {
      setShowFavoritesModal(true);
    } else if (tab === 'cart') {
      setShowCartModal(true);
    } else if (tab === 'profile') {
      if (storeId) navigate(`/loja/${storeId}/perfil`);
    }
  };

  return (
    <div className={cn('min-h-screen bg-[#FFC107]', className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FFC107] px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-[#E53935] rounded-full p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#E53935] text-white font-bold text-lg">
                  {avatar || storeName?.charAt(0) || 'B'}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xl font-bold text-black italic">{storeName || 'Bite.'}</span>
          </div>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            {showActions.favorites && (
              <button 
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
                onClick={() => setShowFavoritesModal(true)}
              >
                <Heart className="h-5 w-5 text-black" />
              </button>
            )}

            {showActions.cart && (
              <button
                className="relative p-2 hover:bg-black/10 rounded-full transition-colors"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5 text-black" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-[#E53935] text-white border-2 border-[#FFC107]">
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </button>
            )}

            {showActions.profile && (
              <Link 
                to={storeId ? `/loja/${storeId}/perfil` : '/perfil'} 
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
              >
                <User className="h-5 w-5 text-black" />
              </Link>
            )}
          </div>
        </div>

        {/* Tempo de entrega */}
        {deliveryTime && (
          <p className="text-xs text-black/70 mt-1">
            Tempo médio de entrega: {deliveryTime}
          </p>
        )}
      </header>

      {/* Campo de Busca */}
      {showSearch && (
        <div className="px-4 pb-3 bg-[#FFC107]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 bg-white border-0 rounded-full shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className={cn('bg-white rounded-t-3xl min-h-[calc(100vh-120px)] -mt-1 pb-20 md:pb-0', mainClassName)}>
        {children}
      </main>

      {/* Bottom Navigation - apenas mobile/tablet */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#8B0000] md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => handleTabClick('home')}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              activeTab === 'home' ? 'text-white' : 'text-white/60'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Início</span>
          </button>

          <button
            onClick={() => handleTabClick('favorites')}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              activeTab === 'favorites' ? 'text-white' : 'text-white/60'
            )}
          >
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">Favoritos</span>
          </button>

          <button
            onClick={() => handleTabClick('cart')}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              activeTab === 'cart' ? 'text-white' : 'text-white/60'
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#FFC107] text-black text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px]">Carrinho</span>
          </button>

          <button
            onClick={() => handleTabClick('profile')}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              activeTab === 'profile' ? 'text-white' : 'text-white/60'
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modal de Favoritos */}
      <Modal
        isOpen={showFavoritesModal}
        onClose={() => {
          setShowFavoritesModal(false);
          setActiveTab('home');
        }}
        title="Meus Favoritos"
        size="lg"
      >
        <div className="min-h-[300px]">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HeartOff className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum favorito ainda</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Toque no coração dos produtos que você gosta para salvá-los aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-[#E53935] font-bold text-sm">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal do Carrinho */}
      <Modal
        isOpen={showCartModal}
        onClose={() => {
          setShowCartModal(false);
          setActiveTab('home');
        }}
        title="Meu Carrinho"
        size="lg"
      >
        <div className="min-h-[300px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Carrinho vazio</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Adicione produtos ao seu carrinho para continuar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity}x {formatPrice(item.product.price)}</p>
                    <p className="text-[#E53935] font-bold text-sm">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}

              {/* Total e botão */}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-[#E53935]">{formatPrice(totalAmount)}</span>
                </div>
                <Button
                  className="w-full bg-[#E53935] hover:bg-[#C62828]"
                  onClick={() => {
                    setShowCartModal(false);
                    handleCartClick();
                  }}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Login */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setLoginEmail('');
          setLoginPassword('');
        }}
        title="Login para continuar"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para finalizar sua compra, faça login.
          </p>
          
          <div className="space-y-3">
            <InputWithLabel
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              disabled={loginLoading}
            />
            
            <InputWithLabel
              label="Senha"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={loginLoading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleLogin}
              className="flex-1 bg-[#E53935] hover:bg-[#C62828]"
              disabled={!loginEmail.trim() || !loginPassword.trim() || loginLoading || authLoading}
              loading={loginLoading}
            >
              Entrar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              disabled={loginLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
