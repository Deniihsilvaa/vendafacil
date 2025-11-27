/**
 * Página de confirmação/detalhes do pedido
 * Exibe os detalhes completos do pedido incluindo itens
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, CreditCard, Package, Loader2, Store, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { Badge } from '@/components/ui/badge';
import { OrderService, type OrderDetail } from '@/services/orderService';
import { formatPrice } from '@/utils/format';

// Mapeamento de status para exibição
const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  preparing: { label: 'Preparando', variant: 'default' },
  ready: { label: 'Pronto', variant: 'default' },
  out_for_delivery: { label: 'Saiu para entrega', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

// Mapeamento de método de pagamento
const paymentMethodMap: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  cash: 'Dinheiro',
};

export const OrderConfirmation: React.FC = () => {
  const { orderId, storeId } = useParams<{ orderId: string; storeId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('ID do pedido não informado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await OrderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Erro ao buscar pedido:', err);
        setError('Não foi possível carregar os detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleBackToStore = () => {
    navigate(storeId ? `/loja/${storeId}` : '/');
  };

  const handleViewOrders = () => {
    navigate(storeId ? `/loja/${storeId}/perfil` : '/perfil');
  };

  if (loading) {
    return (
      <Layout variant="public" showBanner={false} showFooter={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout variant="public" showBanner={false} showFooter={false}>
        <div className="max-w-lg mx-auto py-8 px-4">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">{error || 'Pedido não encontrado'}</p>
              <Button onClick={handleBackToStore}>Voltar para a loja</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const status = statusMap[order.status] || { label: order.status, variant: 'secondary' as const };

  return (
      <div className="min-h-screen bg-background">
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToStore} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-sm">Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('pt-BR', { 
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                })}
              </p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Status Card */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">Pedido Confirmado!</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Seu pedido foi recebido e está sendo processado.
              </p>
            </div>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-3">
            {/* Loja */}
            {order.store && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loja</span>
                </div>
                <p className="text-sm font-medium truncate">{order.store.name}</p>
              </div>
            )}

            {/* Tempo Estimado */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Previsão</span>
              </div>
              <p className="text-sm font-medium">
                {order.estimatedDeliveryTime 
                  ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '30-45 min'}
              </p>
            </div>

            {/* Pagamento */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pagamento</span>
              </div>
              <p className="text-sm font-medium">{paymentMethodMap[order.paymentMethod] || order.paymentMethod}</p>
            </div>

            {/* Entrega/Retirada */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tipo</span>
              </div>
              <p className="text-sm font-medium">
                {order.fulfillmentMethod === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
              </p>
            </div>
          </div>

          {/* Endereço de entrega */}
          {order.fulfillmentMethod === 'delivery' && order.deliveryAddress && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Entregar em</span>
              </div>
              <p className="text-sm">
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
                {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} - {order.deliveryAddress.state}
              </p>
            </div>
          )}

          {/* Itens do Pedido */}
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 border-b">
                <p className="text-sm font-medium">Itens ({order.totalItemsQuantity || order.orderItems.length})</p>
              </div>
              <div className="divide-y">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3">
                    {/* Imagem do produto */}
                    {item.productImageUrl ? (
                      <img 
                        src={item.productImageUrl} 
                        alt={item.productName}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Detalhes do item */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {formatPrice(item.unitPrice)}
                      </p>
                      
                      {/* Customizações */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-1">
                          {item.customizations.map((custom, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              + {custom.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Preço total do item */}
                    <p className="font-semibold text-sm shrink-0">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações do Pedido */}
          {order.observations && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">Observações</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">{order.observations}</p>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.totalAmount - (order.deliveryFee || 0))}</span>
            </div>
            {order.fulfillmentMethod === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span>
                  {order.deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Grátis</span>
                  ) : (
                    formatPrice(order.deliveryFee)
                  )}
                </span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <Button onClick={handleViewOrders} variant="outline" size="sm">
              Ver pedidos
            </Button>
            <Button onClick={handleBackToStore} size="sm">
              Novo pedido
            </Button>
          </div>
        </div>
      </div>
  );
};

export default OrderConfirmation;
