/**
 * Página de gerenciamento de clientes do Merchant
 * Página de demonstração - apenas visualização
 */

import React, { useState, useMemo } from 'react';
import { useMerchantAuth } from '@/hooks/useMerchantAuth';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { useCustomers } from './hooks';
import { CustomersTable, AddressModal } from './components';
import type { MerchantCustomerAddress } from '@/types/merchant/customer';

export const MerchantCustomers: React.FC = () => {
  const { merchant, loading: authLoading } = useMerchantAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<{
    address: MerchantCustomerAddress;
    customerName: string;
  } | null>(null);

  // Obter storeId do merchant
  const storeId = useMemo(() => {
    if (!merchant?.stores || merchant.stores.length === 0) return null;
    if (merchant.stores.length === 1) return merchant.stores[0].id;
    const activeStore = merchant.stores.find((store) => store.is_active);
    return activeStore?.id || merchant.stores[0]?.id || null;
  }, [merchant]);

  // Hook para gerenciar clientes
  const { customers, loading, error } = useCustomers({ storeId });

  // Filtrar clientes por busca
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone.includes(query)
    );
  }, [customers, searchQuery]);

  // Handlers
  const handleAddressClick = (
    address: MerchantCustomerAddress,
    customerName: string
  ) => {
    setSelectedAddress({ address, customerName });
  };

  const handleCloseModal = () => {
    setSelectedAddress(null);
  };

  // Loading state
  if (authLoading) {
    return (
      <MerchantLayout>
        <LoadingState />
      </MerchantLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MerchantLayout>
        <div className="p-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Erro ao carregar clientes. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Clientes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie os clientes da sua loja
          </p>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-2xl font-bold mt-1">{customers.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Resultados da Busca</p>
            <p className="text-2xl font-bold mt-1">{filteredCustomers.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            <p className="text-2xl font-bold mt-1">
              {customers.reduce((sum, c) => sum + c.ordersCount, 0)}
            </p>
          </div>
        </div>

        {/* Tabela de clientes */}
        <CustomersTable
          customers={filteredCustomers}
          onAddressClick={handleAddressClick}
          loading={loading}
        />

        {/* Modal de endereço */}
        <AddressModal
          isOpen={!!selectedAddress}
          onClose={handleCloseModal}
          address={selectedAddress?.address || null}
          customerName={selectedAddress?.customerName}
        />
      </div>
    </MerchantLayout>
  );
};

