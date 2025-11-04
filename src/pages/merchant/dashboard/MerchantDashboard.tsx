import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface OrderStats {
  novos: number;
  emPreparo: number;
  prontos: number;
  hoje: number;
}

interface Order {
  id: string;
  numero: string;
  horario: string;
  telefone: string;
  status: 'novo' | 'preparo' | 'pronto' | 'concluido';
  items: {
    quantidade: number;
    nome: string;
    descricao: string;
  }[];
  total: number;
  tempoEstimado: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    numero: 'ORD-001',
    horario: '13:51',
    telefone: '(11) 98745-4321',
    status: 'novo',
    items: [
      {
        quantidade: 2,
        nome: 'Poke Salmão Tradicional',
        descricao: 'Base: Shari (Arroz Japonês)\nProteína: Salmão Premium\nToppings: Edamame, Gergelim\nMolho: Shoyu'
      }
    ],
    total: 79.80,
    tempoEstimado: '60-80 min'
  }
];

const StatCard = ({ title, count, icon: Icon, color }: {
  title: string;
  count: number;
  icon: any;
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

const OrderCard = ({ order }: { order: Order }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="font-semibold">Pedido #{order.numero}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {order.horario}
          </span>
          <span>{order.telefone}</span>
        </div>
      </div>
      <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
        Novo
      </span>
    </div>

    <div className="space-y-2 mb-4">
      {order.items.map((item, index) => (
        <div key={index}>
          <p className="font-medium">
            {item.quantidade}x {item.nome}
          </p>
          <p className="text-sm text-gray-600 whitespace-pre-line ml-4">
            {item.descricao}
          </p>
        </div>
      ))}
    </div>

    <div className="text-orange-600 text-sm mb-4 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      Menos picante por favor
    </div>

    <div className="flex items-center justify-between mb-4">
      <span className="text-lg font-bold text-green-600">
        R$ {order.total.toFixed(2).replace('.', ',')}
      </span>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        Tempo estimado: {order.tempoEstimado}
      </div>
    </div>

    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
      Aceitar Pedido
    </button>
  </div>
);

export const MerchantDashboard = () => {
  const [activeMainTab, setActiveMainTab] = useState<'pedidos' | 'cardapio'>('pedidos');
  const [activeOrderTab, setActiveOrderTab] = useState<'novos' | 'preparo' | 'prontos' | 'concluidos'>('novos');

  const stats: OrderStats = {
    novos: 1,
    emPreparo: 1,
    prontos: 1,
    hoje: 3
  };

  const orderCounts = {
    novos: 1,
    preparo: 1,
    prontos: 1,
    concluidos: 0
  };

  const filteredOrders = mockOrders.filter(order => {
    switch (activeOrderTab) {
      case 'novos': return order.status === 'novo';
      case 'preparo': return order.status === 'preparo';
      case 'prontos': return order.status === 'pronto';
      case 'concluidos': return order.status === 'concluido';
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center font-bold text-sm">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold">KAMPAI - Painel Lojista</h1>
            <p className="text-sm opacity-90">Gestão de Pedidos e Cardápio</p>
          </div>
        </div>
      </div>

      <div className="p-4">
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

        {/* Main Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveMainTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeMainTab === 'pedidos'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600'
            }`}
          >
            Pedidos
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              {stats.novos}
            </span>
          </button>
          <button
            onClick={() => setActiveMainTab('cardapio')}
            className={`px-4 py-2 font-medium ${
              activeMainTab === 'cardapio'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600'
            }`}
          >
            Gestão de Cardápio
          </button>
        </div>

        {/* Order Tabs */}
        {activeMainTab === 'pedidos' && (
          <>
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
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido encontrado nesta categoria
                </div>
              )}
            </div>
          </>
        )}

        {/* Cardápio Tab Content */}
        {activeMainTab === 'cardapio' && (
          <div className="text-center py-8 text-gray-500">
            Gestão de Cardápio em desenvolvimento
          </div>
        )}
      </div>
    </div>
  );
};
