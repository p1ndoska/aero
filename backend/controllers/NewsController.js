const prisma = require ('../prisma/prisma-client');

const NewsController = {
    createNews: async (req, res) => {
        const {name, nameEn, nameBe, content, contentEn, contentBe, categoryId} = req.body;
        // if (!name || !categoryId ) {
        //     return res.status(400).json({error: 'Заполните обязательные поля'});
        // }

        let filePath;
        let additionalImages = [];

        // Основное фото
        if(req.files && req.files.photo && req.files.photo[0]){
            filePath = req.files.photo[0].path;
        }

        // Дополнительные изображения
        if(req.files && req.files.images) {
            try {
                // Проверяем, является ли images массивом
                if (Array.isArray(req.files.images)) {
                    additionalImages = req.files.images.map(file => file.path);
                } else {
                    // Если это не массив, создаем массив из одного элемента
                    additionalImages = [req.files.images.path];
                }
                console.log('Additional images processed:', additionalImages);
            } catch (error) {
                console.error('Error processing additional images:', error);
                additionalImages = [];
            }
        }

        try{
            console.log('Creating news with data:', {
                name,
                content,
                categoryId,
                filePath,
                additionalImages,
                files: req.files,
                body: req.body
            });
            
            // Проверяем, что categoryId является числом
            if (!categoryId || isNaN(Number(categoryId))) {
                console.error('Invalid categoryId:', categoryId);
                return res.status(400).json({error: 'Неверный ID категории'});
            }
            
            const existingNewsCategory = await prisma.newsCategory.findUnique({
                where: {
                    id: Number(categoryId),
                }
            })
            if(!existingNewsCategory){
                return res.status(400).json({error:"Категория не найдена"})
            }

            // Создаем новость с дополнительными изображениями
            const newsData = {
                name: name,
                nameEn: nameEn || null,
                nameBe: nameBe || null,
                content: content,
                contentEn: contentEn || null,
                contentBe: contentBe || null,
                photo: filePath,
                images: additionalImages, // Добавляем дополнительные изображения
                newsCategory: {
                    connect: { id: Number(categoryId) }
                }
            };

            console.log('News data to create:', newsData);

            const news = await prisma.news.create({
                data: newsData
            })
            return res.status(200).json(news);
        }catch(error){
            console.error('create news error', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                meta: error.meta
            });
            return res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    },
    updateNews: async (req, res) => {
        const { name, nameEn, nameBe, content, contentEn, contentBe, categoryId } = req.body; // убрали photo из body
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "Новость не найдена" });
        }

        const newsId = parseInt(id, 10);
        if (isNaN(newsId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        // if (!name || !categoryId) {
        //     return res.status(400).json({ error: "Заполните обязательные поля" });
        // }

        try {
            // Проверяем существование категории
            const existingNewsCategory = await prisma.newsCategory.findUnique({
                where: {
                    id: Number(categoryId),
                }
            });

            if (!existingNewsCategory) {
                return res.status(400).json({ error: "Категория не найдена" });
            }

            // Подготавливаем данные для обновления
            const updateData = {
                name: name,
                nameEn: nameEn || null,
                nameBe: nameBe || null,
                content: content || undefined,
                contentEn: contentEn || null,
                contentBe: contentBe || null,
                categoryId: Number(categoryId),
            };

            // Обрабатываем основное фото
            if (req.files && req.files.photo && req.files.photo[0]) {
                updateData.photo = req.files.photo[0].path;
            } else if (req.body.photo !== undefined) {
                // Если photo передано как текст (например, URL)
                updateData.photo = req.body.photo || null;
            }

            // Обрабатываем дополнительные изображения
            let additionalImages = [];
            if (req.files && req.files.images) {
                additionalImages = req.files.images.map(file => file.path);
                updateData.images = additionalImages; // Добавляем дополнительные изображения
            }

            // Обновляем новость
            const updatedNews = await prisma.news.update({
                where: { id: newsId },
                data: updateData
            });

            return res.status(200).json(updatedNews);
        } catch (error) {
            console.error('update news error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    deleteNews: async (req, res) => {
        const {id} = req.params;

        if(!id){
            return res.status(400).json({error:"Новость не найдена"})
        }

        try{
            const tranc = await prisma.news.delete({
                where: {
                    id: Number(id),
                }
            })

            return res.status(200).json(`Новость ${tranc.name} успешно удалена `);
        }catch(error){
            console.error('delete News error', error);
            return res.status(500).json({error:'Internal server error'});
        }

    },
    getNewsById: async (req, res) => {
        const id = req.params.id;
        if(!id){
            return res.status(400).json({error:"Новость не найдена"})
        }

        const newsId = parseInt(id, 10);

        if (isNaN(newsId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try{

                const news = await prisma.news.findUnique({
                    where: { id: newsId },
                    select: {
                        id: true,
                        name: true,
                        content: true,
                        photo: true,
                        images: true,
                        createdAt: true,
                        updatedAt: true,
                        categoryId: true,
                        newsCategory: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
            });

            if (!news) {
                return res.status(404).json({error: 'Новость не найдена'});
            }

            return res.status(200).json(news);
        }catch(error){
            console.error('get news by id error', error);
            return res.status(500).json({error:'Internal server error'});
        }
    },
    getAllNews: async (req, res) => {
        try {
            const news = await prisma.news.findMany({
                select: {
                    id: true,
                    name: true,
                    content: true,
                    photo: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                    categoryId: true,
                    newsCategory: {
                        select: {
                            id: true,
                            name: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return res.status(200).json(news);
        }catch(error){
            console.error('get All News error', error);
            return res.status(500).json({error:'Internal server error'});
        }

    },
    getNewsByCategory: async (req, res) => {
        const category = req.params.category;
        if(!category){
            return res.status(400).json({error:"Новость не найдена"})
        }

        const categoryId = parseInt(req.params.id, 10);

        if(isNaN(categoryId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }

        const {id} = req.params;

        if(!id){
            return res.status(400).json({error:"Новость не найдена"})
        }

        const newsId = parseInt(id, 10);

        if (isNaN(newsId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        const validCategory = Object.values(prisma.newsCategory);
        if(!validCategory.includes(category)){
            return res.status(400).json({error:"Неверная категория"})
        }

        try{
            const news = await prisma.news.findMany({
                where: {
                    category: {
                        has: category
                    }
                },
                select: {
                    name:true,
                    content:true,
                    photo:true,
                    category:true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            if (news.length === 0) {
                return res.status(404).json({ error: 'Новости не найдены' });
            }

            return res.status(200).json(news);
        }catch(error){
            console.error('get news by id error', error);
            return res.status(500).json({error:'Internal server error'});
        }
    }
}
module.exports = NewsController;