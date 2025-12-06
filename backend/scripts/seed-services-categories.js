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
      {
        name: 'Оказание услуг по регистрации (перерегистрации, снятию с регистрации) ELT',
        nameEn: 'ELT Registration (Re-registration, Deregistration) Services',
        nameBe: 'Аказанне паслуг па рэгістрацыі (перарэгістрацыі, зняцці з рэгістрацыі) ELT',
        description: 'Оказание услуг по регистрации, перерегистрации и снятию с регистрации ELT (Emergency Locator Transmitter)',
        descriptionEn: 'Services for registration, re-registration and deregistration of ELT (Emergency Locator Transmitter)',
        descriptionBe: 'Аказанне паслуг па рэгістрацыі, перарэгістрацыі і зняцці з рэгістрацыі ELT (Emergency Locator Transmitter)',
        pageType: 'elt-registration-services',
        sortOrder: 8,
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

      // Автоматическое создание страницы контента для категории
      try {
        // Для категории ELT создаем начальный контент со списком документов
        let initialContent = [];
        let initialContentEn = [];
        let initialContentBe = [];
        if (cat.pageType === 'elt-registration-services') {
          initialContent = [
            {
              id: `elt-list-${Date.now()}`,
              type: 'list',
              content: '',
              props: {
                items: [
                  'ДОГОВОР возмездного оказания услуг по регистрации (перерегистрации, снятию с регистрации) ELT',
                  'ЗАЯВЛЕНИЕ о регистрации*',
                  'ЗАЯВЛЕНИЕ о снятии с регистрации*',
                  'ИНСТРУКЦИЯ по заполнению форм заявлений по регистрации ELT, снятию с регистрации ELT*'
                ]
              }
            }
          ];
          initialContentEn = [
            {
              id: `elt-list-${Date.now()}`,
              type: 'list',
              content: '',
              props: {
                items: [
                  'CONTRACT for paid services for registration (re-registration, deregistration) of ELT',
                  'APPLICATION for registration*',
                  'APPLICATION for deregistration*',
                  'INSTRUCTIONS for filling out application forms for ELT registration, ELT deregistration*'
                ]
              }
            }
          ];
          initialContentBe = [
            {
              id: `elt-list-${Date.now()}`,
              type: 'list',
              content: '',
              props: {
                items: [
                  'ДОГАВОР платнага аказання паслуг па рэгістрацыі (перарэгістрацыі, зняццю з рэгістрацыі) ELT',
                  'ЗАЯЎЛЕННЕ пра рэгістрацыю*',
                  'ЗАЯЎЛЕННЕ пра зняцце з рэгістрацыі*',
                  'ІНСТРУКЦЫЯ па запоўненні формаў заяўленняў па рэгістрацыі ELT, зняццю з рэгістрацыі ELT*'
                ]
              }
            }
          ];
        }

        await prisma.servicesPageContent.upsert({
          where: { pageType: cat.pageType },
          update: cat.pageType === 'elt-registration-services' ? {
            content: initialContent,
            contentEn: initialContentEn,
            contentBe: initialContentBe
          } : {},
          create: {
            pageType: cat.pageType,
            title: cat.name || 'Услуги',
            titleEn: cat.nameEn || 'Services',
            titleBe: cat.nameBe || 'Паслугі',
            subtitle: '',
            content: initialContent,
            contentEn: initialContentEn.length > 0 ? initialContentEn : undefined,
            contentBe: initialContentBe.length > 0 ? initialContentBe : undefined
          }
        });
        console.log(`Created/Updated services page content for: ${cat.name}`);
      } catch (e) {
        console.warn(`servicesPageContent upsert failed for ${cat.pageType} (non-critical):`, e?.message);
      }
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