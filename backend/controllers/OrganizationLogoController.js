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
                isActive, 
                sortOrder 
            } = req.body;

            console.log('OrganizationLogoController: Creating logo with data:', {
                name, nameEn, nameBe, logoUrl, internalPath, isActive, sortOrder
            });

            const logo = await prisma.organizationLogo.create({
                data: {
                    name,
                    nameEn,
                    nameBe,
                    logoUrl,
                    internalPath,
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
            
            const updatePromises = logos.map(logo => 
                prisma.organizationLogo.update({
                    where: { id: logo.id },
                    data: { sortOrder: logo.sortOrder }
                })
            );
            
            await Promise.all(updatePromises);
            res.json({ message: 'Logos order updated successfully' });
        } catch (error) {
            console.error('Error updating logos order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = OrganizationLogoController;
