import type { Store } from '@/types/store';

export const mockStores: Store[] = [
  {
    id: 'kampai-poke',
    name: 'KAMPAI Poke Bar',
    slug: 'kampai-poke',
    description: 'Autênticos pratos japoneses com ingredientes frescos e selecionados',
    category: 'Japonês',
    avatar: '🍱',
    rating: 4.8,
    reviewCount: 245,
    theme: {
      primaryColor: '#dc2626', // red-600
      secondaryColor: '#1f2937', // gray-800
      accentColor: '#059669', // emerald-600
      textColor: '#ffffff', // Branco para contraste com header vermelho
    },
    settings: {
      isActive: true,
      deliveryTime: '35-50 min',
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
      phone: '(11) 99999-0001',
      email: 'pedidos@kampai.com.br',
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
  },
  {
    id: 'burger-house',
    name: 'Burger House',
    slug: 'burger-house',
    description: 'Os melhores hambúrguers artesanais da cidade',
    category: 'Hamburguer',
    avatar: '🍔',
    rating: 4.6,
    reviewCount: 189,
    theme: {
      primaryColor: '#ea580c', // orange-600
      secondaryColor: '#7c2d12', // orange-900
      accentColor: '#15803d', // green-700
      textColor: '#1f2937', // Cinza escuro para contraste
    },
    settings: {
      isActive: true,
      deliveryTime: '25-40 min',
      minOrderValue: 20.00,
      deliveryFee: 4.50,
      freeDeliveryAbove: 30.00,
      acceptsPayment: {
        creditCard: true,
        debitCard: true,
        pix: true,
        cash: false,
      },
    },
    info: {
      phone: '(11) 99999-0002',
      email: 'pedidos@burgerhouse.com.br',
      address: {
        street: 'Av. Paulista',
        number: '456',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
      workingHours: {
        monday: { open: '18:00', close: '23:30' },
        tuesday: { open: '18:00', close: '23:30' },
        wednesday: { open: '18:00', close: '23:30' },
        thursday: { open: '18:00', close: '23:30' },
        friday: { open: '18:00', close: '01:00' },
        saturday: { open: '18:00', close: '01:00' },
        sunday: { closed: true, open: '', close: '' },
      },
    },
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-10-25T12:15:00Z',
  },
  {
    id: 'pizza-nova',
    name: 'Pizza Nova',
    slug: 'pizza-nova',
    description: 'Pizzas tradicionais e gourmet feitas no forno a lenha',
    category: 'Pizza',
    avatar: '🍕',
    rating: 4.7,
    reviewCount: 312,
    theme: {
      primaryColor: '#dc2626', // red-600
      secondaryColor: '#16a34a', // green-600
      accentColor: '#eab308', // yellow-500
      textColor: '#ffffff', // Branco para contraste com header vermelho
    },
    settings: {
      isActive: true,
      deliveryTime: '30-45 min',
      minOrderValue: 30.00,
      deliveryFee: 6.00,
      freeDeliveryAbove: 50.00,
      acceptsPayment: {
        creditCard: true,
        debitCard: true,
        pix: true,
        cash: true,
      },
    },
    info: {
      phone: '(11) 99999-0003',
      email: 'pedidos@pizzanova.com.br',
      address: {
        street: 'Rua Augusta',
        number: '789',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-100',
      },
      workingHours: {
        monday: { open: '17:00', close: '23:00' },
        tuesday: { open: '17:00', close: '23:00' },
        wednesday: { open: '17:00', close: '23:00' },
        thursday: { open: '17:00', close: '23:00' },
        friday: { open: '17:00', close: '00:00' },
        saturday: { open: '17:00', close: '00:00' },
        sunday: { open: '17:00', close: '23:00' },
      },
    },
    createdAt: '2024-03-10T16:00:00Z',
    updatedAt: '2024-11-02T18:45:00Z',
  },
  {
    id: 'loja-sem-produtos',
    name: 'Loja Nova',
    slug: 'loja-nova',
    description: 'Uma nova loja que ainda está organizando seu cardápio',
    category: 'Diversos',
    avatar: '🏪',
    rating: 0,
    reviewCount: 0,
    theme: {
      primaryColor: '#6366f1', // indigo-500
      secondaryColor: '#374151', // gray-700
      accentColor: '#10b981', // emerald-500
      textColor: '#1e40af', // Azul escuro para contraste
    },
    settings: {
      isActive: true,
      deliveryTime: '30-60 min',
      minOrderValue: 20.00,
      deliveryFee: 5.00,
      freeDeliveryAbove: 40.00,
      acceptsPayment: {
        creditCard: true,
        debitCard: true,
        pix: true,
        cash: true,
      },
    },
    info: {
      phone: '(11) 99999-0004',
      email: 'contato@lojanova.com.br',
      address: {
        street: 'Rua das Flores',
        number: '321',
        neighborhood: 'Jardim Exemplo',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04567-890',
      },
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { closed: true, open: '', close: '' },
        sunday: { closed: true, open: '', close: '' },
      },
    },
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z',
  },
];

// Função para simular busca por ID (futuro: chamada para API)
export const getStoreById = async (id: string): Promise<Store | null> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const store = mockStores.find(store => store.id === id || store.slug === id);
  return store || null;
};

// Função para simular listagem de lojas (futuro: chamada para API)
export const getAllStores = async (): Promise<Store[]> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockStores.filter(store => store.settings.isActive);
};
