const prisma = require('../prisma/prisma-client');

// Получить контент страницы услуг по pageType
const getServicesPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    const pageContent = await prisma.servicesPageContent.findUnique({
      where: { pageType }
    });

    if (!pageContent) {
      return res.status(404).json({ error: 'Контент страницы не найден' });
    }

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при получении контента страницы услуг:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Создать контент страницы услуг
const createServicesPageContent = async (req, res) => {
  try {
    const {
      pageType,
      title,
      titleEn,
      titleBe,
      subtitle,
      subtitleEn,
      subtitleBe,
      content,
      contentEn,
      contentBe
    } = req.body;

    const pageContent = await prisma.servicesPageContent.create({
      data: {
        pageType,
        title: title || 'Услуги',
        titleEn: titleEn || 'Services',
        titleBe: titleBe || 'Паслугі',
        subtitle: subtitle || '',
        subtitleEn: subtitleEn || '',
        subtitleBe: subtitleBe || '',
        content: content || [],
        contentEn: contentEn || [],
        contentBe: contentBe || []
      }
    });

    res.status(201).json(pageContent);
  } catch (error) {
    console.error('Ошибка при создании контента страницы услуг:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновить контент страницы услуг
const updateServicesPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    const {
      title,
      titleEn,
      titleBe,
      subtitle,
      subtitleEn,
      subtitleBe,
      content,
      contentEn,
      contentBe
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (titleEn !== undefined) updateData.titleEn = titleEn;
    if (titleBe !== undefined) updateData.titleBe = titleBe;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (subtitleEn !== undefined) updateData.subtitleEn = subtitleEn;
    if (subtitleBe !== undefined) updateData.subtitleBe = subtitleBe;
    if (content !== undefined) updateData.content = content;
    if (contentEn !== undefined) updateData.contentEn = contentEn;
    if (contentBe !== undefined) updateData.contentBe = contentBe;

    // Обновляем, а если записи ещё нет — создаём её
    const pageContent = await prisma.servicesPageContent.upsert({
      where: { pageType },
      update: updateData,
      create: {
        pageType,
        title: title ?? 'Услуги',
        titleEn: titleEn ?? 'Services',
        titleBe: titleBe ?? 'Паслугі',
        subtitle: subtitle ?? '',
        subtitleEn: subtitleEn ?? '',
        subtitleBe: subtitleBe ?? '',
        content: content ?? [],
        contentEn: contentEn ?? [],
        contentBe: contentBe ?? [],
      }
    });

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при обновлении контента страницы услуг:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удалить контент страницы услуг
const deleteServicesPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;

    await prisma.servicesPageContent.delete({
      where: { pageType }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении контента страницы услуг:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getServicesPageContent,
  createServicesPageContent,
  updateServicesPageContent,
  deleteServicesPageContent
};
