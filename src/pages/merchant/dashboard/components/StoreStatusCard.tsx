/**
 * Componente de Status da Loja
 * Mostra se a loja está aberta ou fechada
 * Permite abrir/fechar a loja temporariamente
 */

import React from 'react';
import { Store, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StoreStatus } from '@/services/stores/storeService';
import { cn } from '@/utils';

interface StoreStatusCardProps {
  status: StoreStatus | null;
  loading?: boolean;
}

export const StoreStatusCard: React.FC<StoreStatusCardProps> = ({ 
  status, 
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Status da Loja</h3>
            <p className="text-sm text-gray-600">Não foi possível carregar o status</p>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = status.isOpen;
  const isInactive = status.isInactive ?? false;

  return (
    <div className={cn(
      'bg-white rounded-lg p-4 shadow-sm border transition-all',
      isOpen
        ? 'border-green-200 bg-green-50/30' 
        : 'border-red-200 bg-red-50/30'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isOpen
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        )}>
          {isOpen ? (
            <Store className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Status da Loja</h3>
            <Badge 
              variant={isOpen ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isOpen
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              {isInactive 
                ? 'Inativa' 
                : isOpen 
                ? 'Aberta' 
                : 'Fechada'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            {isOpen ? (
              <span>
                Aberta até {status.currentDayHours?.close}
              </span>
            ) : status.nextOpenDay ? (
              <span>
                Próxima abertura: {status.nextOpenDay} às {status.nextOpenHours?.open}
              </span>
            ) : (
              <span>Fechada hoje</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
