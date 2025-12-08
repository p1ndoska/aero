const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    // Проверяем всех пользователей с ролью SERVICES_ADMIN
    const servicesAdminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'SERVICES_ADMIN'
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Пользователи с ролью SERVICES_ADMIN:');
    console.log(JSON.stringify(servicesAdminUsers, null, 2));

    // Проверяем, есть ли еще пользователи с ролью ACTIVITY_ADMIN
    const activityAdminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'ACTIVITY_ADMIN'
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (activityAdminUsers.length > 0) {
      console.log('\n⚠️  Найдены пользователи с ролью ACTIVITY_ADMIN (нужно обновить):');
      console.log(JSON.stringify(activityAdminUsers, null, 2));
    } else {
      console.log('\n✅ Пользователей с ролью ACTIVITY_ADMIN не найдено');
    }

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();

