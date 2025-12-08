// Утилита для обработки fetch запросов с автоматическим выходом при 401
import { store } from '../app/store';
import { logout } from '../features/user/userSlice';

/**
 * Выполняет fetch запрос с автоматической обработкой 401 ошибки
 * При получении 401 автоматически выполняет logout и перенаправляет на главную
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Получаем токен из localStorage
  const token = localStorage.getItem('token');
  
  // Добавляем токен в заголовки, если он есть
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token.trim()}`);
  }
  
  // Выполняем запрос
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Если получили 401, выполняем logout и перенаправляем
  if (response.status === 401) {
    console.error('API: Unauthorized (401) - Token expired or invalid. Logging out...');
    
    // Выполняем logout
    store.dispatch(logout());
    
    // Перенаправляем на главную страницу
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    
    // Бросаем ошибку, чтобы вызывающий код мог обработать
    throw new Error('Unauthorized: Token expired or invalid');
  }
  
  return response;
}

