const prisma = require('../prisma/prisma-client');

const AboutCompanyCategoryController = {
    // Получить все категории "О предприятии"
    getAllCategories: async (req, res) => {
        try {
            const categories = await prisma.aboutCompanyCategory.findMany({
                orderBy: { sortOrder: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            console.error('Error fetching about company categories:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить категорию по ID
    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await prisma.aboutCompanyCategory.findUnique({
                where: { id: parseInt(id) }
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.json(category);
        } catch (error) {
            console.error('Error fetching about company category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создать новую категорию
    createCategory: async (req, res) => {
        try {
            const {
                name,
                nameEn,
                nameBe,
                description,
                descriptionEn,
                descriptionBe,
                pageType,
                isActive = true,
                sortOrder = 0
            } = req.body;

            if (!name || !pageType) {
                return res.status(400).json({ error: 'Name and pageType are required' });
            }

            // Проверяем, не существует ли уже категория с таким pageType
            const existingCategory = await prisma.aboutCompanyCategory.findUnique({
                where: { pageType }
            });

            if (existingCategory) {
                return res.status(400).json({ error: 'Category with this pageType already exists' });
            }

            const category = await prisma.aboutCompanyCategory.create({
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
            // Автосоздание страницы контента для новой подкатегории "О предприятии"
            try {
                await prisma.aboutCompanyPageContent.upsert({
                    where: { pageType },
                    update: {},
                    create: {
                        pageType,
                        title: name || 'О предприятии',
                        subtitle: '',
                        content: []
                    }
                });
            } catch (e) {
                console.warn('aboutCompanyPageContent upsert failed (non-critical):', e?.message);
            }

            res.status(201).json(category);
        } catch (error) {
            console.error('Error creating about company category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить категорию
    updateCategory: async (req, res) => {
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

            const category = await prisma.aboutCompanyCategory.findUnique({
                where: { id: parseInt(id) }
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            // Если pageType изменяется, проверяем уникальность
            if (pageType && pageType !== category.pageType) {
                const existingCategory = await prisma.aboutCompanyCategory.findUnique({
                    where: { pageType }
                });

                if (existingCategory) {
                    return res.status(400).json({ error: 'Category with this pageType already exists' });
                }
            }

            const updatedCategory = await prisma.aboutCompanyCategory.update({
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

            res.json(updatedCategory);
        } catch (error) {
            console.error('Error updating about company category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удалить категорию
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const category = await prisma.aboutCompanyCategory.findUnique({
                where: { id: parseInt(id) }
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            await prisma.aboutCompanyCategory.delete({
                where: { id: parseInt(id) }
            });

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting about company category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = AboutCompanyCategoryController;
