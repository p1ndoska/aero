const prisma = require('../prisma/prisma-client');
const emailService = require('../utils/emailService');

const ServiceRequestController = {
    // Создать новую заявку на услугу
    createServiceRequest: async (req, res) => {
        try {
            const {
                serviceType,
                serviceName,
                fullName,
                email,
                phone,
                organization,
                position,
                subject,
                description,
                priority = 'medium',
                preferredDate,
                budget,
                notes
            } = req.body;

            // Валидация обязательных полей
            if (!serviceType || !serviceName || !fullName || !email || !subject || !description) {
                return res.status(400).json({
                    error: 'Заполните все обязательные поля: тип услуги, название услуги, ФИО, email, тема и описание'
                });
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Некорректный формат email адреса'
                });
            }

            // Создание заявки
            const serviceRequest = await prisma.serviceRequest.create({
                data: {
                    serviceType,
                    serviceName,
                    fullName,
                    email,
                    phone: phone || null,
                    organization: organization || null,
                    position: position || null,
                    subject,
                    description,
                    priority,
                    preferredDate: preferredDate ? new Date(preferredDate) : null,
                    budget: budget || null,
                    notes: notes || null
                }
            });

            // Отправка email уведомлений
            try {
                console.log('=== Attempting to send service request emails ===');
                console.log('Service Request ID:', serviceRequest.id);
                console.log('User Email:', serviceRequest.email);
                console.log('User FullName:', serviceRequest.fullName);
                
                // Подтверждение заявителю
                const confirmationResult = await emailService.sendServiceRequestConfirmation(serviceRequest);
                if (confirmationResult.success) {
                    console.log('✅ Service request confirmation email sent successfully!');
                    console.log('Message ID:', confirmationResult.messageId);
                } else {
                    console.error('❌ Failed to send service request confirmation email');
                    console.error('Error:', confirmationResult.error);
                    if (confirmationResult.details) {
                        console.error('Details:', confirmationResult.details);
                    }
                }
                
                // Уведомление администратору
                const notificationResult = await emailService.sendServiceRequestNotification(serviceRequest);
                if (notificationResult.success) {
                    console.log('✅ Service request admin notification sent successfully!');
                    console.log('Message ID:', notificationResult.messageId);
                } else {
                    console.error('❌ Failed to send service request admin notification');
                    console.error('Error:', notificationResult.error);
                    if (notificationResult.details) {
                        console.error('Details:', notificationResult.details);
                    }
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                console.error('Error message:', emailError.message);
                // Не прерываем процесс, если email не отправился
            }

            res.status(201).json({
                message: 'Заявка успешно создана',
                serviceRequest: {
                    id: serviceRequest.id,
                    serviceType: serviceRequest.serviceType,
                    serviceName: serviceRequest.serviceName,
                    subject: serviceRequest.subject,
                    status: serviceRequest.status,
                    createdAt: serviceRequest.createdAt
                }
            });

        } catch (error) {
            console.error('createServiceRequest error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить все заявки (для админа)
    getAllServiceRequests: async (req, res) => {
        try {
            const { page = 1, limit = 10, status, serviceType, search } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Построение фильтров
            const where = {};
            
            if (status) {
                where.status = status;
            }
            
            if (serviceType) {
                where.serviceType = serviceType;
            }
            
            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { serviceName: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [serviceRequests, total] = await Promise.all([
                prisma.serviceRequest.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.serviceRequest.count({ where })
            ]);

            res.json({
                serviceRequests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('getAllServiceRequests error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить заявку по ID
    getServiceRequestById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const serviceRequest = await prisma.serviceRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!serviceRequest) {
                return res.status(404).json({ error: 'Заявка не найдена' });
            }

            res.json(serviceRequest);

        } catch (error) {
            console.error('getServiceRequestById error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить заявку (для админа)
    updateServiceRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                status,
                priority,
                assignedTo,
                response,
                notes
            } = req.body;

            const updateData = {};
            
            if (status) updateData.status = status;
            if (priority) updateData.priority = priority;
            if (assignedTo) updateData.assignedTo = assignedTo;
            if (response) {
                updateData.response = response;
                updateData.responseDate = new Date();
            }
            if (notes !== undefined) updateData.notes = notes;

            const serviceRequest = await prisma.serviceRequest.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.json({
                message: 'Заявка успешно обновлена',
                serviceRequest
            });

        } catch (error) {
            console.error('updateServiceRequest error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удалить заявку (для админа)
    deleteServiceRequest: async (req, res) => {
        try {
            const { id } = req.params;
            
            await prisma.serviceRequest.delete({
                where: { id: parseInt(id) }
            });

            res.json({ message: 'Заявка успешно удалена' });

        } catch (error) {
            console.error('deleteServiceRequest error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить статистику заявок (для админа)
    getServiceRequestStats: async (req, res) => {
        try {
            const [total, pending, inProgress, completed, cancelled] = await Promise.all([
                prisma.serviceRequest.count(),
                prisma.serviceRequest.count({ where: { status: 'pending' } }),
                prisma.serviceRequest.count({ where: { status: 'in_progress' } }),
                prisma.serviceRequest.count({ where: { status: 'completed' } }),
                prisma.serviceRequest.count({ where: { status: 'cancelled' } })
            ]);

            const serviceTypeStats = await prisma.serviceRequest.groupBy({
                by: ['serviceType'],
                _count: { serviceType: true }
            });

            res.json({
                total,
                byStatus: {
                    pending,
                    inProgress,
                    completed,
                    cancelled
                },
                byServiceType: serviceTypeStats.map(stat => ({
                    serviceType: stat.serviceType,
                    count: stat._count.serviceType
                }))
            });

        } catch (error) {
            console.error('getServiceRequestStats error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = ServiceRequestController;

