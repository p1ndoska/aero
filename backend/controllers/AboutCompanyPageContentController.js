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

            const updatedContent = await prisma.aboutCompanyPageContent.update({
                where: { pageType },
                data: updateData
            });
            res.json(updatedContent);
        } catch (error) {
            console.error('Error updating about company page content by pageType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = AboutCompanyPageContentController;
