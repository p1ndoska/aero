const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Мокаем Prisma Client перед импортом контроллера
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../prisma/prisma-client', () => mockPrisma);

// Мокаем passwordValidator
jest.mock('../utils/passwordValidator', () => ({
  checkPasswordExpiry: jest.fn(() => ({
    expired: false,
    daysRemaining: 30,
  })),
}));

const UserController = require('../controllers/UserController');

describe('Авторизация пользователя', () => {
  let app;
  let consoleLogSpy;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/login', UserController.login);
    jest.clearAllMocks();
    process.env.SECRET_KEY = 'test-secret-key';
    
    // Глобально заглушаем console.log для всех тестов
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Восстанавливаем console.log
    if (consoleLogSpy) consoleLogSpy.mockRestore();
  });

  describe('POST /api/login', () => {
    it('должен вернуть ошибку 400, если email отсутствует', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Все поля обязательны');
    });

    it('должен вернуть ошибку 400, если password отсутствует', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Все поля обязательны');
    });

    it('должен вернуть ошибку 400, если пользователь не найден', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Неверные данные');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        include: { role: true },
      });
    });

    it('должен вернуть ошибку 400, если пароль неверный', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        role: { name: 'USER' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Неверные данные');

      // Очищаем моки
      bcrypt.compare.mockRestore();
    });

    it('должен успешно авторизовать пользователя с валидными данными', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        lastLoginAt: null,
        role: { name: 'USER' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, lastLoginAt: new Date() });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Успешный вход');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.mustChangePassword).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastLoginAt: expect.any(Date) },
      });

      // Очищаем моки
      bcrypt.compare.mockRestore();
      jwt.sign.mockRestore();
    });

    it('должен вернуть mustChangePassword: true, если требуется смена пароля', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        mustChangePassword: true,
        passwordChangedAt: new Date(),
        role: { name: 'USER' },
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.mustChangePassword).toBe(true);
      expect(response.body.message).toContain('Требуется смена пароля');

      // Очищаем моки
      bcrypt.compare.mockRestore();
      jwt.sign.mockRestore();
    });
  });
});

