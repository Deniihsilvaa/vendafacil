/**
 * Layout específico para área do merchant (lojista)
 * Baseado no Layout.tsx mas simplificado, sem carrinho/favoritos
 * Usa Navigation Menu do Shadcn na barra superior
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
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
import { useAuthContext } from '@/contexts';
import { cn } from '@/utils';
import { showSuccessToast } from '@/utils/toast';

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
  const { user, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logout realizado com sucesso', 'Até logo');
      navigate('/merchant/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

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
    {
      title: 'Configurações',
      href: '/merchant/settings',
      icon: Settings,
      description: 'Configurações da loja',
    },
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

            {/* User Menu e Logout - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 hidden lg:block">
                    {user.email}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
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
                {user && (
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">{user.email}</span>
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

