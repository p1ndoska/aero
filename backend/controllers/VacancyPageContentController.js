const prisma = require('../prisma/prisma-client');

const VacancyPageContentController = {
    // Получение контента страницы вакансий
    getPageContent: async (req, res) => {
        try {
            // Получаем первую запись (у нас будет только одна запись для контента страницы)
            let pageContent = await prisma.vacancyPageContent.findFirst();

            // Если записи нет, создаем дефолтную
            if (!pageContent) {
                pageContent = await prisma.vacancyPageContent.create({
                    data: {
                        title: 'Открытые вакансии',
                        subtitle: 'Присоединяйтесь к нашей команде профессионалов',
                        content: []
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
        const { title, subtitle, content } = req.body;

        try {
            // Получаем первую запись
            let pageContent = await prisma.vacancyPageContent.findFirst();

            if (!pageContent) {
                // Создаем, если не существует
                pageContent = await prisma.vacancyPageContent.create({
                    data: {
                        title: title || 'Открытые вакансии',
                        subtitle: subtitle || null,
                        content: content || []
                    }
                });
            } else {
                // Обновляем существующую запись
                pageContent = await prisma.vacancyPageContent.update({
                    where: { id: pageContent.id },
                    data: {
                        title: title !== undefined ? title : pageContent.title,
                        subtitle: subtitle !== undefined ? subtitle : pageContent.subtitle,
                        content: content !== undefined ? content : pageContent.content
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

