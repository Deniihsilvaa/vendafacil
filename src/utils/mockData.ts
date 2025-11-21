import type { Store, Product, ProductCustomization } from '@/types';

// Utilitários
export * from './cn';

// Mock data para desenvolvimento (será substituído pelos dados de mockStores.ts)
export const mockStore: Store = {
  id: 'poke-bar-123',
  name: 'KAMPAI Poke Bar',
  slug: 'kampai-poke-bar',
  description: 'Autênticos pratos japoneses com ingredientes frescos',
  category: 'Japonês',
  avatar: '🥗',
  rating: 4.8,
  reviewCount: 245,
  theme: {
    primaryColor: '#10b981', // emerald-500
    secondaryColor: '#374151', // gray-700
    accentColor: '#059669', // emerald-600
    textColor: '#1f2937', // Cor customizável do texto do nome da loja (opcional)
  },
  settings: {
    isActive: true,
    deliveryTime: '30-45 min',
    minOrderValue: 25.00,
    deliveryFee: 5.90,
    freeDeliveryAbove: 35.00,
    acceptsPayment: {
      creditCard: true,
      debitCard: true,
      pix: true,
      cash: true,
    },
  },
  info: {
    address: {
      street: 'Rua das Palmeiras',
      number: '123',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    workingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-11-01T15:30:00Z',
};

// Customizações disponíveis
export const mockCustomizations: ProductCustomization[] = [
  // Bases
  { id: '1', name: 'Arroz Branco', type: 'base', price: 0 },
  { id: '2', name: 'Arroz Integral', type: 'base', price: 2 },
  { id: '3', name: 'Quinoa', type: 'base', price: 4 },
  
  // Proteínas
  { id: '4', name: 'Salmão', type: 'protein', price: 8 },
  { id: '5', name: 'Atum', type: 'protein', price: 7 },
  { id: '6', name: 'Camarão', type: 'protein', price: 10 },
  { id: '7', name: 'Frango Grelhado', type: 'protein', price: 6 },
  
  // Toppings
  { id: '8', name: 'Abacate', type: 'topping', price: 3 },
  { id: '9', name: 'Manga', type: 'topping', price: 2 },
  { id: '10', name: 'Cenoura', type: 'topping', price: 1 },
  { id: '11', name: 'Pepino', type: 'topping', price: 1 },
  { id: '12', name: 'Edamame', type: 'topping', price: 2 },
  
  // Molhos
  { id: '13', name: 'Shoyu', type: 'sauce', price: 0 },
  { id: '14', name: 'Tarê', type: 'sauce', price: 1 },
  { id: '15', name: 'Spicy Mayo', type: 'sauce', price: 1 },
];

// Produtos mockados
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Poke Tradicional',
    description: 'Monte seu poke do jeito que quiser! Escolha base, proteína e toppings.',
    price: 18.90, // Preço base
    image: '🥗',
    category: 'Pokes',
    storeId: '1',
    isActive: true,
    customizations: mockCustomizations,
    preparationTime: 15,
    nutritionalInfo: {
      calories: 420,
      proteins: 25,
      carbs: 35,
      fats: 18,
    },
  },
  {
    id: '2',
    name: 'Poke Salmão Premium',
    description: 'Poke especial com salmão grelhado, arroz integral e mix de vegetais frescos.',
    price: 24.90,
    image: '🍣',
    category: 'Pokes',
    storeId: '1',
    isActive: true,
    customizations: mockCustomizations.filter(c => 
      c.type !== 'base' && c.type !== 'protein' // Já vem com base e proteína definidas
    ),
    preparationTime: 20,
    nutritionalInfo: {
      calories: 380,
      proteins: 28,
      carbs: 30,
      fats: 15,
    },
  },
  {
    id: '3',
    name: 'Temaki Salmão',
    description: 'Temaki fresco com salmão, abacate e pepino.',
    price: 12.90,
    image: '🍙',
    category: 'Temakis',
    storeId: '1',
    isActive: true,
    customizations: [], // Sem customizações
    preparationTime: 10,
    nutritionalInfo: {
      calories: 280,
      proteins: 18,
      carbs: 25,
      fats: 12,
    },
  },
  {
    id: '4',
    name: 'Bowl de Açaí',
    description: 'Açaí cremoso com granola, banana e mel.',
    price: 14.90,
    image: '🍇',
    category: 'Sobremesas',
    storeId: '1',
    isActive: true,
    customizations: [
      { id: '16', name: 'Granola Extra', type: 'topping', price: 2 },
      { id: '17', name: 'Banana', type: 'topping', price: 1 },
      { id: '18', name: 'Morango', type: 'topping', price: 2 },
      { id: '19', name: 'Mel', type: 'sauce', price: 0 },
      { id: '20', name: 'Leite Condensado', type: 'sauce', price: 1 },
    ],
    preparationTime: 8,
    nutritionalInfo: {
      calories: 320,
      proteins: 8,
      carbs: 45,
      fats: 12,
    },
  },
  {
    id: '5',
    name: 'Água Mineral',
    description: 'Água mineral natural 500ml.',
    price: 3.50,
    image: '💧',
    category: 'Bebidas',
    storeId: '1',
    isActive: true,
    customizations: [],
    preparationTime: 1,
  },
  {
    id: '6',
    name: 'Suco de Laranja',
    description: 'Suco de laranja natural 400ml.',
    price: 8.90,
    image: '🍊',
    category: 'Bebidas',
    storeId: '1',
    isActive: true,
    customizations: [],
    preparationTime: 5,
  },
];

// Categorias
export const mockCategories = [
  { id: 'all', name: 'Todos', icon: '🍽️' },
  { id: 'Pokes', name: 'Pokes', icon: '🥗' },
  { id: 'Temakis', name: 'Temakis', icon: '🍙' },
  { id: 'Sobremesas', name: 'Sobremesas', icon: '🍇' },
  { id: 'Bebidas', name: 'Bebidas', icon: '🥤' },
];
