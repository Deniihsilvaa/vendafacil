/**
 * Validadores para entidades de Order
 */

import { z } from 'zod';
import type { Order, DeliveryAddress } from '@/types/order';

// Schema para DeliveryAddress
const deliveryAddressSchema = z.object({
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().optional(),
  zipCode: z.string(),
  complement: z.string().optional(),
  reference: z.string().optional(),
});

// Schema simplificado para Product (usado em CartItem)
const productInOrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  storeId: z.string(),
  isActive: z.boolean(),
  customizations: z.array(z.any()),
  preparationTime: z.number(),
  nutritionalInfo: z.any().optional(),
});

// Schema para ProductCustomization (usado em CartItem)
const customizationInOrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  price: z.number(),
  selectionType: z.string().optional(),
  group: z.string().optional(),
});

// Schema para CartItem (usado em Order)
const cartItemSchema = z.object({
  product: productInOrderSchema,
  quantity: z.number().min(1),
  customizations: z.array(customizationInOrderSchema),
  totalPrice: z.number().min(0),
  observations: z.string().optional(),
});

// Schema para Order
export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  storeId: z.string(),
  items: z.array(cartItemSchema),
  totalAmount: z.number().min(0),
  deliveryFee: z.number().min(0),
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'cash']),
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
  fulfillmentMethod: z.enum(['delivery', 'pickup']),
  deliveryAddress: deliveryAddressSchema,
  estimatedDeliveryTime: z.string(),
  observations: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Valida uma resposta de Order
 */
export function validateOrder(data: unknown): Order {
  return orderSchema.parse(data) as Order;
}

/**
 * Valida uma lista de Orders
 */
export function validateOrders(data: unknown): Order[] {
  return z.array(orderSchema).parse(data) as Order[];
}

/**
 * Valida uma resposta de DeliveryAddress
 */
export function validateDeliveryAddress(data: unknown): DeliveryAddress {
  return deliveryAddressSchema.parse(data) as DeliveryAddress;
}

