/**
 * Constantes relacionadas a lojas
 */

/**
 * Categorias de lojas disponíveis no sistema
 */
export const STORE_CATEGORIES = [
  { value: 'hamburgueria', label: 'Hamburgueria' },
  { value: 'pizzaria', label: 'Pizzaria' },
  { value: 'pastelaria', label: 'Pastelaria' },
  { value: 'sorveteria', label: 'Sorveteria' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'padaria', label: 'Padaria' },
  { value: 'comida_brasileira', label: 'Comida Brasileira' },
  { value: 'comida_japonesa', label: 'Comida Japonesa' },
  { value: 'doces', label: 'Doces' },
  { value: 'mercado', label: 'Mercado' },
  { value: 'outros', label: 'Outros' },
] as const;

/**
 * Dias da semana com mapeamento para a API
 * weekDay: 0 = Domingo, 1 = Segunda-feira, ..., 6 = Sábado
 */
export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', weekDay: 1 },
  { key: 'tuesday', label: 'Terça-feira', weekDay: 2 },
  { key: 'wednesday', label: 'Quarta-feira', weekDay: 3 },
  { key: 'thursday', label: 'Quinta-feira', weekDay: 4 },
  { key: 'friday', label: 'Sexta-feira', weekDay: 5 },
  { key: 'saturday', label: 'Sábado', weekDay: 6 },
  { key: 'sunday', label: 'Domingo', weekDay: 0 },
] as const;

