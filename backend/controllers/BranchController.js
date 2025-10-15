const prisma = require('../prisma/prisma-client');

const BranchController = {
    // Получить все филиалы
    getAllBranches: async (req, res) => {
        try {
            const branches = await prisma.branch.findMany({
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
                where: { id: branchId }
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
            const newBranch = await prisma.branch.create({
                data: {
                    name,
                    nameEn: nameEn || null,
                    nameBe: nameBe || null,
                    address,
                    addressEn: addressEn || null,
                    addressBe: addressBe || null,
                    phone,
                    email,
                    description: description || null,
                    descriptionEn: descriptionEn || null,
                    descriptionBe: descriptionBe || null,
                    workHours: workHours || null,
                    services: services || null,
                    coordinates: coordinates || null,
                    images: images || [],
                    content: content || null,
                    contentEn: contentEn || null,
                    contentBe: contentBe || null
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

            const updatedBranch = await prisma.branch.update({
                where: { id: branchId },
                data: {
                    name: name || existingBranch.name,
                    nameEn: nameEn !== undefined ? nameEn : existingBranch.nameEn,
                    nameBe: nameBe !== undefined ? nameBe : existingBranch.nameBe,
                    address: address || existingBranch.address,
                    addressEn: addressEn !== undefined ? addressEn : existingBranch.addressEn,
                    addressBe: addressBe !== undefined ? addressBe : existingBranch.addressBe,
                    phone: phone || existingBranch.phone,
                    email: email || existingBranch.email,
                    description: description !== undefined ? description : existingBranch.description,
                    descriptionEn: descriptionEn !== undefined ? descriptionEn : existingBranch.descriptionEn,
                    descriptionBe: descriptionBe !== undefined ? descriptionBe : existingBranch.descriptionBe,
                    workHours: workHours !== undefined ? workHours : existingBranch.workHours,
                    services: services !== undefined ? services : existingBranch.services,
                    coordinates: coordinates !== undefined ? coordinates : existingBranch.coordinates,
                    images: images !== undefined ? images : existingBranch.images,
                    content: content !== undefined ? content : existingBranch.content,
                    contentEn: contentEn !== undefined ? contentEn : existingBranch.contentEn,
                    contentBe: contentBe !== undefined ? contentBe : existingBranch.contentBe
                }
            });

            return res.status(200).json({
                message: 'Филиал успешно обновлен',
                branch: updatedBranch
            });
        } catch (error) {
            console.error('updateBranch error', error);
            return res.status(500).json({ error: 'Internal server error' });
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


