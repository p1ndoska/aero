const prisma = require('../prisma/prisma-client');
const RecurringSchedule = require('../utils/recurringSchedule');
const emailService = require('../utils/emailService');

const ReceptionSlotController = {
    // Получить все слоты для руководителя
    getSlotsByManager: async (req, res) => {
        const { managementId } = req.params;
        const { startDate, endDate } = req.query;
        
        try {
            // Возвращаем ВСЕ слоты (и доступные, и занятые), чтобы фронтенд мог их отобразить
            const whereClause = {
                managementId: parseInt(managementId)
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
        const { email, notes, fullName } = req.body;


        if (!email || !fullName) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!fullName) missingFields.push('fullName');
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                error: 'Email и ФИО обязательны для записи',
                details: `Отсутствуют поля: ${missingFields.join(', ')}`,
                received: { email: !!email, fullName: !!fullName }
            });
        }

        // Проверяем, что поля не пустые после trim
        if (!email.trim() || !fullName.trim()) {
            console.error('Empty fields after trim:', { 
                email: email.trim(), 
                fullName: fullName.trim() 
            });
            return res.status(400).json({ 
                error: 'Email и ФИО не могут быть пустыми',
                details: 'Поля должны содержать непустые значения'
            });
        }

        try {
            const slot = await prisma.receptionSlot.findUnique({
                where: { id: parseInt(slotId) },
                include: {
                    management: true
                }
            });

            if (!slot) {
                return res.status(404).json({ error: 'Слот не найден' });
            }

            // Проверяем доступность слота атомарно в одном запросе
            console.log('Slot status:', { 
                id: slot.id, 
                isAvailable: slot.isAvailable, 
                isBooked: slot.isBooked,
                bookedBy: slot.bookedBy 
            });
            
            if (!slot.isAvailable || slot.isBooked) {
                console.error('Slot is not available:', {
                    isAvailable: slot.isAvailable,
                    isBooked: slot.isBooked,
                    reason: !slot.isAvailable ? 'isAvailable is false' : 'isBooked is true'
                });
                return res.status(400).json({ 
                    error: 'Слот недоступен для записи',
                    details: slot.isBooked ? 'Слот уже забронирован' : 'Слот недоступен'
                });
            }

            // Используем updateMany с условием для предотвращения race condition
            const updateResult = await prisma.receptionSlot.updateMany({
                where: { 
                    id: parseInt(slotId),
                    isBooked: false,
                    isAvailable: true
                },
                data: {
                    isBooked: true,
                    bookedBy: email.trim(),
                    notes: notes ? notes.trim() : null
                }
            });

            // Если ни одна запись не была обновлена, значит слот уже забронирован
            if (updateResult.count === 0) {
                return res.status(400).json({ error: 'Слот уже занят' });
            }

            // Получаем обновленный слот
            const updatedSlot = await prisma.receptionSlot.findUnique({
                where: { id: parseInt(slotId) },
                include: {
                    management: true
                }
            });

            // Отправка email уведомлений
            try {
                const bookingData = {
                    fullName: fullName.trim(),
                    email: email.trim(),
                    notes: notes ? notes.trim() : undefined
                };

                const slotData = {
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                };

                const managerData = {
                    name: slot.management.name,
                    position: slot.management.position,
                    phone: slot.management.phone,
                    offices: slot.management.offices
                };



                // Отправка подтверждения пользователю
                const emailResult = await emailService.sendBookingConfirmation(
                    bookingData, 
                    slotData, 
                    managerData
                );

                if (emailResult.success) {
                    console.log(' Booking confirmation email sent successfully!');
                    console.log('Message ID:', emailResult.messageId);
                } else {
                    console.error(' Failed to send booking confirmation email');
                    console.error('Error:', emailResult.error);
                    if (emailResult.details) {
                        console.error('Details:', emailResult.details);
                    }
                }

                // Отправка уведомления администратору
                const adminNotificationResult = await emailService.sendAdminNotification(
                    bookingData, 
                    slotData, 
                    managerData
                );

                if (adminNotificationResult.success) {
                    console.log(' Admin notification email sent successfully:', adminNotificationResult.messageId);
                } else {
                    console.error(' Failed to send admin notification email:', adminNotificationResult.error);
                }
            } catch (emailError) {
                console.error(' Email sending failed:', emailError);
                // Не прерываем процесс бронирования, если email не отправился
                // Пользователь все равно получит успешный ответ о бронировании
            }

            res.json({
                message: 'Слот успешно забронирован. Подтверждение отправлено на email.',
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

    // Получить все забронированные слоты для админ панели
    getAllBookedSlots: async (req, res) => {
        const { startDate, endDate } = req.query;

        try {
            // Получаем ВСЕ забронированные слоты БЕЗ фильтрации по дате в where clause
            // Это обходит проблему Prisma с требованием managementId при использовании индекса
            let bookedSlots = await prisma.receptionSlot.findMany({
                where: {
                    isBooked: true
                },
                orderBy: [
                    { date: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            // Фильтруем по датам в JavaScript, если они указаны
            if (startDate && endDate) {
                try {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                        return res.status(400).json({ error: 'Invalid date format' });
                    }
                    
                    bookedSlots = bookedSlots.filter(slot => {
                        const slotDate = new Date(slot.date);
                        return slotDate >= start && slotDate <= end;
                    });
                } catch (e) {
                    console.error('Error parsing dates:', e);
                    return res.status(400).json({ error: 'Invalid date format', details: e.message });
                }
            }

            // Получаем уникальные managementId
            const managementIds = [...new Set(bookedSlots.map(slot => slot.managementId))];

            // Получаем данные management одним запросом
            const managementData = await prisma.management.findMany({
                where: {
                    id: { in: managementIds }
                },
                select: {
                    id: true,
                    name: true,
                    position: true,
                    phone: true
                }
            });

            // Создаем мапу для быстрого поиска
            const managementMap = new Map(managementData.map(m => [m.id, m]));

            // Объединяем данные
            const formattedSlots = bookedSlots.map(slot => ({
                ...slot,
                management: managementMap.get(slot.managementId) || null
            }));

            res.json(formattedSlots);
        } catch (error) {
            console.error('getAllBookedSlots error', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    // Создать повторяющееся расписание на основе выбранной даты
    createRecurringSchedule: async (req, res) => {
        const { managementId } = req.params;
        const { selectedDate, startTime, endTime, slotDuration = 10, monthsAhead = 3, isWeekly = false } = req.body;

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
            }, parseInt(managementId), isWeekly);

            // Сохраняем шаблон в базу данных
            const savedTemplate = await prisma.recurringScheduleTemplate.create({
                data: template
            });

            // Находим все даты, соответствующие шаблону
            const recurringDates = RecurringSchedule.findRecurringDates(
                template.weekday,
                template.weekNumber,
                template.monthsAhead,
                date,
                template.isWeekly
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
