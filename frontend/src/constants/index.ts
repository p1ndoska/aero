// Функция для получения API URL
const getApiUrl = () => {
  // Приоритет 1: переменная окружения VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Приоритет 2: переменные окружения для dev/prod
  if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_DEV_URL) {
    return import.meta.env.VITE_BACKEND_DEV_URL;
  }
  
  if (!import.meta.env.DEV && import.meta.env.VITE_FRONTEND_PROD_URL) {
    return import.meta.env.VITE_FRONTEND_PROD_URL;
  }
  
  // Приоритет 3: значения по умолчанию
  return import.meta.env.DEV 
    ? (import.meta.env.VITE_FRONTEND_DEV_URL || 'http://localhost:3000')
    : (import.meta.env.VITE_FRONTEND_PROD_URL || window.location.origin);
};

export const BASE_URL = getApiUrl();
export const SERVER_URL = getApiUrl();