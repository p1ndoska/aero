// Функция для получения API URL
// Для локальной разработки используем локальный backend, для production - Docker
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // В режиме разработки (npm run dev) используем локальный сервер
  // В production (npm run build) используем Docker
  return import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443';
};

export const BASE_URL = getApiUrl();