const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAboutCompanyCategories() {
  try {
    console.log('🌱 Seeding about company categories...');

    const aboutCompanyCategories = [
      {
        name: 'Руководство',
        nameEn: 'Management',
        nameBe: 'Кіраўніцтва',
        description: 'Информация о руководстве предприятия',
        descriptionEn: 'Information about company management',
        descriptionBe: 'Інфармацыя аб кіраўніцтве прадпрыемства',
        pageType: 'management',
        isActive: true,
        sortOrder: 0
      },
      {
        name: 'Структура предприятия',
        nameEn: 'Company Structure',
        nameBe: 'Структура прадпрыемства',
        description: 'Организационная структура предприятия',
        descriptionEn: 'Organizational structure of the company',
        descriptionBe: 'Арганізацыйная структура прадпрыемства',
        pageType: 'structure',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Наши филиалы',
        nameEn: 'Our Branches',
        nameBe: 'Нашы філіялы',
        description: 'Информация о филиалах предприятия',
        descriptionEn: 'Information about company branches',
        descriptionBe: 'Інфармацыя аб філіялах прадпрыемства',
        pageType: 'branches',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Политика безопасности',
        nameEn: 'Security Policy',
        nameBe: 'Палітыка бяспекі',
        description: 'Политика безопасности предприятия',
        descriptionEn: 'Company security policy',
        descriptionBe: 'Палітыка бяспекі прадпрыемства',
        pageType: 'security-policy',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'История',
        nameEn: 'History',
        nameBe: 'Гісторыя',
        description: 'История развития предприятия',
        descriptionEn: 'Company development history',
        descriptionBe: 'Гісторыя развіцця прадпрыемства',
        pageType: 'history',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Контакты',
        nameEn: 'Contacts',
        nameBe: 'Кантакт',
        description: 'Контактная информация предприятия',
        descriptionEn: 'Company contact information',
        descriptionBe: 'Кантактная інфармацыя прадпрыемства',
        pageType: 'contacts',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Открытые вакансии',
        nameEn: 'Open Vacancies',
        nameBe: 'Адкрытыя вакансіі',
        description: 'Актуальные вакансии предприятия',
        descriptionEn: 'Current company vacancies',
        descriptionBe: 'Актуальныя вакансіі прадпрыемства',
        pageType: 'vacancies',
        isActive: true,
        sortOrder: 6
      }
    ];

    // Создаем категории "О предприятии"
    for (const categoryData of aboutCompanyCategories) {
      await prisma.aboutCompanyCategory.upsert({
        where: { pageType: categoryData.pageType },
        update: categoryData,
        create: categoryData,
      });
      console.log(`✅ Created/Updated about company category: ${categoryData.name}`);
    }

    console.log('🎉 About company categories seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding about company categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем сидинг только если файл выполняется напрямую
if (require.main === module) {
  seedAboutCompanyCategories();
}

module.exports = { seedAboutCompanyCategories };
