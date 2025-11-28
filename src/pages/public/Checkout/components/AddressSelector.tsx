import React from 'react';
import { Home, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Customer } from '@/types/auth';

interface AddressSelectorProps {
  customer: Customer;
  selectedAddressType: 'home' | 'work' | null;
  onSelect: (type: 'home' | 'work') => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  customer,
  selectedAddressType,
  onSelect,
}) => {
  const hasAddresses = customer.addresses && (customer.addresses.home || customer.addresses.work);
  
  if (!hasAddresses) return null;

  return (
    <div className="space-y-3 pb-4 border-b">
      <label className="text-sm font-medium text-foreground">
        Escolha o endereço de entrega
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {customer.addresses?.home && (
          <button
            type="button"
            onClick={() => onSelect('home')}
            className={`p-3 border-2 rounded-lg transition-all text-left ${
              selectedAddressType === 'home'
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Casa</span>
              {customer.addresses.home.isDefault && (
                <Badge variant="default" className="text-xs">Padrão</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {customer.addresses.home.street}, {customer.addresses.home.number}
            </p>
          </button>
        )}
        {customer.addresses?.work && (
          <button
            type="button"
            onClick={() => onSelect('work')}
            className={`p-3 border-2 rounded-lg transition-all text-left ${
              selectedAddressType === 'work'
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Trabalho</span>
              {customer.addresses.work.isDefault && (
                <Badge variant="default" className="text-xs">Padrão</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {customer.addresses.work.street}, {customer.addresses.work.number}
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

