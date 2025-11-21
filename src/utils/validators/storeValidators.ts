/**
 * Validadores para entidades de Store
 * Schema adaptado para a resposta real da API (snake_case)
 */

import { z } from 'zod';
import type { Store } from '@/types/store';
import type { Product } from '@/types/product';

// Schema para customização de produto (formato da API)
const apiProductCustomizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
  selection_type: z.enum(['quantity', 'boolean']), // Mapear para selectionType
  customization_type: z.enum(['extra', 'sauce', 'base', 'protein', 'topping']), // Mapear para type
  // group não aparece na API - pode não existir ou ser opcional
});

// Schema para produto (formato da API - snake_case)
const apiProductSchema = z.object({
  id: z.string(),
  store_id: z.string(), // Mapear para storeId
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  cost_price: z.number().min(0).optional(), // Apenas para backend/merchant
  family: z.enum(['raw_material', 'finished_product', 'addon']).optional(),
  image_url: z.string().nullable().optional(), // Mapear para image
  category: z.string(),
  custom_category: z.string().nullable().optional(),
  is_active: z.boolean(), // Mapear para isActive
  preparation_time: z.number().min(0).nullable().optional(), // Mapear para preparationTime - pode ser null
  nutritional_info: z.object({
    calories: z.number().min(0),
    proteins: z.number().min(0),
    carbs: z.number().min(0),
    fats: z.number().min(0),
  }).nullable().optional(), // Mapear para nutritionalInfo - pode ser null
  deleted_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  
  // Campos redundantes da loja (podem ser ignorados)
  store_name: z.string().optional(),
  store_slug: z.string().optional(),
  store_category: z.string().optional(),
  
  // Contadores
  customizations_count: z.number().nullable().optional(),
  extra_lists_count: z.number().nullable().optional(),
  
  // Customizações disponíveis - pode ser null ou array
  available_customizations: z.array(apiProductCustomizationSchema).nullable().optional(), // Mapear para customizations
}).passthrough(); // Permitir campos extras que não estão no schema

// Schema para horários de funcionamento (formato da API: array de objetos)
const workingHourSchema = z.object({
  opens_at: z.string().nullable(), // Ex: "11:00:00" ou null
  week_day: z.number().min(0).max(6), // 0 = domingo, 1 = segunda, etc
  closes_at: z.string().nullable(), // Ex: "23:00:00" ou null
  is_closed: z.boolean(), // true se fechado no dia
});

