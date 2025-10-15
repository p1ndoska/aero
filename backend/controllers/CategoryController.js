const prisma = require ('../prisma/prisma-client');

const CategoryController = {
    createCategory: async (req, res) => {
        const {name, nameEn, nameBe} = req.body;
        if(!name || !name.trim()){
            return res.status(400).json({err:'Введите название'});
        }
        try {
            const existingCategory = await prisma.newsCategory.findFirst({
                where: {
                    name: name
                }
            })
            if(existingCategory){
                return res.status(400).json({error:"Категория уже существует"})
            }
            const category = await prisma.newsCategory.create({
                data: {
                    name: name,
                    nameEn: nameEn || null,
                    nameBe: nameBe || null
                },
            })
            return res.status(200).json(`Категория успешно создана: ${category.name}`);
        }catch(error){
            console.error('create category error', error);
            return res.status(502).json({err:'Internal server error'});
        }


    },
    deleteCategory: async (req, res) => {
        const {id} = req.params;
        const { cascade } = req.query; // Новый параметр для каскадного удаления

        const categoryId = parseInt(req.params.id, 10);
        if(isNaN(categoryId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }
        if(!categoryId){
            return res.status(400).json({error:"Категория не найдена"})
        }
        try{

            const existingCategory = await prisma.newsCategory.findUnique({
                where: {
                    id: categoryId
                }
            })
            if(!existingCategory){
                return res.status(404).json({error:"Категория не существует"})
            }

            // Проверяем, есть ли новости в этой категории
            const newsInCategory = await prisma.news.count({
                where: {
                    categoryId: categoryId
                }
            })

            // Если каскадное удаление не запрошено и есть новости
            if(newsInCategory > 0 && cascade !== 'true') {
                return res.status(400).json({
                    error: `Невозможно удалить категорию "${existingCategory.name}". В ней содержится ${newsInCategory} новостей.`,
                    newsCount: newsInCategory,
                    canCascade: true
                });
            }

            let deletedCategory;
            let deletedNewsCount = 0;

            if (cascade === 'true' && newsInCategory > 0) {
                // Каскадное удаление: сначала удаляем все новости, затем категорию
                deletedNewsCount = await prisma.news.deleteMany({
                    where: {
                        categoryId: categoryId
                    }
                });

                deletedCategory = await prisma.newsCategory.delete({
                    where: {
                        id: categoryId
                    }
                });

                return res.status(200).json({
                    message: `Категория "${deletedCategory.name}" и ${deletedNewsCount.count} новостей успешно удалены`,
                    category: deletedCategory,
                    deletedNewsCount: deletedNewsCount.count
                });
            } else {
                // Обычное удаление (только пустые категории)
                deletedCategory = await prisma.newsCategory.delete({
                    where: {
                        id: categoryId
                    }
                });

                return res.status(200).json({
                    message: `Категория "${deletedCategory.name}" успешно удалена`,
                    category: deletedCategory,
                    deletedNewsCount: 0
                });
            }
        }catch(error){
            console.error('delete category error', error);
            return res.status(502).json({error:'Internal server error'});
        }
    },
    updateCategory: async (req, res) => {
        const {id} = req.params;
        const categoryId = parseInt(req.params.id, 10);
        if(isNaN(categoryId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }
        if(!categoryId){
            return res.status(400).json({error:"Категория не найдена"})
        }
        const {name, nameEn, nameBe} = req.body;
        if(!name || !name.trim()){
            return res.status(400).json({error:"Введите название категории"})
        }
        try{
            const existingCategory = await prisma.newsCategory.findUnique({
                where: {
                    id: categoryId
                }
            })
            if(!existingCategory){
                return res.status(404).json({error:"Категория не существует"})
            }

            const updtCategory = await prisma.newsCategory.update({
                where: {
                    id: categoryId
                },
                data:{
                    name: name || undefined,
                    nameEn: nameEn || null,
                    nameBe: nameBe || null
                }
            })
            return res.status(200).json(`Категория успешно изменена: ${updtCategory.name}`);
        }catch(error){
            console.error('update category error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    getCategoryById: async (req, res) => {
        const {id} = req.params;
        const categoryId = parseInt(req.params.id, 10);
        if(isNaN(categoryId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }
        if(!categoryId){
            return res.status(400).json({error:"Категория не найдена"})
        }
        try{
            const existingCategory = await prisma.newsCategory.findUnique({
                where: {
                    id: categoryId
                }
            })
            if(!existingCategory){
                return res.status(404).json({error:"Категория не существует"})
            }

            const category = await prisma.newsCategory.findUnique({
                where: {
                    id: categoryId
                }
            })

            return res.status(200).json({category});
        }catch(error){
            console.error('get Category by id error', error);
            return res.status(502).json({err:'Internal server error'});
        }

    },
    getCategories: async (req, res) => {
        try{
            const existingCategory = await prisma.newsCategory.findMany()
            if(!existingCategory){
                return res.status(404).json({error:"Категорий нет"})
            }
            const categories = await prisma.newsCategory.findMany()
            return res.status(200).json(categories);
        }catch(error){
            console.error('get Categories Error', error);
            return res.status(500).json({err:'Internal server error'});
        }
    }
}
module.exports = CategoryController;