/**
 * Utilitários de validação usando Zod
 */

import { z } from 'zod';

// Schema para telefone brasileiro
export const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 caracteres')
  .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone deve conter apenas números, espaços, parênteses, hífens ou +')
  .refine(
    (phone) => {
      const digits = phone.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 11;
    },
    { message: 'Telefone deve ter 10 ou 11 dígitos' }
  );

// Schema para CEP brasileiro
export const cepSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000')
  .transform((cep) => cep.replace(/\D/g, ''))
  .refine((cep) => cep.length === 8, { message: 'CEP deve ter 8 dígitos' });

// Schema para email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email deve ter pelo menos 5 caracteres')
  .max(255, 'Email deve ter no máximo 255 caracteres');

// Schema para nome completo
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// Schema para endereço
export const addressSchema = z.object({
  street: z.string().min(3, 'Rua deve ter pelo menos 3 caracteres').max(200, 'Rua deve ter no máximo 200 caracteres'),
  number: z.string().min(1, 'Número é obrigatório').max(20, 'Número deve ter no máximo 20 caracteres'),
  neighborhood: z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres').max(100, 'Bairro deve ter no máximo 100 caracteres'),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100, 'Cidade deve ter no máximo 100 caracteres'),
  zipCode: cepSchema,
  complement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  reference: z.string().max(200, 'Referência deve ter no máximo 200 caracteres').optional(),
});

// Schema para validação de formulário de login de cliente
export const customerLoginSchema = z.object({
  phone: phoneSchema,
});

// Schema para validação de formulário de login de lojista
export const merchantLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  addresses: z
    .object({
      home: addressSchema.optional(),
      work: addressSchema.optional(),
    })
    .optional(),
});

// Schema para validação de endereço de entrega
export const deliveryAddressSchema = addressSchema;

// Funções auxiliares de validação

/**
 * Formata telefone para exibição
 */
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formata CEP para exibição
 */
export const formatCEP = (cep: string): string => {
  const digits = cep.replace(/\D/g, '');
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
};

/**
 * Valida telefone e retorna erro ou null
 */
export const validatePhone = (phone: string): string | null => {
  try {
    phoneSchema.parse(phone);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Telefone inválido';
    }
    return 'Telefone inválido';
  }
};

/**
 * Valida CEP e retorna erro ou null
 */
export const validateCEP = (cep: string): string | null => {
  try {
    cepSchema.parse(cep);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'CEP inválido';
    }
    return 'CEP inválido';
  }
};

/**
 * Valida email e retorna erro ou null
 */
export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Email inválido';
    }
    return 'Email inválido';
  }
};

/**
 * Valida nome e retorna erro ou null
 */
export const validateName = (name: string): string | null => {
  try {
    nameSchema.parse(name);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Nome inválido';
    }
    return 'Nome inválido';
  }
};
