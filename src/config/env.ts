/**
 * Configurações de ambiente
 */

const getApiBaseUrl = (): string => {
  // Em desenvolvimento, usar variável de ambiente ou padrão
  if (import.meta.env.DEV) {
    // Se VITE_API_BASE_URL não tiver /api, não adicionar (backend pode não usar)
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  }
  
  // Em produção, usar variável de ambiente ou padrão
  return import.meta.env.VITE_API_BASE_URL || 'https://api.vendafacil.com.br';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 segundos
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true', // Flag para usar mocks
} as const;

export default API_CONFIG;
