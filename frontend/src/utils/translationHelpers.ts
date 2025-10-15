/**
 * Получает переведенное поле из объекта на основе текущего языка
 * @param obj - объект с переводами
 * @param field - базовое имя поля
 * @param language - текущий язык ('ru', 'en', 'be')
 * @returns переведенное значение или значение по умолчанию
 */
export function getTranslatedField(obj: any, field: string, language: string): any {
  if (!obj) return null;
  
  switch (language) {
    case 'en':
      return obj[`${field}En`] || obj[field];
    case 'be':
      return obj[`${field}Be`] || obj[field];
    default: // 'ru' или по умолчанию
      return obj[field];
  }
}

/**
 * Получает переведенное поле из объекта на основе текущего языка (для строк)
 * @param obj - объект с переводами
 * @param field - базовое имя поля
 * @param language - текущий язык ('ru', 'en', 'be')
 * @param defaultValue - значение по умолчанию
 * @returns переведенная строка или значение по умолчанию
 */
export function getTranslatedString(
  obj: any, 
  field: string, 
  language: string, 
  defaultValue: string = ''
): string {
  const translated = getTranslatedField(obj, field, language);
  return translated || defaultValue;
}