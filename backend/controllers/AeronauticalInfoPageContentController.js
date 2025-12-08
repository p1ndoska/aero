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
            let content = await prisma.aeronauticalInfoPageContent.findUnique({
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
                const category = await prisma.aeronauticalInfoCategory.findUnique({
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
                    content = await prisma.aeronauticalInfoPageContent.create({
                        data: {
                            pageType,
                            title: category.name || 'Аэронавигационная информация',
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
                    // Если категории нет, создаем контент с дефолтными значениями
                    try {
                        content = await prisma.aeronauticalInfoPageContent.create({
                            data: {
                                pageType,
                                title: 'Аэронавигационная информация',
                                titleEn: 'Aeronautical Information',
                                titleBe: 'Аэранавігацыйная інфармацыя',
                                subtitle: null,
                                subtitleEn: null,
                                subtitleBe: null,
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
                    } catch (createError) {
                        // Если не удалось создать (например, из-за уникального ограничения), пытаемся получить еще раз
                        content = await prisma.aeronauticalInfoPageContent.findUnique({
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
                            return res.status(500).json({ error: 'Could not create or find content', details: createError.message });
                        }
                    }
                }
            }
            
            res.json(content);
        } catch (error) {
            console.error('Error fetching aeronautical info page content by pageType:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ error: 'Internal server error', details: error.message });
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
                
                const updatedContent = await prisma.aeronauticalInfoPageContent.update({
                    where: { pageType },
                    data: updateData
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