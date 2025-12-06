const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAboutCompanyPageContentTitles() {
  try {
    console.log('Updating about company page content titles...');

    const categories = await prisma.aboutCompanyCategory.findMany();
    console.log(`Found ${categories.length} categories`);

    for (const category of categories) {
      const { pageType, name, nameEn, nameBe, description, descriptionEn, descriptionBe } = category;

      // Find existing content or create a default one
      let content = await prisma.aboutCompanyPageContent.findUnique({
        where: { pageType }
      });

      if (!content) {
        // Create new content if it doesn't exist
        content = await prisma.aboutCompanyPageContent.create({
          data: {
            pageType,
            title: name,
            titleEn: nameEn || null,
            titleBe: nameBe || null,
            subtitle: description || null,
            subtitleEn: descriptionEn || null,
            subtitleBe: descriptionBe || null,
            content: [],
            contentEn: [],
            contentBe: []
          }
        });
        console.log(`Created page content for: ${name}`);
      } else {
        // Update existing content
        await prisma.aboutCompanyPageContent.update({
          where: { pageType },
          data: {
            title: name,
            titleEn: nameEn || null,
            titleBe: nameBe || null,
            subtitle: description || null,
            subtitleEn: descriptionEn || null,
            subtitleBe: descriptionBe || null,
          }
        });
        console.log(`Updated page content for: ${name}`);
      }
    }
    console.log('About company page content titles update completed!');
  } catch (error) {
    console.error('Error updating about company page content titles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateAboutCompanyPageContentTitles()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { updateAboutCompanyPageContentTitles };

