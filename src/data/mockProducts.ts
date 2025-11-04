import type { Product, ProductCustomization } from '@/types/product';

// Customizações para Poke
const pokeCustomizations: ProductCustomization[] = [
  // Bases
  { id: 'base-shari', name: 'Shari (Arroz Japonês)', type: 'base', price: 0, required: true },
  { id: 'base-quinoa', name: 'Quinoa', type: 'base', price: 2, required: true },
  { id: 'base-salada', name: 'Mix de Folhas', type: 'base', price: 0, required: true },
  
  // Proteínas
  { id: 'protein-salmon', name: 'Salmão Premium', type: 'protein', price: 0, required: true },
  { id: 'protein-tuna', name: 'Atum', type: 'protein', price: 3, required: true },
  { id: 'protein-shrimp', name: 'Camarão', type: 'protein', price: 5, required: true },
  
  // Toppings
  { id: 'topping-edamame', name: 'Edamame', type: 'topping', price: 2, maxQuantity: 2 },
  { id: 'topping-avocado', name: 'Abacate', type: 'topping', price: 3, maxQuantity: 2 },
  { id: 'topping-cucumber', name: 'Pepino', type: 'topping', price: 1.5, maxQuantity: 2 },
  
  // Molhos
  { id: 'sauce-shoyu', name: 'Molho Shoyu', type: 'sauce', price: 0, required: true },
  { id: 'sauce-teriyaki', name: 'Molho Teriyaki', type: 'sauce', price: 1, required: true },
  { id: 'sauce-spicy', name: 'Molho Picante', type: 'sauce', price: 1, required: true },
];

// Customizações para Burger
const burgerCustomizations: ProductCustomization[] = [
  // Ponto da carne (mutuamente exclusivo - radio buttons)
  { 
    id: 'meat-rare', 
    name: 'Mal Passado', 
    type: 'extra', 
    price: 0, 
    required: true,
    selectionType: 'boolean',
    group: 'ponto-carne'
  },
  { 
    id: 'meat-medium', 
    name: 'Ao Ponto', 
    type: 'extra', 
    price: 0, 
    required: true,
    selectionType: 'boolean',
    group: 'ponto-carne'
  },
  { 
    id: 'meat-well', 
    name: 'Bem Passado', 
    type: 'extra', 
    price: 0, 
    required: true,
    selectionType: 'boolean',
    group: 'ponto-carne'
  },
  
  // Extras (com quantidade)
  { id: 'extra-bacon', name: 'Bacon Extra', type: 'extra', price: 4, maxQuantity: 2 },
  { id: 'extra-cheese', name: 'Queijo Extra', type: 'extra', price: 3, maxQuantity: 2 },
  { id: 'extra-egg', name: 'Ovo', type: 'extra', price: 2, maxQuantity: 1 },
  
  // Molhos (checkbox - boolean sem grupo)
  { 
    id: 'sauce-ketchup', 
    name: 'Ketchup', 
    type: 'sauce', 
    price: 0,
    selectionType: 'boolean'
  },
  { 
    id: 'sauce-mayo', 
    name: 'Maionese', 
    type: 'sauce', 
    price: 0,
    selectionType: 'boolean'
  },
  { 
    id: 'sauce-bbq', 
    name: 'Molho BBQ', 
    type: 'sauce', 
    price: 1,
    selectionType: 'boolean'
  },
];

