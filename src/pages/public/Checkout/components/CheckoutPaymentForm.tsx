import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/forms';
import type { PaymentMethod } from '../types';

interface CheckoutPaymentFormProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  observations: string;
  onObservationsChange: (observations: string) => void;
  onBack: () => void;
  onFinalize: () => void;
  loading: boolean;
}

export const CheckoutPaymentForm: React.FC<CheckoutPaymentFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  observations,
  onObservationsChange,
  onBack,
  onFinalize,
  loading,
}) => {
  const paymentMethods: PaymentMethod[] = ['pix', 'credit_card', 'debit_card', 'cash'];

  const getMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      cash: 'Dinheiro',
    };
    return labels[method];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method}
            onClick={() => onPaymentMethodChange(method)}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === method
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <CreditCard className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">{getMethodLabel(method)}</div>
          </button>
        ))}
      </div>

      <Textarea
        label="Observações do pedido (opcional)"
        placeholder="Sem cebola, ponto da carne, etc."
        value={observations}
        onChange={(e) => onObservationsChange(e.target.value)}
        rows={3}
      />

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          onClick={onFinalize}
          className="flex-1"
          size="lg"
          loading={loading}
        >
          Finalizar Pedido
        </Button>
      </div>
    </div>
  );
};

