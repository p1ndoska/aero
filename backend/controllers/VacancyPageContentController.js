const prisma = require('../prisma/prisma-client');

const VacancyPageContentController = {
    // Получение контента страницы вакансий
    getPageContent: async (req, res) => {
        try {
            // Получаем первую запись (у нас будет только одна запись для контента страницы)
            let pageContent = await prisma.vacancyPageContent.findFirst({
                select: {
                    id: true,
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

            // Если записи нет, создаем дефолтную
            if (!pageContent) {
                pageContent = await prisma.vacancyPageContent.create({
                    data: {
                        title: 'Открытые вакансии',
                        titleEn: 'Open Vacancies',
                        titleBe: 'Адкрытыя вакансіі',
                        subtitle: 'Присоединяйтесь к нашей команде профессионалов',
                        subtitleEn: 'Join our team of professionals',
                        subtitleBe: 'Далучайцеся да нашай каманды прафесіяналаў',
                        content: [],
                        contentEn: [],
                        contentBe: []
                    },
                    select: {
                        id: true,
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
            }

            return res.status(200).json(pageContent);
        } catch (error) {
            console.error('get page content error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновление контента страницы вакансий
    updatePageContent: async (req, res) => {
        const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

        try {
            // Получаем первую запись
            let pageContent = await prisma.vacancyPageContent.findFirst();

            if (!pageContent) {
                // Создаем, если не существует
                pageContent = await prisma.vacancyPageContent.create({
                    data: {
                        title: title || 'Открытые вакансии',
                        titleEn: titleEn || null,
                        titleBe: titleBe || null,
                        subtitle: subtitle || null,
                        subtitleEn: subtitleEn || null,
                        subtitleBe: subtitleBe || null,
                        content: content || [],
                        contentEn: contentEn || [],
                        contentBe: contentBe || []
                    },
                    select: {
                        id: true,
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
                // Обновляем существующую запись
                pageContent = await prisma.vacancyPageContent.update({
                    where: { id: pageContent.id },
                    data: {
                        title: title !== undefined ? title : pageContent.title,
                        titleEn: titleEn !== undefined ? titleEn : pageContent.titleEn,
                        titleBe: titleBe !== undefined ? titleBe : pageContent.titleBe,
                        subtitle: subtitle !== undefined ? subtitle : pageContent.subtitle,
                        subtitleEn: subtitleEn !== undefined ? subtitleEn : pageContent.subtitleEn,
                        subtitleBe: subtitleBe !== undefined ? subtitleBe : pageContent.subtitleBe,
                        content: content !== undefined ? content : pageContent.content,
                        contentEn: contentEn !== undefined ? contentEn : pageContent.contentEn,
                        contentBe: contentBe !== undefined ? contentBe : pageContent.contentBe
                    },
                    select: {
                        id: true,
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
            }

            return res.status(200).json(pageContent);
        } catch (error) {
            console.error('update page content error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = VacancyPageContentController;

