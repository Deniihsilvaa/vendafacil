/**
 * Tipos para gerenciamento de clientes do Merchant
 */

export interface MerchantCustomerAddress {
  id: string;
  label: string | null;
  addressType: 'home' | 'work' | 'other';
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement: string | null;
  reference: string | null;
}

export interface MerchantCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  registrationDate: string; // ISO 8601
  ordersCount: number;
  addresses: MerchantCustomerAddress[];
}

export interface MerchantCustomersData {
  customers: MerchantCustomer[];
  total: number;
}

export interface MerchantCustomersResponse {
  success: boolean;
  data: MerchantCustomersData;
  timestamp: string;
}

