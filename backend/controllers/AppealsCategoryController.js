const prisma = require('../prisma/prisma-client');

const AppealsCategoryController = {
    getAll: async (req, res) => {
        try {
            const categories = await prisma.appealsCategory.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            console.error('Error fetching appeals categories:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await prisma.appealsCategory.findUnique({ where: { id: parseInt(id) } });
            if (!category) return res.status(404).json({ error: 'Appeals category not found' });
            res.json(category);
        } catch (error) {
            console.error('Error fetching appeals category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    create: async (req, res) => {
        try {
            const { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder } = req.body;

            const existing = await prisma.appealsCategory.findUnique({ where: { pageType } });
            if (existing) return res.status(400).json({ error: 'Page type already exists' });

            const created = await prisma.appealsCategory.create({
                data: {
                    name, nameEn, nameBe,
                    description, descriptionEn, descriptionBe,
                    pageType,
                    isActive: isActive !== undefined ? isActive : true,
                    sortOrder: sortOrder || 0
                }
            });

            // Автоматическое создание страницы контента
            try {
                await prisma.appealsPageContent.upsert({
                    where: { pageType },
                    update: {},
                    create: {
                        pageType,
                        title: name || 'Обращения',
                        titleEn: nameEn || 'Appeals',
                        titleBe: nameBe || 'Звароты',
                        subtitle: '',
                        content: []
                    }
                });
            } catch (e) {
                console.warn('appealsPageContent upsert failed (non-critical):', e?.message);
            }

            res.json(created);
        } catch (error) {
            console.error('Error creating appeals category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder } = req.body;

            if (pageType) {
                const existing = await prisma.appealsCategory.findFirst({ where: { pageType, id: { not: parseInt(id) } } });
                if (existing) return res.status(400).json({ error: 'Page type already exists' });
            }

            const updated = await prisma.appealsCategory.update({
                where: { id: parseInt(id) },
                data: { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder }
            });
            res.json(updated);
        } catch (error) {
            console.error('Error updating appeals category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    remove: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.appealsCategory.delete({ where: { id: parseInt(id) } });
            res.json({ message: 'Appeals category deleted successfully' });
        } catch (error) {
            console.error('Error deleting appeals category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateOrder: async (req, res) => {
        try {
            const { categories } = req.body;
            await Promise.all(
                categories.map(c => prisma.appealsCategory.update({ where: { id: c.id }, data: { sortOrder: c.sortOrder } }))
            );
            res.json({ message: 'Categories order updated successfully' });
        } catch (error) {
            console.error('Error updating appeals categories order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = AppealsCategoryController;