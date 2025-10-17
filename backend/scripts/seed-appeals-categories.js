const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAppealsCategories() {
  try {
    console.log('Seeding appeals categories...');

    const appeals = [
      {
        name: 'Электронные обращения',
        nameEn: 'E-appeals',
        nameBe: 'Электронныя звароты',
        pageType: 'e-appeals',
        sortOrder: 0,
        isActive: true,
      },
      {
        name: 'Добровольное сообщение о небезопасном событии',
        nameEn: 'Voluntary report of unsafe event',
        nameBe: 'Добраахвотнае паведамленне пра небяспечную падзею',
        pageType: 'voluntary-report',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Способы подачи обращений и порядок рассмотрения',
        nameEn: 'Submission methods and review procedure',
        nameBe: 'Спосабы падачы зваротаў і парадак іх разгляду',
        pageType: 'submission-methods',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Графики приема',
        nameEn: 'Reception schedules',
        nameBe: 'Графікі прыёму',
        pageType: 'schedules',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Анкета потребителя аэронавигационных услуг',
        nameEn: 'Aeronautical services customer questionnaire',
        nameBe: 'Анкета спадарожніка аэранавігацыйных паслуг',
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
      console.log(`Created/Updated appeals category: ${cat.name}`);
    }

    console.log('Appeals categories seeding completed!');
  } catch (e) {
    console.error('Error seeding appeals categories:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAppealsCategories();
}

module.exports = { seedAppealsCategories };