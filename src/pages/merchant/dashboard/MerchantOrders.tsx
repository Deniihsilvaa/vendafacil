/**
 * Componente de gestão de pedidos para merchants
 * Mostra pedidos filtrados por status com ações de confirmar, rejeitar e atualizar status
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle, X, Package, MapPin, Phone, User } from 'lucide-react';
import { useMerchantAuth } from '@/contexts';
import { OrderService } from '@/services/orders/orderService';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { formatPrice } from '@/utils';
import { cn } from '@/utils';
import type { OrderListItem } from '@/types/order';

interface MerchantOrdersProps {
  activeTab: 'novos' | 'preparo' | 'prontos' | 'concluidos';
}

export const MerchantOrders: React.FC<MerchantOrdersProps> = ({ activeTab }) => {
  const { merchant } = useMerchantAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
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

  // Mapear tabs para status da API
  const statusMap = useMemo<Record<string, string | string[]>>(() => ({
    novos: 'pending',
    preparo: ['confirmed', 'preparing'],
    prontos: 'ready',
    concluidos: ['delivered', 'cancelled'],
  }), []);

  // Carregar pedidos
  const loadOrders = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const statusFilter = statusMap[activeTab];
      
      // Se for array, buscar múltiplos status
      let response;
      if (Array.isArray(statusFilter)) {
        // Buscar todos os status e filtrar localmente
        response = await OrderService.getOrders({
          storeId,
          page: pagination.page,
          limit: pagination.limit,
        });
        
        // Filtrar por status
        response.data.items = response.data.items.filter(order => 
          statusFilter.includes(order.status)
        );
      } else {
        response = await OrderService.getOrders({
          storeId,
          status: statusFilter,
          page: pagination.page,
          limit: pagination.limit,
        });
      }

      // Verificar se a resposta tem a estrutura esperada
      if (!response || !response.data) {
        console.error('Resposta inválida:', response);
        throw new Error('Resposta inválida da API');
      }

      if (!response.data.items || !Array.isArray(response.data.items)) {
        console.error('Estrutura de resposta inválida:', response.data);
        throw new Error('Estrutura de resposta inválida: items não encontrado');
      }

      if (!response.data.pagination) {
        console.error('Estrutura de resposta inválida: pagination não encontrado:', response.data);
        throw new Error('Estrutura de resposta inválida: pagination não encontrado');
      }

      setOrders(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      console.error('Detalhes do erro:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      showErrorToast(error as Error, 'Erro ao carregar pedidos');
      setOrders([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, activeTab, pagination.page, pagination.limit, statusMap]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Callbacks para real-time updates
  const handleNewOrder = useCallback((order: OrderListItem) => {
    // Verificar se o pedido pertence à loja e ao status atual
    if (order.store_id !== storeId) return;
    
    const statusFilter = statusMap[activeTab];
    const matchesFilter = Array.isArray(statusFilter) 
      ? statusFilter.includes(order.status)
      : order.status === statusFilter;
    
    if (matchesFilter) {
      setOrders(prev => {
        // Verificar se já existe
        const exists = prev.find(o => o.id === order.id);
        if (exists) return prev;
        return [order, ...prev];
      });
    }
  }, [storeId, activeTab, statusMap]);

  const handleOrderUpdated = useCallback((order: OrderListItem) => {
    if (order.store_id !== storeId) return;
    
    const statusFilter = statusMap[activeTab];
    const matchesFilter = Array.isArray(statusFilter) 
      ? statusFilter.includes(order.status)
      : order.status === statusFilter;
    
    if (matchesFilter) {
      // Adicionar ou atualizar na lista
      setOrders(prev => {
        const exists = prev.find(o => o.id === order.id);
        if (exists) {
          return prev.map(o => o.id === order.id ? order : o);
        }
        return [order as OrderListItem, ...prev];
      });
    } else {
      // Remover se não corresponde mais ao filtro
      setOrders(prev => prev.filter(o => o.id !== order.id));
    }
  }, [storeId, activeTab, statusMap]);

  const handleOrderDeleted = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  // Integrar Supabase Real-time
  useRealtimeOrders({
    userType: 'merchant',
    storeId: storeId || undefined,
    onNewOrder: handleNewOrder,
    onOrderUpdated: handleOrderUpdated,
    onOrderDeleted: handleOrderDeleted,
    enabled: !!storeId,
  });

  // Ações
  const handleConfirm = async (order: OrderListItem) => {
    if (!storeId) return;
    
    try {
      await OrderService.confirmOrder(storeId, order.id);
      showSuccessToast('Pedido confirmado com sucesso!', 'Pedido Confirmado');
      loadOrders();
    } catch {
      // Erro já é tratado no OrderService
    }
  };

  const handleReject = async (order: OrderListItem) => {
    if (!storeId) return;
    
    const reason = prompt('Motivo da rejeição:');
    if (!reason || !reason.trim()) {
      showErrorToast(new Error('Motivo é obrigatório'), 'Erro');
      return;
    }

    try {
      await OrderService.rejectOrder(storeId, order.id, {
        reason: reason.trim(),
      });
      showSuccessToast('Pedido rejeitado', 'Pedido Rejeitado');
      loadOrders();
    } catch {
      // Erro já é tratado no OrderService
    }
  };

  const handleUpdateStatus = async (order: OrderListItem, newStatus: 'preparing' | 'ready' | 'out_for_delivery' | 'delivered') => {
    if (!storeId) return;

    try {
      await OrderService.updateOrderStatus(storeId, order.id, {
        status: newStatus,
      });
      showSuccessToast(`Status atualizado para: ${getStatusLabel(newStatus)}`, 'Status Atualizado');
      loadOrders();
    } catch {
      // Erro já é tratado no OrderService
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Em Preparo',
      ready: 'Pronto',
      out_for_delivery: 'Saiu para Entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-blue-500',
      confirmed: 'bg-yellow-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      out_for_delivery: 'bg-purple-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!storeId) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhuma loja encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        // Skeleton Loading
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p>Nenhum pedido encontrado nesta categoria</p>
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <Badge className={cn('text-white', getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{order.customer_name || 'Cliente'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{order.customer_phone || 'N/A'}</span>
                    </div>
                    {order.fulfillment_method === 'delivery' && order.delivery_street && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {order.delivery_street}, {order.delivery_number} - {order.delivery_neighborhood}
                        </span>
                      </div>
                    )}
                    {order.fulfillment_method === 'pickup' && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Retirada no balcão</span>
                      </div>
                    )}
                  </div>

                  {order.observations && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{order.observations}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items_count || 0} item(s) • Total: {order.total_items || 0} unidades
                      </p>
                      <p className="text-xl font-bold text-green-600 mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {order.payment_method === 'credit_card' ? '💳 Cartão' :
                         order.payment_method === 'debit_card' ? '💳 Débito' :
                         order.payment_method === 'pix' ? '📱 PIX' :
                         order.payment_method === 'cash' ? '💵 Dinheiro' : order.payment_method}
                      </Badge>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações baseadas no status */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {order.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleConfirm(order)}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Pedido
                    </Button>
                    <Button
                      onClick={() => handleReject(order)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <Button
                    onClick={() => handleUpdateStatus(order, 'preparing')}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Iniciar Preparo
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    onClick={() => handleUpdateStatus(order, 'ready')}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    Marcar como Pronto
                  </Button>
                )}
                {order.status === 'ready' && order.fulfillment_method === 'delivery' && (
                  <Button
                    onClick={() => handleUpdateStatus(order, 'out_for_delivery')}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    Saiu para Entrega
                  </Button>
                )}
                {(order.status === 'ready' || order.status === 'out_for_delivery') && (
                  <Button
                    onClick={() => handleUpdateStatus(order, 'delivered')}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    Marcar como Entregue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} pedidos)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

