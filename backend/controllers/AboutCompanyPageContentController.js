const prisma = require('../prisma/prisma-client');

const AboutCompanyPageContentController = {
    getAboutCompanyPageContent: async (req, res) => {
        try {
            const content = await prisma.aboutCompanyPageContent.findFirst();
            if (!content) {
                // Возвращаем пустой объект с дефолтными значениями вместо 404
                return res.json({
                    id: null,
                    pageType: 'default',
                    title: 'О предприятии',
                    titleEn: 'About the Company',
                    titleBe: 'Пра прадпрыемстве',
                    subtitle: '',
                    subtitleEn: '',
                    subtitleBe: '',
                    content: [],
                    contentEn: [],
                    contentBe: [],
                    createdAt: null,
                    updatedAt: null
                });
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
            let content = await prisma.aboutCompanyPageContent.findUnique({
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
                const category = await prisma.aboutCompanyCategory.findUnique({
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
                    content = await prisma.aboutCompanyPageContent.create({
                        data: {
                            pageType,
                            title: category.name || 'О предприятии',
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
                    return res.json(content);
                } else {
                    // Если категория не найдена, возвращаем 404
                    return res.status(404).json({ 
                        error: 'About company page content and category not found'
                    });
                }
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

            console.log('Update request for pageType:', pageType);
            console.log('Update data:', JSON.stringify({ title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe }, null, 2));

            // Проверяем, существует ли запись с таким pageType
            const existingContent = await prisma.aboutCompanyPageContent.findUnique({
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
                
                console.log('Updating with data:', JSON.stringify(updateData, null, 2));
                
                const updatedContent = await prisma.aboutCompanyPageContent.update({
                    where: { pageType },
                    data: updateData
                });
                
                console.log('Updated content:', JSON.stringify(updatedContent, null, 2));
                res.json(updatedContent);
            } else {
                // Создаем новую запись
                const newContent = await prisma.aboutCompanyPageContent.create({
                    data: {
                        pageType,
                        title: title !== undefined ? title : 'О предприятии',
                        titleEn: titleEn !== undefined ? titleEn : 'About the Company',
                        titleBe: titleBe !== undefined ? titleBe : 'Пра прадпрыемстве',
                        subtitle: subtitle !== undefined ? subtitle : '',
                        subtitleEn: subtitleEn !== undefined ? subtitleEn : '',
                        subtitleBe: subtitleBe !== undefined ? subtitleBe : '',
                        content: content !== undefined ? content : [],
                        contentEn: contentEn !== undefined ? contentEn : [],
                        contentBe: contentBe !== undefined ? contentBe : [],
                    }
                });
                console.log('Created new content:', JSON.stringify(newContent, null, 2));
                res.json(newContent);
            }
        } catch (error) {
            console.error('Error updating about company page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
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
