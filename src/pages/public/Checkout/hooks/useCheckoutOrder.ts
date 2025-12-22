import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCartContext, useStoreContext, useAuthContext } from '@/contexts';
import { formatPrice } from '@/utils';
import { showErrorToast, showOrderNotification } from '@/utils/toast';
import { OrderService } from '@/services/orders/orderService';
import { validateAddress, isPaymentMethodAccepted, isFulfillmentMethodEnabled } from '../utils/checkoutValidation';
import type { DeliveryAddress } from '@/types';
import type { PaymentMethod, FulfillmentMethod } from '../types';

/**
 * A API aceita tanto UUID quanto slug, então não precisamos converter
 * Apenas retorna o valor passado
 */
const getStoreIdFromSlug = (slug: string | undefined): string | undefined => {
  return slug; // A API aceita slug ou ID diretamente
};

export const useCheckoutOrder = (
  address: DeliveryAddress,
  paymentMethod: PaymentMethod,
  fulfillmentMethod: FulfillmentMethod,
  observations: string
) => {
  const navigate = useNavigate();
  const { storeId: storeSlugOrId } = useParams<{ storeId: string }>();
  const { items, totalAmount, clearCart } = useCartContext();
  const { currentStore } = useStoreContext();
  const { customer } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Obter o ID real da loja (pode ser slug ou ID)
  const storeId = useMemo(() => {
    // Se já temos currentStore, usar o ID dele
    if (currentStore?.id) {
      return currentStore.id;
    }
    // Caso contrário, tentar obter do localStorage pelo slug
    return getStoreIdFromSlug(storeSlugOrId);
  }, [currentStore, storeSlugOrId]);

  const validateAndFinalize = async () => {
    if (!customer) {
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

      // Preparar dados do pedido
      const orderData: Parameters<typeof OrderService.createOrder>[0] = {
        storeId,
        items: orderItems,
        paymentMethod,
        fulfillmentMethod,
        observations: observations.trim() || undefined,
      };

      // Se for delivery, incluir endereço; se for pickup, não incluir o campo
      if (fulfillmentMethod === 'delivery') {
        orderData.deliveryAddress = {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode.replace(/\D/g, ''),
          complement: address.complement || undefined,
        };
      }
      // Para pickup, não definir deliveryAddress (será undefined)

      const order = await OrderService.createOrder(orderData);

      console.log('Pedido criado com sucesso:', order);
      clearCart();
      
      // Mostrar notificação de sucesso
      showOrderNotification('order_created', order.id);
      
      // Invalidar cache do pedido para garantir dados atualizados na página de confirmação
      try {
        const { CacheService } = await import('@/services/cache/CacheService');
        const { CACHE_TAGS } = await import('@/services/cache/CacheService');
        CacheService.invalidateByTag(CACHE_TAGS.ORDER(order.id));
      } catch (cacheError) {
        console.warn('Erro ao invalidar cache:', cacheError);
      }
      
      // Redirecionar para página de confirmação do pedido
      navigate(`/loja/${storeSlugOrId}/pedido/${order.id}`);
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

