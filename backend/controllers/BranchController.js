const prisma = require('../prisma/prisma-client');
const { normalizeUploadPath } = require('../config/paths');

const BranchController = {
    // Получить все филиалы
    getAllBranches: async (req, res) => {
        try {
            const branches = await prisma.branch.findMany({
                select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    nameBe: true,
                    address: true,
                    addressEn: true,
                    addressBe: true,
                    phone: true,
                    email: true,
                    description: true,
                    descriptionEn: true,
                    descriptionBe: true,
                    workHours: true,
                    services: true,
                    coordinates: true,
                    images: true,
                    content: true,
                    contentEn: true,
                    contentBe: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return res.status(200).json({ branches });
        } catch (error) {
            console.error('getAllBranches error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить филиал по ID
    getBranchById: async (req, res) => {
        const { id } = req.params;
        const branchId = parseInt(id, 10);

        if (isNaN(branchId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    nameBe: true,
                    address: true,
                    addressEn: true,
                    addressBe: true,
                    phone: true,
                    email: true,
                    description: true,
                    descriptionEn: true,
                    descriptionBe: true,
                    workHours: true,
                    services: true,
                    coordinates: true,
                    images: true,
                    content: true,
                    contentEn: true,
                    contentBe: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!branch) {
                return res.status(404).json({ error: 'Филиал не найден' });
            }

            return res.status(200).json({ branch });
        } catch (error) {
            console.error('getBranchById error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создать новый филиал
    createBranch: async (req, res) => {
        const { 
            name, nameEn, nameBe,
            address, addressEn, addressBe,
            phone, email, 
            description, descriptionEn, descriptionBe,
            workHours, services, coordinates, images, 
            content, contentEn, contentBe 
        } = req.body;

        if (!name || !address || !phone || !email) {
            return res.status(400).json({ error: 'Название, адрес, телефон и email обязательны' });
        }

        try {
            // Нормализуем пути к изображениям при создании
            let normalizedImages = [];
            if (images !== undefined && Array.isArray(images)) {
                normalizedImages = images.map(img => {
                    if (typeof img === 'string' && img) {
                        return normalizeUploadPath(img) || img;
                    }
                    return img;
                }).filter(img => img !== null && img !== undefined);
            }

            const newBranch = await prisma.branch.create({
                data: {
                    name,
                    nameEn: nameEn !== undefined ? nameEn : null,
                    nameBe: nameBe !== undefined ? nameBe : null,
                    address,
                    addressEn: addressEn !== undefined ? addressEn : null,
                    addressBe: addressBe !== undefined ? addressBe : null,
                    phone,
                    email,
                    description: description !== undefined ? description : null,
                    descriptionEn: descriptionEn !== undefined ? descriptionEn : null,
                    descriptionBe: descriptionBe !== undefined ? descriptionBe : null,
                    workHours: workHours !== undefined ? workHours : null,
                    services: services !== undefined ? services : null,
                    coordinates: coordinates !== undefined ? coordinates : null,
                    images: normalizedImages,
                    // Для контента: если передана строка (JSON), парсим её; если null или undefined, сохраняем null
                    content: content !== undefined ? (typeof content === 'string' ? JSON.parse(content) : content) : null,
                    contentEn: contentEn !== undefined ? (typeof contentEn === 'string' ? JSON.parse(contentEn) : contentEn) : null,
                    contentBe: contentBe !== undefined ? (typeof contentBe === 'string' ? JSON.parse(contentBe) : contentBe) : null
                }
            });

            return res.status(201).json({
                message: 'Филиал успешно создан',
                branch: newBranch
            });
        } catch (error) {
            console.error('createBranch error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить филиал
    updateBranch: async (req, res) => {
        const { id } = req.params;
        const branchId = parseInt(id, 10);
        const { 
            name, nameEn, nameBe,
            address, addressEn, addressBe,
            phone, email, 
            description, descriptionEn, descriptionBe,
            workHours, services, coordinates, images, 
            content, contentEn, contentBe 
        } = req.body;

        if (isNaN(branchId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const existingBranch = await prisma.branch.findUnique({
                where: { id: branchId }
            });

            if (!existingBranch) {
                return res.status(404).json({ error: 'Филиал не найден' });
            }

            // Нормализуем пути к изображениям, если они переданы
            let normalizedImages = existingBranch.images || [];
            if (images !== undefined) {
                if (Array.isArray(images)) {
                    normalizedImages = images.map(img => {
                        if (typeof img === 'string' && img.trim()) {
                            try {
                                const normalized = normalizeUploadPath(img);
                                return normalized || img;
                            } catch (err) {
                                console.error('Error normalizing image path:', img, err);
                                return img; // Возвращаем исходный путь при ошибке
                            }
                        }
                        return img;
                    }).filter(img => {
                        // Фильтруем только null, undefined и пустые строки
                        return img !== null && img !== undefined && img !== '';
                    });
                    console.log('Normalized images:', normalizedImages);
                    console.log('Original images:', images);
                    console.log('Existing images:', existingBranch.images);
                } else if (images === null) {
                    // Если явно передано null, очищаем массив
                    normalizedImages = [];
                } else {
                    // Если не массив и не null, оставляем существующие
                    normalizedImages = existingBranch.images || [];
                }
            }

            const updatedBranch = await prisma.branch.update({
                where: { id: branchId },
                data: {
                    name: name !== undefined ? name : existingBranch.name,
                    nameEn: nameEn !== undefined ? nameEn : existingBranch.nameEn,
                    nameBe: nameBe !== undefined ? nameBe : existingBranch.nameBe,
                    address: address !== undefined ? address : existingBranch.address,
                    addressEn: addressEn !== undefined ? addressEn : existingBranch.addressEn,
                    addressBe: addressBe !== undefined ? addressBe : existingBranch.addressBe,
                    phone: phone !== undefined ? phone : existingBranch.phone,
                    email: email !== undefined ? email : existingBranch.email,
                    description: description !== undefined ? description : existingBranch.description,
                    descriptionEn: descriptionEn !== undefined ? descriptionEn : existingBranch.descriptionEn,
                    descriptionBe: descriptionBe !== undefined ? descriptionBe : existingBranch.descriptionBe,
                    workHours: workHours !== undefined ? workHours : existingBranch.workHours,
                    services: services !== undefined ? services : existingBranch.services,
                    coordinates: coordinates !== undefined ? coordinates : existingBranch.coordinates,
                    images: normalizedImages,
                    // Для контента: если передана строка (JSON), парсим её; если null, сохраняем null; если undefined, оставляем старое значение
                    content: content !== undefined ? (typeof content === 'string' ? (content.trim() ? JSON.parse(content) : null) : content) : existingBranch.content,
                    contentEn: contentEn !== undefined ? (typeof contentEn === 'string' ? (contentEn.trim() ? JSON.parse(contentEn) : null) : contentEn) : existingBranch.contentEn,
                    contentBe: contentBe !== undefined ? (typeof contentBe === 'string' ? (contentBe.trim() ? JSON.parse(contentBe) : null) : contentBe) : existingBranch.contentBe
                }
            });

            return res.status(200).json({
                message: 'Филиал успешно обновлен',
                branch: updatedBranch
            });
        } catch (error) {
            console.error('updateBranch error', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                branchId: branchId,
                body: req.body
            });
            // Возвращаем более детальное сообщение об ошибке
            const errorMessage = error.message || 'Internal server error';
            return res.status(500).json({ 
                error: 'Ошибка при обновлении филиала',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    },

    // Удалить филиал
    deleteBranch: async (req, res) => {
        const { id } = req.params;
        const branchId = parseInt(id, 10);

        if (isNaN(branchId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const existingBranch = await prisma.branch.findUnique({
                where: { id: branchId }
            });

            if (!existingBranch) {
                return res.status(404).json({ error: 'Филиал не найден' });
            }

            await prisma.branch.delete({
                where: { id: branchId }
            });

            return res.status(200).json({ message: 'Филиал успешно удален' });
        } catch (error) {
            console.error('deleteBranch error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = BranchController;


