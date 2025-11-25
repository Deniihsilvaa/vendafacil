/**
 * Cliente HTTP centralizado para todas as requisições
 * Com suporte a refresh token, retry automático e cache
 */

import API_CONFIG from '@/config/env';
import type { ApiResponse, ApiError, RequestConfig, HttpMethod } from '@/types/api';
import { ApiException } from '@/types/api';
import { CacheService } from '@/services/cache/CacheService';

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private refreshTokenPromise: Promise<string> | null = null;
  private maxRetries = 3;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Adiciona token de autenticação aos headers
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-token', token);
      }
    } else {
      delete this.defaultHeaders['Authorization'];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('store-flow-token');
      }
    }
  }

  /**
   * Obtém token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('store-flow-token');
  }

  /**
   * Obtém refresh token do localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('store-flow-refresh-token');
  }

  /**
   * Salva refresh token
   */
  setRefreshToken(token: string | null): void {
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('store-flow-refresh-token', token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('store-flow-refresh-token');
      }
    }
  }

  /**
   * Renova token usando refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    // Se já está renovando, retornar a promise existente
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new ApiException('Refresh token não encontrado', 'NO_REFRESH_TOKEN', 401);
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          // Refresh token inválido - limpar tudo
          this.setAuthToken(null);
          this.setRefreshToken(null);
          throw new ApiException('Sessão expirada. Faça login novamente.', 'SESSION_EXPIRED', 401);
        }

        const data: RefreshTokenResponse = await response.json();
        const newToken = data.token || (data as unknown as { data: RefreshTokenResponse }).data?.token;

        if (!newToken) {
          throw new ApiException('Token não recebido no refresh', 'REFRESH_FAILED', 401);
        }

        this.setAuthToken(newToken);
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }

        return newToken;
      } catch (error) {
        if (error instanceof ApiException) {
          throw error;
        }
        throw new ApiException('Erro ao renovar token', 'REFRESH_ERROR', 401);
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Faz requisição HTTP com retry automático e refresh token
   */
  private async request<T = unknown>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: unknown,
    config?: RequestConfig & {
      useCache?: boolean;
      cacheTags?: string[];
      skipRefresh?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    const {
      useCache = method === 'GET',
      cacheTags = [],
      skipRefresh = false,
      ...requestConfig
    } = config || {};

    // Verificar cache para GET requests
    if (useCache && method === 'GET') {
      const cacheKey = `api:${endpoint}`;
      const cached = CacheService.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return this.executeRequest<T>(endpoint, method, data, requestConfig, useCache, cacheTags, skipRefresh);
  }

  /**
   * Executa a requisição com retry e refresh token
   */
  private async executeRequest<T = unknown>(
    endpoint: string,
    method: HttpMethod,
    data: unknown | undefined,
    config: RequestConfig | undefined,
    useCache: boolean,
    cacheTags: string[],
    skipRefresh: boolean,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    // Debug: log da URL em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API Client] ${method} ${url}`);
    }

    // Preparar headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...config?.headers,
    };

    // Adicionar token se existir
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Preparar opções da requisição
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: config?.signal,
    };

    // Adicionar body para métodos que suportam
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      // Criar controller para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config?.timeout || this.timeout
      );

      if (config?.signal) {
        // Se já há um signal, combinar ambos
        config.signal.addEventListener('abort', () => controller.abort());
      }

      requestOptions.signal = controller.signal;

      let response: Response;
      try {
        response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Erro de CORS ou rede - a requisição nem chegou ao servidor
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new ApiException(
            `Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${this.baseURL} e se CORS está configurado corretamente.`,
            'CORS_ERROR',
            0
          );
        }
        throw fetchError;
      }

      // Processar resposta
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      let responseData: unknown;

      if (isJson) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Verificar se a resposta é um erro
      if (!response.ok) {
        // Se for 401 e não estiver pulando refresh, tentar renovar token
        if (response.status === 401 && !skipRefresh && retryCount === 0) {
          try {
            await this.refreshAccessToken();
            // Retentar requisição com novo token
            return this.executeRequest<T>(endpoint, method, data, config, useCache, cacheTags, true, 1);
          } catch {
            // Se refresh falhar, tratar como erro 401 normal
            const error = this.handleError(response, responseData);
            throw error;
          }
        }

        // Retry automático para erros de rede (5xx) ou timeout
        if (
          (response.status >= 500 || response.status === 408) &&
          retryCount < this.maxRetries
        ) {
          // Esperar exponencialmente antes de retry (1s, 2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.executeRequest<T>(endpoint, method, data, config, useCache, cacheTags, skipRefresh, retryCount + 1);
        }

        const error = this.handleError(response, responseData);
        throw error;
      }

      // Retornar resposta formatada
      const formattedResponse = this.formatResponse<T>(responseData);

      // Salvar no cache para GET requests
      if (useCache && method === 'GET') {
        const cacheKey = `api:${endpoint}`;
        CacheService.set(cacheKey, formattedResponse, {
          ttl: 5 * 60 * 1000, // 5 minutos
          tags: cacheTags,
        });
      }

      return formattedResponse;

    } catch (error) {
      if (error instanceof ApiException) {
        // Retry para erros de rede ou timeout
        if (
          (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') &&
          retryCount < this.maxRetries
        ) {
          // Esperar exponencialmente antes de retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.executeRequest<T>(endpoint, method, data, config, useCache, cacheTags, skipRefresh, retryCount + 1);
        }
        throw error;
      }

      // Erro de rede, timeout, etc.
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Retry para timeout
          if (retryCount < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            return this.executeRequest<T>(endpoint, method, data, config, useCache, cacheTags, skipRefresh, retryCount + 1);
          }
          throw new ApiException(
            'Requisição cancelada ou timeout',
            'TIMEOUT',
            408
          );
        }
        // Retry para erros de rede
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.executeRequest<T>(endpoint, method, data, config, useCache, cacheTags, skipRefresh, retryCount + 1);
        }
        // Verificar se é erro de CORS
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          throw new ApiException(
            `Erro de CORS: Não foi possível conectar ao servidor em ${this.baseURL}. Verifique se o backend está rodando e se CORS está configurado para aceitar requisições de ${typeof window !== 'undefined' ? window.location.origin : 'frontend'}.`,
            'CORS_ERROR',
            0
          );
        }
        throw new ApiException(
          `Erro de conexão: ${error.message}`,
          'NETWORK_ERROR',
          0
        );
      }

      throw new ApiException('Erro desconhecido', 'UNKNOWN_ERROR', 0);
    }
  }

  /**
   * Formata resposta da API
   */
  private formatResponse<T>(data: unknown): ApiResponse<T> {
    // Se a resposta já está no formato esperado
    if (typeof data === 'object' && data !== null && 'data' in data) {
      return data as ApiResponse<T>;
    }

    // Se não, encapsular em ApiResponse
    return {
      data: data as T,
      success: true,
    };
  }

  /**
   * Trata erros da API
   */
  private handleError(response: Response, data: unknown): ApiException {
    const status = response.status;
    let message = `Erro ${status}`;
    let code: string | undefined;
    let errors: Record<string, string[]> | undefined;

    // Tentar extrair informações do erro
    if (typeof data === 'object' && data !== null) {
      const errorData = data as ApiError;
      
      if ('error' in data && typeof (data as { error: unknown }).error === 'object') {
        const apiError = (data as { error: ApiError }).error;
        message = apiError.message || message;
        code = apiError.code;
        errors = apiError.errors;
      } else if ('message' in errorData) {
        message = errorData.message;
        code = errorData.code;
        errors = errorData.errors;
      }
    } else if (typeof data === 'string') {
      message = data;
    }

    // Mensagens amigáveis por status code
    switch (status) {
      case 400:
        message = message || 'Requisição inválida';
        code = code || 'BAD_REQUEST';
        break;
      case 401:
        message = message || 'Não autenticado. Faça login novamente.';
        code = code || 'UNAUTHORIZED';
        // Limpar token inválido
        if (typeof window !== 'undefined') {
          localStorage.removeItem('store-flow-token');
        }
        break;
      case 403:
        message = message || 'Acesso negado';
        code = code || 'FORBIDDEN';
        break;
      case 404:
        message = message || 'Recurso não encontrado';
        code = code || 'NOT_FOUND';
        break;
      case 422:
        message = message || 'Erro de validação';
        code = code || 'VALIDATION_ERROR';
        break;
      case 500:
        message = message || 'Erro interno do servidor';
        code = code || 'INTERNAL_ERROR';
        break;
      case 503:
        message = message || 'Serviço temporariamente indisponível';
        code = code || 'SERVICE_UNAVAILABLE';
        break;
    }

    return new ApiException(message, code, status, errors);
  }

  // Métodos HTTP

  async get<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, config);
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, config);
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, config);
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, config);
  }

  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, config);
  }
}

// Exportar instância singleton
export const apiClient = new ApiClient();
export default apiClient;
