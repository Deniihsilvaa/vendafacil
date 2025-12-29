/**
 * Componente reutilizável para formulário de endereço
 * Pode ser usado em checkout, perfil, settings, etc.
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { formatZipCode, unformatZipCode } from '@/utils/format';

export interface AddressFormData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  reference?: string;
}

export interface AddressFormProps {
  value: AddressFormData;
  onChange: (address: AddressFormData) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
  showOptionalFields?: boolean;
  hideZipCode?: boolean;
  className?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  value,
  onChange,
  errors = {},
  showOptionalFields = true,
  hideZipCode = false,
  className = '',
}) => {
  const handleChange = (field: keyof AddressFormData, newValue: string) => {
    onChange({
      ...value,
      [field]: field === 'zipCode' ? unformatZipCode(newValue) : newValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rua */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Rua <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Rua Exemplo"
            value={value.street}
            onChange={(e) => handleChange('street', e.target.value)}
            className={errors.street ? 'border-destructive' : ''}
          />
          {errors.street && (
            <p className="text-sm text-destructive">{errors.street}</p>
          )}
        </div>

        {/* Número */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Número <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="123"
            value={value.number}
            onChange={(e) => handleChange('number', e.target.value)}
            className={errors.number ? 'border-destructive' : ''}
          />
          {errors.number && (
            <p className="text-sm text-destructive">{errors.number}</p>
          )}
        </div>

        {/* Bairro */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Bairro <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Centro"
            value={value.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            className={errors.neighborhood ? 'border-destructive' : ''}
          />
          {errors.neighborhood && (
            <p className="text-sm text-destructive">{errors.neighborhood}</p>
          )}
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Cidade <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="São Paulo"
            value={value.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Estado <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="SP"
            value={value.state}
            onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            className={errors.state ? 'border-destructive' : ''}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        {/* CEP */}
        {!hideZipCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              CEP <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="00000-000"
              value={formatZipCode(value.zipCode)}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              maxLength={9}
              className={errors.zipCode ? 'border-destructive' : ''}
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode}</p>
            )}
          </div>
        )}

        {/* Complemento - Opcional */}
        {showOptionalFields && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Complemento
            </label>
            <Input
              placeholder="Apto 101"
              value={value.complement || ''}
              onChange={(e) => handleChange('complement', e.target.value)}
              className={errors.complement ? 'border-destructive' : ''}
            />
            {errors.complement && (
              <p className="text-sm text-destructive">{errors.complement}</p>
            )}
          </div>
        )}

        {/* Referência - Opcional */}
        {showOptionalFields && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Ponto de Referência
            </label>
            <Input
              placeholder="Próximo ao mercado"
              value={value.reference || ''}
              onChange={(e) => handleChange('reference', e.target.value)}
              className={errors.reference ? 'border-destructive' : ''}
            />
            {errors.reference && (
              <p className="text-sm text-destructive">{errors.reference}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

