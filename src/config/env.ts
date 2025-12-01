/**
 * Configurações de ambiente
 */

const getApiBaseUrl = (): string => {
  // Em desenvolvimento, usar proxy do Vite se configurado
  if (import.meta.env.DEV) {
    // Com proxy do Vite configurado em vite.config.ts, usar URL relativa (vazio)
    // Isso faz com que as requisições passem pelo proxy: /api/* → http://localhost:4000/api/*
    // Verifique vite.config.ts → server.proxy para confirmar configuração
    if (import.meta.env.VITE_USE_PROXY !== 'false') {
      return ''; // URL relativa - será proxy pelo Vite
    }
    // Se não usar proxy, usar URL completa do backend
    return import.meta.env.VITE_API_BASE_URL || '';
  }
  
  // Em produção, usar variável de ambiente ou padrão
  return import.meta.env.VITE_API_BASE_URL || '';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 segundos
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true', // Flag para usar mocks
} as const;

export default API_CONFIG;
