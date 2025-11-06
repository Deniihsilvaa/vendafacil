import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { StoreLayout } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import { useAuthContext, useStoreContext } from '@/contexts';
import { formatPrice } from '@/utils';
import { MapPin, Home, Briefcase, Package, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import type { Order } from '@/types';

// Mock de pedidos - em produção viria da API
const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: '1',
    storeId: 'burger-house',
    items: [
      {
        product: {
          id: 'burger-classic',
          name: 'Classic Burger',
          description: 'Pão brioche, hambúrguer 150g, queijo cheddar',
          price: 28.90,
          category: 'Hambúrguers',
          storeId: 'burger-house',
          isActive: true,
          customizations: [],
          preparationTime: 20,
        },
        quantity: 2,
        customizations: [],
        totalPrice: 57.80,
      },
    ],
    totalAmount: 63.70,
    deliveryFee: 5.90,
    status: 'delivered',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    deliveryAddress: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      zipCode: '01234-567',
      complement: 'Apto 45',
    },
    estimatedDeliveryTime: '30-45 min',
    createdAt: '2024-11-15T18:30:00Z',
    updatedAt: '2024-11-15T19:15:00Z',
  },
];

const getStatusBadge = (status: Order['status']) => {
  const statusConfig = {
    pending: { label: 'Pendente', variant: 'default' as const, icon: Clock },
    confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle },
    preparing: { label: 'Preparando', variant: 'default' as const, icon: Loader },
    ready: { label: 'Pronto', variant: 'default' as const, icon: CheckCircle },
    out_for_delivery: { label: 'Saiu para entrega', variant: 'default' as const, icon: Package },
    delivered: { label: 'Entregue', variant: 'default' as const, icon: CheckCircle },
    cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const formatAddress = (address: typeof mockOrders[0]['deliveryAddress']) => {
  return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.zipCode}`;
};

export const CustomerProfile: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, isCustomer } = useAuthContext();
  const { currentStore } = useStoreContext();

  // Redirecionar se não estiver logado ou não for cliente
  if (!user || !isCustomer) {
    return <Navigate to={storeId ? `/loja/${storeId}` : '/'} replace />;
  }

  // Type guard: após verificar isCustomer, sabemos que user é Customer
  const customer = user as import('@/types').Customer;
  
  // Filtrar pedidos desta loja
  const storeOrders = storeId 
    ? mockOrders.filter(order => order.storeId === storeId)
    : [];

  return (
    <StoreLayout showSearch={false}>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header do Perfil */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>

        {/* Informações Pessoais */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-base font-medium mt-1">{customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p className="text-base font-medium mt-1">{customer.phone}</p>
            </div>
          </div>
        </Card>

        {/* Endereços */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Endereços</h2>
          <div className="space-y-4">
            {/* Endereço Casa */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="font-semibold">Casa</span>
                {customer.addresses?.home && (
                  <Badge variant="outline" className="ml-auto">Padrão</Badge>
                )}
              </div>
              {customer.addresses?.home ? (
                <div className="pl-7 space-y-1">
                  <p className="text-sm">{formatAddress(customer.addresses.home)}</p>
                  {customer.addresses.home.reference && (
                    <p className="text-xs text-muted-foreground">
                      Referência: {customer.addresses.home.reference}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pl-7">Nenhum endereço cadastrado</p>
              )}
            </div>

            {/* Endereço Trabalho */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-semibold">Trabalho</span>
              </div>
              {customer.addresses?.work ? (
                <div className="pl-7 space-y-1">
                  <p className="text-sm">{formatAddress(customer.addresses.work)}</p>
                  {customer.addresses.work.reference && (
                    <p className="text-xs text-muted-foreground">
                      Referência: {customer.addresses.work.reference}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pl-7">Nenhum endereço cadastrado</p>
              )}
            </div>

            <Button variant="outline" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Adicionar/Editar Endereços
            </Button>
          </div>
        </Card>

        {/* Histórico de Pedidos */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pedidos {currentStore ? `na ${currentStore.name}` : ''}
          </h2>
          
          {storeOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Você ainda não fez pedidos nesta loja</p>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="mt-4"
              >
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {storeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">Pedido #{order.id.split('-')[1]}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-2 pt-4 border-t">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Total e Endereço */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(order.totalAmount - order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span>{formatPrice(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {formatAddress(order.deliveryAddress)}
                      </p>
                    </div>
                  </div>

                  {/* Status de Pagamento */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pagamento</span>
                      <Badge 
                        variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                      >
                        {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'} • {
                          order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                          order.paymentMethod === 'debit_card' ? 'Cartão de Débito' :
                          order.paymentMethod === 'pix' ? 'PIX' :
                          'Dinheiro'
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </StoreLayout>
  );
};
