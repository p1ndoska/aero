const jwt = require("jsonwebtoken");

const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Нет токена авторизации' });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const userRole = decoded.role;

            // Нормализуем роль к верхнему регистру для сравнения
            const normalizedUserRole = userRole ? userRole.toString().toUpperCase() : '';
            const normalizedRequiredRoles = requiredRoles.map(role => role.toString().toUpperCase());

            console.log('checkRole - User role:', normalizedUserRole);
            console.log('checkRole - Required roles:', normalizedRequiredRoles);
            console.log('checkRole - Match:', normalizedRequiredRoles.includes(normalizedUserRole));

            if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
                return res.status(403).json({ 
                    error: 'Доступ запрещен',
                    userRole: normalizedUserRole,
                    requiredRoles: normalizedRequiredRoles
                });
            }

            req.user = decoded;
            next();
        } catch (err) {
            console.error('checkRole error:', err);
            return res.status(403).json({ error: 'Недействителен токен', details: err.message });
        }
    }
}

module.exports = checkRole;