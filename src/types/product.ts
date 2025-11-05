export interface ProductCustomization {
  id: string;
  name: string;
  type: 'extra' | 'sauce' | 'base' | 'protein' | 'topping';
  price: number;
  // Tipo de seleção: 'quantity' (padrão) permite quantidade, 'boolean' permite true/false
  selectionType?: 'quantity' | 'boolean';
  // Grupo para customizações mutuamente exclusivas (ex: ponto da carne - só pode escolher uma)
  // Se definido, customizações do mesmo grupo são mutuamente exclusivas (radio buttons)
  group?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  storeId: string;
  isActive: boolean;
  customizations: ProductCustomization[];
  preparationTime: number; // em minutos
  nutritionalInfo?: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  customizations: ProductCustomization[];
  totalPrice: number;
  observations?: string;
}

export interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isNew?: boolean;
}
