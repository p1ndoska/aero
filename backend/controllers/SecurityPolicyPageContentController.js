const prisma = require('../prisma/prisma-client');

const SecurityPolicyPageContentController = {
    getSecurityPolicyPageContent: async (req, res) => {
        try {
            const content = await prisma.securityPolicyPageContent.findFirst();
            if (!content) {
                return res.status(404).json({ error: 'Security policy page content not found' });
            }
            res.json(content);
        } catch (error) {
            console.error('Error fetching security policy page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateSecurityPolicyPageContent: async (req, res) => {
        try {
            const { title, subtitle, content, titleEn, titleBe, subtitleEn, subtitleBe, contentEn, contentBe } = req.body;

            const existingContent = await prisma.securityPolicyPageContent.findFirst();

            let updatedContent;
            if (existingContent) {
                updatedContent = await prisma.securityPolicyPageContent.update({
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
                updatedContent = await prisma.securityPolicyPageContent.create({
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
            console.error('Error updating security policy page content:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = SecurityPolicyPageContentController;