// Schema para Store (formato exato da API)
export const storeSchema = z.object({
  // Campos básicos
  id: z.string(),
  merchant_id: z.string().nullable().optional(), // TODO: Verificar se usado no frontend
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category: z.string(), // Ex: "comida_japonesa"
  /**/custom_category: z.string().nullable().optional(), // TODO: Verificar se usado
  
  // Imagens
  /**/avatar_url: z.string().nullable().optional(), // Mapear para avatar
  /**/banner_url: z.string().nullable().optional(), // Mapear para banner
  
  // Avaliações
  rating: z.number().min(0).max(5),
  review_count: z.number().min(0), // Mapear para reviewCount
  
  // Cores do tema (não estão em objeto na API)
  primary_color: z.string(), // Mapear para theme.primaryColor
  secondary_color: z.string(), // Mapear para theme.secondaryColor
  accent_color: z.string(), // Mapear para theme.accentColor
  text_color: z.string().nullable().optional(), // Mapear para theme.textColor
  
  // Configurações (não estão em objeto settings na API)
  is_active: z.boolean(), // Mapear para settings.isActive
  delivery_time: z.string(), // Mapear para settings.deliveryTime
  min_order_value: z.number().min(0), // Mapear para settings.minOrderValue
  delivery_fee: z.number().min(0), // Mapear para settings.deliveryFee
  free_delivery_above: z.number().min(0), // Mapear para settings.freeDeliveryAbove
  
  // Formas de pagamento (não estão em objeto acceptsPayment na API)
  accepts_payment_credit_card: z.boolean(), // Mapear para settings.acceptsPayment.creditCard
  accepts_payment_debit_card: z.boolean(), // Mapear para settings.acceptsPayment.debitCard
  accepts_payment_pix: z.boolean(), // Mapear para settings.acceptsPayment.pix
  accepts_payment_cash: z.boolean(), // Mapear para settings.acceptsPayment.cash
  
  // Opções de entrega/retirada
  fulfillment_delivery_enabled: z.boolean().optional(), // TODO: Verificar se usado
  fulfillment_pickup_enabled: z.boolean().optional(), // TODO: Verificar se usado
  fulfillment_pickup_instructions: z.string().nullable().optional(), // TODO: Verificar se usado
  
  // Soft delete
  /**/deleted_at: z.string().nullable().optional(), // TODO: Verificar se usado
  
  // Informações legais (provavelmente só backend)
  /**/legal_responsible_name: z.string().nullable().optional(), // TODO: Confirmar se não usado
  /**/legal_responsible_document: z.string().nullable().optional(), // TODO: Confirmar se não usado
  /**/terms_accepted_at: z.string().nullable().optional(), // TODO: Confirmar se não usado
  
  // Endereço (não está em objeto address na API)
  address_street: z.string().optional(), // Mapear para info.address.street
  address_number: z.string().optional(), // Mapear para info.address.number
  address_neighborhood: z.string().optional(), // Mapear para info.address.neighborhood
  address_city: z.string().optional(), // Mapear para info.address.city
  address_state: z.string().optional(), // Mapear para info.address.state
  address_zip_code: z.string().optional(), // Mapear para info.address.zipCode
  address_complement: z.string().nullable().optional(), // TODO: Verificar se usado
  
  // TODO: phone e email não estão na resposta da API - vêm de outro lugar?
  // /**/phone: z.string().optional(),
  // /**/email: z.string().email().optional(),
  
  // Horários de funcionamento (formato diferente: array)
  working_hours: z.array(workingHourSchema).optional(), // TODO: Transformar para formato atual?
  
  // Contadores
  /**/products_count: z.number().optional(), // TODO: Verificar se usado
  /**/team_members_count: z.number().nullable().optional(), // TODO: Confirmar se não usado
  
  // Produtos (vêm na resposta do espelho da loja)
  products: z.array(apiProductSchema).optional(),
  
  // Timestamps
  created_at: z.string(), // Mapear para createdAt
  updated_at: z.string(), // Mapear para updatedAt
}).passthrough(); // Permitir campos extras que não estão no schema (como timestamp do wrapper)

/**
 * Transforma produto da API (snake_case) para formato do frontend (camelCase)
 */
export function transformApiProductToFrontend(apiProduct: z.infer<typeof apiProductSchema>): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    price: apiProduct.price,
    image: apiProduct.image_url || undefined,
    category: apiProduct.category,
    storeId: apiProduct.store_id,
    isActive: apiProduct.is_active,
    customizations: (apiProduct.available_customizations || []).map(cust => ({
      id: cust.id,
      name: cust.name,
      type: cust.customization_type,
      price: cust.price,
      selectionType: cust.selection_type,
      // group não vem na API - deixar undefined
    })),
    preparationTime: apiProduct.preparation_time || 0,
    nutritionalInfo: apiProduct.nutritional_info || undefined,
  };
}

/**
 * Transforma o formato da API (snake_case) para o formato do frontend (camelCase com objetos aninhados)
 */
