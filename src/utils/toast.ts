import { toast } from "sonner";
import { ApiException } from "@/types/api";

/**
 * Utilitário para exibir mensagens de erro via toast
 * Melhorado com suporte a tema da loja e melhor contraste
 */

// Mensagens amigáveis baseadas no código de erro
const friendlyMessages: Record<string, string> = {
  NETWORK_ERROR: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
  TIMEOUT: "A requisição demorou muito para responder. Tente novamente.",
  NOT_FOUND: "Recurso não encontrado.",
  UNAUTHORIZED: "Sua sessão expirou. Faça login novamente.",
  FORBIDDEN: "Você não tem permissão para acessar este recurso.",
  VALIDATION_ERROR: "Os dados fornecidos são inválidos. Verifique os campos.",
  INTERNAL_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
  SERVICE_UNAVAILABLE: "Serviço temporariamente indisponível. Tente novamente mais tarde.",
  BAD_REQUEST: "Requisição inválida. Verifique os dados enviados.",
  UNKNOWN_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

/**
 * Exibe um toast de erro com melhor contraste
 */
export const showErrorToast = (error: Error | ApiException | string | null, title?: string) => {
  if (!error) return;

  let errorMessage = "Ocorreu um erro inesperado";
  let errorCode: string | undefined;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof ApiException) {
    errorMessage = error.message;
    errorCode = error.code;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Usar a mensagem amigável apenas se a mensagem original não for específica o suficiente
  // ou se for muito técnica
  const displayMessage = 
    errorMessage && 
    errorMessage !== "Ocorreu um erro inesperado" &&
    errorMessage.length > 10 
      ? errorMessage 
      : (friendlyMessages[errorCode || ""] || errorMessage);

  toast.error(title || "Ops! Algo deu errado", {
    description: displayMessage,
    duration: 5000,
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    className: 'toast-error',
    descriptionClassName: '!text-gray-800',
  });
};

/**
 * Exibe um toast de sucesso com tema da loja
 */
export const showSuccessToast = (message: string, title?: string) => {
  toast.success(title || "Sucesso", {
    description: message,
    duration: 3000,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    className: 'toast-success',
    descriptionClassName: '!text-gray-800',
  });
};

/**
 * Exibe um toast de informação com melhor contraste
 */
export const showInfoToast = (message: string, title?: string) => {
  toast.info(title || "Informação", {
    description: message,
    duration: 3000,
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
    },
    className: 'toast-info',
    descriptionClassName: '!text-gray-800',
  });
};

/**
 * Exibe um toast de aviso com melhor contraste
 */
export const showWarningToast = (message: string, title?: string) => {
  toast.warning(title || "Atenção", {
    description: message,
    duration: 4000,
    style: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
    className: 'toast-warning',
    descriptionClassName: '!text-gray-800',
  });
};

/**
 * Exibe um toast de loading
 */
export const showLoadingToast = (message: string, toastId?: string) => {
  return toast.loading(message, {
    id: toastId,
  });
};

/**
 * Exibe notificação específica para pedidos
 */
export const showOrderNotification = (
  type: 'order_created' | 'status_updated' | 'order_cancelled',
  orderId: string,
  status?: string
) => {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  
  switch (type) {
    case 'order_created':
      showSuccessToast(
        `Pedido #${shortOrderId} criado com sucesso!`,
        'Pedido Criado'
      );
      break;
    case 'status_updated': {
      const statusLabels: Record<string, string> = {
        pending: 'Pendente',
        confirmed: 'Confirmado',
        preparing: 'Preparando',
        ready: 'Pronto',
        out_for_delivery: 'Saiu para Entrega',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
      };
      const statusLabel = status ? statusLabels[status] || status : 'atualizado';
      showInfoToast(
        `Status do pedido #${shortOrderId} atualizado para: ${statusLabel}`,
        'Status Atualizado'
      );
      break;
    }
    case 'order_cancelled':
      showWarningToast(
        `Pedido #${shortOrderId} foi cancelado`,
        'Pedido Cancelado'
      );
      break;
  }
};

/**
 * Atualiza um toast existente (útil para converter loading em sucesso/erro)
 */
export const updateToast = (
  toastId: string,
  type: "success" | "error" | "info" | "warning",
  message: string,
  title?: string
) => {
  const styleMap = {
    success: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    error: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    info: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
    },
    warning: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
  };

  const options = {
    id: toastId,
    description: message,
    duration: type === "error" ? 5000 : 3000,
    style: styleMap[type],
    className: `toast-${type}`,
    descriptionClassName: '!text-gray-800',
  };

  switch (type) {
    case "success":
      toast.success(title || "Sucesso", options);
      break;
    case "error":
      toast.error(title || "Erro", options);
      break;
    case "info":
      toast.info(title || "Informação", options);
      break;
    case "warning":
      toast.warning(title || "Atenção", options);
      break;
  }
};
