import React from 'react';
import { Layout } from './Layout';
import type { StoreLayoutProps } from '@/types/layout';
/**
 * @deprecated Use Layout component with variant="store" instead
 * StoreLayout mantido para compatibilidade retroativa
 */


export const StoreLayout: React.FC<StoreLayoutProps> = ({
  children,
  showSearch = true,
  onSearch,
  showDescription = true,
  showheader = true,
  showActions = {
    favorites: false,
    cart: false,
    profile: false,
  },
  showBanner = true,
  showFooter = true,
}) => {
  
  return (
    <Layout
      variant="store"
      showSearch={showSearch}
      onSearch={onSearch}
      showDescription={showDescription}
      showheader={showheader}
        showActions={{
          favorites: showActions.favorites,
          cart: showActions.cart,
          profile: showActions.profile,
        }}
      showBanner={showBanner}
      showFooter={showFooter}
    >
      {children}
    </Layout>
  );
};
