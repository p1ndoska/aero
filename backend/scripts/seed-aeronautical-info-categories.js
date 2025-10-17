const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAeronauticalInfoCategories() {
  try {
    console.log('Seeding aeronautical info categories...');

    const aeronauticalInfoCategories = [
      {
        name: 'Сборник аэронавигационной информации (EAIP)',
        nameEn: 'Aeronautical information publication (EAIP)',
        nameBe: 'Зборнік аэранавігацыйнай інфармацыі (EAIP)',
        description: 'Сборник аэронавигационной информации для аэропортов и воздушных трасс',
        descriptionEn: 'Aeronautical information publication for airports and air routes',
        descriptionBe: 'Зборнік аэранавігацыйнай інфармацыі для аэрапортаў і паветраных трас',
        pageType: 'eaip',
        isActive: true,
        sortOrder: 0
      },
      {
        name: 'Сборник аэронавигационной информации для визуальных полетов (EAIP VFR)',
        nameEn: 'Aeronautical information publication for visual flight rules (EAIP VFR)',
        nameBe: 'Зборнік аэранавігацыйнай інфармацыі для візуальных палётаў (EAIP VFR)',
        description: 'Сборник аэронавигационной информации для визуальных полетов',
        descriptionEn: 'Aeronautical information publication for visual flight rules',
        descriptionBe: 'Зборнік аэранавігацыйнай інфармацыі для візуальных палётаў',
        pageType: 'eaip-vfr',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Электронные данные о местности и препятствиях (ETOD)',
        nameEn: 'Electronic terrain and obstacle data (ETOD)',
        nameBe: 'Электронныя даныя аб мясцовасці і перашкодах (ETOD)',
        description: 'Электронные данные о местности и препятствиях для авиации',
        descriptionEn: 'Electronic terrain and obstacle data for aviation',
        descriptionBe: 'Электронныя даныя аб мясцовасці і перашкодах для авіяцыі',
        pageType: 'etod',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Циркуляры аэронавигационной информации (AIC)',
        nameEn: 'Aeronautical information circulars (AIC)',
        nameBe: 'Цыркуляры аэранавігацыйнай інфармацыі (AIC)',
        description: 'Циркуляры аэронавигационной информации',
        descriptionEn: 'Aeronautical information circulars',
        descriptionBe: 'Цыркуляры аэранавігацыйнай інфармацыі',
        pageType: 'aic',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Порядок взимания сборов за аэронавигационное обслуживание',
        nameEn: 'Procedure for collecting charges for aeronautical services',
        nameBe: 'Парадак узімвання збораў за аэранавігацыйнае абслугоўванне',
        description: 'Порядок взимания сборов за аэронавигационное обслуживание',
        descriptionEn: 'Procedure for collecting charges for aeronautical services',
        descriptionBe: 'Парадак узімвання збораў за аэранавігацыйнае абслугоўванне',
        pageType: 'charges-procedure',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Дополнения к сборнику аэронавигационной информации (SUP)',
        nameEn: 'Supplements to aeronautical information publication (SUP)',
        nameBe: 'Дапаўненні да зборніка аэранавігацыйнай інфармацыі (SUP)',
        description: 'Дополнения к сборнику аэронавигационной информации',
        descriptionEn: 'Supplements to aeronautical information publication',
        descriptionBe: 'Дапаўненні да зборніка аэранавігацыйнай інфармацыі',
        pageType: 'sup',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Подписка на EAIP и/или EAIP VFR',
        nameEn: 'Subscription to EAIP and/or EAIP VFR',
        nameBe: 'Падпіска на EAIP і/або EAIP VFR',
        description: 'Подписка на EAIP и/или EAIP VFR',
        descriptionEn: 'Subscription to EAIP and/or EAIP VFR',
        descriptionBe: 'Падпіска на EAIP і/або EAIP VFR',
        pageType: 'subscription',
        isActive: true,
        sortOrder: 6
      },
      {
        name: 'Система менеджмента качества',
        nameEn: 'Quality management system',
        nameBe: 'Сістэма менеджменту якасці',
        description: 'Система менеджмента качества',
        descriptionEn: 'Quality management system',
        descriptionBe: 'Сістэма менеджменту якасці',
        pageType: 'quality-management',
        isActive: true,
        sortOrder: 7
      },
      {
        name: 'Система для подачи заявок на использование воздушного пространства (FPL)',
        nameEn: 'System for submitting applications for airspace use (FPL)',
        nameBe: 'Сістэма для падачы заявак на выкарыстанне паветранай прасторы (FPL)',
        description: 'Система для подачи заявок на использование воздушного пространства',
        descriptionEn: 'System for submitting applications for airspace use',
        descriptionBe: 'Сістэма для падачы заявак на выкарыстанне паветранай прасторы',
        pageType: 'fpl',
        isActive: true,
        sortOrder: 8
      },
      {
        name: 'Прочая информация',
        nameEn: 'Other information',
        nameBe: 'Іншая інфармацыя',
        description: 'Прочая информация',
        descriptionEn: 'Other information',
        descriptionBe: 'Іншая інфармацыя',
        pageType: 'other-info',
        isActive: true,
        sortOrder: 9
      }
    ];

    // Создаем категории аэронавигационной информации
    for (const categoryData of aeronauticalInfoCategories) {
      await prisma.aeronauticalInfoCategory.upsert({
        where: { pageType: categoryData.pageType },
        update: categoryData,
        create: categoryData,
      });
      console.log(`Created/Updated aeronautical info category: ${categoryData.name}`);
    }

    console.log('Aeronautical info categories seeding completed!');
  } catch (error) {
    console.error('Error seeding aeronautical info categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем сидинг только если файл выполняется напрямую
if (require.main === module) {
  seedAeronauticalInfoCategories();
}

module.exports = { seedAeronauticalInfoCategories };