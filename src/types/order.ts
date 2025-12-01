import type { CartItem } from './product';

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
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
  fulfillmentMethod: 'delivery' | 'pickup';
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

export interface ApiOrderResponse {
  id: string;
  store_id: string;
  customer_id: string;
  delivery_option_id?: string;
  fulfillment_method: 'delivery' | 'pickup';
  pickup_slot?: string | null;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery_time?: string | null;
  observations?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Campos extras da view
  store_name?: string;
  customer_name?: string;
  delivery_street?: string;
  delivery_number?: string;
  delivery_neighborhood?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip_code?: string;
}

// Interface para resposta detalhada da API (GET /orders/:id)
export interface ApiOrderDetailResponse {
  order: {
    id: string;
    storeId: string;
    customerId: string;
    fulfillmentMethod: 'delivery' | 'pickup';
    pickupSlot?: string | null;
    totalAmount: number;
    deliveryFee: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    estimatedDeliveryTime?: string | null;
    observations?: string | null;
    cancellationReason?: string | null;
    createdAt: string;
    updatedAt: string;
    store: {
      name: string;
      slug: string;
    };
    customer: {
      name: string;
      phone: string;
    };
    deliveryAddress: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    deliveryOption?: {
      name: string;
      fee: number;
    } | null;
    itemsCount: number;
    totalItems: number;
    statusHistory: Array<{
      status: string;
      changedAt: string;
    }>;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productFamily?: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observations?: string | null;
    customizations?: Array<{
      name: string;
      type: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> | null;
    createdAt: string;
  }>;
}

// Interface estendida para Order com dados detalhados
export interface OrderDetail extends Order {
  store?: {
    name: string;
    slug: string;
  };
  customer?: {
    name: string;
    phone: string;
  };
  deliveryOption?: {
    name: string;
    fee: number;
  } | null;
  itemsCount?: number;
  totalItemsQuantity?: number;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
  }>;
  orderItems?: Array<{
    id: string;
    productId: string;
    productName: string;
    productFamily?: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observations?: string | null;
    customizations?: Array<{
      name: string;
      type: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> | null;
  }>;
}
// types/orders.ts
export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: string;
  storeId?: string;
  startDate?: string; // ISO format
  endDate?: string;   // ISO format
  customerId?: string; // Apenas para merchants
}

export interface OrdersListResponse {
  items: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderListItem {
  id: string;
  store_id: string;
  customer_id: string;
  delivery_option_id: string;
  fulfillment_method: 'delivery' | 'pickup';
  pickup_slot: string | null;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery_time: string;
  observations: string | null;
  cancellation_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  store_name: string;
  store_slug: string;
  customer_name: string;
  customer_phone: string;
  delivery_street: string;
  delivery_number: string;
  delivery_neighborhood: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip_code: string;
  delivery_option_name: string;
  delivery_option_fee: number;
  items_count: number;
  total_items: number;
  status_history: Record<string, string>;
}