const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSocialWorkPageContentTitles() {
  try {
    console.log('Updating social work page content titles...');

    // Получаем все категории социальной работы
    const categories = await prisma.socialWorkCategory.findMany({
      where: { isActive: true }
    });

    console.log(`Found ${categories.length} categories`);

    // Для каждой категории обновляем соответствующий контент страницы
    for (const category of categories) {
      const existingContent = await prisma.socialWorkPageContent.findUnique({
        where: { pageType: category.pageType }
      });

      if (existingContent) {
        // Обновляем заголовки и подзаголовки, если они дефолтные
        const isDefaultTitle = existingContent.title === 'Социальная работа' || 
                              !existingContent.titleEn || 
                              !existingContent.titleBe;
        
        if (isDefaultTitle) {
          await prisma.socialWorkPageContent.update({
            where: { pageType: category.pageType },
            data: {
              title: category.name,
              titleEn: category.nameEn || null,
              titleBe: category.nameBe || null,
              subtitle: category.description || existingContent.subtitle || '',
              subtitleEn: category.descriptionEn || existingContent.subtitleEn || null,
              subtitleBe: category.descriptionBe || existingContent.subtitleBe || null,
            }
          });
          console.log(`Updated page content for: ${category.name}`);
        } else {
          console.log(`Skipped (already has custom title): ${category.name}`);
        }
      } else {
        // Создаем новый контент, если его нет
        await prisma.socialWorkPageContent.create({
          data: {
            pageType: category.pageType,
            title: category.name,
            titleEn: category.nameEn || null,
            titleBe: category.nameBe || null,
            subtitle: category.description || '',
            subtitleEn: category.descriptionEn || null,
            subtitleBe: category.descriptionBe || null,
            content: [],
            contentEn: [],
            contentBe: []
          }
        });
        console.log(`Created page content for: ${category.name}`);
      }
    }

    console.log('Social work page content titles update completed!');
  } catch (error) {
    console.error('Error updating social work page content titles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем обновление только если файл выполняется напрямую
if (require.main === module) {
  updateSocialWorkPageContentTitles()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { updateSocialWorkPageContentTitles };

