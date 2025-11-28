import React from 'react';
import type { Store } from '@/types/store';

interface PickupInfoProps {
  store: Store | null;
}

export const PickupInfo: React.FC<PickupInfoProps> = ({ store }) => {
  if (!store?.info.address) return null;

  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">
        Você retirará seu pedido na loja. O endereço da loja será usado para a retirada.
      </p>
      <div className="mt-2 text-sm">
        <p className="font-medium">
          {store.info.address.street}, {store.info.address.number}
        </p>
        <p className="text-muted-foreground">
          {store.info.address.neighborhood}, {store.info.address.city} - {store.info.address.state}
        </p>
        <p className="text-muted-foreground">{store.info.address.zipCode}</p>
      </div>
    </div>
  );
};

