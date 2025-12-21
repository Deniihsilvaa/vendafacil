/**
 * Componente de Status da Loja
 * Mostra se a loja está aberta ou fechada
 * Permite abrir/fechar a loja temporariamente
 */

import React from 'react';
import { Store, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch/Switch';
import type { StoreStatus } from '@/services/stores/storeService';
import { cn } from '@/utils';

interface StoreStatusCardProps {
  status: StoreStatus | null;
  loading?: boolean;
  toggling?: boolean;
  onToggle?: (closed: boolean) => void;
}

export const StoreStatusCard: React.FC<StoreStatusCardProps> = ({ 
  status, 
  loading = false,
  toggling = false,
  onToggle,
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
  const isTemporarilyClosed = status.isTemporarilyClosed ?? false;
  const isInactive = status.isInactive ?? false;

  // Se a loja está inativa, não pode ser aberta
  const canToggle = !isInactive && onToggle;

  return (
    <div className={cn(
      'bg-white rounded-lg p-4 shadow-sm border transition-all',
      isOpen && !isTemporarilyClosed
        ? 'border-green-200 bg-green-50/30' 
        : 'border-red-200 bg-red-50/30'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isOpen && !isTemporarilyClosed
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        )}>
          {isOpen && !isTemporarilyClosed ? (
            <Store className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Status da Loja</h3>
            <Badge 
              variant={isOpen && !isTemporarilyClosed ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isOpen && !isTemporarilyClosed
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              {isInactive 
                ? 'Inativa' 
                : isTemporarilyClosed 
                ? 'Fechada Temporariamente' 
                : isOpen 
                ? 'Aberta' 
                : 'Fechada'}
            </Badge>
            {isTemporarilyClosed && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                Manual
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Clock className="h-3 w-3" />
            {isOpen && !isTemporarilyClosed ? (
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

          {/* Toggle para abrir/fechar loja */}
          {canToggle && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {isTemporarilyClosed ? 'Loja fechada manualmente' : 'Abrir/Fechar Loja'}
                </label>
                <p className="text-xs text-gray-500">
                  {isTemporarilyClosed 
                    ? 'Clique para abrir e voltar ao horário normal'
                    : 'Fechar temporariamente (sobrescreve horários)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-medium',
                  isTemporarilyClosed ? 'text-red-600' : 'text-gray-600'
                )}>
                  {isTemporarilyClosed ? 'Fechada' : 'Aberta'}
                </span>
                <Switch
                  checked={!isTemporarilyClosed}
                  onCheckedChange={(checked) => onToggle?.(!checked)}
                  disabled={toggling}
                  className="scale-90"
                />
              </div>
            </div>
          )}

          {isInactive && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ Loja inativa. Ative a loja nas configurações para poder abrir/fechar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
