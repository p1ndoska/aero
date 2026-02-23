import { BASE_URL } from '../constants';

/**
 * Нормализует URL изображения для отображения
 * Обрабатывает как относительные пути, так и полные URL
 * @param imagePath - путь к изображению (может быть относительным или полным URL)
 * @returns полный URL для использования в src атрибуте
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }
  
  // Если уже полный URL, возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Если путь начинается с '/', добавляем BASE_URL
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Иначе добавляем BASE_URL и '/'
  return `${BASE_URL}/${imagePath}`;
}

