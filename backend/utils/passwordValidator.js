/**
 * Утилита для валидации паролей
 * Разные требования для обычных пользователей и администраторов
 */

/**
 * Проверяет, является ли пользователь администратором
 */
function isAdmin(roleName) {
  // Роли администраторов, для которых срок жизни пароля 180 дней
  const adminRoles = ['SUPER_ADMIN', 'NEWS_ADMIN', 'ABOUT_ADMIN', 'AIRNAV_ADMIN', 
                      'APPEALS_ADMIN', 'SOCIAL_ADMIN', 'MEDIA_ADMIN'];
  // Приводим к верхнему регистру для сравнения
  const normalizedRoleName = roleName ? roleName.toUpperCase() : '';
  return adminRoles.some(role => role.toUpperCase() === normalizedRoleName);
}

/**
 * Вычисляет количество отличающихся символов между двумя паролями
 */
function getPasswordDifference(password1, password2) {
  if (password1.length !== password2.length) {
    return Math.max(password1.length, password2.length);
  }
  
  let differences = 0;
  for (let i = 0; i < password1.length; i++) {
    if (password1[i] !== password2[i]) {
      differences++;
    }
  }
  return differences;
}

/**
 * Валидация пароля для обычных пользователей
 * @param {string} password - Новый пароль
 * @param {string} username - Email пользователя
 * @param {Array<string>} previousPasswordHashes - Массив хешей предыдущих паролей
 * @param {Function} comparePassword - Функция для сравнения пароля с хешем (async)
 */
async function validateUserPassword(password, username, previousPasswordHashes = [], comparePassword) {
  const errors = [];

  // Минимальная длина 8 символов
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  // Проверка на наличие букв A-Z
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву (A-Z)');
  }

  // Проверка на наличие букв a-z
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву (a-z)');
  }

  // Проверка на наличие цифр 0-9
  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру (0-9)');
  }

  // Проверка на наличие специальных символов ! $ # %
  if (!/[!$#%]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы один из символов: ! $ # %');
  }

  // Пароль не может содержать имя учетной записи (email без домена)
  const usernamePart = username.split('@')[0].toLowerCase();
  if (password.toLowerCase().includes(usernamePart)) {
    errors.push('Пароль не может содержать имя учетной записи');
  }

  // Проверка отличия от предыдущих паролей (минимум 4 символа)
  if (previousPasswordHashes.length > 0 && comparePassword) {
    // Асинхронная проверка всех предыдущих паролей
    let isDifferent = true;
    for (const prevHash of previousPasswordHashes) {
      const matches = await comparePassword(password, prevHash);
      if (matches) {
        isDifferent = false;
        break;
      }
    }
    
    if (!isDifferent) {
      errors.push('Новый пароль должен отличаться от предыдущего минимум на 4 символа');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация пароля для администраторов
 * @param {string} password - Новый пароль
 * @param {string} username - Email пользователя
 * @param {Array<string>} previousPasswordHashes - Массив хешей предыдущих паролей
 * @param {Function} comparePassword - Функция для сравнения пароля с хешем (async)
 */
async function validateAdminPassword(password, username, previousPasswordHashes = [], comparePassword) {
  const errors = [];

  // Минимальная длина 14 символов
  if (password.length < 14) {
    errors.push('Пароль администратора должен содержать минимум 14 символов');
  }

  // Проверка на наличие букв A-Z
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву (A-Z)');
  }

  // Проверка на наличие букв a-z
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву (a-z)');
  }

  // Проверка на наличие цифр 0-9
  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру (0-9)');
  }

  // Проверка на наличие специальных символов ! $ # %
  if (!/[!$#%]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы один из символов: ! $ # %');
  }

  // Пароль не может содержать имя учетной записи или его часть
  const usernamePart = username.split('@')[0].toLowerCase();
  const usernameParts = usernamePart.split(/[._-]/); // Разбиваем по точкам, подчеркиваниям, дефисам
  
  for (const part of usernameParts) {
    if (part.length >= 3 && password.toLowerCase().includes(part)) {
      errors.push('Пароль не может содержать имя учетной записи или его часть');
      break;
    }
  }

  // Проверка отличия от предыдущих паролей (минимум 4 символа)
  if (previousPasswordHashes.length > 0 && comparePassword) {
    let isDifferent = true;
    for (const prevHash of previousPasswordHashes) {
      const matches = await comparePassword(password, prevHash);
      if (matches) {
        isDifferent = false;
        break;
      }
    }
    
    if (!isDifferent) {
      errors.push('Новый пароль должен отличаться от предыдущего минимум на 4 символа');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Основная функция валидации пароля
 * @param {string} password - Новый пароль
 * @param {string} username - Email пользователя
 * @param {string} roleName - Название роли
 * @param {Array<string>} previousPasswordHashes - Массив хешей предыдущих паролей
 * @param {Function} comparePassword - Функция для сравнения пароля с хешем (async)
 */
async function validatePassword(password, username, roleName, previousPasswordHashes = [], comparePassword) {
  if (isAdmin(roleName)) {
    return await validateAdminPassword(password, username, previousPasswordHashes, comparePassword);
  } else {
    return await validateUserPassword(password, username, previousPasswordHashes, comparePassword);
  }
}

/**
 * Проверка срока жизни пароля
 * @param {Date} passwordChangedAt - Дата последней смены пароля
 * @param {string} roleName - Название роли
 * @returns {Object} { expired: boolean, daysRemaining: number, maxDays: number }
 */
function checkPasswordExpiry(passwordChangedAt, roleName) {
  if (!passwordChangedAt) {
    return { expired: true, daysRemaining: 0, maxDays: 0 };
  }

  const maxDays = isAdmin(roleName) ? 180 : 365;
  const now = new Date();
  const changedAt = new Date(passwordChangedAt);
  const daysSinceChange = Math.floor((now - changedAt) / (1000 * 60 * 60 * 24));
  const daysRemaining = maxDays - daysSinceChange;

  return {
    expired: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
    maxDays
  };
}

module.exports = {
  validatePassword,
  validateUserPassword,
  validateAdminPassword,
  checkPasswordExpiry,
  isAdmin,
  getPasswordDifference
};

