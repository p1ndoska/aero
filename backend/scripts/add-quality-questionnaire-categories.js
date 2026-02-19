const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addQualityQuestionnaireCategories() {
  try {
    console.log('Adding quality questionnaire categories...');

    // Находим родительскую категорию "Система менеджмента качества"
    const parentCategory = await prisma.aeronauticalInfoCategory.findUnique({
      where: { pageType: 'quality-management' }
    });

    if (!parentCategory) {
      console.error('Parent category "Система менеджмента качества" not found!');
      console.log('Please make sure the category exists with pageType: quality-management');
      return;
    }

    console.log(`Found parent category: ${parentCategory.name} (ID: ${parentCategory.id})`);

    // Создаем две дочерние категории
    const childCategories = [
      {
        name: 'Анкета потребителя САИ Республики Беларусь',
        nameEn: 'Consumer Questionnaire of the State Aviation Inspectorate of the Republic of Belarus',
        nameBe: 'Анкета спажыўца САІ Рэспублікі Беларусь',
        description: 'Анкета потребителя САИ Республики Беларусь',
        descriptionEn: 'Consumer Questionnaire of the State Aviation Inspectorate of the Republic of Belarus',
        descriptionBe: 'Анкета спажыўца САІ Рэспублікі Беларусь',
        pageType: 'quality-questionnaire-sai',
        isActive: true,
        sortOrder: 0,
        parentId: parentCategory.id
      },
      {
        name: 'Анкета потребителя аэронавигационных услуг Республики Беларусь',
        nameEn: 'Consumer Questionnaire of Aeronautical Services of the Republic of Belarus',
        nameBe: 'Анкета спажыўца аэранавігацыйных паслуг Рэспублікі Беларусь',
        description: 'Анкета потребителя аэронавигационных услуг Республики Беларусь',
        descriptionEn: 'Consumer Questionnaire of Aeronautical Services of the Republic of Belarus',
        descriptionBe: 'Анкета спажыўца аэранавігацыйных паслуг Рэспублікі Беларусь',
        pageType: 'quality-questionnaire-aeronautical',
        isActive: true,
        sortOrder: 1,
        parentId: parentCategory.id
      }
    ];

    // Создаем категории
    for (const categoryData of childCategories) {
      try {
        const category = await prisma.aeronauticalInfoCategory.upsert({
          where: { pageType: categoryData.pageType },
          update: categoryData,
          create: categoryData,
        });
        console.log(`✓ Created/Updated category: ${category.name}`);

        // Автоматически создаем страницу контента для новой категории
        try {
          await prisma.aeronauticalInfoPageContent.upsert({
            where: { pageType: categoryData.pageType },
            update: {},
            create: {
              pageType: categoryData.pageType,
              title: categoryData.name,
              titleEn: categoryData.nameEn,
              titleBe: categoryData.nameBe,
              subtitle: categoryData.description,
              subtitleEn: categoryData.descriptionEn,
              subtitleBe: categoryData.descriptionBe,
              content: [],
              contentEn: [],
              contentBe: []
            }
          });
          console.log(`  ✓ Created page content for: ${category.name}`);
        } catch (contentError) {
          console.warn(`  ⚠ Failed to create page content for ${category.name}:`, contentError.message);
        }
      } catch (error) {
        console.error(`✗ Failed to create category ${categoryData.name}:`, error.message);
      }
    }

    console.log('\nQuality questionnaire categories creation completed!');
  } catch (error) {
    console.error('Error adding quality questionnaire categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт только если файл выполняется напрямую
if (require.main === module) {
  addQualityQuestionnaireCategories()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addQualityQuestionnaireCategories };

