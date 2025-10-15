const prisma = require('../prisma/prisma-client');

const HistoryPageContentController = {
    getHistoryPageContent: async (req, res) => {
        try {
            const content = await prisma.historyPageContent.findFirst();
            if (!content) {
                return res.status(404).json({ error: 'History page content not found' });
            }
            res.json(content);
        } catch (error) {
            console.error('Error fetching history page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateHistoryPageContent: async (req, res) => {
        try {
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const existingContent = await prisma.historyPageContent.findFirst();

            let updatedContent;
            if (existingContent) {
                updatedContent = await prisma.historyPageContent.update({
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
                updatedContent = await prisma.historyPageContent.create({
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
            console.error('Error updating history page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = HistoryPageContentController;