const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServicesCategories() {
  try {
    console.log('Seeding services categories...');

    const services = [
      {
        name: 'Аэронавигационное обслуживание воздушных судов в воздушном пространстве Республики Беларусь',
        nameEn: 'Air navigation services in the airspace of the Republic of Belarus',
        nameBe: 'Аэранавігацыйнае абслугоўванне паветраных суднаў у паветранай прасторы Рэспублікі Беларусь',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'air-navigation-belarus',
        sortOrder: 0,
        isActive: true,
      },
      {
        name: 'Обеспечение срочного полета вне расписания в воздушном пространстве Республики Беларусь',
        nameEn: 'Urgent flights outside schedule in the airspace of the Republic of Belarus',
        nameBe: 'Забеспячэнне тэрміновых палётаў па-за раскладам у паветранай прасторы Рэспублікі Беларусь',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'urgent-flight-out-of-schedule',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Информация о действующих тарифах на оказываемые услуги Центра координации и обеспечения полетов (ЦКОП)',
        nameEn: 'Information on current tariffs for services of the Coordination and Flight Support Center',
        nameBe: 'Інфармацыя аб дзеючых тарыфах на паслугі Цэнтра каардынацыі і забеспячэння палётаў (ЦКЗП)',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'ckop-tariffs',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Оказание услуг по обеспечению аэронавигационной информацией',
        nameEn: 'Provision of aeronautical information services',
        nameBe: 'Аказанне паслуг па забеспячэнні аэранавігацыйнай інфармацыяй',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'aip-services',
        sortOrder: 3,
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
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Пользование веб-сервисом « КПТС интернет-заявка»',
        nameEn: 'Use of the web service "KPTS Internet Application"',
        nameBe: 'Карыстанне вэб-сервісам «КПТС інтэрнэт-заяўка»',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'kpts-web-service',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'Тарифы на услуги хранения имущества (БПЛА) на складе',
        nameEn: 'Tariffs for storage of property (UAV) in the warehouse',
        nameBe: 'Тарыфы на паслугі захоўвання маёмасці (БПЛА) на складзе',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'uav-storage-tariffs',
        sortOrder: 6,
        isActive: true,
      },
      {
        name: 'Тарифы на услуги электрической связи общего пользования государственного предприятия «Белаэронавигация»',
        nameEn: 'Tariffs for public telecommunication services of the state enterprise "BelAeroNavigatsia"',
        nameBe: 'Тарыфы на паслугі электрасувязі агульнага карыстання дзяржаўнага прадпрыемства «Белаэронавігацыя»',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'telecom-tariffs',
        sortOrder: 7,
        isActive: true,
      },
      {
        name: 'Тарифы на услуги аэропортов государственного предприятия «Белаэронавигация»',
        nameEn: 'Tariffs for airport services of the state enterprise "BelAeroNavigatsia"',
        nameBe: 'Тарыфы на паслугі аэрапортаў дзяржаўнага прадпрыемства «Белаэронавігацыя»',
        description: null,
        descriptionEn: null,
        descriptionBe: null,
        pageType: 'airport-services-tariffs',
        sortOrder: 8,
        isActive: true,
      },
    ];

    // Удаляем все лишние категории и страницы услуг, которых нет в текущем списке services
    const allowedPageTypes = services.map((s) => s.pageType);

    console.log('Cleaning up obsolete services categories and page contents...');
    // Сначала удаляем контент страниц услуг для неразрешённых pageType
    await prisma.servicesPageContent.deleteMany({
      where: {
        pageType: {
          notIn: allowedPageTypes,
        },
      },
    });

    // Затем удаляем сами категории услуг, которых нет в списке
    await prisma.servicesCategory.deleteMany({
      where: {
        pageType: {
          notIn: allowedPageTypes,
        },
      },
    });

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