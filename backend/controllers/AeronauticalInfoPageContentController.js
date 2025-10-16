const prisma = require('../prisma/prisma-client');

const AeronauticalInfoPageContentController = {
    getAeronauticalInfoPageContent: async (req, res) => {
        try {
            const content = await prisma.aeronauticalInfoPageContent.findMany();
            res.json(content);
        } catch (error) {
            console.error('Error fetching aeronautical info page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAeronauticalInfoPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            const content = await prisma.aeronauticalInfoPageContent.findUnique({
                where: { pageType }
            });
            res.json(content);
        } catch (error) {
            console.error('Error fetching aeronautical info page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAeronauticalInfoPageContent: async (req, res) => {
        try {
            const { pageType, title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const updateData = {
                pageType,
                title: title || 'Аэронавигационная информация',
                titleEn: titleEn || 'Aeronautical Information',
                titleBe: titleBe || 'Аэранавігацыйная інфармацыя',
                subtitle: subtitle || '',
                subtitleEn: subtitleEn || '',
                subtitleBe: subtitleBe || '',
                content: content || [],
                contentEn: contentEn || [],
                contentBe: contentBe || [],
            };

            const updatedContent = await prisma.aeronauticalInfoPageContent.upsert({
                where: { pageType },
                update: updateData,
                create: updateData
            });
            res.json(updatedContent);
        } catch (error) {
            console.error('Error updating aeronautical info page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAeronauticalInfoPageContentByPageType: async (req, res) => {
        try {
            const { pageType } = req.params;
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;
            
            console.log('Updating aeronautical info page content:', { pageType, title, content });

            // Проверяем, существует ли запись с таким pageType
            const existingContent = await prisma.aeronauticalInfoPageContent.findUnique({
                where: { pageType }
            });

            if (existingContent) {
                // Обновляем существующую запись
                const updatedContent = await prisma.aeronauticalInfoPageContent.update({
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
                const newContent = await prisma.aeronauticalInfoPageContent.create({
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
                        contentBe: contentBe || [],
                    }
                });
                res.json(newContent);
            }
        } catch (error) {
            console.error('Error updating aeronautical info page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createAeronauticalInfoPageContent: async (req, res) => {
        try {
            const { pageType, title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const newContent = await prisma.aeronauticalInfoPageContent.create({
                data: {
                    pageType: pageType || 'default',
                    title: title || 'Аэронавигационная информация',
                    titleEn: titleEn || 'Aeronautical Information',
                    titleBe: titleBe || 'Аэранавігацыйная інфармацыя',
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
            console.error('Error creating aeronautical info page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteAeronauticalInfoPageContent: async (req, res) => {
        try {
            const { pageType } = req.params;
            await prisma.aeronauticalInfoPageContent.delete({
                where: { pageType }
            });
            res.json({ message: 'Aeronautical info page content deleted successfully' });
        } catch (error) {
            console.error('Error deleting aeronautical info page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = AeronauticalInfoPageContentController;