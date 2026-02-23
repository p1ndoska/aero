// Функция для получения API URL
// В production использует тот же домен, с которого загружен frontend (window.location.origin)
// Это позволяет работать по DNS без необходимости пересборки frontend
const getApiUrl = () => {
  // В режиме разработки используем VITE_API_URL или localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
  
  // В production всегда используем window.location.origin для автоматического определения домена
  // Это позволяет работать как по IP, так и по DNS без пересборки
  if (typeof window !== 'undefined') {
    // window.location.origin уже включает протокол, хост и порт (если нестандартный)
    // Например: https://aero.ban.by:8443 или https://192.168.1.100:8443
    return window.location.origin;
  }
  
  // Fallback для SSR (если будет использоваться)
  // Используем VITE_API_URL только как fallback, если window недоступен
  return import.meta.env.VITE_API_URL || 'https://localhost:8443';
};

export const BASE_URL = getApiUrl();