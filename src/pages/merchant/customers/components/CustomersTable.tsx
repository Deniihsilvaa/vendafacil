/**
 * Tabela de clientes
 * Componente puramente de UI
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Button } from '@/components/ui/buttons';
import { Badge } from '@/components/ui/badge';
import type { MerchantCustomer } from '@/types/merchant/customer';
import { MapPin, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { formatDateTime } from '@/utils';

interface CustomersTableProps {
  customers: MerchantCustomer[];
  onAddressClick: (address: MerchantCustomer['addresses'][0], customerName: string) => void;
  loading?: boolean;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onAddressClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Endereços</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={5} className="h-16">
                  <div className="animate-pulse bg-muted h-4 w-3/4 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Endereços</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{customer.name}</p>
                  {customer.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{customer.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDateTime(customer.registrationDate)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge variant="outline" className="font-medium">
                    {customer.ordersCount}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {customer.addresses.length > 0 ? (
                    customer.addresses.map((address) => (
                      <Button
                        key={address.id}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1.5 text-xs justify-start"
                        onClick={() => onAddressClick(address, customer.name)}
                      >
                        <MapPin className="h-3 w-3 mr-1.5" />
                        <span className="truncate max-w-[150px]">
                          {address.street}, {address.number}
                        </span>
                      </Button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem endereços</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

