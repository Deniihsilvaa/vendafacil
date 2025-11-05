/**
 * Configurações de ambiente
 */

const getApiBaseUrl = (): string => {
  // Em desenvolvimento, usar variável de ambiente ou padrão
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
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
