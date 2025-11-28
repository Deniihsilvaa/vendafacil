import type { DeliveryAddress } from '@/types';
import type { Store } from '@/types/store';

type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash';
type FulfillmentMethod = 'delivery' | 'pickup';

export const validateAddress = (
  address: DeliveryAddress,
  fulfillmentMethod: FulfillmentMethod
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (fulfillmentMethod === 'delivery') {
    if (!address.street.trim()) errors.street = 'Rua é obrigatória';
    if (!address.number.trim()) errors.number = 'Número é obrigatório';
    if (!address.neighborhood.trim()) errors.neighborhood = 'Bairro é obrigatório';
    if (!address.city.trim()) errors.city = 'Cidade é obrigatória';
    if (!address.state.trim()) errors.state = 'Estado é obrigatório';
    if (!address.zipCode.trim()) errors.zipCode = 'CEP é obrigatório';
    
    const zipCodeRegex = /^\d{5}-?\d{3}$/;
    if (address.zipCode && !zipCodeRegex.test(address.zipCode.replace(/\D/g, ''))) {
      errors.zipCode = 'CEP inválido';
    }
  }

  return errors;
};

export const isPaymentMethodAccepted = (
  method: PaymentMethod,
  store: Store | null
): boolean => {
  if (!store) return false;
  const accepts = store.settings.acceptsPayment;
  return (
    (method === 'credit_card' && accepts.creditCard) ||
    (method === 'debit_card' && accepts.debitCard) ||
    (method === 'pix' && accepts.pix) ||
    (method === 'cash' && accepts.cash)
  );
};

export const isFulfillmentMethodEnabled = (store: Store | null): boolean => {
  if (!store) return false;
  return true; // TODO: Implementar validação baseada nas configurações da loja
};

