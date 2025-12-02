/**
 * Página de listagem de pedidos para merchants
 * Acessível via /merchant/orders
 */

import { useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { MerchantOrders } from '@/pages/merchant/dashboard/MerchantOrders';

export const MerchantOrdersPage: React.FC = () => {
  const [activeOrderTab, setActiveOrderTab] = useState<'novos' | 'preparo' | 'prontos' | 'concluidos'>('novos');

  return (
    <MerchantLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
        
        {/* Order Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveOrderTab('novos')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'novos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Novos
          </button>
          <button
            onClick={() => setActiveOrderTab('preparo')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'preparo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Em Preparo
          </button>
          <button
            onClick={() => setActiveOrderTab('prontos')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'prontos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prontos
          </button>
          <button
            onClick={() => setActiveOrderTab('concluidos')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'concluidos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Concluídos
          </button>
        </div>

        {/* Orders List */}
        <MerchantOrders activeTab={activeOrderTab} />
      </div>
    </MerchantLayout>
  );
};

