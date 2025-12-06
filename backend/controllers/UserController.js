const prisma = require ('../prisma/prisma-client');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const jdenticon = require('jdenticon');
const fs = require('fs');
const path = require('path');
const { checkPasswordExpiry } = require('../utils/passwordValidator');

const UserController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { role: true }, // подтянем роль
            });

            if (!user) {
                return res.status(400).json({ error: "Неверные данные" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Неверные данные" });
            }

            // Проверяем необходимость смены пароля
            let mustChangePassword = user.mustChangePassword || false;
            
            // Проверяем срок жизни пароля
            const passwordExpiry = checkPasswordExpiry(user.passwordChangedAt, user.role?.name);
            const passwordExpired = passwordExpiry.expired;

            // Если пароль истек, устанавливаем флаг mustChangePassword в базе данных
            if (passwordExpired && !mustChangePassword) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { mustChangePassword: true }
                });
                mustChangePassword = true;
            }

            // Если пароль истек или требуется смена при первом входе
            if (mustChangePassword || passwordExpired) {
                const token = jwt.sign(
                    { userId: user.id, role: user.role?.name, mustChangePassword: true },
                    process.env.SECRET_KEY,
                    { expiresIn: "1h" } // Короткий срок для принудительной смены пароля
                );

                // Обновляем пользователя, чтобы вернуть актуальные данные
                const updatedUser = await prisma.user.findUnique({
                    where: { id: user.id },
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

                const { password: _, ...userData } = updatedUser || user;
                return res.status(200).json({
                    message: mustChangePassword 
                        ? "Требуется смена пароля при первом входе" 
                        : "Срок действия пароля истек. Требуется смена пароля",
                    token,
                    user: userData,
                    mustChangePassword: true,
                    passwordExpired: passwordExpired,
                    daysRemaining: passwordExpired ? 0 : passwordExpiry.daysRemaining
                });
            }

            // Обновляем время последнего входа
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            const token = jwt.sign(
                { userId: user.id, role: user.role?.name },
                process.env.SECRET_KEY,
                { expiresIn: "7d" } // токен живет 7 дней
            );

            console.log("Успешная авторизация:", user.email);
            const { password: _, ...userData } = user;

            return res.status(200).json({
                message: "Успешный вход",
                token,
                user: userData,
                mustChangePassword: false,
                passwordExpired: false,
                daysRemaining: passwordExpiry.daysRemaining
            });
        } catch (error) {
            console.error("login error", error);
            return res.status(502).json({ error: "Internal server error" });
        }
    },


    getUserById: async(req, res)=>{
        const { id } = req.params;
        //////
        if(!id){
            return res.status(400).json({error:'Пользователь не найден'})
        }

        const userId = parseInt(id, 10);

        if(isNaN(userId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }

        try{

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    firstName:true,
                    lastName:true,
                    email:true,
                    phone:true,
                    avatar:true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                    }
            })
            if(!user){
                return res.status(400).json({error:'Пользователь не найден'})
            }


            console.log(user)
            res.status(200).json({user:user});

        }catch(error){
            console.error('get User By Id error', error);
            return res.status(502).json({err:'Internal server error'});
        }

    },

    updateUser: async(req, res)=>{
        const { id } = req.params;
        const { firstName,lastName, email, password, phone, roleId, role, avatar} = req.body;
        const userId = parseInt(req.params.id);

        if(isNaN(userId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }

        if(!id){
            return res.status(400).json({error:"Пользователь не найден"})
        }
            let filePath;

        if(req.file && req.filePath){
            filePath = req.file.path;
        }
        try{
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            // Проверка уникальности email
            if (email && email !== existingUser.email) {
                const userWithSameEmail = await prisma.user.findFirst({
                    where: {
                        email: email,
                        NOT: { id: userId }
                    }
                });

                if (userWithSameEmail) {
                    return res.status(400).json({ error: "Email уже используется" });
                }
            }
            // Определяем новое значение roleId: либо напрямую из roleId, либо по имени роли из поля role
            let newRoleId = undefined;
            if (roleId) {
                const parsed = parseInt(roleId);
                if (!isNaN(parsed)) {
                    newRoleId = parsed;
                }
            } else if (role && typeof role === 'string') {
                const existingRole = await prisma.role.findUnique({ where: { name: role } });
                if (!existingRole) {
                    return res.status(400).json({ error: 'Указанная роль не существует' });
                }
                newRoleId = existingRole.id;
            }

            const user = await prisma.user.update({
                where: {id: userId},
                data: {
                    firstName: firstName|| undefined,
                    lastName: lastName||undefined,
                    email: email||undefined,
                    phone: phone||undefined,
                    roleId: newRoleId !== undefined ? newRoleId : undefined,
                    avatar: filePath? '/filePath': undefined,
                },
                include: { role: true }
            })

            return res.status(200).json({user:user});
        }catch(error){
            console.error('update user error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    deleteUser: async(req, res)=>{
        const { id } = req.params;

        const userId = parseInt(req.params.id);
        if(!id){
            return res.status(400).json({error:"Пользователь не существует"})
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            return res.status(400).json({error:"Пользователь не найден"})
        }
        try{
            await prisma.user.delete({
                where: { id: userId }  // Используем числовой ID
            });

            return res.status(200).json({
                message: "Пользователь успешно удален",
                deletedUserId: userId
            });
        }catch(error){
            console.error('delete User error', error);
            return res.status(502).json({err:'Internal server error'});
        }

    },
    getAllUsers: async(req, res) => {
        try {
            const users = await prisma.user.findMany({
                include: { role: true }
            });
            return res.status(200).json({users});
        }catch(error){
            console.error('get All Users error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    }

}

module.exports = UserController;
