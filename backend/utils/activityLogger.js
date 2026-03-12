const prisma = require('../prisma/prisma-client');

/**
 * Логирование активности пользователя.
 *
 * Таблица read-only для админки: мы не будем давать CRUD в API,
 * только вставки из серверного кода и чтение при необходимости.
 *
 * @param {Object} params
 * @param {string} params.action - тип действия (например: LOGIN, LOGOUT, CREATE_CONTENT, UPDATE_CONTENT)
 * @param {number|null} [params.userId] - ID пользователя (может быть null)
 * @param {string|null} [params.description] - человеко-читаемое описание
 * @param {string|null} [params.userRole] - роль пользователя на момент действия
 * @param {string|null} [params.userName] - имя/логин пользователя (email или ФИО)
 * @param {Object} [params.metadata] - произвольные данные (ID сущности, payload и т.п.)
 * @param {import('express').Request} [params.req] - HTTP-запрос (для IP и User-Agent)
 */
async function logUserActivity({ action, userId = null, description = null, metadata = undefined, userRole = null, userName = null, req = undefined }) {
  try {
    const ip =
      req?.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req?.socket?.remoteAddress ||
      null;
    const userAgent = req?.headers['user-agent'] || null;

    // Если роль/имя не переданы явно, пробуем взять из JWT (auth middleware кладёт в req.user)
    const jwtUser = req?.user;
    let effectiveUserId = userId ?? jwtUser?.userId ?? null;
    let effectiveRole = userRole ?? (jwtUser?.role || null);
    let effectiveName = userName ?? (jwtUser?.email || null);

    // Если есть userId, но нет имени/роли в jwt, пробуем подтянуть их из БД
    if (effectiveUserId && (!effectiveName || !effectiveRole)) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: effectiveUserId },
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: { select: { name: true } },
          },
        });
        if (dbUser) {
          if (!effectiveName) {
            // Сначала пробуем собрать ФИО, если нет — fallback на email
            const parts = [dbUser.lastName, dbUser.firstName].filter(Boolean);
            effectiveName = parts.length ? parts.join(' ') : dbUser.email || effectiveName;
          }
          if (!effectiveRole) {
            effectiveRole = dbUser.role?.name || effectiveRole;
          }
        }
      } catch (e) {
        console.error('logUserActivity lookup user error', {
          message: e.message,
          userId: effectiveUserId,
        });
      }
    }

    await prisma.userActivityLog.create({
      data: {
        action,
        userId: effectiveUserId,
        description,
        userRole: effectiveRole,
        userName: effectiveName,
        ip,
        userAgent,
        metadata: metadata !== undefined ? metadata : undefined,
      },
    });
  } catch (error) {
    // Логирование не должно ломать основной поток
    console.error('logUserActivity error', {
      message: error.message,
      stack: error.stack,
      action,
      userId: effectiveUserId,
    });
  }
}

module.exports = {
  logUserActivity,
};

