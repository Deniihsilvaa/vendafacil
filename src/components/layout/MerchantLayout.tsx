/**
 * Layout específico para área do merchant (lojista)
 * Baseado no Layout.tsx mas simplificado, sem carrinho/favoritos
 * Usa Navigation Menu do Shadcn na barra superior
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  Package,
  // Settings,
  LogOut,
  Menu,
  X,
  User,
  Building2,
  CreditCard,
  Mail,
  ChevronDown,
  Search,
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu-styles';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/buttons';
import { useMerchantAuth } from '@/contexts';
import { cn } from '@/utils';
import { showSuccessToast } from '@/utils/toast';
import { useStoreStatus } from '@/pages/merchant/dashboard/hooks';
import { Switch } from '@/components/ui/switch/Switch';
import { Badge } from '@/components/ui/badge';

interface MerchantLayoutProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({
  children,
  className,
  mainClassName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { merchant, logout } = useMerchantAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Obter storeId do merchant (do localStorage ou do contexto)
  const storeId = useMemo(() => {
    // Tentar obter do localStorage primeiro
    try {
      const savedUserStr = localStorage.getItem('store-flow-user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if ('role' in savedUser && 'stores' in savedUser && savedUser.stores) {
          if (savedUser.stores.length > 0) {
            if (savedUser.stores.length === 1) {
              return savedUser.stores[0].id;
            }
            const activeStore = savedUser.stores.find((store: { is_active: boolean }) => store.is_active);
            if (activeStore) return activeStore.id;
            return savedUser.stores[0]?.id || null;
          }
        }
        if (savedUser?.storeId) {
          return savedUser.storeId;
        }
      }
    } catch (error) {
      console.error('Erro ao obter storeId do localStorage:', error);
    }
    
    // Fallback: tentar do merchant do contexto
    if (merchant?.storeId) return merchant.storeId;
    
    return null;
  }, [merchant?.storeId]);

  // Hook para gerenciar status da loja
  const {
    status: storeStatus,
    loading: loadingStoreStatus,
    toggling: togglingStoreStatus,
    toggleStatus: toggleStoreStatus,
  } = useStoreStatus({ storeId, enabled: !!storeId });

  const isTemporarilyClosed = storeStatus?.isTemporarilyClosed ?? false;
  const isOpen = storeStatus?.isOpen ?? false;
  const isInactive = storeStatus?.isInactive ?? false;
  const canToggle = !isInactive && !!toggleStoreStatus;

  // Estado local para controle visual imediato do toggle
  const [localToggleState, setLocalToggleState] = useState<boolean | null>(null);

  // Sincronizar estado local com o status quando mudar
  useEffect(() => {
    if (storeStatus && !togglingStoreStatus) {
      setLocalToggleState(null); // Reset quando não está fazendo toggle
    }
  }, [storeStatus, togglingStoreStatus]);

  // Valor do checked: usar estado local se estiver definido, senão usar o status
  const toggleChecked = localToggleState !== null ? localToggleState : Boolean(isTemporarilyClosed);

  // Debug: Log do status para verificar valores
  useEffect(() => {
    if (storeStatus) {
      console.log('🏪 MerchantLayout - Status da loja:', {
        storeStatus,
        isTemporarilyClosed,
        isOpen,
        isInactive,
        canToggle,
        toggleChecked,
        localToggleState,
        rawIsTemporarilyClosed: storeStatus.isTemporarilyClosed,
      });
    }
  }, [storeStatus, isTemporarilyClosed, isOpen, isInactive, canToggle, toggleChecked, localToggleState]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logout realizado com sucesso', 'Até logo');
      navigate('/merchant/login');
      setMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleMenuAction = (action: string) => {
    setMenuOpen(false);
    
    switch (action) {
      case 'profile':
        navigate('/merchant/profile');
        break;
      case 'store':
        navigate('/merchant/settings');
        break;
      case 'plans':
        navigate('/merchant/plans');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Itens do menu do usuário
  const userMenuItems = [
    { id: 'profile', icon: User, label: 'Perfil', action: 'profile' },
    { id: 'store', icon: Building2, label: 'Configurações', action: 'store' },
    { id: 'plans', icon: CreditCard, label: 'Planos', action: 'plans' },
  ];

  // Filtrar itens baseado na busca
  const filteredItems = userMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Itens do menu de navegação
  const menuItems = [
    {
      title: 'Dashboard',
      href: '/merchant/dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e estatísticas',
    },
    {
      title: 'Produtos',
      href: '/merchant/products',
      icon: Package,
      description: 'Gerenciar produtos',
    },
    {
      title: 'Pedidos',
      href: '/merchant/orders',
      icon: Package,
      description: 'Gerenciar pedidos',
    },
    // {
    //   title: 'Configurações',
    //   href: '/merchant/settings',
    //   icon: Settings,
    //   description: 'Configurações da loja',
    // },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header com Navigation Menu */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Nome */}
            <div className="flex items-center gap-3">
              <Link to="/merchant/dashboard" className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Painel do Lojista
                </span>
              </Link>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden md:flex items-center flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink
                          asChild
                          className={cn(
                            navigationMenuTriggerStyle(),
                            isActive(item.href) && 'bg-accent text-accent-foreground'
                          )}
                        >
                          <Link to={item.href} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Store Status Toggle - Desktop */}
            {canToggle && storeStatus && (
              <div className="hidden md:flex items-center gap-3 mr-4">
                <Badge 
                  variant={isOpen && !isTemporarilyClosed ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    isOpen && !isTemporarilyClosed
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-red-100 text-red-800 border-red-300'
                  )}
                >
                  {isInactive 
                    ? 'Inativa' 
                    : isTemporarilyClosed 
                    ? 'Fechada Temporariamente' 
                    : isOpen 
                    ? 'Aberta' 
                    : 'Fechada'}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isTemporarilyClosed ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {isTemporarilyClosed ? 'Fechada' : 'Aberta'}
                  </span>
                  <Switch
                    checked={toggleChecked}
                    onCheckedChange={async (checked) => {
                      console.log('🔄 MerchantLayout - Toggle alterado:', {
                        checked,
                        isTemporarilyClosedAtual: isTemporarilyClosed,
                        storeStatus,
                        localToggleState,
                      });
                      // Atualizar estado local imediatamente para feedback visual
                      setLocalToggleState(checked);
                      try {
                        await toggleStoreStatus(checked);
                      } catch (error) {
                        // Se der erro, reverter estado local
                        setLocalToggleState(!checked);
                        console.error('Erro ao alterar status:', error);
                      }
                    }}
                    disabled={togglingStoreStatus || loadingStoreStatus}
                    className="scale-90"
                  />
                </div>
              </div>
            )}

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center gap-4 relative" ref={menuRef}>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {merchant && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {merchant.email?.charAt(0).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 hidden lg:block">
                      {merchant.email}
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-gray-500 transition-transform",
                      menuOpen && "rotate-180"
                    )} />
                  </>
                )}
              </Button>

              {/* Dropdown Menu com Command Style */}
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  {/* Command Header */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar opção..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Command List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {/* Email da conta */}
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Conta
                      </div>
                      <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-md">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {merchant?.email}
                          </span>
                          <span className="text-xs text-gray-500">Email da conta</span>
                        </div>
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="h-px bg-gray-200 my-1" />

                    {/* Menu Items */}
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Menu
                      </div>
                      
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleMenuAction(item.action)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Icon className="h-4 w-4 text-gray-500" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-gray-500">
                          Nenhuma opção encontrada
                        </div>
                      )}
                    </div>

                    {/* Separador */}
                    <div className="h-px bg-gray-200 my-1" />

                    {/* Logout */}
                    <div className="p-2">
                      <button
                        onClick={() => handleMenuAction('logout')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Sair</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Mobile Toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                {merchant && (
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {merchant.email?.charAt(0).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">{merchant.email}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', mainClassName)}>
        {children}
      </main>
    </div>
  );
};

