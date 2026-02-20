// Функция для получения API URL
// В production использует тот же домен, с которого загружен frontend (window.location.origin)
// Это позволяет работать по DNS без необходимости пересборки frontend
const getApiUrl = () => {
  // В режиме разработки используем VITE_API_URL или localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
  
  // В production:
  // 1. Если указан VITE_API_URL - используем его (для случаев, когда API на другом домене)
  // 2. Иначе используем window.location.origin (тот же домен, с которого загружен frontend)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Используем тот же домен, с которого загружен frontend
  // Это работает для случаев, когда frontend и backend на одном домене
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback для SSR (если будет использоваться)
  return 'https://localhost:8443';
};

export const BASE_URL = getApiUrl();