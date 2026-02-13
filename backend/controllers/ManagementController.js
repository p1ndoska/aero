const prisma = require('../prisma/prisma-client');
const ScheduleParser = require('../utils/scheduleParser');

const ManagementController = {
    // Получить всех руководителей
    getManagers: async (req, res) => {
        try {
            const managers = await prisma.management.findMany({
                select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    nameBe: true,
                    position: true,
                    positionEn: true,
                    positionBe: true,
                    receptionSchedule: true,
                    receptionScheduleEn: true,
                    receptionScheduleBe: true,
                    phone: true,
                    offices: true,
                    officesEn: true,
                    officesBe: true,
                    images: true,
                    order: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: [
                    { order: 'asc' },
                    { createdAt: 'desc' }
                ]
            });
            return res.status(200).json({ managers });
        } catch (error) {
            console.error('getManagers error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить руководителя по ID
    getManagerById: async (req, res) => {
        const { id } = req.params;
        const managerId = parseInt(id, 10);

        if (isNaN(managerId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const manager = await prisma.management.findUnique({
                where: { id: managerId }
            });

            if (!manager) {
                return res.status(404).json({ error: 'Руководитель не найден' });
            }

            return res.status(200).json({ manager });
        } catch (error) {
            console.error('getManagerById error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создать нового руководителя
    createManager: async (req, res) => {
        const { 
            name, nameEn, nameBe,
            position, positionEn, positionBe,
            phone, 
            offices, officesEn, officesBe,
            receptionSchedule, receptionScheduleEn, receptionScheduleBe, 
            images,
            order
        } = req.body;

        if (!name || !position || !phone || !receptionSchedule) {
            return res.status(400).json({ error: 'Название, должность, телефон и расписание приема обязательны' });
        }

        try {
            // Если order не указан, устанавливаем максимальный order + 1
            let managerOrder = order;
            if (managerOrder === undefined || managerOrder === null) {
                const maxOrderManager = await prisma.management.findFirst({
                    orderBy: { order: 'desc' },
                    select: { order: true }
                });
                managerOrder = maxOrderManager ? maxOrderManager.order + 1 : 0;
            }

            const newManager = await prisma.management.create({
                data: {
                    name,
                    nameEn: nameEn || null,
                    nameBe: nameBe || null,
                    position,
                    positionEn: positionEn || null,
                    positionBe: positionBe || null,
                    phone,
                    offices: offices || null,
                    officesEn: officesEn || null,
                    officesBe: officesBe || null,
                    receptionSchedule,
                    receptionScheduleEn: receptionScheduleEn || null,
                    receptionScheduleBe: receptionScheduleBe || null,
                    images: images || [],
                    order: managerOrder
                }
            });

            return res.status(201).json({
                message: 'Руководитель успешно создан',
                manager: newManager
            });
        } catch (error) {
            console.error('createManager error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить руководителя
    updateManager: async (req, res) => {
        const { id } = req.params;
        const managerId = parseInt(id, 10);
        const { 
            name, nameEn, nameBe,
            position, positionEn, positionBe,
            phone, 
            offices, officesEn, officesBe,
            receptionSchedule, receptionScheduleEn, receptionScheduleBe, 
            images 
        } = req.body;

        if (isNaN(managerId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const existingManager = await prisma.management.findUnique({
                where: { id: managerId }
            });

            if (!existingManager) {
                return res.status(404).json({ error: 'Руководитель не найден' });
            }

            const updatedManager = await prisma.management.update({
                where: { id: managerId },
                data: {
                    name: name !== undefined ? name : existingManager.name,
                    nameEn: nameEn !== undefined ? nameEn : existingManager.nameEn,
                    nameBe: nameBe !== undefined ? nameBe : existingManager.nameBe,
                    position: position !== undefined ? position : existingManager.position,
                    positionEn: positionEn !== undefined ? positionEn : existingManager.positionEn,
                    positionBe: positionBe !== undefined ? positionBe : existingManager.positionBe,
                    phone: phone !== undefined ? phone : existingManager.phone,
                    offices: offices !== undefined ? offices : existingManager.offices,
                    officesEn: officesEn !== undefined ? officesEn : existingManager.officesEn,
                    officesBe: officesBe !== undefined ? officesBe : existingManager.officesBe,
                    receptionSchedule: receptionSchedule !== undefined ? receptionSchedule : existingManager.receptionSchedule,
                    receptionScheduleEn: receptionScheduleEn !== undefined ? receptionScheduleEn : existingManager.receptionScheduleEn,
                    receptionScheduleBe: receptionScheduleBe !== undefined ? receptionScheduleBe : existingManager.receptionScheduleBe,
                    images: images !== undefined ? images : existingManager.images,
                    order: order !== undefined ? order : existingManager.order
                }
            });

            return res.status(200).json({
                message: 'Руководитель успешно обновлен',
                manager: updatedManager
            });
        } catch (error) {
            console.error('updateManager error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удалить руководителя
    deleteManager: async (req, res) => {
        const { id } = req.params;
        const managerId = parseInt(id, 10);

        if (isNaN(managerId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const existingManager = await prisma.management.findUnique({
                where: { id: managerId }
            });

            if (!existingManager) {
                return res.status(404).json({ error: 'Руководитель не найден' });
            }

            await prisma.management.delete({
                where: { id: managerId }
            });

            return res.status(200).json({ message: 'Руководитель успешно удален' });
        } catch (error) {
            console.error('deleteManager error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить доступные слоты для записи на прием
    getAvailableSlots: async (req, res) => {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const managerId = parseInt(id, 10);

        if (isNaN(managerId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const manager = await prisma.management.findUnique({
                where: { id: managerId }
            });

            if (!manager) {
                return res.status(404).json({ error: 'Руководитель не найден' });
            }

            if (!manager.receptionSchedule) {
                return res.status(400).json({ error: 'Расписание приема не настроено' });
            }

            // Устанавливаем диапазон дат для генерации слотов
            const start = startDate ? new Date(startDate) : new Date();
            const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            // Генерируем доступные слоты
            const receptionData = ScheduleParser.parseSchedule(manager.receptionSchedule);
            const availableSlots = ScheduleParser.generateTimeSlots(receptionData, start, end);

            return res.status(200).json({
                manager: {
                    id: manager.id,
                    name: manager.name,
                    position: manager.position,
                    receptionSchedule: manager.receptionSchedule
                },
                scheduleData: receptionData,
                availableSlots,
                dateRange: {
                    start: start,
                    end: end
                }
            });
        } catch (error) {
            console.error('getAvailableSlots error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить порядок сортировки руководителей
    updateManagersOrder: async (req, res) => {
        const { managers } = req.body; // массив объектов { id, order }

        if (!Array.isArray(managers)) {
            return res.status(400).json({ error: 'Неверный формат данных. Ожидается массив объектов { id, order }' });
        }

        try {
            // Обновляем порядок для всех переданных руководителей
            const updatePromises = managers.map(({ id, order }) => {
                if (typeof id !== 'number' || typeof order !== 'number') {
                    throw new Error(`Неверный формат данных для руководителя: id=${id}, order=${order}`);
                }
                return prisma.management.update({
                    where: { id },
                    data: { order }
                });
            });

            await Promise.all(updatePromises);

            return res.status(200).json({ 
                message: 'Порядок сортировки успешно обновлен',
                updated: managers.length
            });
        } catch (error) {
            console.error('updateManagersOrder error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = ManagementController;