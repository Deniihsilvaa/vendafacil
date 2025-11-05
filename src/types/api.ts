/**
 * Tipos padronizados para API
 */

// Resposta genérica da API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Erro padronizado da API
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>; // Validações de campo
  timestamp?: string;
}

// Resposta de erro da API
export interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

// Parâmetros de paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Configurações de requisição
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// Métodos HTTP suportados
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Classe de erro customizada
export class ApiException extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    code?: string,
    status?: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.errors = errors;
    
    // Mantém o stack trace correto (Node.js/V8)
    // @ts-ignore - captureStackTrace não está no tipo Error do TypeScript
    if (typeof Error.captureStackTrace === 'function') {
      // @ts-ignore
      Error.captureStackTrace(this, ApiException);
    }
  }
}
