const prisma = require('../prisma/prisma-client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordValidator');

const UserProfileController = {
    // Получить профиль текущего пользователя
    getProfile: async (req, res) => {
        try {
            const userId = req.user.userId || req.user.id;
            
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
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
                    passwordChangedAt: true,
                    mustChangePassword: true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

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

            // Проверяем уникальность телефона, если он указан и не пустой
            if (phone && phone.trim() !== '') {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        phone: phone.trim(),
                        id: { not: userId }
                    }
                });

                if (existingUser) {
                    return res.status(400).json({ error: 'Телефон уже используется другим пользователем' });
                }
            }

            // Формируем объект данных для обновления
            const updateData = {
                updatedAt: new Date()
            };
            
            // Обновляем только те поля, которые были переданы
            if (firstName !== undefined) {
                updateData.firstName = firstName && firstName.trim() !== '' ? firstName.trim() : null;
            }
            if (lastName !== undefined) {
                updateData.lastName = lastName && lastName.trim() !== '' ? lastName.trim() : null;
            }
            if (middleName !== undefined) {
                updateData.middleName = middleName && middleName.trim() !== '' ? middleName.trim() : null;
            }
            if (phone !== undefined) {
                updateData.phone = phone && phone.trim() !== '' ? phone.trim() : null;
            }
            if (birthDate !== undefined) {
                if (birthDate && birthDate !== '') {
                    try {
                        updateData.birthDate = new Date(birthDate);
                    } catch (e) {
                        return res.status(400).json({ error: 'Неверный формат даты рождения' });
                    }
                } else {
                    updateData.birthDate = null;
                }
            }
            if (gender !== undefined) {
                updateData.gender = gender && gender.trim() !== '' ? gender.trim() : null;
            }
            if (address !== undefined) {
                updateData.address = address && address.trim() !== '' ? address.trim() : null;
            }
            if (position !== undefined) {
                updateData.position = position && position.trim() !== '' ? position.trim() : null;
            }
            if (department !== undefined) {
                updateData.department = department && department.trim() !== '' ? department.trim() : null;
            }
            if (bio !== undefined) {
                updateData.bio = bio && bio.trim() !== '' ? bio.trim() : null;
            }
            if (preferences !== undefined) {
                updateData.preferences = preferences || null;
            }
            
            console.log('updateProfile - updateData:', JSON.stringify(updateData, null, 2));

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
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
            console.error('updateProfile error details:', error.message);
            console.error('updateProfile error stack:', error.stack);
            return res.status(500).json({ 
                error: 'Internal server error',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    // Обновить аватар

    // Изменить пароль
    changePassword: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            console.log('changePassword - userId:', userId);
            console.log('changePassword - has currentPassword:', !!currentPassword);
            console.log('changePassword - has newPassword:', !!newPassword);
            console.log('changePassword - newPassword length:', newPassword?.length);

            if (!currentPassword || !newPassword) {
                console.log('changePassword - missing required fields');
                return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
            }

            // Получаем пользователя с полной информацией
            // Нельзя использовать include и select одновременно, используем только select
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { 
                    password: true,
                    email: true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    previousPasswords: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            // Проверяем текущий пароль
            console.log('changePassword - comparing passwords...');
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            console.log('changePassword - password valid:', isCurrentPasswordValid);
            if (!isCurrentPasswordValid) {
                console.log('changePassword - invalid current password');
                return res.status(400).json({ error: 'Неверный текущий пароль' });
            }

            // Валидация нового пароля
            // Создаем функцию для сравнения пароля с хешем
            const comparePassword = async (password, hash) => {
                try {
                    return await bcrypt.compare(password, hash);
                } catch (err) {
                    console.error('comparePassword error:', err);
                    return false;
                }
            };

            // Убеждаемся, что previousPasswords - это массив
            let previousPasswordsArray = [];
            if (user.previousPasswords) {
                if (Array.isArray(user.previousPasswords)) {
                    previousPasswordsArray = user.previousPasswords;
                } else if (typeof user.previousPasswords === 'string') {
                    // Если это строка (старый формат), преобразуем в массив
                    previousPasswordsArray = [user.previousPasswords];
                }
            }

            console.log('changePassword - previousPasswordsArray:', previousPasswordsArray);

            try {
                const validation = await validatePassword(
                    newPassword, 
                    user.email, 
                    user.role?.name || 'USER',
                    previousPasswordsArray,
                    comparePassword
                );

                console.log('changePassword - validation result:', validation);

                if (!validation.isValid) {
                    return res.status(400).json({ 
                        error: 'Пароль не соответствует требованиям',
                        errors: validation.errors
                    });
                }
            } catch (validationError) {
                console.error('changePassword - validation error:', validationError);
                return res.status(500).json({ 
                    error: 'Ошибка при валидации пароля',
                    details: validationError.message 
                });
            }

            // Хешируем новый пароль
            let hashedNewPassword;
            try {
                hashedNewPassword = await bcrypt.hash(newPassword, 10);
            } catch (hashError) {
                console.error('changePassword - hash error:', hashError);
                return res.status(500).json({ 
                    error: 'Ошибка при хешировании пароля',
                    details: hashError.message 
                });
            }

            // Обновляем пароль и связанные поля
            // previousPasswords может быть null, поэтому используем пустой массив по умолчанию
            const previousPasswords = Array.isArray(user.previousPasswords) ? [...user.previousPasswords] : [];
            previousPasswords.push(user.password);
            // Оставляем только последние 5 паролей
            const updatedPreviousPasswords = previousPasswords.slice(-5);

            console.log('changePassword - updating user with previousPasswords:', updatedPreviousPasswords.length);

            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        password: hashedNewPassword,
                        passwordChangedAt: new Date(),
                        mustChangePassword: false, // Сбрасываем флаг принудительной смены
                        previousPasswords: updatedPreviousPasswords,
                        updatedAt: new Date()
                    }
                });

                console.log('changePassword - password updated successfully');
                return res.status(200).json({ message: 'Пароль успешно изменен' });
            } catch (updateError) {
                console.error('changePassword - update error:', updateError);
                console.error('changePassword - update error details:', updateError.message, updateError.stack);
                return res.status(500).json({ 
                    error: 'Ошибка при обновлении пароля',
                    details: updateError.message 
                });
            }
        } catch (error) {
            console.error('changePassword - unexpected error:', error);
            console.error('changePassword - error details:', error.message, error.stack);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },

    // Принудительная смена пароля при первом входе (без проверки текущего пароля)
    forceChangePassword: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { newPassword } = req.body;

            console.log('forceChangePassword - userId:', userId);
            console.log('forceChangePassword - newPassword length:', newPassword?.length);

            if (!newPassword) {
                return res.status(400).json({ error: 'Новый пароль обязателен' });
            }

            // Получаем пользователя с полной информацией
            // Нельзя использовать include и select одновременно, используем только select
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { 
                    password: true,
                    email: true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    previousPasswords: true,
                    mustChangePassword: true
                }
            });

            console.log('forceChangePassword - user found:', !!user);
            console.log('forceChangePassword - user.mustChangePassword:', user?.mustChangePassword);
            console.log('forceChangePassword - user.previousPasswords type:', typeof user?.previousPasswords);
            console.log('forceChangePassword - user.previousPasswords:', user?.previousPasswords);

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            // Проверяем, что действительно требуется смена пароля
            if (!user.mustChangePassword) {
                return res.status(400).json({ error: 'Смена пароля не требуется. Используйте обычный эндпоинт смены пароля' });
            }

            // Валидация нового пароля
            const comparePassword = async (password, hash) => {
                try {
                    return await bcrypt.compare(password, hash);
                } catch (err) {
                    console.error('comparePassword error:', err);
                    return false;
                }
            };

            // Убеждаемся, что previousPasswords - это массив
            let previousPasswordsArray = [];
            if (user.previousPasswords) {
                if (Array.isArray(user.previousPasswords)) {
                    previousPasswordsArray = user.previousPasswords;
                } else if (typeof user.previousPasswords === 'string') {
                    // Если это строка (старый формат), преобразуем в массив
                    previousPasswordsArray = [user.previousPasswords];
                }
            }

            console.log('forceChangePassword - previousPasswordsArray:', previousPasswordsArray);

            try {
                const validation = await validatePassword(
                    newPassword, 
                    user.email, 
                    user.role?.name || 'USER',
                    previousPasswordsArray,
                    comparePassword
                );

                console.log('forceChangePassword - validation result:', validation);

                if (!validation.isValid) {
                    return res.status(400).json({ 
                        error: 'Пароль не соответствует требованиям',
                        errors: validation.errors
                    });
                }
            } catch (validationError) {
                console.error('forceChangePassword - validation error:', validationError);
                return res.status(500).json({ 
                    error: 'Ошибка при валидации пароля',
                    details: validationError.message 
                });
            }

            // Хешируем новый пароль
            let hashedNewPassword;
            try {
                hashedNewPassword = await bcrypt.hash(newPassword, 10);
            } catch (hashError) {
                console.error('forceChangePassword - hash error:', hashError);
                return res.status(500).json({ 
                    error: 'Ошибка при хешировании пароля',
                    details: hashError.message 
                });
            }

            // Обновляем пароль и связанные поля
            // previousPasswords может быть null, поэтому используем пустой массив по умолчанию
            const previousPasswords = Array.isArray(user.previousPasswords) ? [...user.previousPasswords] : [];
            previousPasswords.push(user.password);
            const updatedPreviousPasswords = previousPasswords.slice(-5);

            console.log('forceChangePassword - updating user with previousPasswords:', updatedPreviousPasswords.length);

            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        password: hashedNewPassword,
                        passwordChangedAt: new Date(),
                        mustChangePassword: false, // Сбрасываем флаг принудительной смены
                        previousPasswords: updatedPreviousPasswords,
                        updatedAt: new Date()
                    }
                });

                console.log('forceChangePassword - password updated successfully');
                return res.status(200).json({ message: 'Пароль успешно изменен' });
            } catch (updateError) {
                console.error('forceChangePassword - update error:', updateError);
                console.error('forceChangePassword - update error details:', updateError.message, updateError.stack);
                return res.status(500).json({ 
                    error: 'Ошибка при обновлении пароля',
                    details: updateError.message 
                });
            }
        } catch (error) {
            console.error('forceChangePassword - unexpected error:', error);
            console.error('forceChangePassword - error details:', error.message, error.stack);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
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

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

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
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
};

module.exports = UserProfileController;
