
// components/OrdersList.tsx
import { useState, useEffect, useMemo } from 'react';
import { StoreLayout } from '@/components/layout';
import { useOrders } from '@/hooks/useOrders';
import { LoadingState } from '@/components/shared/LoadingState';
import { OrderCard } from '@/components/business/order/OrderCard';
import type { OrderListItem } from '@/types/order';

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
    storeId,
    customerId,
    statusFilter
}) => {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(
        statusFilter || null
    );

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

    // Atualizar status quando a prop mudar
    useEffect(() => {
        if (statusFilter !== undefined) {
            setSelectedStatus(statusFilter || null);
        }
    }, [statusFilter]);

    // Filtrar pedidos por status
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        
        // Se orders é um array direto (formato antigo do OrderService)
        if (Array.isArray(orders)) {
            if (!selectedStatus) return orders;
            return orders.filter((order: OrderListItem | { status?: string }) => {
                const orderStatus = order.status || (order as OrderListItem).status;
                return orderStatus === selectedStatus;
            });
        }
        
        // Se orders tem estrutura { items, pagination } ou { data: { items, pagination } }
        const ordersData = orders as { items?: OrderListItem[]; data?: { items?: OrderListItem[] } };
        const items = ordersData?.items || ordersData?.data?.items || [];
        if (!selectedStatus) return items;
        
        return items.filter((order: OrderListItem) => order.status === selectedStatus);
    }, [orders, selectedStatus]);

    const handleStatusFilter = (status: string | null) => {
        setSelectedStatus(status);
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
        <StoreLayout showSearch={false} showDescription={false} showheader={true} >
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-background">
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
                {filteredOrders.length === 0 ? (
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

