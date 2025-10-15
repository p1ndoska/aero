const prisma = require('../prisma/prisma-client');
const RecurringSchedule = require('../utils/recurringSchedule');

const ReceptionSlotController = {
    // Получить все слоты для руководителя
    getSlotsByManager: async (req, res) => {
        const { managementId } = req.params;
        const { startDate, endDate } = req.query;
        
        try {
            const whereClause = {
                managementId: parseInt(managementId),
                isAvailable: true
            };

            if (startDate && endDate) {
                whereClause.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const slots = await prisma.receptionSlot.findMany({
                where: whereClause,
                orderBy: [
                    { date: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            res.json(slots);
        } catch (error) {
            console.error('getSlotsByManager error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создать слоты для руководителя
    createSlots: async (req, res) => {
        const { managementId } = req.params;
        const { date, startTime, endTime, slotDuration = 10 } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ error: 'Дата, время начала и окончания обязательны' });
        }

        try {
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(`${date}T${endTime}`);
            
            // Проверяем, что время окончания больше времени начала
            if (endDateTime <= startDateTime) {
                return res.status(400).json({ error: 'Время окончания должно быть больше времени начала' });
            }

            // Генерируем слоты по 10 минут
            const slots = [];
            const currentTime = new Date(startDateTime);
            
            while (currentTime < endDateTime) {
                const slotEndTime = new Date(currentTime.getTime() + slotDuration * 60000);
                
                // Проверяем, что слот не выходит за границы
                if (slotEndTime <= endDateTime) {
                    slots.push({
                        managementId: parseInt(managementId),
                        date: new Date(date),
                        startTime: new Date(currentTime),
                        endTime: new Date(slotEndTime),
                        isAvailable: true,
                        isBooked: false
                    });
                }
                
                currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
            }

            // Создаем слоты в базе данных
            const createdSlots = await prisma.receptionSlot.createMany({
                data: slots,
                skipDuplicates: true
            });

            res.status(201).json({
                message: `Создано ${createdSlots.count} слотов`,
                slots: createdSlots
            });
        } catch (error) {
            console.error('createSlots error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Забронировать слот
    bookSlot: async (req, res) => {
        const { slotId } = req.params;
        const { email, notes } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email обязателен для записи' });
        }

        try {
            const slot = await prisma.receptionSlot.findUnique({
                where: { id: parseInt(slotId) }
            });

            if (!slot) {
                return res.status(404).json({ error: 'Слот не найден' });
            }

            if (!slot.isAvailable || slot.isBooked) {
                return res.status(400).json({ error: 'Слот недоступен для записи' });
            }

            const updatedSlot = await prisma.receptionSlot.update({
                where: { id: parseInt(slotId) },
                data: {
                    isBooked: true,
                    bookedBy: email,
                    notes: notes || null
                }
            });

            res.json({
                message: 'Слот успешно забронирован',
                slot: updatedSlot
            });
        } catch (error) {
            console.error('bookSlot error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Отменить бронирование
    cancelBooking: async (req, res) => {
        const { slotId } = req.params;

        try {
            const slot = await prisma.receptionSlot.findUnique({
                where: { id: parseInt(slotId) }
            });

            if (!slot) {
                return res.status(404).json({ error: 'Слот не найден' });
            }

            const updatedSlot = await prisma.receptionSlot.update({
                where: { id: parseInt(slotId) },
                data: {
                    isBooked: false,
                    bookedBy: null,
                    notes: null
                }
            });

            res.json({
                message: 'Бронирование отменено',
                slot: updatedSlot
            });
        } catch (error) {
            console.error('cancelBooking error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удалить слоты
    deleteSlots: async (req, res) => {
        const { managementId } = req.params;
        const { date, startTime, endTime } = req.body;

        try {
            const whereClause = {
                managementId: parseInt(managementId)
            };

            if (date) {
                whereClause.date = new Date(date);
            }

            if (startTime && endTime) {
                whereClause.startTime = {
                    gte: new Date(`${date}T${startTime}`),
                    lt: new Date(`${date}T${endTime}`)
                };
            }

            const deletedSlots = await prisma.receptionSlot.deleteMany({
                where: whereClause
            });

            res.json({
                message: `Удалено ${deletedSlots.count} слотов`,
                deletedCount: deletedSlots.count
            });
        } catch (error) {
            console.error('deleteSlots error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить забронированные слоты для администратора
    getBookedSlots: async (req, res) => {
        const { managementId } = req.params;
        const { startDate, endDate } = req.query;

        try {
            const whereClause = {
                managementId: parseInt(managementId),
                isBooked: true
            };

            if (startDate && endDate) {
                whereClause.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const bookedSlots = await prisma.receptionSlot.findMany({
                where: whereClause,
                orderBy: [
                    { date: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            res.json(bookedSlots);
        } catch (error) {
            console.error('getBookedSlots error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создать повторяющееся расписание на основе выбранной даты
    createRecurringSchedule: async (req, res) => {
        const { managementId } = req.params;
        const { selectedDate, startTime, endTime, slotDuration = 10, monthsAhead = 3 } = req.body;

        if (!selectedDate || !startTime || !endTime) {
            return res.status(400).json({ error: 'Выбранная дата, время начала и окончания обязательны' });
        }

        try {
            const date = new Date(selectedDate);
            
            // Создаем шаблон на основе выбранной даты
            const template = RecurringSchedule.createTemplateFromDate(date, {
                startTime,
                endTime,
                slotDuration,
                monthsAhead
            }, parseInt(managementId));

            // Сохраняем шаблон в базу данных
            const savedTemplate = await prisma.recurringScheduleTemplate.create({
                data: template
            });

            // Находим все даты, соответствующие шаблону
            const recurringDates = RecurringSchedule.findRecurringDates(
                template.weekday,
                template.weekNumber,
                template.monthsAhead,
                date
            );

            // Создаем слоты для всех найденных дат
            const slots = RecurringSchedule.createSlotsFromTemplate(template, recurringDates);

            // Сохраняем слоты в базу данных
            const createdSlots = await prisma.receptionSlot.createMany({
                data: slots,
                skipDuplicates: true
            });

            res.status(201).json({
                message: `Создано повторяющееся расписание: ${RecurringSchedule.getTemplateDescription(template)}`,
                template: savedTemplate,
                slots: {
                    count: createdSlots.count,
                    dates: recurringDates.map(d => d.toISOString().split('T')[0])
                }
            });
        } catch (error) {
            console.error('createRecurringSchedule error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить все шаблоны повторяющегося расписания
    getRecurringTemplates: async (req, res) => {
        const { managementId } = req.params;

        try {
            const templates = await prisma.recurringScheduleTemplate.findMany({
                where: {
                    managementId: parseInt(managementId),
                    isActive: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // Добавляем описание к каждому шаблону
            const templatesWithDescription = templates.map(template => ({
                ...template,
                description: RecurringSchedule.getTemplateDescription(template)
            }));

            res.json(templatesWithDescription);
        } catch (error) {
            console.error('getRecurringTemplates error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удалить шаблон повторяющегося расписания
    deleteRecurringTemplate: async (req, res) => {
        const { templateId } = req.params;

        try {
            // Удаляем все слоты, связанные с шаблоном
            await prisma.receptionSlot.deleteMany({
                where: { recurringTemplateId: templateId }
            });

            // Удаляем сам шаблон
            await prisma.recurringScheduleTemplate.delete({
                where: { id: templateId }
            });

            res.json({ message: 'Шаблон повторяющегося расписания удален' });
        } catch (error) {
            console.error('deleteRecurringTemplate error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить шаблон повторяющегося расписания
    updateRecurringTemplate: async (req, res) => {
        const { templateId } = req.params;
        const { startTime, endTime, slotDuration, monthsAhead, isActive } = req.body;

        try {
            const existingTemplate = await prisma.recurringScheduleTemplate.findUnique({
                where: { id: templateId }
            });

            if (!existingTemplate) {
                return res.status(404).json({ error: 'Шаблон не найден' });
            }

            // Обновляем шаблон
            const updatedTemplate = await prisma.recurringScheduleTemplate.update({
                where: { id: templateId },
                data: {
                    startTime: startTime || existingTemplate.startTime,
                    endTime: endTime || existingTemplate.endTime,
                    slotDuration: slotDuration || existingTemplate.slotDuration,
                    monthsAhead: monthsAhead || existingTemplate.monthsAhead,
                    isActive: isActive !== undefined ? isActive : existingTemplate.isActive
                }
            });

            // Если шаблон был активирован, создаем новые слоты
            if (updatedTemplate.isActive && !existingTemplate.isActive) {
                const recurringDates = RecurringSchedule.findRecurringDates(
                    updatedTemplate.weekday,
                    updatedTemplate.weekNumber,
                    updatedTemplate.monthsAhead
                );

                const slots = RecurringSchedule.createSlotsFromTemplate(updatedTemplate, recurringDates);
                
                await prisma.receptionSlot.createMany({
                    data: slots,
                    skipDuplicates: true
                });
            }

            res.json({
                message: 'Шаблон обновлен',
                template: {
                    ...updatedTemplate,
                    description: RecurringSchedule.getTemplateDescription(updatedTemplate)
                }
            });
        } catch (error) {
            console.error('updateRecurringTemplate error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = ReceptionSlotController;
