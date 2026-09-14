const prisma = require('../prisma/prisma-client');
const { UPLOADS_URL_PREFIX } = require('../config/paths');

const getImageUrl = (file) => (
    file ? `${UPLOADS_URL_PREFIX}/${file.filename}` : null
);

const parseBoolean = (value, fallback = true) => {
    if (value === undefined) return fallback;
    if (typeof value === 'boolean') return value;
    return value !== 'false';
};

const HomeServiceCardController = {
    getAll: async (req, res) => {
        try {
            const cards = await prisma.homeServiceCard.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            });
            res.json(cards);
        } catch (error) {
            console.error('Error fetching home service cards:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAllForAdmin: async (req, res) => {
        try {
            const cards = await prisma.homeServiceCard.findMany({
                orderBy: { sortOrder: 'asc' },
            });
            res.json(cards);
        } catch (error) {
            console.error('Error fetching home service cards for admin:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    create: async (req, res) => {
        try {
            const { title, titleEn, titleBe, href, imageUrl, sortOrder, isActive } = req.body;

            if (!title?.trim() || !href?.trim()) {
                return res.status(400).json({ error: 'Название и ссылка обязательны' });
            }

            const card = await prisma.homeServiceCard.create({
                data: {
                    title: title.trim(),
                    titleEn: titleEn?.trim() || null,
                    titleBe: titleBe?.trim() || null,
                    href: href.trim(),
                    imageUrl: getImageUrl(req.file) || imageUrl?.trim() || null,
                    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
                    isActive: parseBoolean(isActive),
                },
            });

            res.status(201).json(card);
        } catch (error) {
            console.error('Error creating home service card:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    update: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { title, titleEn, titleBe, href, imageUrl, sortOrder, isActive } = req.body;

            if (!title?.trim() || !href?.trim()) {
                return res.status(400).json({ error: 'Название и ссылка обязательны' });
            }

            const card = await prisma.homeServiceCard.update({
                where: { id },
                data: {
                    title: title.trim(),
                    titleEn: titleEn?.trim() || null,
                    titleBe: titleBe?.trim() || null,
                    href: href.trim(),
                    ...(req.file || imageUrl !== undefined
                        ? { imageUrl: getImageUrl(req.file) || imageUrl?.trim() || null }
                        : {}),
                    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
                    isActive: parseBoolean(isActive),
                },
            });

            res.json(card);
        } catch (error) {
            console.error('Error updating home service card:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    remove: async (req, res) => {
        try {
            await prisma.homeServiceCard.delete({
                where: { id: Number(req.params.id) },
            });
            res.json({ message: 'Home service card deleted successfully' });
        } catch (error) {
            console.error('Error deleting home service card:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = HomeServiceCardController;
