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
}) => {
  return (
    <Layout
      variant="store"
      showSearch={showSearch}
      onSearch={onSearch}
      showActions={{
        favorites: true,
        cart: true,
        profile: true,
      }}
      showBanner={false}
      showFooter={false}
    >
      {children}
    </Layout>
  );
};
