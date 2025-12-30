/**
 * Modal para exibir informações de endereço do cliente
 * Componente puramente de UI
 */

import React from 'react';
import { Modal } from '@/components/ui';
import type { MerchantCustomerAddress } from '@/types/merchant/customer';
import { MapPin, Home, Briefcase, Building2 } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: MerchantCustomerAddress | null;
  customerName?: string;
}

const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'home':
      return Home;
    case 'work':
      return Briefcase;
    default:
      return Building2;
  }
};

const getAddressTypeLabel = (type: string) => {
  switch (type) {
    case 'home':
      return 'Casa';
    case 'work':
      return 'Trabalho';
    default:
      return 'Outro';
  }
};

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  address,
  customerName,
}) => {
  if (!address) return null;

  const Icon = getAddressTypeIcon(address.addressType);
  const typeLabel = getAddressTypeLabel(address.addressType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerName ? `Endereço de ${customerName}` : 'Endereço'}
      size="md"
    >
      <div className="space-y-4">
        {/* Tipo de endereço */}
        <div className="flex items-center gap-2 pb-3 border-b">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm text-muted-foreground">
            {address.label || typeLabel}
          </span>
        </div>

        {/* Informações do endereço */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Endereço</p>
              <p className="text-sm font-medium">
                {address.street}, {address.number}
              </p>
              {address.complement && (
                <p className="text-sm text-muted-foreground mt-1">
                  {address.complement}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bairro</p>
              <p className="text-sm font-medium">{address.neighborhood}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CEP</p>
              <p className="text-sm font-medium">{address.zipCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cidade</p>
              <p className="text-sm font-medium">{address.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              <p className="text-sm font-medium">{address.state}</p>
            </div>
          </div>

          {address.reference && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Referência</p>
              <p className="text-sm">{address.reference}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

