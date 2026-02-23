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
    // Если используется нестандартный порт (8443), добавляем его
    const origin = window.location.origin;
    const port = window.location.port;
    // Если порт 8443 (HTTPS) или 80/443 (стандартные), используем origin как есть
    // Иначе добавляем порт
    if (port && port !== '80' && port !== '443' && port !== '') {
      return `${window.location.protocol}//${window.location.hostname}:${port}`;
    }
    return origin;
  }
  
  // Fallback для SSR (если будет использоваться)
  return 'https://localhost:8443';
};

export const BASE_URL = getApiUrl();