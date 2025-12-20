
// components/OrdersList.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { StoreLayout } from '@/components/layout';
import { useOrders } from '@/hooks/useOrders';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useAuthContext, useStoreContext } from '@/contexts';
import { LoadingState } from '@/components/shared/LoadingState';
import { OrderCard } from '@/components/business/order/OrderCard';
import { showOrderNotification } from '@/utils/toast';
import type { OrderListItem, OrdersListResponse } from '@/types/order';

interface OrdersListProps {
    storeId?: string;
    customerId?: string;
    statusFilter?: string;
}

interface StatusFilter {
    label: string;
    value: string | null; // null para "Todos"
}

const statusFilters: StatusFilter[] = [
    { label: 'Todos', value: null },
    { label: 'Pendente', value: 'pending' },
    { label: 'Confirmado', value: 'confirmed' },
    { label: 'Preparando', value: 'preparing' },
    { label: 'Pronto', value: 'ready' },
    { label: 'Entregue', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' }
];

export const OrdersList: React.FC<OrdersListProps> = ({
    storeId: propStoreId,
    customerId: propCustomerId,
    statusFilter: propStatusFilter
}) => {
    const { storeId: routeStoreId } = useParams<{ storeId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { customer } = useAuthContext();
    const { currentStore } = useStoreContext();
    
    // Obter storeId da prop, rota ou contexto
    const storeId = propStoreId || routeStoreId || currentStore?.id;
    
    // Obter customerId da prop ou do usuário autenticado
    const customerId = propCustomerId || (customer ? customer.id : undefined);
    
    // Obter statusFilter da prop ou query params
    const statusFilterFromQuery = searchParams.get('status');
    const statusFilter = propStatusFilter || statusFilterFromQuery || null;
    
    // Detectar novo pedido criado
    const newOrderId = searchParams.get('newOrder');

    const [selectedStatus, setSelectedStatus] = useState<string | null>(statusFilter);
    const [ordersList, setOrdersList] = useState<OrderListItem[]>([]);

    const {
        orders,
        loading,
        error,
        fetchOrders,
    } = useOrders({
        page: 1,
        limit: 100, // Buscar todos para filtrar no frontend
        status: selectedStatus || undefined,
        storeId,
        customerId,
    });

    // Atualizar lista local quando orders mudar
    useEffect(() => {
        if (!orders) {
            setOrdersList([]);
            return;
        }
        
        // Se orders é um array direto
        if (Array.isArray(orders)) {
            setOrdersList(orders as OrderListItem[]);
            return;
        }
        
        // Se orders tem estrutura { items, pagination }
        const ordersData = orders as OrdersListResponse | { items?: OrderListItem[]; data?: { items?: OrderListItem[] } };
        const items = (ordersData as OrdersListResponse)?.items || 
                     (ordersData as { items?: OrderListItem[] })?.items || 
                     (ordersData as { data?: { items?: OrderListItem[] } })?.data?.items || [];
        setOrdersList(items);
    }, [orders]);

    // Callbacks para real-time
    const handleOrderUpdated = useCallback((updatedOrder: OrderListItem) => {
        setOrdersList(prev => {
            const index = prev.findIndex(o => o.id === updatedOrder.id);
            if (index >= 0) {
                // Atualizar pedido existente
                const newList = [...prev];
                newList[index] = updatedOrder;
                return newList;
            }
            return prev;
        });
    }, []);

    const handleNewOrder = useCallback((newOrder: OrderListItem) => {
        setOrdersList(prev => {
            // Verificar se já existe (evitar duplicatas)
            if (prev.some(o => o.id === newOrder.id)) {
                return prev;
            }
            // Adicionar no início da lista
            return [newOrder, ...prev];
        });
        showOrderNotification('order_created', newOrder.id);
    }, []);

    const handleOrderDeleted = useCallback((orderId: string) => {
        setOrdersList(prev => prev.filter(o => o.id !== orderId));
    }, []);

    // Integrar real-time
    const { isConnected } = useRealtimeOrders({
        userId: customerId,
        userType: 'customer',
        storeId,
        onOrderUpdated: handleOrderUpdated,
        onNewOrder: handleNewOrder,
        onOrderDeleted: handleOrderDeleted,
        enabled: !!customerId && !!storeId,
    });

    // Atualizar status quando a prop ou query param mudar
    useEffect(() => {
        if (propStatusFilter !== undefined) {
            setSelectedStatus(propStatusFilter || null);
        } else if (statusFilterFromQuery) {
            setSelectedStatus(statusFilterFromQuery);
        }
    }, [propStatusFilter, statusFilterFromQuery]);

    // Detectar e processar novo pedido criado
    useEffect(() => {
        if (newOrderId) {
            // Mostrar notificação
            showOrderNotification('order_created', newOrderId);
            
            // Filtrar para mostrar pedidos confirmados
            if (!selectedStatus || selectedStatus !== 'confirmed') {
                setSelectedStatus('confirmed');
            }
            
            // Remover parâmetro da URL após processar
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('newOrder');
            setSearchParams(newSearchParams, { replace: true });
            
            // Recarregar pedidos para garantir que o novo pedido apareça
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        }
    }, [newOrderId, searchParams, setSearchParams, selectedStatus, fetchOrders]);

    // Filtrar pedidos por status
    const filteredOrders = useMemo(() => {
        if (!selectedStatus) return ordersList;
        return ordersList.filter((order: OrderListItem) => order.status === selectedStatus);
    }, [ordersList, selectedStatus]);

    const handleStatusFilter = (status: string | null) => {
        setSelectedStatus(status);
        // Atualizar query params
        const newSearchParams = new URLSearchParams(searchParams);
        if (status) {
            newSearchParams.set('status', status);
        } else {
            newSearchParams.delete('status');
        }
        window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    };

    if (loading && !orders) {
        return (
            <StoreLayout showSearch={false}>
                <LoadingState />
            </StoreLayout>
        );
    }

    if (error) {
        return (
            <StoreLayout showSearch={false}>
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => fetchOrders()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </StoreLayout>
        );
    }

    return (
        <StoreLayout showSearch={false} showDescription={false} showheader={true}>
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-background">
                {/* Header com indicador de conexão real-time */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Atualizações em tempo real</span>
                        </div>
                    )}
                </div>

                {/* Filtros de Status */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value || 'all'}
                            onClick={() => handleStatusFilter(filter.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedStatus === filter.value
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Lista de Pedidos */}
                {loading && !ordersList.length ? (
                    <LoadingState />
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => fetchOrders()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {selectedStatus 
                                ? `Nenhum pedido com status "${statusFilters.find(f => f.value === selectedStatus)?.label}" encontrado`
                                : 'Nenhum pedido encontrado'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map((order: OrderListItem) => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
};

