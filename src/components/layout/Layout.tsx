import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Search, 
  Clock, 
  MapPin, 
  Star, 
  Truck
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
  showBanner = variant === 'public',
  showFooter = variant === 'public',
  className,
  mainClassName,
}) => {
  const {
    storeName,
    storeDescription,
    deliveryTime,
    storeCategory,
    avatar,
    colors,
    textColor,
  } = useStoreTheme();
  const { currentStore } = useStoreContext();
  const { totalItems, totalAmount } = useCartContext();
  const { user, isCustomer, login, loading: authLoading } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams<{ storeId?: string }>();
  const storeId = params.storeId || currentStore?.id || currentStore?.slug;
  
  const handleCartClick = () => {
    // Verificar se o usuário está logado
    if (!user || !isCustomer) {
      setShowLoginModal(true);
      return;
    }

    // Se estiver logado, navegar para checkout
    if (storeId) {
      navigate(`/loja/${storeId}/checkout`);
    } else {
      console.warn('Store ID não encontrado para navegar ao checkout');
    }
  };

  const handleLogin = async () => {
    // Validar telefone
    if (!phone.trim()) {
      return; // TODO: Mostrar mensagem de erro
    }

    // Limpar caracteres especiais do telefone (apenas números)
    const cleanPhone = phone.replace(/\D/g, '');

    // Validar formato básico (pelo menos 10 dígitos)
    if (cleanPhone.length < 10) {
      return; // TODO: Mostrar mensagem de erro
    }

    setLoginLoading(true);
    try {
      await login({ phone: cleanPhone });
      // Após login bem-sucedido, fechar modal e navegar para checkout
      setShowLoginModal(false);
      setPhone('');
      if (storeId) {
        navigate(`/loja/${storeId}/checkout`);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // TODO: Mostrar mensagem de erro ao usuário
    } finally {
      setLoginLoading(false);
    }
  };

  const formatPhoneInput = (value: string) => {
    // Remover todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar máscara: (XX) XXXXX-XXXX
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const isStoreVariant = variant === 'store';

  return (
    <div className={cn('min-h-screen', isStoreVariant ? 'bg-gray-50' : 'bg-background', className)}>
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full overflow-hidden',
          isStoreVariant
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
        )}
      >
        {isStoreVariant ? (
          // Header estilo Store (colorido, compacto)
          <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 container mx-auto max-w-full">
            {/* Primeira linha: Logo e ações */}
            <div className="flex items-center gap-2 mb-2 min-w-0">
              {/* Logo - ocupa o espaço disponível */}
              <div className="flex items-center gap-2 sm:gap-3 bg-primary-foreground p-1.5 sm:p-2 rounded-full flex-1 min-w-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 ring-2 ring-primary-foreground/20">
                  <AvatarFallback className="bg-black text-white text-sm sm:text-lg font-bold ">
                    {avatar || storeName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 
                  className="text-base sm:text-lg md:text-xl font-bold bg-white text-black py-2 sm:py-2.5 px-2 sm:px-3 md:px-4 rounded-full truncate min-w-0"
                  // style={{ color: textColor || undefined }}
                >
                  {storeName}
                  to
                </h1>
              </div>

              {/* Ações - fixas no canto direito */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {showActions.favorites && (
                  <button
                    className="p-1.5 sm:p-2 hover:bg-primary-foreground/10 rounded-full transition-colors shrink-0"
                    aria-label="Favoritos"
                  >
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}

                {showActions.cart && (
                  <button
                    className="relative p-1.5 sm:p-2 hover:bg-primary-foreground/10 rounded-full transition-colors shrink-0"
                    aria-label="Carrinho"
                    onClick={handleCartClick}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    {totalItems > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-[10px] sm:text-xs flex items-center justify-center"
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </Badge>
                    )}
                  </button>
                )}

                {showActions.profile && (
                  <Link 
                    to={storeId ? `/loja/${storeId}/perfil` : '/perfil'} 
                    className="p-1.5 sm:p-2 hover:bg-primary-foreground/10 rounded-full transition-colors shrink-0"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Segunda linha: Descrição e status */}
            {(storeDescription || storeCategory || deliveryTime) && (
              <div className="text-sm text-primary-foreground/90 space-y-1">
                {storeDescription && <p>{storeDescription || storeCategory}</p>}
                {deliveryTime && (
                  <p className="text-xs">
                    {deliveryTime} • <span className="text-red-300">Fechado</span>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Header estilo Public (branco, espaçado)
          <div className="container flex h-16 max-w-screen-2xl items-center">
            {/* Logo e nome da loja */}
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {avatar || '🥗'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 
                  className="text-xl font-bold text-foreground"
                  style={textColor ? { color: textColor } : undefined}
                >
                  {storeName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {deliveryTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{deliveryTime}</span>
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Delivery disponível</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Botão do carrinho */}
            {showActions.cart && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2"
                  onClick={handleCartClick}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Carrinho</span>
                  {totalItems > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {totalItems}
                    </Badge>
                  )}
                </Button>

                {/* Badge de notificação */}
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Campo de Busca */}
      {showSearch && (
        <div
          className={cn(
            'sticky z-40 bg-white border-b px-4 py-3 shadow-sm w-full position-sticky rounded-lg',
            isStoreVariant ? 'top-[88px] sticky' : 'top-16 sticky'
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Procurar..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              aria-label="Buscar produtos"
            />
          </div>
        </div>
      )}

      {/* Banner de informações da loja */}
      {showBanner && (
        <div className="bg-primary text-primary-foreground">
          <div className="container py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                >
                  <Truck className="h-3 w-3" />
                  Entrega grátis acima de R$ 25,00
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                >
                  <Star className="h-3 w-3" />
                  4.8 (120+ avaliações)
                </Badge>
              </div>

              {totalItems > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary-foreground/20 text-primary-foreground"
                >
                  Total: {formatPrice(totalAmount)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main
        className={cn(
          isStoreVariant
            ? 'p-5 rounded-lg'
            : 'container flex-1 py-6',
          mainClassName
        )}
        style={isStoreVariant ? { backgroundColor: colors?.secondary } : undefined}
      >
        {children}
      </main>

      {/* Carrinho flutuante (quando há itens) - apenas mobile */}
      {totalItems > 0 && !isStoreVariant && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <Button
            size="lg"
            className="shadow-lg gap-2 rounded-full"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            <Badge variant="secondary" className="bg-primary-foreground text-primary">
              {totalItems}
            </Badge>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline">{formatPrice(totalAmount)}</span>
          </Button>
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <footer className="border-t bg-background">
          <div className="container py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {avatar || '🥗'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-lg font-semibold text-primary">
                  {storeName}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Feito com ❤️ pelo sistema Venda Fácil
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Modal de Login */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPhone('');
        }}
        title="Login para continuar"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para finalizar sua compra, precisamos do seu número de telefone.
          </p>
          
          <div className="space-y-2">
            <InputWithLabel
              label="Telefone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              required
              autoFocus
              disabled={loginLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleLogin}
              className="w-full sm:flex-1"
              disabled={!phone.trim() || loginLoading || authLoading}
              loading={loginLoading}
              size="sm"
            >
              Continuar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginModal(false);
                setPhone('');
              }}
              disabled={loginLoading}
              className="w-full sm:flex-1"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