// Produtos por loja
export const mockProducts: Product[] = [
  // Produtos da KAMPAI Poke Bar
  {
    id: 'kampai-poke-salmon',
    name: 'Poke Salmão Tradicional',
    description: 'Base de arroz japonês, salmão premium, edamame, gergelim e molho shoyu',
    price: 39.90,
    category: 'Pokes',
    storeId: 'kampai-poke',
    isActive: true,
    customizations: pokeCustomizations,
    preparationTime: 15,
    nutritionalInfo: {
      calories: 420,
      proteins: 32,
      carbs: 45,
      fats: 12,
    },
  },
  {
    id: 'kampai-poke-tuna',
    name: 'Poke Atum Spicy',
    description: 'Base de quinoa, atum fresco, abacate, pepino e molho picante',
    price: 42.90,
    category: 'Pokes',
    storeId: 'kampai-poke',
    isActive: true,
    customizations: pokeCustomizations,
    preparationTime: 15,
    nutritionalInfo: {
      calories: 380,
      proteins: 28,
      carbs: 38,
      fats: 14,
    },
  },
  {
    id: 'kampai-temaki-salmon',
    name: 'Temaki Salmão',
    description: 'Cone de alga nori com arroz, salmão, pepino e cream cheese',
    price: 18.90,
    category: 'Temakis',
    storeId: 'kampai-poke',
    isActive: true,
    customizations: [],
    preparationTime: 10,
    nutritionalInfo: {
      calories: 220,
      proteins: 15,
      carbs: 22,
      fats: 8,
    },
  },
  {
    id: 'kampai-combo-1',
    name: 'Combo Poke + Temaki',
    description: 'Poke salmão tradicional + temaki salmão + refrigerante',
    price: 54.90,
    category: 'Combos',
    storeId: 'kampai-poke',
    isActive: true,
    customizations: pokeCustomizations,
    preparationTime: 20,
  },

  // Produtos da Burger House
  {
    id: 'burger-classic',
    name: 'Classic Burger',
    description: 'Pão brioche, hambúrguer 150g, queijo cheddar, alface, tomate, cebola',
    price: 28.90,
    category: 'Hambúrguers',
    storeId: 'burger-house',
    isActive: true,
    customizations: burgerCustomizations,
    preparationTime: 20,
    nutritionalInfo: {
      calories: 580,
      proteins: 35,
      carbs: 45,
      fats: 28,
    },
  },
  {
    id: 'burger-bacon',
    name: 'Bacon Burger',
    description: 'Pão brioche, hambúrguer 150g, bacon crocante, queijo, maionese especial',
    price: 32.90,
    category: 'Hambúrguers',
    storeId: 'burger-house',
    isActive: true,
    customizations: burgerCustomizations,
    preparationTime: 22,
    nutritionalInfo: {
      calories: 720,
      proteins: 42,
      carbs: 48,
      fats: 38,
    },
  },
  {
    id: 'burger-chicken',
    name: 'Chicken Burger',
    description: 'Pão brioche, peito de frango grelhado, queijo suíço, rúcula, tomate seco',
    price: 26.90,
    category: 'Hambúrguers',
    storeId: 'burger-house',
    isActive: true,
    customizations: burgerCustomizations.filter(c => c.type !== 'extra' || c.id !== 'meat-rare'),
    preparationTime: 18,
    nutritionalInfo: {
      calories: 520,
      proteins: 38,
      carbs: 42,
      fats: 22,
    },
  },
  {
    id: 'burger-fries',
    name: 'Batata Frita Premium',
    description: 'Batatas cortadas na casa, tempero especial, maionese verde',
    price: 15.90,
    category: 'Acompanhamentos',
    storeId: 'burger-house',
    isActive: true,
    customizations: [],
    preparationTime: 12,
    nutritionalInfo: {
      calories: 320,
      proteins: 4,
      carbs: 48,
      fats: 12,
    },
  },

  // Produtos da Pizza Nova
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite extra virgem',
    price: 45.90,
    category: 'Pizzas Tradicionais',
    storeId: 'pizza-nova',
    isActive: true,
    customizations: [],
    preparationTime: 25,
    nutritionalInfo: {
      calories: 1200,
      proteins: 48,
      carbs: 120,
      fats: 55,
    },
  },
  {
    id: 'pizza-pepperoni',
    name: 'Pizza Pepperoni',
    description: 'Molho de tomate, mussarela, pepperoni artesanal e orégano',
    price: 52.90,
    category: 'Pizzas Tradicionais',
    storeId: 'pizza-nova',
    isActive: true,
    customizations: [],
    preparationTime: 25,
    nutritionalInfo: {
      calories: 1420,
      proteins: 58,
      carbs: 118,
      fats: 72,
    },
  },
  {
    id: 'pizza-quattro',
    name: 'Pizza Quattro Formaggi',
    description: 'Molho branco, mussarela, gorgonzola, parmesão e provolone',
    price: 58.90,
    category: 'Pizzas Gourmet',
    storeId: 'pizza-nova',
    isActive: true,
    customizations: [],
    preparationTime: 28,
    nutritionalInfo: {
      calories: 1580,
      proteins: 72,
      carbs: 115,
      fats: 85,
    },
  },
  {
    id: 'pizza-calzone',
    name: 'Calzone Especial',
    description: 'Pizza fechada com presunto, mussarela, tomate e azeitona',
    price: 38.90,
    category: 'Calzones',
    storeId: 'pizza-nova',
    isActive: true,
    customizations: [],
    preparationTime: 30,
    nutritionalInfo: {
      calories: 950,
      proteins: 45,
      carbs: 95,
      fats: 42,
    },
  },

  // Loja sem produtos não tem produtos aqui (para testar estado empty)
];

// Categorias por loja
export const mockCategories = {
  'kampai-poke': [
    { id: 'pokes', name: 'Pokes', icon: '🥗' },
    { id: 'temakis', name: 'Temakis', icon: '🍣' },
    { id: 'combos', name: 'Combos', icon: '🍱' },
  ],
  'burger-house': [
    { id: 'hamburguers', name: 'Hambúrguers', icon: '🍔' },
    { id: 'acompanhamentos', name: 'Acompanhamentos', icon: '🍟' },
  ],
  'pizza-nova': [
    { id: 'pizzas-tradicionais', name: 'Pizzas Tradicionais', icon: '🍕' },
    { id: 'pizzas-gourmet', name: 'Pizzas Gourmet', icon: '🍕' },
    { id: 'calzones', name: 'Calzones', icon: '🥟' },
  ],
  'loja-sem-produtos': [],
};

// Funções para simular API calls
export const getProductsByStoreId = async (storeId: string): Promise<Product[]> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockProducts.filter(product => 
    product.storeId === storeId && product.isActive
  );
};

export const getCategoriesByStoreId = async (storeId: string) => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockCategories[storeId as keyof typeof mockCategories] || [];
};
