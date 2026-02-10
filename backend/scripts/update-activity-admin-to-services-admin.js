const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateActivityAdminToServicesAdmin() {
  try {
    console.log('🔄 Начало обновления роли ACTIVITY_ADMIN на SERVICES_ADMIN...')

    // 1. Проверяем, существует ли роль ACTIVITY_ADMIN
    const activityAdminRole = await prisma.role.findUnique({
      where: { name: 'ACTIVITY_ADMIN' }
    })

    if (!activityAdminRole) {
      console.log('ℹ️  Роль ACTIVITY_ADMIN не найдена в базе данных. Возможно, она уже была удалена или переименована.')
      
      // Проверяем, существует ли роль SERVICES_ADMIN
      const servicesAdminRole = await prisma.role.findUnique({
        where: { name: 'SERVICES_ADMIN' }
      })

      if (!servicesAdminRole) {
        console.log('📝 Создаем роль SERVICES_ADMIN...')
        await prisma.role.create({
          data: { name: 'SERVICES_ADMIN' }
        })
        console.log(' Роль SERVICES_ADMIN создана')
      } else {
        console.log(' Роль SERVICES_ADMIN уже существует')
      }
      
      await prisma.$disconnect()
      return
    }

    // 2. Проверяем, существует ли роль SERVICES_ADMIN
    let servicesAdminRole = await prisma.role.findUnique({
      where: { name: 'SERVICES_ADMIN' }
    })

    if (!servicesAdminRole) {
      console.log('📝 Создаем роль SERVICES_ADMIN...')
      servicesAdminRole = await prisma.role.create({
        data: { name: 'SERVICES_ADMIN' }
      })
      console.log(' Роль SERVICES_ADMIN создана')
    } else {
      console.log(' Роль SERVICES_ADMIN уже существует')
    }

    // 3. Находим всех пользователей с ролью ACTIVITY_ADMIN
    const usersWithActivityAdmin = await prisma.user.findMany({
      where: { roleId: activityAdminRole.id },
      select: { id: true, email: true, firstName: true, lastName: true }
    })

    console.log(`📊 Найдено пользователей с ролью ACTIVITY_ADMIN: ${usersWithActivityAdmin.length}`)

    // 4. Обновляем всех пользователей на роль SERVICES_ADMIN
    if (usersWithActivityAdmin.length > 0) {
      console.log('🔄 Обновление пользователей...')
      for (const user of usersWithActivityAdmin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: servicesAdminRole.id }
        })
        console.log(`   Пользователь ${user.email} (${user.firstName} ${user.lastName}) обновлен`)
      }
      console.log(` Все пользователи обновлены на роль SERVICES_ADMIN`)
    }

    // 5. Удаляем роль ACTIVITY_ADMIN
    console.log('🗑️  Удаление роли ACTIVITY_ADMIN...')
    await prisma.role.delete({
      where: { id: activityAdminRole.id }
    })
    console.log(' Роль ACTIVITY_ADMIN удалена')

    console.log('\n Обновление завершено успешно!')
    console.log(`📊 Статистика:`)
    console.log(`   - Обновлено пользователей: ${usersWithActivityAdmin.length}`)
    console.log(`   - Роль ACTIVITY_ADMIN удалена`)
    console.log(`   - Роль SERVICES_ADMIN активна`)

  } catch (error) {
    console.error(' Ошибка при обновлении:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateActivityAdminToServicesAdmin()
  .catch((error) => {
    console.error(' Критическая ошибка:', error)
    process.exit(1)
  })


