import type { CartItem } from './product';

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  complement?: string;
  reference?: string;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: DeliveryAddress;
  estimatedDeliveryTime: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}
