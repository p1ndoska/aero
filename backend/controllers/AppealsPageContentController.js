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
            const content = await prisma.appealsPageContent.findUnique({
                where: { pageType }
            });
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
                const updatedContent = await prisma.appealsPageContent.update({
                    where: { pageType },
                    data: {
                        title: title || existingContent.title,
                        titleEn: titleEn || existingContent.titleEn,
                        titleBe: titleBe || existingContent.titleBe,
                        subtitle: subtitle !== undefined ? subtitle : existingContent.subtitle,
                        subtitleEn: subtitleEn !== undefined ? subtitleEn : existingContent.subtitleEn,
                        subtitleBe: subtitleBe !== undefined ? subtitleBe : existingContent.subtitleBe,
                        content: content !== undefined ? content : existingContent.content,
                        contentEn: contentEn !== undefined ? contentEn : existingContent.contentEn,
                        contentBe: contentBe !== undefined ? contentBe : existingContent.contentBe,
                    }
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