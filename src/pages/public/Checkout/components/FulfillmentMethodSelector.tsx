import React from 'react';
import { Truck, Store } from 'lucide-react';
import type { FulfillmentMethod } from '../types';

interface FulfillmentMethodSelectorProps {
  fulfillmentMethod: FulfillmentMethod;
  onSelect: (method: FulfillmentMethod) => void;
  isStoreActive?: boolean;
}

export const FulfillmentMethodSelector: React.FC<FulfillmentMethodSelectorProps> = ({
  fulfillmentMethod,
  onSelect,
  isStoreActive = true,
}) => {
  if (!isStoreActive) return null;

  return (
    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
      <button
        onClick={() => onSelect('delivery')}
        className={`p-4 border-2 rounded-lg transition-all ${
          fulfillmentMethod === 'delivery'
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/50'
        }`}
      >
        <Truck className="h-6 w-6 mx-auto mb-2" />
        <div className="text-sm font-medium">Entrega</div>
      </button>
      <button
        onClick={() => onSelect('pickup')}
        className={`p-4 border-2 rounded-lg transition-all ${
          fulfillmentMethod === 'pickup'
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/50'
        }`}
      >
        <Store className="h-6 w-6 mx-auto mb-2" />
        <div className="text-sm font-medium">Retirada</div>
      </button>
    </div>
  );
};