function transformApiStoreToFrontend(apiStore: z.infer<typeof storeSchema>): Store {
  // Transformar horários de funcionamento (array) para objeto
  const workingHours: Store['info']['workingHours'] = {
    monday: { open: '', close: '', closed: true },
    tuesday: { open: '', close: '', closed: true },
    wednesday: { open: '', close: '', closed: true },
    thursday: { open: '', close: '', closed: true },
    friday: { open: '', close: '', closed: true },
    saturday: { open: '', close: '', closed: true },
    sunday: { open: '', close: '', closed: true },
  };

  // Mapear week_day para nomes de dias (0 = domingo, 1 = segunda, etc)
  const dayMap: Record<number, keyof typeof workingHours> = {
    0: 'sunday',    // domingo
    1: 'monday',    // segunda
    2: 'tuesday',   // terça
    3: 'wednesday', // quarta
    4: 'thursday',  // quinta
    5: 'friday',    // sexta
    6: 'saturday',  // sábado
  };

  if (apiStore.working_hours) {
    apiStore.working_hours.forEach((wh) => {
      const dayName = dayMap[wh.week_day];
      if (dayName) {
        // Converter "11:00:00" para "11:00" (remover segundos)
        const formatTime = (time: string | null): string => {
          if (!time) return '';
          // Se tiver formato "HH:MM:SS", remover os segundos
          if (time.includes(':') && time.split(':').length === 3) {
            return time.substring(0, 5); // "11:00:00" -> "11:00"
          }
          return time;
        };

        workingHours[dayName] = {
          open: formatTime(wh.opens_at),
          close: formatTime(wh.closes_at),
          closed: wh.is_closed,
        };
      }
    });
  }

  return {
    id: apiStore.id,
    name: apiStore.name,
    slug: apiStore.slug,
    description: apiStore.description,
    category: apiStore.category,
    avatar: apiStore.avatar_url || undefined,
    banner: apiStore.banner_url || undefined,
    rating: apiStore.rating,
    reviewCount: apiStore.review_count,
    theme: {
      primaryColor: apiStore.primary_color,
      secondaryColor: apiStore.secondary_color,
      accentColor: apiStore.accent_color,
      textColor: apiStore.text_color || undefined,
    },
    settings: {
      isActive: apiStore.is_active,
      deliveryTime: apiStore.delivery_time,
      minOrderValue: apiStore.min_order_value,
      deliveryFee: apiStore.delivery_fee,
      freeDeliveryAbove: apiStore.free_delivery_above,
      acceptsPayment: {
        creditCard: apiStore.accepts_payment_credit_card,
        debitCard: apiStore.accepts_payment_debit_card,
        pix: apiStore.accepts_payment_pix,
        cash: apiStore.accepts_payment_cash,
      },
    },
    info: {
      // phone e email removidos do frontend conforme solicitado
      address: {
        street: apiStore.address_street || '',
        number: apiStore.address_number || '',
        neighborhood: apiStore.address_neighborhood || '',
        city: apiStore.address_city || '',
        state: apiStore.address_state || '',
        zipCode: apiStore.address_zip_code || '',
      },
      workingHours,
    },
    createdAt: apiStore.created_at,
    updatedAt: apiStore.updated_at,
  };
}

/**
 * Valida uma resposta de Store e transforma para o formato do frontend
 */
export function validateStore(data: unknown): Store {
  const validatedData = storeSchema.parse(data);
  return transformApiStoreToFrontend(validatedData);
}

/**
 * Valida uma lista de Stores e transforma para o formato do frontend
 */
export function validateStores(data: unknown): Store[] {
  const validatedArray = z.array(storeSchema).parse(data);
  return validatedArray.map(transformApiStoreToFrontend);
}

/**
 * Valida uma resposta de Store com produtos (espelho da loja)
 * Retorna tanto a Store transformada quanto os produtos
 */
export function validateStoreWithProducts(data: unknown): { store: Store; products: Product[] } {
  try {
    console.log('Validando store com produtos, data recebido:', data);
    
    // Validar a store (inclui produtos no schema)
    const validatedData = storeSchema.parse(data);
    console.log('Store validada com sucesso:', validatedData.id);
    
    const store = transformApiStoreToFrontend(validatedData);
    
    // Transformar produtos - tratar erro individualmente para não quebrar tudo
    const products: Product[] = [];
    if (validatedData.products && Array.isArray(validatedData.products)) {
      console.log(`Transformando ${validatedData.products.length} produtos...`);
      for (const productData of validatedData.products) {
        try {
          // Validar produto individualmente
          const validatedProduct = apiProductSchema.parse(productData);
          const transformedProduct = transformApiProductToFrontend(validatedProduct);
          products.push(transformedProduct);
        } catch (productError) {
          console.warn('Erro ao validar produto individual:', productData?.id || 'sem id', productError);
          // Continuar com os outros produtos mesmo se um falhar
        }
      }
      console.log(`${products.length} produtos transformados com sucesso`);
    } else {
      console.warn('Nenhum produto encontrado na resposta ou products não é um array');
    }
    
    return { store, products };
  } catch (error) {
    console.error('Erro ao validar store com produtos:', error);
    if (error instanceof z.ZodError) {
      console.error('Erros de validação Zod:', error.issues);
    }
    // Re-lançar erro para tratamento acima
    throw error;
  }
}

