const prisma = require('../prisma/prisma-client');

const SocialWorkPageContentController = {
    getSocialWorkPageContent: async (req, res) => {
        try {
            const { pageType } = req.params;
            console.log('Fetching social work page content for pageType:', pageType);
            console.log('Prisma client:', typeof prisma, prisma ? 'loaded' : 'not loaded');
            
            const content = await prisma.socialWorkPageContent.findUnique({
                where: { pageType }
            });
            
            if (!content) {
                console.log('No content found for pageType:', pageType);
                // Создаем дефолтный контент, если его нет
                const defaultContent = await prisma.socialWorkPageContent.create({
                    data: {
                        pageType,
                        title: 'Социальная работа',
                        subtitle: 'Информация о социальной работе на предприятии',
                        content: [],
                        contentEn: [],
                        contentBe: []
                    }
                });
                return res.json(defaultContent);
            }
            
            console.log('Found content for pageType:', pageType);
            res.json(content);
        } catch (error) {
            console.error('Error fetching social work page content:', error);
            console.error('Error details:', error.message);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    updateSocialWorkPageContent: async (req, res) => {
        try {
            const { pageType } = req.params;
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;
            
            console.log('Updating social work page content for pageType:', pageType);
            console.log('Update data:', { title, subtitle, content });

            const existingContent = await prisma.socialWorkPageContent.findUnique({
                where: { pageType }
            });

            let updatedContent;
            if (existingContent) {
                updatedContent = await prisma.socialWorkPageContent.update({
                    where: { pageType },
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
                updatedContent = await prisma.socialWorkPageContent.create({
                    data: {
                        pageType,
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
            console.error('Error updating social work page content:', error);
            console.error('Error details:', error.message);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    // Получить все страницы социальной работы
    getAllSocialWorkPages: async (req, res) => {
        try {
            const pages = await prisma.socialWorkPageContent.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(pages);
        } catch (error) {
            console.error('Error fetching all social work pages:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = SocialWorkPageContentController;
