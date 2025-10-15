const prisma = require('../prisma/prisma-client');

const SocialWorkCategoryController = {
    getAllSocialWorkCategories: async (req, res) => {
        try {
            const categories = await prisma.socialWorkCategory.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            console.error('Error fetching social work categories:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getSocialWorkCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await prisma.socialWorkCategory.findUnique({
                where: { id: parseInt(id) }
            });
            if (!category) {
                return res.status(404).json({ error: 'Social work category not found' });
            }
            res.json(category);
        } catch (error) {
            console.error('Error fetching social work category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createSocialWorkCategory: async (req, res) => {
        try {
            const { 
                name, 
                nameEn, 
                nameBe, 
                description, 
                descriptionEn, 
                descriptionBe, 
                pageType, 
                isActive, 
                sortOrder 
            } = req.body;

            // Проверяем, что pageType уникален
            const existingCategory = await prisma.socialWorkCategory.findUnique({
                where: { pageType }
            });
            if (existingCategory) {
                return res.status(400).json({ error: 'Page type already exists' });
            }

            const category = await prisma.socialWorkCategory.create({
                data: {
                    name,
                    nameEn,
                    nameBe,
                    description,
                    descriptionEn,
                    descriptionBe,
                    pageType,
                    isActive: isActive !== undefined ? isActive : true,
                    sortOrder: sortOrder || 0
                }
            });
            // Автосоздание страницы контента для новой подкатегории
            try {
                await prisma.socialWorkPageContent.upsert({
                    where: { pageType },
                    update: {},
                    create: {
                        pageType,
                        title: name || 'Социальная и идеологическая работа',
                        subtitle: '',
                        content: []
                    }
                });
            } catch (e) {
                console.warn('socialWorkPageContent upsert failed (non-critical):', e?.message);
            }
            res.json(category);
        } catch (error) {
            console.error('Error creating social work category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateSocialWorkCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                name, 
                nameEn, 
                nameBe, 
                description, 
                descriptionEn, 
                descriptionBe, 
                pageType, 
                isActive, 
                sortOrder 
            } = req.body;

            // Проверяем, что pageType уникален (если изменился)
            if (pageType) {
                const existingCategory = await prisma.socialWorkCategory.findFirst({
                    where: { 
                        pageType,
                        id: { not: parseInt(id) }
                    }
                });
                if (existingCategory) {
                    return res.status(400).json({ error: 'Page type already exists' });
                }
            }

            const category = await prisma.socialWorkCategory.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    nameEn,
                    nameBe,
                    description,
                    descriptionEn,
                    descriptionBe,
                    pageType,
                    isActive,
                    sortOrder
                }
            });
            res.json(category);
        } catch (error) {
            console.error('Error updating social work category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteSocialWorkCategory: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.socialWorkCategory.delete({
                where: { id: parseInt(id) }
            });
            res.json({ message: 'Social work category deleted successfully' });
        } catch (error) {
            console.error('Error deleting social work category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateCategoriesOrder: async (req, res) => {
        try {
            const { categories } = req.body; // Array of {id, sortOrder}
            
            const updatePromises = categories.map(category => 
                prisma.socialWorkCategory.update({
                    where: { id: category.id },
                    data: { sortOrder: category.sortOrder }
                })
            );
            
            await Promise.all(updatePromises);
            res.json({ message: 'Categories order updated successfully' });
        } catch (error) {
            console.error('Error updating categories order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = SocialWorkCategoryController;
