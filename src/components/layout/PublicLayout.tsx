import React from 'react';
import { Layout } from './Layout';

/**
 * @deprecated Use Layout component with variant="public" instead
 * PublicLayout mantido para compatibilidade retroativa
 */
interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout
      variant="public"
      showSearch={false}
      showActions={{
        cart: true,
      }}
      showBanner={true}
      showFooter={true}
    >
      {children}
    </Layout>
  );
};
