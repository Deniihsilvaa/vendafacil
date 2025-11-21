/**
 * Validadores para entidades de Product
 */

import { z } from 'zod';
import type { Product } from '@/types/product';

// Schema para ProductCustomization
const productCustomizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['extra', 'sauce', 'base', 'protein', 'topping']),
  price: z.number().min(0),
  selectionType: z.enum(['quantity', 'boolean']).optional(),
  group: z.string().optional(),
});

// Schema para Product
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  image: z.string().optional(),
  category: z.string(),
  storeId: z.string(),
  isActive: z.boolean(),
  customizations: z.array(productCustomizationSchema),
  preparationTime: z.number().min(0),
  nutritionalInfo: z
    .object({
      calories: z.number().min(0),
      proteins: z.number().min(0),
      carbs: z.number().min(0),
      fats: z.number().min(0),
    })
    .optional(),
});

/**
 * Valida uma resposta de Product
 */
export function validateProduct(data: unknown): Product {
  return productSchema.parse(data) as Product;
}

/**
 * Valida uma lista de Products
 */
export function validateProducts(data: unknown): Product[] {
  return z.array(productSchema).parse(data) as Product[];
}

