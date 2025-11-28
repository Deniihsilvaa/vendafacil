import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputWithLabel } from '@/components/ui/forms/InputWithLabel';
import { Collapsible } from '@/components/ui';
import { Info } from 'lucide-react';
import type { DeliveryAddress } from '@/types';
import type { FulfillmentMethod } from '../types';

interface CheckoutAddressFormProps {
  address: DeliveryAddress;
  setAddress: (address: DeliveryAddress | ((prev: DeliveryAddress) => DeliveryAddress)) => void;
  errors: Record<string, string>;
  isAddressFromProfile: boolean;
  addressSummary: string;
  onEnableManualEdit: () => void;
  fulfillmentMethod: FulfillmentMethod;
}

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  address,
  setAddress,
  errors,
  isAddressFromProfile,
  addressSummary,
  onEnableManualEdit,
  fulfillmentMethod,
}) => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  if (fulfillmentMethod === 'pickup') {
    return null;
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    setAddress({ ...address, zipCode: formatted });
  };

  const addressFields = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <InputWithLabel
            label="Rua"
            placeholder="Nome da rua"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            error={errors.street}
            required
            readOnly={isAddressFromProfile}
            className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>
        <InputWithLabel
          label="Número"
          placeholder="123"
          value={address.number}
          onChange={(e) => setAddress({ ...address, number: e.target.value })}
          error={errors.number}
          required
          readOnly={isAddressFromProfile}
          className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
        />
      </div>

      <InputWithLabel
        label="Bairro"
        placeholder="Nome do bairro"
        value={address.neighborhood}
        onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
        error={errors.neighborhood}
        required
        readOnly={isAddressFromProfile}
        className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputWithLabel
          label="Cidade"
          placeholder="São Paulo"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          error={errors.city}
          required
          readOnly={isAddressFromProfile}
          className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
        />
        <InputWithLabel
          label="Estado"
          placeholder="SP"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
          error={errors.state}
          maxLength={2}
          required
          readOnly={isAddressFromProfile}
          className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
        />
        <InputWithLabel
          label="CEP"
          placeholder="00000-000"
          value={address.zipCode}
          onChange={handleZipCodeChange}
          error={errors.zipCode}
          maxLength={9}
          required
          readOnly={isAddressFromProfile}
          className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
        />
      </div>

      <InputWithLabel
        label="Complemento (opcional)"
        placeholder="Apto, bloco, etc."
        value={address.complement}
        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
        readOnly={isAddressFromProfile}
        className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
      />

      <InputWithLabel
        label="Ponto de referência (opcional)"
        placeholder="Próximo ao..."
        value={address.reference}
        onChange={(e) => setAddress({ ...address, reference: e.target.value })}
        readOnly={isAddressFromProfile}
        className={isAddressFromProfile ? 'bg-muted cursor-not-allowed' : ''}
      />
    </>
  );

  if (isAddressFromProfile) {
    return (
      <Collapsible
        title={`Endereço de entrega${addressSummary ? `: ${addressSummary}` : ''}`}
        defaultOpen={false}
        className="border-muted"
      >
        <div className="space-y-4 pt-2">
          <div className="bg-muted/50 border border-muted rounded-lg p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Este endereço foi preenchido automaticamente do seu perfil. 
                Para alterar,{' '}
                <button
                  type="button"
                  onClick={onEnableManualEdit}
                  className="text-primary hover:underline font-medium"
                >
                  clique aqui para editar manualmente
                </button>
                {' '}ou{' '}
                <button
                  type="button"
                  onClick={() => navigate(storeId ? `/loja/${storeId}/perfil` : '/perfil')}
                  className="text-primary hover:underline font-medium"
                >
                  edite no seu perfil
                </button>
                .
              </p>
            </div>
          </div>
          {addressFields}
        </div>
      </Collapsible>
    );
  }

  return <div className="space-y-4">{addressFields}</div>;
};

