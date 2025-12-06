const prisma = require("../prisma/prisma-client");
const bcrypt = require("bcrypt");
const jdenticon = require("jdenticon");
const fs = require("fs");
const path = require("path");

const AdminController = {
    register: async (req, res) => {
        const { firstName, lastName, email, password, phone, role } = req.body;
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ error: "Поля обязательны" });
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ error: "Такой пользователь существует" });
            }

            // Проверяем, что такая роль есть в таблице Role
            const existingRole = await prisma.role.findUnique({
                where: { name: role }, // предполагаем, что в таблице Role есть поле "name"
            });

            if (!existingRole) {
                return res.status(400).json({ error: "Указанная роль не существует" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            // Генерируем аватарку на основе email для уникальности
            // Используем комбинацию firstName + lastName + email для более уникального аватара
            const avatarSeed = `${firstName}${lastName}${email}`;
            const png = jdenticon.toPng(avatarSeed, 200);
            const avatarName = `avatar_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            const avatarPath = path.join(__dirname, "../uploads", avatarName);
            
            // Убеждаемся, что папка uploads существует
            const uploadsDir = path.join(__dirname, "../uploads");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            fs.writeFileSync(avatarPath, png);

            // создаём пользователя и связываем с ролью
            // Новые пользователи должны сменить пароль при первом входе
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone: phone || undefined,
                    password: hashedPassword,
                    avatar: `/uploads/${avatarName}`,
                    mustChangePassword: true, // Требуется смена пароля при первом входе
                    passwordChangedAt: new Date(), // Устанавливаем дату создания как дату смены пароля
                    role: {
                        connect: { id: existingRole.id }, // связываем по id
                    },
                },
                include: {
                    role: true, // подтянем связанную роль для ответа
                },
            });

            console.log("Создан пользователь:", user);
            res.status(200).json({ message: "Пользователь успешно добавлен", user });
        } catch (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Internal server error", details: err.message });
        }
    },
};

module.exports = AdminController;
