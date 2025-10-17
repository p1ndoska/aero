const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSocialWorkCategories() {
  try {
    console.log('Seeding social work categories...');

    const socialWorkCategories = [
      {
        name: 'Объединенная профсоюзная организация',
        nameEn: 'United Trade Union Organization',
        nameBe: 'Аб\'яднаная прафсаюзная арганізацыя',
        description: 'Информация об объединенной профсоюзной организации предприятия',
        descriptionEn: 'Information about the united trade union organization of the enterprise',
        descriptionBe: 'Інфармацыя аб аб\'яднанай прафсаюзнай арганізацыі прадпрыемства',
        pageType: 'trade-union',
        isActive: true,
        sortOrder: 0
      },
      {
        name: 'Белая Русь',
        nameEn: 'White Rus',
        nameBe: 'Белая Русь',
        description: 'Деятельность республиканского общественного объединения "Белая Русь"',
        descriptionEn: 'Activities of the Republican Public Association "White Rus"',
        descriptionBe: 'Дзейнасць рэспубліканскага грамадскага аб\'яднання "Белая Русь"',
        pageType: 'belaya-rus',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'БРСМ',
        nameEn: 'BRSM',
        nameBe: 'БРСМ',
        description: 'Белорусский республиканский союз молодежи',
        descriptionEn: 'Belarusian Republican Youth Union',
        descriptionBe: 'Беларускі рэспубліканскі саюз моладзі',
        pageType: 'brsm',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Белорусский союз женщин',
        nameEn: 'Belarusian Women\'s Union',
        nameBe: 'Беларускі саюз жанчын',
        description: 'Общественная организация "Белорусский союз женщин"',
        descriptionEn: 'Public organization "Belarusian Women\'s Union"',
        descriptionBe: 'Грамадская арганізацыя "Беларускі саюз жанчын"',
        pageType: 'women-union',
        isActive: true,
        sortOrder: 3
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
        sortOrder: 4
      },
      {
        name: 'Год благоустройства',
        nameEn: 'Year of Improvement',
        nameBe: 'Год аблашчэння',
        description: 'Мероприятия года благоустройства и озеленения',
        descriptionEn: 'Year of improvement and landscaping events',
        descriptionBe: 'Мерапрыемствы года аблашчэння і азелянення',
        pageType: 'improvement-year',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Память и боль белорусской земли',
        nameEn: 'Memory and Pain of the Belarusian Land',
        nameBe: 'Памяць і боль беларускай зямлі',
        description: 'Мероприятия по сохранению памяти о Великой Отечественной войне',
        descriptionEn: 'Events to preserve the memory of the Great Patriotic War',
        descriptionBe: 'Мерапрыемствы па захаванню памяці аб Вялікай Айчыннай вайне',
        pageType: 'memory',
        isActive: true,
        sortOrder: 6
      }
    ];

    // Создаем категории социальной работы
    for (const categoryData of socialWorkCategories) {
      await prisma.socialWorkCategory.upsert({
        where: { pageType: categoryData.pageType },
        update: categoryData,
        create: categoryData,
      });
      console.log(`Created/Updated social work category: ${categoryData.name}`);
    }

    console.log('Social work categories seeding completed!');
  } catch (error) {
    console.error('Error seeding social work categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем сидинг только если файл выполняется напрямую
if (require.main === module) {
  seedSocialWorkCategories()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedSocialWorkCategories };

