import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import type { Store } from '@/types/store';

interface CheckoutConfirmationProps {
  store: Store | null;
  onBackToStore: () => void;
}

export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  store,
  onBackToStore,
}) => {
  return (
    <Card>
      <CardContent>
        <div className="text-center space-y-6 py-8">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
            <p className="text-muted-foreground">
              Seu pedido foi recebido e está sendo preparado.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Tempo estimado de entrega:
            </p>
            <p className="text-lg font-semibold">
              {store?.settings.deliveryTime || '30-45 min'}
            </p>
          </div>
          <Button
            onClick={onBackToStore}
            className="w-full sm:w-auto"
            size="lg"
          >
            Fazer Novo Pedido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

