const prisma = require('../prisma/prisma-client');

const AppealsPageContentController = {
    getAppealsPageContent: async (req, res) => {
        try {
            const content = await prisma.appealsPageContent.findMany();
            res.json(content);
        } catch (error) {
            console.error('Error fetching appeals page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAppealsPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            let content = await prisma.appealsPageContent.findUnique({
                where: { pageType },
                select: {
                    id: true,
                    pageType: true,
                    title: true,
                    titleEn: true,
                    titleBe: true,
                    subtitle: true,
                    subtitleEn: true,
                    subtitleBe: true,
                    content: true,
                    contentEn: true,
                    contentBe: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            
            if (!content) {
                // Пытаемся найти категорию для получения названия
                const category = await prisma.appealsCategory.findUnique({
                    where: { pageType },
                    select: {
                        name: true,
                        nameEn: true,
                        nameBe: true,
                        description: true,
                        descriptionEn: true,
                        descriptionBe: true
                    }
                });
                
                // Создаем дефолтный контент на основе категории, если она найдена
                if (category) {
                    content = await prisma.appealsPageContent.create({
                        data: {
                            pageType,
                            title: category.name || 'Обращения',
                            titleEn: category.nameEn || null,
                            titleBe: category.nameBe || null,
                            subtitle: category.description || null,
                            subtitleEn: category.descriptionEn || null,
                            subtitleBe: category.descriptionBe || null,
                            content: [],
                            contentEn: [],
                            contentBe: []
                        },
                        select: {
                            id: true,
                            pageType: true,
                            title: true,
                            titleEn: true,
                            titleBe: true,
                            subtitle: true,
                            subtitleEn: true,
                            subtitleBe: true,
                            content: true,
                            contentEn: true,
                            contentBe: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    });
                } else {
                    // Если категории нет, возвращаем null (не 404, чтобы фронтенд мог обработать)
                    return res.json(null);
                }
            }
            
            res.json(content);
        } catch (error) {
            console.error('Error fetching appeals page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAppealsPageContent: async (req, res) => {
        try {
            const { pageType, title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const updateData = {
                pageType,
                title: title || 'Обращения',
                titleEn: titleEn || 'Appeals',
                titleBe: titleBe || 'Звароты',
                subtitle: subtitle || '',
                subtitleEn: subtitleEn || '',
                subtitleBe: subtitleBe || '',
                content: content || [],
                contentEn: contentEn || [],
                contentBe: contentBe || [],
            };

            const updatedContent = await prisma.appealsPageContent.upsert({
                where: { pageType },
                update: updateData,
                create: updateData
            });
            res.json(updatedContent);
        } catch (error) {
            console.error('Error updating appeals page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAppealsPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;
            
            console.log('Updating appeals page content:', { pageType, title, content });

            // Проверяем, существует ли запись с таким pageType
            const existingContent = await prisma.appealsPageContent.findUnique({
                where: { pageType }
            });

            if (existingContent) {
                // Обновляем существующую запись
                // Используем явные проверки на undefined, чтобы разрешить пустые строки и пустые массивы
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
                
                const updatedContent = await prisma.appealsPageContent.update({
                    where: { pageType },
                    data: updateData
                });
                res.json(updatedContent);
            } else {
                // Создаем новую запись
                const newContent = await prisma.appealsPageContent.create({
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
                        contentBe: contentBe || [],
                    }
                });
                res.json(newContent);
            }
        } catch (error) {
            console.error('Error updating appeals page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createAppealsPageContent: async (req, res) => {
        try {
            const { pageType, title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const newContent = await prisma.appealsPageContent.create({
                data: {
                    pageType: pageType || 'default',
                    title: title || 'Обращения',
                    titleEn: titleEn || 'Appeals',
                    titleBe: titleBe || 'Звароты',
                    subtitle: subtitle || '',
                    subtitleEn: subtitleEn || '',
                    subtitleBe: subtitleBe || '',
                    content: content || [],
                    contentEn: contentEn || [],
                    contentBe: contentBe || [],
                },
            });
            res.status(201).json(newContent);
        } catch (error) {
            console.error('Error creating appeals page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteAppealsPageContent: async (req, res) => {
        try {
            const { pageType } = req.params;
            await prisma.appealsPageContent.delete({
                where: { pageType }
            });
            res.json({ message: 'Appeals page content deleted successfully' });
        } catch (error) {
            console.error('Error deleting appeals page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = AppealsPageContentController;