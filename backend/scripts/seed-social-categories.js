const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROOT_CATEGORIES = [
  {
    name: 'Идеологическая работа',
    nameEn: 'Ideological Work',
    nameBe: 'Ідэалагічная работа',
    description: 'Идеологическая работа на предприятии',
    descriptionEn: 'Ideological work at the enterprise',
    descriptionBe: 'Ідэалагічная работа на прадпрыемстве',
    pageType: 'ideological-work',
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'Объединенная профсоюзная организация',
    nameEn: 'United Trade Union Organization',
    nameBe: "Аб'яднаная прафсаюзная арганізацыя",
    description: 'Информация об объединенной профсоюзной организации предприятия',
    descriptionEn: 'Information about the united trade union organization of the enterprise',
    descriptionBe: "Інфармацыя аб аб'яднанай прафсаюзнай арганізацыі прадпрыемства",
    pageType: 'trade-union',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Общественные объединения',
    nameEn: 'Public Associations',
    nameBe: "Грамадскія аб'яднанні",
    description: 'Общественные объединения предприятия',
    descriptionEn: 'Public associations of the enterprise',
    descriptionBe: "Грамадскія аб'яднанні прадпрыемства",
    pageType: 'public-associations',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'За здоровый образ жизни',
    nameEn: 'For a Healthy Lifestyle',
    nameBe: 'За здаровы лад жыцця',
    description: 'Мероприятия и инициативы по пропаганде здорового образа жизни',
    descriptionEn: 'Events and initiatives to promote a healthy lifestyle',
    descriptionBe: 'Мерапрыемствы і ініцыятывы па прапагандзе здаровага ладу жыцця',
    pageType: 'healthy-lifestyle',
    isActive: true,
    sortOrder: 3,
  },
];

const CHILD_CATEGORIES = [
  {
    parentPageType: 'ideological-work',
    name: 'Директива № 12. О реализации основ идеологии белорусского государства',
    nameEn: 'Directive No. 12. On the implementation of the foundations of the ideology of the Belarusian state',
    nameBe: 'Дырэктыва № 12. Аб рэалізацыі асноў ідэалогіі беларускай дзяржавы',
    description: 'Реализация Директивы № 12 о основах идеологии белорусского государства',
    descriptionEn: 'Implementation of Directive No. 12 on the foundations of the ideology of the Belarusian state',
    descriptionBe: 'Рэалізацыя Дырэктывы № 12 аб асновах ідэалогіі беларускай дзяржавы',
    pageType: 'directive-12',
    isActive: true,
    sortOrder: 0,
  },
  {
    parentPageType: 'ideological-work',
    name: 'Единый день информирования',
    nameEn: 'Unified Information Day',
    nameBe: 'Адзіны дзень інфармавання',
    description: 'Единый день информирования',
    descriptionEn: 'Unified Information Day',
    descriptionBe: 'Адзіны дзень інфармавання',
    pageType: 'information-day',
    isActive: true,
    sortOrder: 1,
  },
  {
    parentPageType: 'ideological-work',
    name: 'Год белорусской женщины',
    nameEn: 'Year of the Belarusian Woman',
    nameBe: 'Год беларускай жанчыны',
    description: 'Мероприятия Года белорусской женщины',
    descriptionEn: 'Events of the Year of the Belarusian Woman',
    descriptionBe: 'Мерапрыемствы Года беларускай жанчыны',
    pageType: 'belarusian-woman-year',
    isActive: true,
    sortOrder: 2,
  },
  {
    parentPageType: 'ideological-work',
    name: 'Память и боль белорусской земли',
    nameEn: 'Memory and Pain of the Belarusian Land',
    nameBe: 'Памяць і боль беларускай зямлі',
    description: 'Мероприятия по сохранению памяти о Великой Отечественной войне',
    descriptionEn: 'Events to preserve the memory of the Great Patriotic War',
    descriptionBe: 'Мерапрыемствы па захаванню памяці аб Вялікай Айчыннай вайне',
    pageType: 'memory',
    isActive: true,
    sortOrder: 3,
  },
  {
    parentPageType: 'public-associations',
    name: 'Белая Русь',
    nameEn: 'White Rus',
    nameBe: 'Белая Русь',
    description: 'Деятельность республиканского общественного объединения "Белая Русь"',
    descriptionEn: 'Activities of the Republican Public Association "White Rus"',
    descriptionBe: 'Дзейнасць рэспубліканскага грамадскага аб\'яднання "Белая Русь"',
    pageType: 'belaya-rus',
    isActive: true,
    sortOrder: 0,
  },
  {
    parentPageType: 'public-associations',
    name: 'БРСМ',
    nameEn: 'BRSM',
    nameBe: 'БРСМ',
    description: 'Белорусский республиканский союз молодежи',
    descriptionEn: 'Belarusian Republican Youth Union',
    descriptionBe: 'Беларускі рэспубліканскі саюз моладзі',
    pageType: 'brsm',
    isActive: true,
    sortOrder: 1,
  },
  {
    parentPageType: 'public-associations',
    name: 'Белорусский союз женщин',
    nameEn: "Belarusian Women's Union",
    nameBe: 'Беларускі саюз жанчын',
    description: 'Общественная организация "Белорусский союз женщин"',
    descriptionEn: 'Public organization "Belarusian Women\'s Union"',
    descriptionBe: 'Грамадская арганізацыя "Беларускі саюз жанчын"',
    pageType: 'women-union',
    isActive: true,
    sortOrder: 2,
  },
];

async function upsertCategory(categoryData) {
  await prisma.socialWorkCategory.upsert({
    where: { pageType: categoryData.pageType },
    update: categoryData,
    create: categoryData,
  });
  console.log(`Created/Updated social work category: ${categoryData.name}`);
}

async function seedSocialWorkCategories() {
  try {
    console.log('Seeding social work categories...');

    for (const categoryData of ROOT_CATEGORIES) {
      await upsertCategory({ ...categoryData, parentId: null });
    }

    const parents = await prisma.socialWorkCategory.findMany({
      where: {
        pageType: { in: ['ideological-work', 'public-associations'] },
      },
    });
    const parentByPageType = Object.fromEntries(parents.map((parent) => [parent.pageType, parent]));

    for (const { parentPageType, ...categoryData } of CHILD_CATEGORIES) {
      const parent = parentByPageType[parentPageType];
      if (!parent) {
        throw new Error(`Parent category not found: ${parentPageType}`);
      }
      await upsertCategory({ ...categoryData, parentId: parent.id });
    }

    await prisma.socialWorkCategory.updateMany({
      where: { pageType: 'improvement-year' },
      data: { isActive: false, parentId: null },
    });

    console.log('Social work categories seeding completed!');
  } catch (error) {
    console.error('Error seeding social work categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSocialWorkCategories()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedSocialWorkCategories };
