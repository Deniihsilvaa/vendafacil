import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { MerchantOrders } from './MerchantOrders';
import { OrderService } from '@/services/orders/orderService';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

const StatCard = ({ title, count, icon: Icon, color }: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{count}</p>
        {title === "Hoje" && (
          <p className="text-gray-400 text-xs mt-1">pedidos total</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

export const MerchantDashboard = () => {
  const { merchant } = useMerchantAuth();
  const [activeOrderTab, setActiveOrderTab] = useState<'novos' | 'preparo' | 'prontos' | 'concluidos'>('novos');
  const [stats, setStats] = useState({
    novos: 0,
    emPreparo: 0,
    prontos: 0,
    hoje: 0,
  });
  const [orderCounts, setOrderCounts] = useState({
    novos: 0,
    preparo: 0,
    prontos: 0,
    concluidos: 0,
  });

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
      console.error('Erro ao ler localStorage:', error);
    }

    // Fallback: usar do contexto
    if (!merchant || !('stores' in merchant) || !merchant.stores) {
      return null;
    }
    if (merchant.stores.length === 1) {
      return merchant.stores[0].id;
    }
    const activeStore = merchant.stores.find(store => store.is_active);
    return activeStore?.id || merchant.stores[0]?.id || null;
  }, [merchant]);

  // Função para carregar todos os pedidos e calcular estatísticas
  const loadAllOrders = useCallback(async () => {
    if (!storeId) {
      return;
    }

    try {
      // Buscar todos os pedidos para calcular estatísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const tomorrowISO = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const [pendingRes, confirmedRes, preparingRes, readyRes, todayRes, deliveredRes, cancelledRes] = await Promise.all([
        OrderService.getOrders({ storeId, status: 'pending', limit: 1000 }),
        OrderService.getOrders({ storeId, status: 'confirmed', limit: 1000 }),
        OrderService.getOrders({ storeId, status: 'preparing', limit: 1000 }),
        OrderService.getOrders({ storeId, status: 'ready', limit: 1000 }),
        OrderService.getOrders({ storeId, startDate: todayISO, endDate: tomorrowISO, limit: 1000 }),
        OrderService.getOrders({ storeId, status: 'delivered', limit: 1000 }),
        OrderService.getOrders({ storeId, status: 'cancelled', limit: 1000 }),
      ]);

      // Calcular estatísticas diretamente
      // Verificar se as respostas têm a estrutura esperada
      const novos = pendingRes?.data?.items?.length || 0;
      const emPreparo = (confirmedRes?.data?.items?.length || 0) + (preparingRes?.data?.items?.length || 0);
      const prontos = readyRes?.data?.items?.length || 0;
      const hoje = todayRes?.data?.items?.length || 0;
      const concluidos = (deliveredRes?.data?.items?.length || 0) + (cancelledRes?.data?.items?.length || 0);

      setStats({ novos, emPreparo, prontos, hoje });
      setOrderCounts({
        novos,
        preparo: emPreparo,
        prontos,
        concluidos,
      });
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }, [storeId]);

  // Carregar pedidos inicialmente
  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // Callbacks para real-time updates
  const handleNewOrder = useCallback(() => {
    // Recarregar estatísticas quando novo pedido chegar
    loadAllOrders();
  }, [loadAllOrders]);

  const handleOrderUpdated = useCallback(() => {
    // Recarregar estatísticas quando pedido for atualizado
    loadAllOrders();
  }, [loadAllOrders]);

  const handleOrderDeleted = useCallback(() => {
    // Recarregar estatísticas quando pedido for deletado
    loadAllOrders();
  }, [loadAllOrders]);

  // Integrar Supabase Real-time
  useRealtimeOrders({
    userType: 'merchant',
    storeId: storeId || undefined,
    onNewOrder: handleNewOrder,
    onOrderUpdated: handleOrderUpdated,
    onOrderDeleted: handleOrderDeleted,
    enabled: !!storeId,
  });

  return (
    <MerchantLayout>
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Novos Pedidos"
            count={stats.novos}
            icon={AlertCircle}
            color="bg-blue-500"
          />
          <StatCard
            title="Em Preparo"
            count={stats.emPreparo}
            icon={Clock}
            color="bg-orange-500"
          />
          <StatCard
            title="Prontos"
            count={stats.prontos}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Hoje"
            count={stats.hoje}
            icon={Calendar}
            color="bg-gray-500"
          />
        </div>

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
            Novos ({orderCounts.novos})
          </button>
          <button
            onClick={() => setActiveOrderTab('preparo')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'preparo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Em Preparo ({orderCounts.preparo})
          </button>
          <button
            onClick={() => setActiveOrderTab('prontos')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'prontos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prontos ({orderCounts.prontos})
          </button>
          <button
            onClick={() => setActiveOrderTab('concluidos')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeOrderTab === 'concluidos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Concluídos ({orderCounts.concluidos})
          </button>
        </div>

        {/* Orders List */}
        <MerchantOrders activeTab={activeOrderTab} />
      </div>
    </MerchantLayout>
  );
};
