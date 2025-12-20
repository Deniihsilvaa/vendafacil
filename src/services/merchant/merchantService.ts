import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

import type { ApiResponse } from '@/types/api';
import type { Merchant } from '../../types/auth';

export const MERCHANT_LOGIN_CATEGORIES = [
    { value: 'hamburgueria', label: 'Hamburgueria' },
    { value: 'pizzaria', label: 'Pizzaria' },
    { value: 'pastelaria', label: 'Pastelaria' },
    { value: 'sorveteria', label: 'Sorveteria' },
    { value: 'cafeteria', label: 'Cafeteria' },
    { value: 'padaria', label: 'Padaria' },
    { value: 'comida_brasileira', label: 'Comida Brasileira' },
    { value: 'comida_japonesa', label: 'Comida Japonesa' },
    { value: 'doces', label: 'Doces' },
    { value: 'mercado', label: 'Mercado' },
    { value: 'outros', label: 'Outros' },
  ] as const;
  export function MerchantLoginService (){
    
    const login = async (data: { email: string; password: string }): Promise<ApiResponse<Merchant>> => {
      const response = await apiClient.post<ApiResponse<Merchant>>(API_ENDPOINTS.AUTH.MERCHANT_LOGIN, data);
      return response.data;
    }
    const signup = async (data: { email: string; password: string }): Promise<ApiResponse<Merchant>> => {
      const response = await apiClient.post<ApiResponse<Merchant>>(API_ENDPOINTS.AUTH.MERCHANT_SIGNUP, data);
      return response.data;
    }
    const logout = async (): Promise<ApiResponse<{ success: boolean }>> => {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    }
    const refresh = async (): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
      const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(API_ENDPOINTS.AUTH.REFRESH);
      return response.data;
    }
    return { login, signup, logout, refresh };
  }