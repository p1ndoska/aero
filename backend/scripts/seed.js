const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { seedAboutCompanyCategories } = require('./seed-about-company-categories')
const { seedSocialWorkCategories } = require('./seed-social-categories')
const { seedAeronauticalInfoCategories } = require('./seed-aeronautical-info-categories')
const { seedAppealsCategories } = require('./seed-appeals-categories')
const { seedServicesCategories } = require('./seed-services-categories')

const prisma = new PrismaClient()

const roles = [
  'SUPER_ADMIN',
  // News
  'NEWS_ADMIN',
  // About
  'ABOUT_ADMIN',
  // Activity
  'ACTIVITY_ADMIN',
  // Air Navigation
  'AIRNAV_ADMIN',
  // Appeals
  'APPEALS_ADMIN',
  // Social
  'SOCIAL_ADMIN',
  // Media
  'MEDIA_ADMIN',
  // Generic site viewer
  'USER'
]

async function main() {
  // Seed roles
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Ensure SUPER_ADMIN user exists
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@local'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!'
  const superRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  if (!superRole) throw new Error('SUPER_ADMIN role not found after seed')

  const hashed = bcrypt.hashSync(superAdminPassword, 10)
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { 
      roleId: superRole.id, 
      password: hashed,
      // При обновлении не меняем mustChangePassword, чтобы не сбрасывать флаг для существующих пользователей
    },
    create: {
      email: superAdminEmail,
      password: hashed,
      role: { connect: { id: superRole.id } },
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      mustChangePassword: true, // Требуется смена пароля при первом входе
      passwordChangedAt: new Date(), // Устанавливаем дату создания как дату смены пароля
    },
  })



  console.log('Roles seeded:', roles.length)
  console.log('SUPER_ADMIN ready:', superAdminEmail)

  // Seed categories
  await seedAboutCompanyCategories()
  await seedSocialWorkCategories()
  await seedAeronauticalInfoCategories()
  await seedAppealsCategories()
  await seedServicesCategories()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 