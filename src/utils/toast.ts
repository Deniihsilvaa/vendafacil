import { toast } from "sonner";
import { ApiException } from "@/types/api";

/**
 * Utilitário para exibir mensagens de erro via toast
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
 * Exibe um toast de erro
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

  const displayMessage = friendlyMessages[errorCode || ""] || errorMessage;

  toast.error(title || "Ops! Algo deu errado", {
    description: displayMessage,
    duration: 5000,
  });
};

/**
 * Exibe um toast de sucesso
 */
export const showSuccessToast = (message: string, title?: string) => {
  toast.success(title || "Sucesso", {
    description: message,
    duration: 3000,
  });
};

/**
 * Exibe um toast de informação
 */
export const showInfoToast = (message: string, title?: string) => {
  toast.info(title || "Informação", {
    description: message,
    duration: 3000,
  });
};

/**
 * Exibe um toast de aviso
 */
export const showWarningToast = (message: string, title?: string) => {
  toast.warning(title || "Atenção", {
    description: message,
    duration: 4000,
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
 * Atualiza um toast existente (útil para converter loading em sucesso/erro)
 */
export const updateToast = (
  toastId: string,
  type: "success" | "error" | "info" | "warning",
  message: string,
  title?: string
) => {
  const options = {
    id: toastId,
    description: message,
    duration: type === "error" ? 5000 : 3000,
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
