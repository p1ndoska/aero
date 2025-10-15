const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAppealsCategories() {
  try {
    console.log('🌱 Seeding appeals categories...');

    const appeals = [
      {
        name: 'ЭЛЕКТРОННЫЕ ОБРАЩЕНИЯ',
        nameEn: 'E-APPEALS',
        nameBe: 'ЭЛЕКТРОННЫЯ ЗВАРОТЫ',
        pageType: 'e-appeals',
        sortOrder: 0,
        isActive: true,
      },
      {
        name: 'ДОБРОВОЛЬНОЕ СООБЩЕНИЕ О НЕБЕЗОПАСНОМ СОБЫТИИ',
        nameEn: 'VOLUNTARY REPORT OF UNSAFE EVENT',
        nameBe: 'ДОБРААХВОТНАЕ ПАВЕДАМЛЕННЕ ПРА НЕБЯСПЕЧНУЮ ПАДЗЕЮ',
        pageType: 'voluntary-report',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'СПОСОБЫ ПОДАЧИ ОБРАЩЕНИЙ И ПОРЯДОК РАССМОТРЕНИЯ',
        nameEn: 'SUBMISSION METHODS AND REVIEW PROCEDURE',
        nameBe: 'СПОСАБЫ ПАДАЧЫ ЗВАРОТАЎ І ПАРАДАК ІХ РАЗГЛЯДУ',
        pageType: 'submission-methods',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'ГРАФИКИ ПРИЕМА',
        nameEn: 'RECEPTION SCHEDULES',
        nameBe: 'ГРАФІКІ ПРЫЁМУ',
        pageType: 'schedules',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'АНКЕТА ПОТРЕБИТЕЛЯ АЭРОНАВИГАЦИОННЫХ УСЛУГ',
        nameEn: 'AERONAUTICAL SERVICES CUSTOMER QUESTIONNAIRE',
        nameBe: 'АНКЕТА СПАДАРОЖНІКА АЭРАНАВІГАЦЫЙНЫХ ПОСЛУГ',
        pageType: 'customer-questionnaire',
        sortOrder: 4,
        isActive: true,
      },
    ];

    for (const cat of appeals) {
      await prisma.appealsCategory.upsert({
        where: { pageType: cat.pageType },
        update: cat,
        create: cat,
      });
      console.log(`✅ Created/Updated appeals category: ${cat.name}`);
    }

    console.log('🎉 Appeals categories seeding completed!');
  } catch (e) {
    console.error('❌ Error seeding appeals categories:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAppealsCategories();
}

module.exports = { seedAppealsCategories };


