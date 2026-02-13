const prisma = require('../prisma/prisma-client');

const OrganizationLogoController = {
    getAllOrganizationLogos: async (req, res) => {
        try {
            const logos = await prisma.organizationLogo.findMany({
                orderBy: { sortOrder: 'asc' }
            });
            console.log('OrganizationLogoController: Fetched logos:', logos.length);
            res.json(logos);
        } catch (error) {
            console.error('Error fetching organization logos:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getOrganizationLogo: async (req, res) => {
        try {
            const { id } = req.params;
            const logo = await prisma.organizationLogo.findUnique({
                where: { id: parseInt(id) }
            });
            if (!logo) {
                return res.status(404).json({ error: 'Organization logo not found' });
            }
            res.json(logo);
        } catch (error) {
            console.error('Error fetching organization logo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    createOrganizationLogo: async (req, res) => {
        try {
            const { 
                name, 
                nameEn, 
                nameBe, 
                logoUrl, 
                internalPath,
                externalUrl,
                isActive, 
                sortOrder 
            } = req.body;

            console.log('OrganizationLogoController: Creating logo with data:', {
                name, nameEn, nameBe, logoUrl, internalPath, externalUrl, isActive, sortOrder
            });

            const logo = await prisma.organizationLogo.create({
                data: {
                    name,
                    nameEn,
                    nameBe,
                    logoUrl,
                    internalPath,
                    externalUrl,
                    isActive: isActive !== undefined ? isActive : true,
                    sortOrder: sortOrder || 0
                }
            });
            
            console.log('OrganizationLogoController: Created logo:', logo.id);
            res.json(logo);
        } catch (error) {
            console.error('Error creating organization logo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateOrganizationLogo: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                name, 
                nameEn, 
                nameBe, 
                logoUrl, 
                internalPath,
                externalUrl,
                isActive, 
                sortOrder 
            } = req.body;

            const logo = await prisma.organizationLogo.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    nameEn,
                    nameBe,
                    logoUrl,
                    internalPath,
                    externalUrl,
                    isActive,
                    sortOrder
                }
            });
            res.json(logo);
        } catch (error) {
            console.error('Error updating organization logo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteOrganizationLogo: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.organizationLogo.delete({
                where: { id: parseInt(id) }
            });
            res.json({ message: 'Organization logo deleted successfully' });
        } catch (error) {
            console.error('Error deleting organization logo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateLogosOrder: async (req, res) => {
        try {
            const { logos } = req.body; // Array of {id, sortOrder}
            
            // Валидация входных данных
            if (!logos || !Array.isArray(logos) || logos.length === 0) {
                return res.status(400).json({ error: 'Logos array is required and must not be empty' });
            }
            
            // Проверка и преобразование типов
            const validLogos = [];
            for (const logo of logos) {
                const id = parseInt(String(logo.id), 10);
                const sortOrder = parseInt(String(logo.sortOrder), 10);
                
                if (isNaN(id) || id <= 0) {
                    return res.status(400).json({ 
                        error: `Invalid logo ID: ${logo.id}`,
                        details: `Logo ID must be a positive integer, got: ${logo.id} (type: ${typeof logo.id})`
                    });
                }
                if (isNaN(sortOrder) || sortOrder < 0) {
                    return res.status(400).json({ 
                        error: `Invalid sort order: ${logo.sortOrder}`,
                        details: `Sort order must be a non-negative integer, got: ${logo.sortOrder} (type: ${typeof logo.sortOrder})`
                    });
                }
                
                validLogos.push({ id, sortOrder });
            }
            
            console.log('Updating logos order:', validLogos);
            
            // Проверка существования всех логотипов перед обновлением
            const existingLogos = await prisma.organizationLogo.findMany({
                where: {
                    id: { in: validLogos.map(l => l.id) }
                },
                select: { id: true }
            });
            
            const existingIds = new Set(existingLogos.map(l => l.id));
            const missingIds = validLogos.filter(l => !existingIds.has(l.id)).map(l => l.id);
            
            if (missingIds.length > 0) {
                return res.status(404).json({ 
                    error: 'Some logos not found',
                    details: `Logos with IDs ${missingIds.join(', ')} do not exist`
                });
            }
            
            // Обновление порядка логотипов
            const updatePromises = validLogos.map(logo => 
                prisma.organizationLogo.update({
                    where: { id: logo.id },
                    data: { sortOrder: logo.sortOrder }
                }).catch(error => {
                    console.error(`Error updating logo ${logo.id}:`, error);
                    throw new Error(`Failed to update logo ${logo.id}: ${error.message}`);
                })
            );
            
            await Promise.all(updatePromises);
            console.log('Logos order updated successfully');
            res.json({ message: 'Logos order updated successfully', updated: validLogos.length });
        } catch (error) {
            console.error('Error updating logos order:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                meta: error.meta,
                stack: error.stack,
                body: req.body
            });
            
            // Обработка специфичных ошибок Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({ 
                    error: 'Logo not found',
                    details: error.meta?.cause || error.message
                });
            }
            
            res.status(500).json({ 
                error: 'Internal server error',
                details: error.message || 'Unknown error occurred'
            });
        }
    }
};

module.exports = OrganizationLogoController;
