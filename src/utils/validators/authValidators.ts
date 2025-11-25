/**
 * Validadores para entidades de Auth
 */

import { z } from 'zod';
import type { Customer, Merchant } from '@/types/auth';

// Schema para DeliveryAddress (usado em Customer)
const deliveryAddressSchema = z.object({
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().min(1, 'Estado é obrigatório'),
  zipCode: z.string(),
  complement: z.string().optional(),
  reference: z.string().optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

// Schema para Customer
export const customerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone: z.string(),
  name: z.string(),
  storeId: z.string(),
  addresses: z
    .object({
      home: deliveryAddressSchema.optional(),
      work: deliveryAddressSchema.optional(),
    })
    .optional(),
  updatedAt: z.string().optional(),
});

// Schema para Merchant
export const merchantSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  storeId: z.string(),
  role: z.enum(['admin', 'manager']),
});

// Schema para Customer ou Merchant (union)
export const userSchema = z.union([customerSchema, merchantSchema]);

/**
 * Valida uma resposta de Customer
 */
export function validateCustomer(data: unknown): Customer {
  return customerSchema.parse(data) as Customer;
}

/**
 * Valida uma resposta de Merchant
 */
export function validateMerchant(data: unknown): Merchant {
  return merchantSchema.parse(data) as Merchant;
}

/**
 * Valida uma resposta de Customer ou Merchant
 */
export function validateUser(data: unknown): Customer | Merchant {
  return userSchema.parse(data) as Customer | Merchant;
}

