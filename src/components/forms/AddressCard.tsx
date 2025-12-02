/**
 * Componente reutilizável para exibir um card de endereço
 * Pode ser usado em listas de endereços, checkout, perfil, etc.
 */

import React from 'react';
import { Home, Briefcase, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/buttons';
import { formatZipCode } from '@/utils/format';
import { cn } from '@/utils';

export interface AddressCardData {
  id?: string;
  label?: string;
  addressType?: 'home' | 'work' | 'other';
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  reference?: string;
  isDefault?: boolean;
}

export interface AddressCardProps {
  address: AddressCardData;
  onSetDefault?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  className?: string;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onSetDefault,
  onRemove,
  onEdit,
  showActions = true,
  className = '',
}) => {
  const getAddressTypeIcon = () => {
    switch (address.addressType) {
      case 'home':
        return <Home className="h-4 w-4 text-gray-400" />;
      case 'work':
        return <Briefcase className="h-4 w-4 text-gray-400" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAddressTypeLabel = () => {
    if (address.label) return address.label;
    switch (address.addressType) {
      case 'home':
        return 'Casa';
      case 'work':
        return 'Trabalho';
      default:
        return 'Outro';
    }
  };

  return (
    <div
      className={cn(
        'p-4 border rounded-lg space-y-3',
        address.isDefault && 'border-primary bg-primary/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getAddressTypeIcon()}
          <span className="font-medium">{getAddressTypeLabel()}</span>
          {address.isDefault && (
            <Badge variant="default" className="text-xs">
              Padrão
            </Badge>
          )}
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            {!address.isDefault && onSetDefault && (
              <Button variant="ghost" size="sm" onClick={onSetDefault}>
                Definir como padrão
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Editar
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                Remover
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        {address.street}, {address.number}
        {address.complement && ` - ${address.complement}`} - {address.neighborhood}
        <br />
        {address.city} - {address.state}, {formatZipCode(address.zipCode)}
        {address.reference && (
          <>
            <br />
            <span className="text-xs text-gray-500">Ref: {address.reference}</span>
          </>
        )}
      </p>
    </div>
  );
};

