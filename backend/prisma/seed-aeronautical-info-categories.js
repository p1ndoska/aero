const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAeronauticalInfoCategories() {
  try {
    console.log('🌱 Seeding aeronautical info categories...');

    const aeronauticalInfoCategories = [
      {
        name: 'СБОРНИК АЭРОНАВИГАЦИОННОЙ ИНФОРМАЦИИ (EAIP)',
        nameEn: 'AERONAUTICAL INFORMATION PUBLICATION (EAIP)',
        nameBe: 'ЗБОРНІК АЭРАНАВІГАЦЫЙНАЙ ІНФАРМАЦЫІ (EAIP)',
        description: 'Сборник аэронавигационной информации для аэропортов и воздушных трасс',
        descriptionEn: 'Aeronautical information publication for airports and air routes',
        descriptionBe: 'Зборнік аэранавігацыйнай інфармацыі для аэрапортаў і паветраных трас',
        pageType: 'eaip',
        isActive: true,
        sortOrder: 0
      },
      {
        name: 'СБОРНИК АЭРОНАВИГАЦИОННОЙ ИНФОРМАЦИИ ДЛЯ ВИЗУАЛЬНЫХ ПОЛЕТОВ (EAIP VFR)',
        nameEn: 'AERONAUTICAL INFORMATION PUBLICATION FOR VISUAL FLIGHT RULES (EAIP VFR)',
        nameBe: 'ЗБОРНІК АЭРАНАВІГАЦЫЙНАЙ ІНФАРМАЦЫІ ДЛЯ ВІЗУАЛЬНЫХ ПАЛЁТАЎ (EAIP VFR)',
        description: 'Сборник аэронавигационной информации для визуальных полетов',
        descriptionEn: 'Aeronautical information publication for visual flight rules',
        descriptionBe: 'Зборнік аэранавігацыйнай інфармацыі для візуальных палётаў',
        pageType: 'eaip-vfr',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'ЭЛЕКТРОННЫЕ ДАННЫЕ О МЕСТНОСТИ И ПРЕПЯТСТВИЯХ (ETOD)',
        nameEn: 'ELECTRONIC TERRAIN AND OBSTACLE DATA (ETOD)',
        nameBe: 'ЭЛЕКТРОННЫЯ ДАНЫЯ АБ МЯСЦОВАСЦІ І ПЕРАШКОДАХ (ETOD)',
        description: 'Электронные данные о местности и препятствиях для авиации',
        descriptionEn: 'Electronic terrain and obstacle data for aviation',
        descriptionBe: 'Электронныя даныя аб мясцовасці і перашкодах для авіяцыі',
        pageType: 'etod',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'ЦИРКУЛЯРЫ АЭРОНАВИГАЦИОННОЙ ИНФОРМАЦИИ (AIC)',
        nameEn: 'AERONAUTICAL INFORMATION CIRCULARS (AIC)',
        nameBe: 'ЦЫРКУЛЯРЫ АЭРАНАВІГАЦЫЙНАЙ ІНФАРМАЦЫІ (AIC)',
        description: 'Циркуляры аэронавигационной информации',
        descriptionEn: 'Aeronautical information circulars',
        descriptionBe: 'Цыркуляры аэранавігацыйнай інфармацыі',
        pageType: 'aic',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'ПОРЯДОК ВЗИМАНИЯ СБОРОВ ЗА АЭРОНАВИГАЦИОННОЕ ОБСЛУЖИВАНИЕ',
        nameEn: 'PROCEDURE FOR COLLECTING CHARGES FOR AERONAUTICAL SERVICES',
        nameBe: 'ПАРАДАК УЗІМАННЯ ЗБОРАЎ ЗА АЭРАНАВІГАЦЫЙНАЕ АБСЛУГОЎВАННЕ',
        description: 'Порядок взимания сборов за аэронавигационное обслуживание',
        descriptionEn: 'Procedure for collecting charges for aeronautical services',
        descriptionBe: 'Парадак узімвання збораў за аэранавігацыйнае абслугоўванне',
        pageType: 'charges-procedure',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'ДОПОЛНЕНИЯ К СБОРНИКУ АЭРОНАВИГАЦИОННОЙ ИНФОРМАЦИИ (SUP)',
        nameEn: 'SUPPLEMENTS TO AERONAUTICAL INFORMATION PUBLICATION (SUP)',
        nameBe: 'ДАПАЎНЕННІ ДА ЗБОРНІКА АЭРАНАВІГАЦЫЙНАЙ ІНФАРМАЦЫІ (SUP)',
        description: 'Дополнения к сборнику аэронавигационной информации',
        descriptionEn: 'Supplements to aeronautical information publication',
        descriptionBe: 'Дапаўненні да зборніка аэранавігацыйнай інфармацыі',
        pageType: 'sup',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'ПОДПИСКА НА EAIP И/ИЛИ EAIP VFR',
        nameEn: 'SUBSCRIPTION TO EAIP AND/OR EAIP VFR',
        nameBe: 'ПАДПІСКА НА EAIP І/АБО EAIP VFR',
        description: 'Подписка на EAIP и/или EAIP VFR',
        descriptionEn: 'Subscription to EAIP and/or EAIP VFR',
        descriptionBe: 'Падпіска на EAIP і/або EAIP VFR',
        pageType: 'subscription',
        isActive: true,
        sortOrder: 6
      },
      {
        name: 'СИСТЕМА МЕНЕДЖМЕНТА КАЧЕСТВА',
        nameEn: 'QUALITY MANAGEMENT SYSTEM',
        nameBe: 'СІСТЭМА МЕНЕДЖМЕНТУ ЯКАСЦІ',
        description: 'Система менеджмента качества',
        descriptionEn: 'Quality management system',
        descriptionBe: 'Сістэма менеджменту якасці',
        pageType: 'quality-management',
        isActive: true,
        sortOrder: 7
      },
      {
        name: 'СИСТЕМА ДЛЯ ПОДАЧИ ЗАЯВОК НА ИСПОЛЬЗОВАНИЕ ВОЗДУШНОГО ПРОСТРАНСТВА (FPL)',
        nameEn: 'SYSTEM FOR SUBMITTING APPLICATIONS FOR AIRSPACE USE (FPL)',
        nameBe: 'СІСТЭМА ДЛЯ ПОДАЧЫ ЗАЯВАК НА ВЫКАРЫСТАННЕ ПАВЕТРАНАЙ ПРАСТОРЫ (FPL)',
        description: 'Система для подачи заявок на использование воздушного пространства',
        descriptionEn: 'System for submitting applications for airspace use',
        descriptionBe: 'Сістэма для падачы заявак на выкарыстанне паветранай прасторы',
        pageType: 'fpl',
        isActive: true,
        sortOrder: 8
      },
      {
        name: 'ПРОЧАЯ ИНФОРМАЦИЯ',
        nameEn: 'OTHER INFORMATION',
        nameBe: 'ІНШАЯ ІНФАРМАЦЫЯ',
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
      console.log(`✅ Created/Updated aeronautical info category: ${categoryData.name}`);
    }

    console.log('🎉 Aeronautical info categories seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding aeronautical info categories:', error);
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
