const prisma = require('../prisma/prisma-client');

const ServicesCategoryController = {
    getAll: async (req, res) => {
        try {
            const categories = await prisma.servicesCategory.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            console.error('Error fetching services categories:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await prisma.servicesCategory.findUnique({ where: { id: parseInt(id) } });
            if (!category) return res.status(404).json({ error: 'Services category not found' });
            res.json(category);
        } catch (error) {
            console.error('Error fetching services category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    create: async (req, res) => {
        try {
            const { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder } = req.body;

            const existing = await prisma.servicesCategory.findUnique({ where: { pageType } });
            if (existing) return res.status(400).json({ error: 'Page type already exists' });

            const created = await prisma.servicesCategory.create({
                data: {
                    name, nameEn, nameBe,
                    description, descriptionEn, descriptionBe,
                    pageType,
                    isActive: isActive !== undefined ? isActive : true,
                    sortOrder: sortOrder || 0
                }
            });
            res.json(created);
        } catch (error) {
            console.error('Error creating services category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder } = req.body;

            if (pageType) {
                const existing = await prisma.servicesCategory.findFirst({ where: { pageType, id: { not: parseInt(id) } } });
                if (existing) return res.status(400).json({ error: 'Page type already exists' });
            }

            const updated = await prisma.servicesCategory.update({
                where: { id: parseInt(id) },
                data: { name, nameEn, nameBe, description, descriptionEn, descriptionBe, pageType, isActive, sortOrder }
            });
            res.json(updated);
        } catch (error) {
            console.error('Error updating services category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    remove: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.servicesCategory.delete({ where: { id: parseInt(id) } });
            res.json({ message: 'Services category deleted successfully' });
        } catch (error) {
            console.error('Error deleting services category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateOrder: async (req, res) => {
        try {
            const { categories } = req.body;
            await Promise.all(
                categories.map(c => prisma.servicesCategory.update({ where: { id: c.id }, data: { sortOrder: c.sortOrder } }))
            );
            res.json({ message: 'Categories order updated successfully' });
        } catch (error) {
            console.error('Error updating services categories order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = ServicesCategoryController;
