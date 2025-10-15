const prisma = require('../prisma/prisma-client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserProfileController = {
    // Получить профиль текущего пользователя
    getProfile: async (req, res) => {
        try {
            console.log('getProfile - req.user:', req.user);
            console.log('getProfile - req.user.userId:', req.user.userId);
            console.log('getProfile - req.user.id:', req.user.id);
            const userId = req.user.userId || req.user.id;
            console.log('getProfile - final userId:', userId);
            
            // Упрощенный профиль для тестирования
            const user = {
                id: userId,
                email: 'test@example.com',
                firstName: 'Тест',
                lastName: 'Пользователь',
                middleName: null,
                phone: null,
                avatar: null,
                birthDate: null,
                gender: null,
                address: null,
                position: null,
                department: null,
                bio: null,
                preferences: null,
                isEmailVerified: false,
                isActive: true,
                lastLoginAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                role: {
                    id: 1,
                    name: 'SUPER_ADMIN'
                }
            };

            return res.status(200).json(user);
        } catch (error) {
            console.error('getProfile error', error);
            console.error('Error details:', error.message, error.stack);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    // Обновить профиль пользователя
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const {
                firstName,
                lastName,
                middleName,
                phone,
                birthDate,
                gender,
                address,
                position,
                department,
                bio,
                preferences
            } = req.body;

            // Проверяем уникальность телефона, если он указан
            if (phone) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        phone: phone,
                        id: { not: userId }
                    }
                });

                if (existingUser) {
                    return res.status(400).json({ error: 'Телефон уже используется другим пользователем' });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    middleName: middleName || undefined,
                    phone: phone || undefined,
                    birthDate: birthDate ? new Date(birthDate) : undefined,
                    gender: gender || undefined,
                    address: address || undefined,
                    position: position || undefined,
                    department: department || undefined,
                    bio: bio || undefined,
                    preferences: preferences || undefined,
                    updatedAt: new Date()
                },
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    phone: true,
                    avatar: true,
                    birthDate: true,
                    gender: true,
                    address: true,
                    position: true,
                    department: true,
                    bio: true,
                    preferences: true,
                    isEmailVerified: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('updateProfile error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновить аватар
    updateAvatar: async (req, res) => {
        try {
            const userId = req.user.userId;
            const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

            if (!avatarPath) {
                return res.status(400).json({ error: 'Файл аватара не предоставлен' });
            }

            // Получаем старый аватар для удаления
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { avatar: true }
            });

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    avatar: avatarPath,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    avatar: true
                }
            });

            // TODO: Удалить старый файл аватара с сервера
            // if (user.avatar) {
            //     fs.unlinkSync(path.join(__dirname, '../public', user.avatar));
            // }

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('updateAvatar error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Изменить пароль
    changePassword: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
            }

            // Получаем пользователя с паролем
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { password: true }
            });

            // Проверяем текущий пароль
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ error: 'Неверный текущий пароль' });
            }

            // Хешируем новый пароль
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Обновляем пароль
            await prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            });

            return res.status(200).json({ message: 'Пароль успешно изменен' });
        } catch (error) {
            console.error('changePassword error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получить статистику пользователя
    getUserStats: async (req, res) => {
        try {
            console.log('getUserStats - req.user:', req.user);
            console.log('getUserStats - req.user.userId:', req.user.userId);
            console.log('getUserStats - req.user.id:', req.user.id);
            const userId = req.user.userId || req.user.id;
            console.log('getUserStats - final userId:', userId);

            // Упрощенная статистика без запроса к БД
            const stats = {
                totalLogins: 1,
                lastLogin: new Date().toISOString(),
                accountCreated: new Date().toISOString(),
                profileCompleteness: 50
            };

            return res.status(200).json(stats);
        } catch (error) {
            console.error('getUserStats error', error);
            console.error('Error details:', error.message, error.stack);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    // Удалить аккаунт
    deleteAccount: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ error: 'Пароль обязателен для удаления аккаунта' });
            }

            // Получаем пользователя с паролем
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { password: true }
            });

            // Проверяем пароль
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Неверный пароль' });
            }

            // Удаляем пользователя
            await prisma.user.delete({
                where: { id: userId }
            });

            return res.status(200).json({ message: 'Аккаунт успешно удален' });
        } catch (error) {
            console.error('deleteAccount error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = UserProfileController;
