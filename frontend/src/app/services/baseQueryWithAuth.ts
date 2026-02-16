// Общий baseQuery с обработкой 401 для всех API сервисов
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout } from '../../features/user/userSlice';
import { BASE_URL } from '../../constants';

export const createBaseQueryWithAuth = (baseUrl?: string) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: baseUrl || `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      let token = state?.auth?.token;
      
      if (!token) {
        try {
          token = localStorage.getItem('token');
        } catch (e) {
          // localStorage недоступен
        }
      }

      if (token) {
        const cleanToken = token.trim();
        headers.set('authorization', `Bearer ${cleanToken}`);
      }
      return headers;
    },
  });

  return async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Если получили 401, токен невалидный или истек
    if (result.error && result.error.status === 401) {
      console.error('API: Unauthorized (401) - Token expired or invalid. Logging out...');
      
      // Выполняем logout
      api.dispatch(logout());
      
      // Перенаправляем на главную страницу
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    
    // Для ошибок 502/503/504 (сервер недоступен) не логируем
    // Это предотвратит спам в консоли при недоступном сервере
    // Ошибки все равно будут видны в DevTools Network, но не будут логироваться в консоль
    
    return result;
  };
};

