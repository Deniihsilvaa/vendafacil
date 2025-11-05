/**
 * Componente para exibir erros de forma amigável
 */

import React from 'react';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ApiException } from '@/types/api';
import { cn } from '@/utils';

export interface ErrorDisplayProps {
  error: Error | ApiException | string | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  onRetry,
  className,
  variant = 'default',
}) => {
  if (!error) return null;

  // Converter erro para formato padronizado
  let errorMessage = 'Ocorreu um erro inesperado';
  let errorCode: string | undefined;
  let errorStatus: number | undefined;
  let errorDetails: Record<string, string[]> | undefined;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof ApiException) {
    errorMessage = error.message;
    errorCode = error.code;
    errorStatus = error.status;
    errorDetails = error.errors;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Mensagens amigáveis baseadas no código
  const friendlyMessages: Record<string, string> = {
    NETWORK_ERROR: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
    TIMEOUT: 'A requisição demorou muito para responder. Tente novamente.',
    NOT_FOUND: 'Recurso não encontrado.',
    UNAUTHORIZED: 'Sua sessão expirou. Faça login novamente.',
    FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
    VALIDATION_ERROR: 'Os dados fornecidos são inválidos. Verifique os campos.',
    INTERNAL_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível. Tente novamente mais tarde.',
  };

  const displayMessage = friendlyMessages[errorCode || ''] || errorMessage;

  // Variante compacta (para toast ou inline)
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
        <XCircle className="h-4 w-4 flex-shrink-0" />
        <span>{displayMessage}</span>
      </div>
    );
  }

  // Variante inline (para formulários)
  if (variant === 'inline') {
    return (
      <div className={cn('text-sm text-destructive mt-1', className)}>
        {displayMessage}
        {errorDetails && (
          <ul className="mt-2 list-disc list-inside space-y-1">
            {Object.entries(errorDetails).map(([field, messages]) => (
              <li key={field}>
                <strong>{field}:</strong> {messages.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Variante padrão (card completo)
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {title || 'Ops! Algo deu errado'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {displayMessage}
          </p>
          {errorStatus && (
            <p className="text-xs text-muted-foreground">
              Código do erro: {errorCode || errorStatus}
            </p>
          )}
        </div>

        {errorDetails && Object.keys(errorDetails).length > 0 && (
          <div className="w-full max-w-md text-left">
            <p className="text-sm font-medium mb-2">Detalhes:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {Object.entries(errorDetails).map(([field, messages]) => (
                <li key={field}>
                  <strong className="capitalize">{field}:</strong>{' '}
                  {messages.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {onRetry && (
          <Button onClick={onRetry} variant="default" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>
    </Card>
  );
};
