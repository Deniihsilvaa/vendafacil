/**
 * Página de gestão de produtos para merchants
 * Acessível via menu de navegação
 */

import { ProductManagement } from './ProductManagement';
import { MerchantLayout } from '@/components/layout/MerchantLayout';

export const MerchantProducts: React.FC = () => {
  return (
    <MerchantLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Gestão de Produtos</h1>
        <ProductManagement />
      </div>
    </MerchantLayout>
  );
};

