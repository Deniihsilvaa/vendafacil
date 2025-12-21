export interface StoreInfo {
  // phone e email removidos - não vêm mais da API
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  workingHours: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  };
}

export interface Store {
  id: string;
  name: string;        // Nome personalizado da loja
  slug: string;        // URL única
  description: string;
  category: string;    // Tipo de negócio (restaurante, lanchonete, etc)
  avatar?: string;     // Logo/Avatar da loja
  banner?: string;     // Banner da loja
  rating: number;      // Avaliação média
  reviewCount: number; // Número de avaliações
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor?: string;  // Cor do texto do nome da loja (opcional)
  };
  settings: {
    isActive: boolean;
    deliveryTime: string;
    minOrderValue: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    acceptsPayment: {
      creditCard: boolean;
      debitCard: boolean;
      pix: boolean;
      cash: boolean;
    };
  };
  info: StoreInfo;
  // Status da loja (calculado automaticamente pela API)
  isOpen?: boolean;              // Indica se a loja está aberta no momento atual
  isTemporarilyClosed?: boolean;  // Indica se a loja está temporariamente fechada
  temporarilyClosed?: boolean;   // Campo booleano que indica se foi fechada temporariamente pelo merchant
  createdAt: string;
  updatedAt: string;
}

export interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  setStore: (store: Store) => void;
  getStoreById: (id: string) => Store | null;
  storeLoading: boolean;
  storeError: string | null;
}

// API Response types (para futuro backend)
export interface ApiStoreResponse {
  store: Store;
  hasProducts: boolean;
  productCount: number;
}

export interface ApiStoresResponse {
  stores: Store[];
  total: number;
  page: number;
  limit: number;
}

export interface StoreProviderProps {
  children: React.ReactNode;
}