const prisma = require('../prisma/prisma-client');

const AboutCompanyPageContentController = {
    getAboutCompanyPageContent: async (req, res) => {
        try {
            const content = await prisma.aboutCompanyPageContent.findFirst();
            if (!content) {
                return res.status(404).json({ error: 'About company page content not found' });
            }
            res.json(content);
        } catch (error) {
            console.error('Error fetching about company page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAboutCompanyPageContent: async (req, res) => {
        try {
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const existingContent = await prisma.aboutCompanyPageContent.findFirst();

            let updatedContent;
            if (existingContent) {
                updatedContent = await prisma.aboutCompanyPageContent.update({
                    where: { id: existingContent.id },
                    data: {
                        title,
                        subtitle,
                        content,
                        titleEn,
                        titleBe,
                        subtitleEn,
                        subtitleBe,
                        contentEn,
                        contentBe,
                    },
                });
            } else {
                updatedContent = await prisma.aboutCompanyPageContent.create({
                    data: {
                        title,
                        subtitle,
                        content,
                        titleEn,
                        titleBe,
                        subtitleEn,
                        subtitleBe,
                        contentEn,
                        contentBe,
                    },
                });
            }
            res.json(updatedContent);
        } catch (error) {
            console.error('Error updating about company page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAboutCompanyPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            const content = await prisma.aboutCompanyPageContent.findUnique({
                where: { pageType }
            });
            if (!content) {
                return res.status(404).json({ error: 'About company page content not found' });
            }
            res.json(content);
        } catch (error) {
            console.error('Error fetching about company page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAboutCompanyPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            // Проверяем, существует ли запись с таким pageType
            const existingContent = await prisma.aboutCompanyPageContent.findUnique({
                where: { pageType }
            });

            if (existingContent) {
                // Обновляем существующую запись
                const updatedContent = await prisma.aboutCompanyPageContent.update({
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
                const newContent = await prisma.aboutCompanyPageContent.create({
                    data: {
                        pageType,
                        title: title || 'О предприятии',
                        titleEn: titleEn || 'About the Company',
                        titleBe: titleBe || 'Пра прадпрыемстве',
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
            console.error('Error updating about company page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createAboutCompanyPageContent: async (req, res) => {
        try {
            const { pageType, title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const newContent = await prisma.aboutCompanyPageContent.create({
                data: {
                    pageType: pageType || 'default',
                    title: title || 'О предприятии',
                    titleEn: titleEn || 'About the Company',
                    titleBe: titleBe || 'Пра прадпрыемстве',
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
            console.error('Error creating about company page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = AboutCompanyPageContentController;
