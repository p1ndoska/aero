const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAeronauticalCategories() {
  try {
    console.log('🔍 Checking aeronautical info categories in database...');
    
    const categories = await prisma.aeronauticalInfoCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`Found ${categories.length} categories:`);
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.pageType}) - Active: ${category.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAeronauticalCategories();
