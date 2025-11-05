const express = require('express');
const router = express.Router();
const prisma = require('../prisma/prisma-client');

// Поиск по всем страницам сайта
router.get('/all', async (req, res) => {
  try {
    const { query, language = 'ru' } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        results: [],
        totalCount: 0,
        message: 'Поисковый запрос должен содержать минимум 2 символа'
      });
    }

    const searchQuery = query.trim();
    const results = [];

    // 1. Поиск в новостях
    try {
      const news = await prisma.news.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { contentEn: { contains: searchQuery, mode: 'insensitive' } },
            { contentBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        include: {
          newsCategory: true
        },
        take: 20
      });

      news.forEach(item => {
        const title = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const content = language === 'en' ? (item.contentEn || item.content) : language === 'be' ? (item.contentBe || item.content) : item.content;
        
        results.push({
          id: item.id,
          type: 'news',
          title: title,
          excerpt: content ? content.substring(0, 200) + '...' : '',
          url: `/news/${item.id}`,
          date: item.createdAt,
          category: item.newsCategory?.name || 'Новости'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в новостях:', error);
    }

    // 2. Поиск в вакансиях
    try {
      const vacancies = await prisma.vacancy.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      vacancies.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'vacancy',
          title: title,
          excerpt: description ? description.substring(0, 200) + '...' : '',
          url: `/about/vacancies`,
          date: item.createdAt,
          category: 'Вакансии'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в вакансиях:', error);
    }

    // 3. Поиск в филиалах
    try {
      const branches = await prisma.branch.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { address: { contains: searchQuery, mode: 'insensitive' } },
            { addressEn: { contains: searchQuery, mode: 'insensitive' } },
            { addressBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      branches.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const address = language === 'en' ? (item.addressEn || item.address) : language === 'be' ? (item.addressBe || item.address) : item.address;
        
        results.push({
          id: item.id,
          type: 'branch',
          title: name,
          excerpt: address || '',
          url: `/`,
          date: item.createdAt || new Date(),
          category: 'Филиалы'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в филиалах:', error);
    }

    // 4. Поиск в руководстве
    try {
      const management = await prisma.management.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { position: { contains: searchQuery, mode: 'insensitive' } },
            { positionEn: { contains: searchQuery, mode: 'insensitive' } },
            { positionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      management.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const position = language === 'en' ? (item.positionEn || item.position) : language === 'be' ? (item.positionBe || item.position) : item.position;
        
        results.push({
          id: item.id,
          type: 'management',
          title: name,
          excerpt: position,
          url: `/about/management`,
          date: item.createdAt || new Date(),
          category: 'Руководство'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в руководстве:', error);
    }

    // 5. Поиск в страницах "О предприятии"
    try {
      const aboutPages = await prisma.aboutCompanyPageContent.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { subtitle: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleEn: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      aboutPages.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const subtitle = language === 'en' ? (item.subtitleEn || item.subtitle) : language === 'be' ? (item.subtitleBe || item.subtitle) : item.subtitle;
        
        results.push({
          id: item.id,
          type: 'about',
          title: title,
          excerpt: subtitle || '',
          url: `/about/${item.pageType}`,
          date: item.createdAt,
          category: 'О предприятии'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в О предприятии:', error);
    }

    // 6. Поиск в аэронавигационной информации
    try {
      const aeroPages = await prisma.aeronauticalInfoPageContent.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { subtitle: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleEn: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      aeroPages.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const subtitle = language === 'en' ? (item.subtitleEn || item.subtitle) : language === 'be' ? (item.subtitleBe || item.subtitle) : item.subtitle;
        
        results.push({
          id: item.id,
          type: 'aeronautical',
          title: title,
          excerpt: subtitle || '',
          url: `/air-navigation/${item.pageType}`,
          date: item.createdAt,
          category: 'Аэронавигационная информация'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в аэронавигации:', error);
    }

    // 7. Поиск в социальной работе
    try {
      const socialPages = await prisma.socialWorkPageContent.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { subtitle: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleEn: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      socialPages.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const subtitle = language === 'en' ? (item.subtitleEn || item.subtitle) : language === 'be' ? (item.subtitleBe || item.subtitle) : item.subtitle;
        
        results.push({
          id: item.id,
          type: 'social',
          title: title,
          excerpt: subtitle || '',
          url: `/social/${item.pageType}`,
          date: item.createdAt,
          category: 'Социальная работа'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в социальной работе:', error);
    }

    // 8. Поиск в услугах
    try {
      const servicesPages = await prisma.servicesPageContent.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { subtitle: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleEn: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      servicesPages.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const subtitle = language === 'en' ? (item.subtitleEn || item.subtitle) : language === 'be' ? (item.subtitleBe || item.subtitle) : item.subtitle;
        
        results.push({
          id: item.id,
          type: 'services',
          title: title,
          excerpt: subtitle || '',
          url: `/services/${item.pageType}`,
          date: item.createdAt,
          category: 'Услуги'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в услугах:', error);
    }

    // 9. Поиск в обращениях
    try {
      const appealsPages = await prisma.appealsPageContent.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
            { titleBe: { contains: searchQuery, mode: 'insensitive' } },
            { subtitle: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleEn: { contains: searchQuery, mode: 'insensitive' } },
            { subtitleBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      appealsPages.forEach(item => {
        const title = language === 'en' ? (item.titleEn || item.title) : language === 'be' ? (item.titleBe || item.title) : item.title;
        const subtitle = language === 'en' ? (item.subtitleEn || item.subtitle) : language === 'be' ? (item.subtitleBe || item.subtitle) : item.subtitle;
        
        results.push({
          id: item.id,
          type: 'appeals',
          title: title,
          excerpt: subtitle || '',
          url: `/appeals/${item.pageType}`,
          date: item.createdAt,
          category: 'Обращения'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в обращениях:', error);
    }

    // 10. Поиск в категориях социальной работы
    try {
      const socialCategories = await prisma.socialWorkCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      socialCategories.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'social',
          title: name,
          excerpt: description || '',
          url: `/social/${item.pageType}`,
          date: item.createdAt,
          category: 'Социальная работа'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в категориях социальной работы:', error);
    }

    // 11. Поиск в категориях "О предприятии"
    try {
      const aboutCategories = await prisma.aboutCompanyCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      aboutCategories.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'about',
          title: name,
          excerpt: description || '',
          url: `/about/${item.pageType}`,
          date: item.createdAt,
          category: 'О предприятии'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в категориях О предприятии:', error);
    }

    // 12. Поиск в категориях аэронавигационной информации
    try {
      const aeroCategories = await prisma.aeronauticalInfoCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      aeroCategories.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'aeronautical',
          title: name,
          excerpt: description || '',
          url: `/air-navigation/${item.pageType}`,
          date: item.createdAt,
          category: 'Аэронавигационная информация'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в категориях аэронавигации:', error);
    }

    // 13. Поиск в категориях услуг
    try {
      const servicesCategories = await prisma.servicesCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      servicesCategories.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'services',
          title: name,
          excerpt: description || '',
          url: `/services/${item.pageType}`,
          date: item.createdAt,
          category: 'Услуги'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в категориях услуг:', error);
    }

    // 14. Поиск в категориях обращений
    try {
      const appealsCategories = await prisma.appealsCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameEn: { contains: searchQuery, mode: 'insensitive' } },
            { nameBe: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
            { descriptionBe: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      appealsCategories.forEach(item => {
        const name = language === 'en' ? (item.nameEn || item.name) : language === 'be' ? (item.nameBe || item.name) : item.name;
        const description = language === 'en' ? (item.descriptionEn || item.description) : language === 'be' ? (item.descriptionBe || item.description) : item.description;
        
        results.push({
          id: item.id,
          type: 'appeals',
          title: name,
          excerpt: description || '',
          url: `/appeals/${item.pageType}`,
          date: item.createdAt,
          category: 'Обращения'
        });
      });
    } catch (error) {
      console.error('Ошибка при поиске в категориях обращений:', error);
    }

    // Сортируем результаты по релевантности и дате
    results.sort((a, b) => {
      // Сначала сортируем по типу (новости важнее)
      const typeOrder = { 
        news: 1, 
        vacancy: 2, 
        branch: 3, 
        management: 4,
        about: 5,
        services: 6,
        aeronautical: 7,
        social: 8,
        appeals: 9
      };
      const typeA = typeOrder[a.type] || 10;
      const typeB = typeOrder[b.type] || 10;
      
      if (typeA !== typeB) return typeA - typeB;
      
      // Потом по дате (новые сначала)
      return new Date(b.date) - new Date(a.date);
    });

    res.json({
      results: results,
      totalCount: results.length,
      query: query
    });

  } catch (error) {
    console.error('Ошибка при поиске:', error);
    res.status(500).json({ 
      error: 'Ошибка при выполнении поиска',
      details: error.message
    });
  }
});

module.exports = router;
