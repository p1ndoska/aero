// Функция для получения API URL
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443';
};

export const BASE_URL = getApiUrl();
export const SERVER_URL = getApiUrl();