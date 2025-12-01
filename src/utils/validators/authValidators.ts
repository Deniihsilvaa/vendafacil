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

// Schema para MerchantStore
export const merchantStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  merchant_role: z.string().nullable(),
  is_owner: z.boolean(),
});

// Schema para Merchant
export const merchantSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  storeId: z.string().optional(),
  role: z.enum(['admin', 'manager']),
  stores: z.array(merchantStoreSchema).optional(),
});

// Schema para AuthTokens
export const authTokensSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional(),
});

// Schema para MerchantLoginResult
export const merchantLoginResultSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
  stores: z.array(merchantStoreSchema),
}).merge(authTokensSchema);

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

/**
 * Valida uma resposta de MerchantLoginResult
 */
export function validateMerchantLoginResult(data: unknown): import('@/types/auth').MerchantLoginResult {
  return merchantLoginResultSchema.parse(data) as import('@/types/auth').MerchantLoginResult;
}

