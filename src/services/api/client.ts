/**
 * Cliente HTTP centralizado para todas as requisições
 */

import API_CONFIG from '@/config/env';
import type { ApiResponse, ApiError, RequestConfig, HttpMethod } from '@/types/api';
import { ApiException } from '@/types/api';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

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
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * Obtém token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('venda-facil-token');
  }

  /**
   * Faz requisição HTTP
   */
  private async request<T = unknown>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
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

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

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
        const error = this.handleError(response, responseData);
        throw error;
      }

      // Retornar resposta formatada
      return this.formatResponse<T>(responseData);

    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Erro de rede, timeout, etc.
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiException(
            'Requisição cancelada ou timeout',
            'TIMEOUT',
            408
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
          localStorage.removeItem('venda-facil-token');
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
