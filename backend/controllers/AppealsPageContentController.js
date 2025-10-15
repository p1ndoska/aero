const prisma = require('../prisma/prisma-client');

// Получить контент страницы обращений по pageType
const getAppealsPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    const pageContent = await prisma.appealsPageContent.findUnique({
      where: { pageType }
    });

    if (!pageContent) {
      return res.status(404).json({ error: 'Контент страницы не найден' });
    }

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при получении контента страницы обращений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Создать контент страницы обращений
const createAppealsPageContent = async (req, res) => {
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

    const pageContent = await prisma.appealsPageContent.create({
      data: {
        pageType,
        title: title || 'Обращения',
        titleEn: titleEn || 'Appeals',
        titleBe: titleBe || 'Звароты',
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
    console.error('Ошибка при создании контента страницы обращений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновить контент страницы обращений
const updateAppealsPageContent = async (req, res) => {
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

    const pageContent = await prisma.appealsPageContent.update({
      where: { pageType },
      data: updateData
    });

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при обновлении контента страницы обращений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удалить контент страницы обращений
const deleteAppealsPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;

    await prisma.appealsPageContent.delete({
      where: { pageType }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении контента страницы обращений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getAppealsPageContent,
  createAppealsPageContent,
  updateAppealsPageContent,
  deleteAppealsPageContent
};
