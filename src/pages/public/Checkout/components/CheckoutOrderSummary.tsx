import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { formatPrice } from '@/utils';
import type { CartItem } from '@/types/product';
import type { FulfillmentMethod, CheckoutStep } from '../types';
import type { DeliveryAddress } from '@/types';
import { calculateDelivery } from '../utils/checkoutCalculations';
import type { Store } from '@/types/store';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
  fulfillmentMethod: FulfillmentMethod;
  address: DeliveryAddress;
  step: CheckoutStep;
  store: Store | null;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  totalAmount,
  fulfillmentMethod,
  address,
  step,
  store,
}) => {
  const { finalDeliveryFee, freeDeliveryAbove, finalTotal } = calculateDelivery(
    fulfillmentMethod,
    totalAmount,
    store
  );

  return (
    <Card className="sticky top-24">
      <CardHeader title="Resumo do Pedido" />
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity}x {formatPrice(item.product.price)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {fulfillmentMethod === 'delivery' && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>
                    {finalDeliveryFee === 0 ? (
                      <Badge variant="secondary">Grátis</Badge>
                    ) : (
                      formatPrice(finalDeliveryFee)
                    )}
                  </span>
                </div>
                {finalDeliveryFee === 0 && totalAmount < freeDeliveryAbove && freeDeliveryAbove > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Frete grátis acima de {formatPrice(freeDeliveryAbove)}
                  </p>
                )}
              </>
            )}
            {fulfillmentMethod === 'pickup' && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Retirada na loja</span>
                <Badge variant="secondary">Sem taxa</Badge>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {(step === 2 || step === 3) && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{address.street}, {address.number}</p>
                  <p className="text-muted-foreground">
                    {address.neighborhood}, {address.city}
                  </p>
                  <p className="text-muted-foreground">{address.zipCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

