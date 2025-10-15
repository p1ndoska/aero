const prisma = require('../prisma/prisma-client');

const VacancyController = {
    // Создание новой вакансии
    createVacancy: async (req, res) => {
        const {
            title,
            titleEn,
            titleBe,
            description,
            descriptionEn,
            descriptionBe,
            requirements,
            requirementsEn,
            requirementsBe,
            conditions,
            conditionsEn,
            conditionsBe,
            salary,
            salaryEn,
            salaryBe,
            location,
            locationEn,
            locationBe,
            employmentType,
            employmentTypeEn,
            employmentTypeBe,
            content,
            isActive
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Заполните обязательные поля: название и описание' });
        }

        try {
            const vacancyData = {
                title,
                titleEn: titleEn || null,
                titleBe: titleBe || null,
                description,
                descriptionEn: descriptionEn || null,
                descriptionBe: descriptionBe || null,
                requirements: requirements || null,
                requirementsEn: requirementsEn || null,
                requirementsBe: requirementsBe || null,
                conditions: conditions || null,
                conditionsEn: conditionsEn || null,
                conditionsBe: conditionsBe || null,
                salary: salary || null,
                salaryEn: salaryEn || null,
                salaryBe: salaryBe || null,
                location: location || null,
                locationEn: locationEn || null,
                locationBe: locationBe || null,
                employmentType: employmentType || null,
                employmentTypeEn: employmentTypeEn || null,
                employmentTypeBe: employmentTypeBe || null,
                content: content ? JSON.parse(content) : null,
                isActive: isActive !== undefined ? isActive : true,
                images: [],
                files: []
            };

            const vacancy = await prisma.vacancy.create({
                data: vacancyData,
                include: {
                    applications: true
                }
            });

            return res.status(201).json(vacancy);
        } catch (error) {
            console.error('create vacancy error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение всех вакансий
    getAllVacancies: async (req, res) => {
        try {
            const { active } = req.query;
            
            const where = {};
            if (active !== undefined) {
                where.isActive = active === 'true';
            }

            const vacancies = await prisma.vacancy.findMany({
                where,
                include: {
                    applications: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            status: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json(vacancies);
        } catch (error) {
            console.error('get all vacancies error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение вакансии по ID
    getVacancyById: async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID вакансии не указан' });
        }

        const vacancyId = parseInt(id, 10);
        if (isNaN(vacancyId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const vacancy = await prisma.vacancy.findUnique({
                where: { id: vacancyId },
                include: {
                    applications: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });

            if (!vacancy) {
                return res.status(404).json({ error: 'Вакансия не найдена' });
            }

            return res.status(200).json(vacancy);
        } catch (error) {
            console.error('get vacancy by id error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновление вакансии
    updateVacancy: async (req, res) => {
        const { id } = req.params;
        const {
            title,
            titleEn,
            titleBe,
            description,
            descriptionEn,
            descriptionBe,
            requirements,
            requirementsEn,
            requirementsBe,
            conditions,
            conditionsEn,
            conditionsBe,
            salary,
            salaryEn,
            salaryBe,
            location,
            locationEn,
            locationBe,
            employmentType,
            employmentTypeEn,
            employmentTypeBe,
            content,
            images,
            files,
            isActive
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID вакансии не указан' });
        }

        const vacancyId = parseInt(id, 10);
        if (isNaN(vacancyId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const updateData = {};
            
            if (title !== undefined) updateData.title = title;
            if (titleEn !== undefined) updateData.titleEn = titleEn;
            if (titleBe !== undefined) updateData.titleBe = titleBe;
            if (description !== undefined) updateData.description = description;
            if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
            if (descriptionBe !== undefined) updateData.descriptionBe = descriptionBe;
            if (requirements !== undefined) updateData.requirements = requirements;
            if (requirementsEn !== undefined) updateData.requirementsEn = requirementsEn;
            if (requirementsBe !== undefined) updateData.requirementsBe = requirementsBe;
            if (conditions !== undefined) updateData.conditions = conditions;
            if (conditionsEn !== undefined) updateData.conditionsEn = conditionsEn;
            if (conditionsBe !== undefined) updateData.conditionsBe = conditionsBe;
            if (salary !== undefined) updateData.salary = salary;
            if (salaryEn !== undefined) updateData.salaryEn = salaryEn;
            if (salaryBe !== undefined) updateData.salaryBe = salaryBe;
            if (location !== undefined) updateData.location = location;
            if (locationEn !== undefined) updateData.locationEn = locationEn;
            if (locationBe !== undefined) updateData.locationBe = locationBe;
            if (employmentType !== undefined) updateData.employmentType = employmentType;
            if (employmentTypeEn !== undefined) updateData.employmentTypeEn = employmentTypeEn;
            if (employmentTypeBe !== undefined) updateData.employmentTypeBe = employmentTypeBe;
            if (content !== undefined) updateData.content = typeof content === 'string' ? JSON.parse(content) : content;
            if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
            if (files !== undefined) updateData.files = Array.isArray(files) ? files : [];
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedVacancy = await prisma.vacancy.update({
                where: { id: vacancyId },
                data: updateData,
                include: {
                    applications: true
                }
            });

            return res.status(200).json(updatedVacancy);
        } catch (error) {
            console.error('update vacancy error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удаление вакансии
    deleteVacancy: async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID вакансии не указан' });
        }

        const vacancyId = parseInt(id, 10);
        if (isNaN(vacancyId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const vacancy = await prisma.vacancy.delete({
                where: { id: vacancyId }
            });

            return res.status(200).json({ message: `Вакансия "${vacancy.title}" успешно удалена` });
        } catch (error) {
            console.error('delete vacancy error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Создание отклика на вакансию
    createApplication: async (req, res) => {
        const { vacancyId, fullName, email, phone, coverLetter } = req.body;

        if (!vacancyId || !fullName || !email || !phone) {
            return res.status(400).json({ error: 'Заполните обязательные поля' });
        }

        try {
            // Проверяем существование вакансии
            const vacancy = await prisma.vacancy.findUnique({
                where: { id: Number(vacancyId) }
            });

            if (!vacancy) {
                return res.status(404).json({ error: 'Вакансия не найдена' });
            }

            if (!vacancy.isActive) {
                return res.status(400).json({ error: 'Вакансия неактивна' });
            }

            let resumeUrl = null;
            if (req.file && req.file.path) {
                resumeUrl = req.file.path;
            }

            const application = await prisma.vacancyApplication.create({
                data: {
                    vacancyId: Number(vacancyId),
                    fullName,
                    email,
                    phone,
                    coverLetter: coverLetter || null,
                    resumeUrl,
                    status: 'NEW'
                },
                include: {
                    vacancy: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            return res.status(201).json(application);
        } catch (error) {
            console.error('create application error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение всех откликов
    getAllApplications: async (req, res) => {
        try {
            const { vacancyId, status } = req.query;
            
            const where = {};
            if (vacancyId) where.vacancyId = Number(vacancyId);
            if (status) where.status = status;

            const applications = await prisma.vacancyApplication.findMany({
                where,
                include: {
                    vacancy: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json(applications);
        } catch (error) {
            console.error('get all applications error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение отклика по ID
    getApplicationById: async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID отклика не указан' });
        }

        const applicationId = parseInt(id, 10);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const application = await prisma.vacancyApplication.findUnique({
                where: { id: applicationId },
                include: {
                    vacancy: true
                }
            });

            if (!application) {
                return res.status(404).json({ error: 'Отклик не найден' });
            }

            return res.status(200).json(application);
        } catch (error) {
            console.error('get application by id error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновление статуса отклика
    updateApplicationStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID отклика не указан' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Статус не указан' });
        }

        const applicationId = parseInt(id, 10);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        const validStatuses = ['NEW', 'VIEWED', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус' });
        }

        try {
            const updatedApplication = await prisma.vacancyApplication.update({
                where: { id: applicationId },
                data: { status },
                include: {
                    vacancy: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error('update application status error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удаление отклика
    deleteApplication: async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID отклика не указан' });
        }

        const applicationId = parseInt(id, 10);
        if (isNaN(applicationId)) {
            return res.status(400).json({ error: 'Неверный формат ID' });
        }

        try {
            const application = await prisma.vacancyApplication.delete({
                where: { id: applicationId }
            });

            return res.status(200).json({ message: 'Отклик успешно удален' });
        } catch (error) {
            console.error('delete application error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = VacancyController;

