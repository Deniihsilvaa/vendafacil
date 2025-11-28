import type { Store } from '@/types/store';

type FulfillmentMethod = 'delivery' | 'pickup';

export interface DeliveryCalculation {
  deliveryFee: number;
  freeDeliveryAbove: number;
  finalDeliveryFee: number;
  finalTotal: number;
}

export const calculateDelivery = (
  fulfillmentMethod: FulfillmentMethod,
  totalAmount: number,
  store: Store | null
): DeliveryCalculation => {
  const deliveryFee = fulfillmentMethod === 'pickup' 
    ? 0 
    : (store?.settings.deliveryFee || 0);
  
  const freeDeliveryAbove = store?.settings.freeDeliveryAbove || 0;
  
  const finalDeliveryFee = fulfillmentMethod === 'pickup' 
    ? 0 
    : (totalAmount >= freeDeliveryAbove ? 0 : deliveryFee);
  
  const finalTotal = totalAmount + finalDeliveryFee;

  return {
    deliveryFee,
    freeDeliveryAbove,
    finalDeliveryFee,
    finalTotal,
  };
};

