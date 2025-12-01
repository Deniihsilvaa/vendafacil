import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/cards';
import type { OrderListItem } from '@/types/order';
import { clsx } from 'clsx';

interface OrderCardProps {
    order: OrderListItem;
}

const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    out_for_delivery: 'Saiu para Entrega',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
};

const paymentMethodLabels: Record<string, string> = {
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    cash: 'Dinheiro'
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const statusLabel = statusLabels[order.status] || order.status;
    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
    const paymentMethodLabel = paymentMethodLabels[order.payment_method] || order.payment_method;

    return (
        <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', statusColor)}>
                        {statusLabel}
                    </span>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                    {/* Loja */}
                    {order.store_name && (
                        <div>
                            <p className="text-xs text-gray-500">Loja</p>
                            <p className="text-sm font-medium text-gray-900">{order.store_name}</p>
                        </div>
                    )}

                    {/* Método de Entrega */}
                    <div>
                        <p className="text-xs text-gray-500">Entrega</p>
                        <p className="text-sm font-medium text-gray-900">
                            {order.fulfillment_method === 'delivery' ? 'Entrega' : 'Retirada'}
                        </p>
                    </div>

                    {/* Endereço (se delivery) */}
                    {order.fulfillment_method === 'delivery' && order.delivery_street && (
                        <div>
                            <p className="text-xs text-gray-500">Endereço</p>
                            <p className="text-sm text-gray-900">
                                {order.delivery_street}, {order.delivery_number}
                                {order.delivery_neighborhood && ` - ${order.delivery_neighborhood}`}
                            </p>
                        </div>
                    )}

                    {/* Itens */}
                    <div>
                        <p className="text-xs text-gray-500">Itens</p>
                        <p className="text-sm font-medium text-gray-900">
                            {order.total_items} {order.total_items === 1 ? 'item' : 'itens'}
                        </p>
                    </div>

                    {/* Método de Pagamento */}
                    <div>
                        <p className="text-xs text-gray-500">Pagamento</p>
                        <p className="text-sm font-medium text-gray-900">{paymentMethodLabel}</p>
                        <span className={clsx(
                            'text-xs px-2 py-0.5 rounded mt-1 inline-block',
                            order.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : order.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        )}>
                            {order.payment_status === 'paid' ? 'Pago' : 
                             order.payment_status === 'pending' ? 'Pendente' : 'Falhou'}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total_amount)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
};