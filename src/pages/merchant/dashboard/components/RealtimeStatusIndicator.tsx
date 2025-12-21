/**
 * Indicador de Status Real-time
 * Mostra se o sistema está online e buscando pedidos em tempo real
 */

import React from 'react';
import { Wifi, WifiOff, Loader2, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase/realtime-client';
import { cn } from '@/utils';

interface RealtimeStatusIndicatorProps {
  isConnected: boolean;
  isConnecting?: boolean;
}

export const RealtimeStatusIndicator: React.FC<RealtimeStatusIndicatorProps> = ({ 
  isConnected, 
  isConnecting = false 
}) => {
  const isConfigured = isSupabaseConfigured();

  // Se não está configurado, mostrar mensagem específica
  if (!isConfigured) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200 bg-yellow-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">Sistema Real-time</h3>
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                Não configurado
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Configure as variáveis de ambiente <code className="text-xs bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="text-xs bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
          isConnected 
            ? 'bg-green-100 text-green-600' 
            : isConnecting
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-red-100 text-red-600'
        )}>
          {isConnecting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isConnected ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Sistema Real-time</h3>
            <Badge 
              variant={isConnected ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isConnected 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : isConnecting
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              {isConnecting ? 'Conectando...' : isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {isConnecting 
              ? 'Estabelecendo conexão...' 
              : isConnected 
              ? 'Buscando novos pedidos em tempo real' 
              : 'Conexão perdida. Recarregue a página.'}
          </p>
        </div>
      </div>
    </div>
  );
};

