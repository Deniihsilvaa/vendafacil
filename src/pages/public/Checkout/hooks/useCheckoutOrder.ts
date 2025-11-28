import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { formatPrice } from '@/utils';
import { showErrorToast } from '@/utils/toast';
import { OrderService } from '@/services/orderService';
import { validateAddress, isPaymentMethodAccepted, isFulfillmentMethodEnabled } from '../utils/checkoutValidation';
import type { DeliveryAddress } from '@/types';
import type { PaymentMethod, FulfillmentMethod } from '../types';

export const useCheckoutOrder = (
  address: DeliveryAddress,
  paymentMethod: PaymentMethod,
  fulfillmentMethod: FulfillmentMethod,
  observations: string
) => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { items, totalAmount, clearCart } = useCartContext();
  const { currentStore } = useStoreContext();
  const { user, isCustomer } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndFinalize = async () => {
    if (!user || !isCustomer) {
      showErrorToast(new Error('Você precisa estar logado para finalizar o pedido'), 'Erro');
      navigate(storeId ? `/loja/${storeId}` : '/');
      return;
    }

    if (!currentStore || !storeId) {
      showErrorToast(new Error('Loja não encontrada'), 'Erro');
      return;
    }

    const addressErrors = validateAddress(address, fulfillmentMethod);
    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);
      return;
    }

    if (!isPaymentMethodAccepted(paymentMethod, currentStore)) {
      const methodNames: Record<PaymentMethod, string> = {
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        pix: 'PIX',
        cash: 'Dinheiro',
      };
      showErrorToast(new Error(`A loja não aceita pagamento via ${methodNames[paymentMethod]}`), 'Erro');
      return;
    }

    if (!isFulfillmentMethodEnabled(currentStore)) {
      const methodNames: Record<FulfillmentMethod, string> = {
        delivery: 'Entrega',
        pickup: 'Retirada',
      };
      showErrorToast(new Error(`${methodNames[fulfillmentMethod]} não está disponível para esta loja`), 'Erro');
      return;
    }

    if (totalAmount < currentStore.settings.minOrderValue) {
      showErrorToast(new Error(`Valor mínimo do pedido é ${formatPrice(currentStore.settings.minOrderValue)}`), 'Erro');
      return;
    }

    setLoading(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        observations: item.observations || undefined,
        customizations: item.customizations.length > 0 ? item.customizations.map(custom => ({
          customization_id: custom.id,
          value: custom.selectionType === 'boolean' ? 'true' : '1',
        })) : undefined,
      }));

      const order = await OrderService.createOrder({
        storeId,
        items: orderItems,
        deliveryAddress: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode.replace(/\D/g, ''),
          complement: address.complement || undefined,
        },
        paymentMethod,
        fulfillmentMethod,
        observations: observations.trim() || undefined,
      });

      console.log('Pedido criado com sucesso:', order);
      clearCart();
      navigate(`/loja/${storeId}/pedido/${order.id}`);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAddressStep = (): boolean => {
    const addressErrors = validateAddress(address, fulfillmentMethod);
    setErrors(addressErrors);
    return Object.keys(addressErrors).length === 0;
  };

  return {
    loading,
    errors,
    setErrors,
    validateAndFinalize,
    validateAddressStep,
  };
};

