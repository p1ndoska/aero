/**
 * Получает переведенное поле из объекта на основе текущего языка
 * @param obj - объект с переводами
 * @param field - базовое имя поля
 * @param language - текущий язык ('ru', 'en', 'be')
 * @returns переведенное значение или значение по умолчанию
 */
export function getTranslatedField(obj: any, field: string, language: string): any {
  if (!obj) return '';
  
  const baseValue = obj[field];
  
  // Проверяем, является ли значение пустым (для строк, массивов, объектов)
  const isEmpty = (value: any): boolean => {
    if (value == null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };
  
  switch (language) {
    case 'en':
      // Если есть перевод на английском, используем его, иначе базовое значение
      const enValue = obj[`${field}En`];
      return (!isEmpty(enValue)) ? enValue : (baseValue != null ? baseValue : '');
    case 'be':
      // Если есть перевод на белорусском, используем его, иначе базовое значение
      const beValue = obj[`${field}Be`];
      return (!isEmpty(beValue)) ? beValue : (baseValue != null ? baseValue : '');
    default: // 'ru' или по умолчанию
      return baseValue != null ? baseValue : '';
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