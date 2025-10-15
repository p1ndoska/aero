const prisma = require('../prisma/prisma-client');

const AeronauticalInfoCategoryController = {
    getAllAeronauticalInfoCategories: async (req, res) => {
        try {
            const categories = await prisma.aeronauticalInfoCategory.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            console.error('Error fetching aeronautical info categories:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAeronauticalInfoCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await prisma.aeronauticalInfoCategory.findUnique({
                where: { id: parseInt(id) }
            });
            if (!category) {
                return res.status(404).json({ error: 'Aeronautical info category not found' });
            }
            res.json(category);
        } catch (error) {
            console.error('Error fetching aeronautical info category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createAeronauticalInfoCategory: async (req, res) => {
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

            const existingCategory = await prisma.aeronauticalInfoCategory.findUnique({
                where: { pageType }
            });
            if (existingCategory) {
                return res.status(400).json({ error: 'Page type already exists' });
            }

            const category = await prisma.aeronauticalInfoCategory.create({
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
            // Автосоздание страницы контента для новой подкатегории АНИ
            try {
                await prisma.aeronauticalInfoPageContent.upsert({
                    where: { pageType },
                    update: {},
                    create: {
                        pageType,
                        title: name || 'Аэронавигационная информация',
                        subtitle: '',
                        content: []
                    }
                });
            } catch (e) {
                console.warn('aeronauticalInfoPageContent upsert failed (non-critical):', e?.message);
            }
            res.json(category);
        } catch (error) {
            console.error('Error creating aeronautical info category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateAeronauticalInfoCategory: async (req, res) => {
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

            if (pageType) {
                const existingCategory = await prisma.aeronauticalInfoCategory.findFirst({
                    where: { 
                        pageType,
                        id: { not: parseInt(id) }
                    }
                });
                if (existingCategory) {
                    return res.status(400).json({ error: 'Page type already exists' });
                }
            }

            const category = await prisma.aeronauticalInfoCategory.update({
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
            console.error('Error updating aeronautical info category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteAeronauticalInfoCategory: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.aeronauticalInfoCategory.delete({
                where: { id: parseInt(id) }
            });
            res.json({ message: 'Aeronautical info category deleted successfully' });
        } catch (error) {
            console.error('Error deleting aeronautical info category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateCategoriesOrder: async (req, res) => {
        try {
            const { categories } = req.body; 
            const updatePromises = categories.map(category => 
                prisma.aeronauticalInfoCategory.update({
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

module.exports = AeronauticalInfoCategoryController;