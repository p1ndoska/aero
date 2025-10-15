const prisma = require('../prisma/prisma-client');

// Получить контент страницы аэронавигационной информации по pageType
const getAeronauticalInfoPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    const pageContent = await prisma.aeronauticalInfoPageContent.findUnique({
      where: { pageType }
    });

    if (!pageContent) {
      return res.status(404).json({ error: 'Контент страницы не найден' });
    }

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при получении контента страницы аэронавигационной информации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Создать контент страницы аэронавигационной информации
const createAeronauticalInfoPageContent = async (req, res) => {
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

    const pageContent = await prisma.aeronauticalInfoPageContent.create({
      data: {
        pageType,
        title: title || 'Аэронавигационная информация',
        titleEn: titleEn || 'Aeronautical Information',
        titleBe: titleBe || 'Аэранавігацыйная інфармацыя',
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
    console.error('Ошибка при создании контента страницы аэронавигационной информации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновить контент страницы аэронавигационной информации
const updateAeronauticalInfoPageContent = async (req, res) => {
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

    const pageContent = await prisma.aeronauticalInfoPageContent.update({
      where: { pageType },
      data: updateData
    });

    res.json(pageContent);
  } catch (error) {
    console.error('Ошибка при обновлении контента страницы аэронавигационной информации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Удалить контент страницы аэронавигационной информации
const deleteAeronauticalInfoPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;

    await prisma.aeronauticalInfoPageContent.delete({
      where: { pageType }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении контента страницы аэронавигационной информации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getAeronauticalInfoPageContent,
  createAeronauticalInfoPageContent,
  updateAeronauticalInfoPageContent,
  deleteAeronauticalInfoPageContent
};
