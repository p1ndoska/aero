const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServicesCategories() {
  try {
    console.log('Seeding services categories...');

    const services = [
      {
        name: 'Управление воздушным движением',
        nameEn: 'Air traffic control',
        nameBe: 'Кіраванне паветраным рухам',
        description: 'Обеспечение безопасного, упорядоченного и быстрого движения воздушных судов',
        descriptionEn: 'Ensuring safe, orderly and expeditious flow of aircraft',
        descriptionBe: 'Забеспячэнне бяспечнага, упарадкаванага і хуткага руху паветраных суднаў',
        pageType: 'air-traffic-control',
        sortOrder: 0,
        isActive: true,
      },
      {
        name: 'Метеорологическое обеспечение',
        nameEn: 'Meteorological services',
        nameBe: 'Метэаралагічнае забеспячэнне',
        description: 'Предоставление метеорологической информации для авиации',
        descriptionEn: 'Providing meteorological information for aviation',
        descriptionBe: 'Прадастаўленне метэаралагічнай інфармацыі для авіяцыі',
        pageType: 'meteorological-services',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Навигационное обеспечение',
        nameEn: 'Navigation services',
        nameBe: 'Навігацыйнае забеспячэнне',
        description: 'Обеспечение навигационными средствами и системами',
        descriptionEn: 'Providing navigation aids and systems',
        descriptionBe: 'Забеспячэнне навігацыйнымі сродкамі і сістэмамі',
        pageType: 'navigation-services',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Поисково-спасательное обеспечение',
        nameEn: 'Search and rescue services',
        nameBe: 'Пошукова-ратуннае забеспячэнне',
        description: 'Организация поисковых и спасательных операций',
        descriptionEn: 'Organizing search and rescue operations',
        descriptionBe: 'Арганізацыя пошукавых і ратунковых аперацый',
        pageType: 'search-rescue',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Аэронавигационное планирование',
        nameEn: 'Air navigation planning',
        nameBe: 'Аэранавігацыйнае планіраванне',
        description: 'Планирование использования воздушного пространства',
        descriptionEn: 'Planning airspace utilization',
        descriptionBe: 'Планіраванне выкарыстання паветранай прасторы',
        pageType: 'air-navigation-planning',
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Информационное обеспечение',
        nameEn: 'Information services',
        nameBe: 'Інфармацыйнае забеспячэнне',
        description: 'Предоставление аэронавигационной информации',
        descriptionEn: 'Providing aeronautical information',
        descriptionBe: 'Прадастаўленне аэранавігацыйнай інфармацыі',
        pageType: 'information-services',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'Обучение и подготовка персонала',
        nameEn: 'Training and personnel development',
        nameBe: 'Навучанне і падрыхтоўка персаналу',
        description: 'Профессиональная подготовка авиационного персонала',
        descriptionEn: 'Professional training of aviation personnel',
        descriptionBe: 'Прафесійная падрыхтоўка авіяцыйнага персаналу',
        pageType: 'training-services',
        sortOrder: 6,
        isActive: true,
      },
      {
        name: 'Техническое обслуживание',
        nameEn: 'Technical maintenance',
        nameBe: 'Тэхнічнае абслугоўванне',
        description: 'Техническое обслуживание аэронавигационного оборудования',
        descriptionEn: 'Technical maintenance of air navigation equipment',
        descriptionBe: 'Тэхнічнае абслугоўванне аэранавігацыйнага абсталявання',
        pageType: 'technical-maintenance',
        sortOrder: 7,
        isActive: true,
      },
    ];

    for (const cat of services) {
      await prisma.servicesCategory.upsert({
        where: { pageType: cat.pageType },
        update: cat,
        create: cat,
      });
      console.log(`Created/Updated services category: ${cat.name}`);
    }

    console.log('Services categories seeding completed!');
  } catch (e) {
    console.error('Error seeding services categories:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedServicesCategories();
}

module.exports = { seedServicesCategories };