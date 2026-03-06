import { BASE_URL } from '../constants';

/**
 * Нормализует URL изображения для отображения
 * Обрабатывает как относительные пути, так и полные URL
 * Если URL содержит старый домен (localhost или другой), заменяет его на текущий BASE_URL
 * @param imagePath - путь к изображению (может быть относительным или полным URL)
 * @returns полный URL для использования в src атрибуте
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }
  
  // Если уже полный URL, проверяем, нужно ли заменить домен
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      const url = new URL(imagePath);
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : BASE_URL;
      const currentUrl = new URL(currentOrigin);
      
      // Если домен отличается от текущего, заменяем его
      if (url.origin !== currentUrl.origin) {
        // Извлекаем путь из старого URL
        const path = url.pathname;
        // Формируем новый URL с текущим доменом
        return `${currentOrigin}${path}${url.search}${url.hash}`;
      }
      
      // Если домен совпадает, возвращаем как есть
      return imagePath;
    } catch (e) {
      // Если не удалось распарсить URL, возвращаем как есть
      return imagePath;
    }
  }
  
  // Если путь начинается с '/', добавляем BASE_URL
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Если путь начинается с 'uploads/', добавляем '/' и BASE_URL
  if (imagePath.startsWith('uploads/')) {
    return `${BASE_URL}/${imagePath}`;
  }
  
  // Иначе добавляем BASE_URL и '/'
  return `${BASE_URL}/${imagePath}`;
}

