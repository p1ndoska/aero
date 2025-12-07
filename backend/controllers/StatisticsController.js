const prisma = require('../prisma/prisma-client');

const StatisticsController = {
    getStatistics: async (req, res) => {
        try {
            console.log('StatisticsController.getStatistics called');
            
            // Получаем базовую статистику параллельно
            const [
                totalUsers,
                totalNews,
                totalVacancies,
                totalBranches,
                totalManagement,
                totalServiceRequests,
                totalCategories,
                totalRoles
            ] = await Promise.all([
                prisma.user.count().catch(() => 0),
                prisma.news.count().catch(() => 0),
                prisma.vacancy.count().catch(() => 0),
                prisma.branch.count().catch(() => 0),
                prisma.management.count().catch(() => 0),
                prisma.serviceRequest.count().catch(() => 0),
                prisma.newsCategory.count().catch(() => 0),
                prisma.role.count().catch(() => 0)
            ]);

            // Получаем активные вакансии
            const activeVacancies = await prisma.vacancy.count({
                where: { active: true }
            }).catch(() => 0);

            // Получаем пользователей по ролям (альтернативный способ без groupBy)
            let usersByRole = {};
            try {
                const users = await prisma.user.findMany({
                    select: {
                        role: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
                
                users.forEach(user => {
                    const roleName = user.role?.name || 'Без роли';
                    usersByRole[roleName] = (usersByRole[roleName] || 0) + 1;
                });
            } catch (error) {
                console.error('Error getting users by role:', error);
                usersByRole = {};
            }

            // Получаем заявки по статусам (альтернативный способ)
            let requestsByStatus = {};
            try {
                const requests = await prisma.serviceRequest.findMany({
                    select: {
                        status: true
                    }
                });
                
                requests.forEach(request => {
                    const status = request.status || 'pending';
                    requestsByStatus[status] = (requestsByStatus[status] || 0) + 1;
                });
            } catch (error) {
                console.error('Error getting requests by status:', error);
                requestsByStatus = {};
            }

            // Получаем новости по категориям (альтернативный способ)
            let newsByCategoryData = [];
            try {
                const news = await prisma.news.findMany({
                    select: {
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
                
                const categoryCounts = {};
                news.forEach(item => {
                    const categoryName = item.category?.name || 'Без категории';
                    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                });
                
                newsByCategoryData = Object.entries(categoryCounts).map(([categoryName, count]) => ({
                    categoryName,
                    count
                }));
            } catch (error) {
                console.error('Error getting news by category:', error);
                newsByCategoryData = [];
            }

            // Получаем последних пользователей
            let recentUsers = [];
            try {
                recentUsers = await prisma.user.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        createdAt: true,
                        role: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error getting recent users:', error);
                recentUsers = [];
            }

            // Получаем последние новости
            let recentNews = [];
            try {
                recentNews = await prisma.news.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error getting recent news:', error);
                recentNews = [];
            }

            const statistics = {
                overview: {
                    totalUsers,
                    totalNews,
                    totalVacancies,
                    activeVacancies,
                    totalBranches,
                    totalManagement,
                    totalServiceRequests,
                    totalCategories,
                    totalRoles
                },
                usersByRole,
                requestsByStatus,
                newsByCategory: newsByCategoryData,
                recentUsers,
                recentNews
            };

            console.log('Statistics generated successfully');
            res.json(statistics);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
};

module.exports = StatisticsController;

