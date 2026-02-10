const request = require('supertest');
const express = require('express');

// Мокаем Prisma Client перед импортом контроллера
const mockPrisma = {
  servicesCategory: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  servicesPageContent: {
    upsert: jest.fn(),
  },
};

jest.mock('../prisma/prisma-client', () => mockPrisma);

const ServicesCategoryController = require('../controllers/ServicesCategoryController');

describe('Добавление подкатегории услуг', () => {
  let app;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/services-categories', ServicesCategoryController.create);
    jest.clearAllMocks();
    
    // Глобально заглушаем console.error и console.warn для всех тестов
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Восстанавливаем console методы
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();
    if (consoleWarnSpy) consoleWarnSpy.mockRestore();
  });

  describe('POST /api/services-categories', () => {
    it('должен успешно создать новую подкатегорию услуг', async () => {
      const categoryData = {
        name: 'Тестовая категория',
        nameEn: 'Test Category',
        nameBe: 'Тэставая катэгорыя',
        description: 'Описание категории',
        descriptionEn: 'Category description',
        descriptionBe: 'Апісанне катэгорыі',
        pageType: 'test-category',
        isActive: true,
        sortOrder: 0,
      };

      const mockCreatedCategory = {
        id: 1,
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.servicesCategory.findUnique.mockResolvedValue(null);
      mockPrisma.servicesCategory.create.mockResolvedValue(mockCreatedCategory);
      mockPrisma.servicesPageContent.upsert.mockResolvedValue({});

      const response = await request(app)
        .post('/api/services-categories')
        .send(categoryData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: categoryData.name,
        nameEn: categoryData.nameEn,
        nameBe: categoryData.nameBe,
        pageType: categoryData.pageType,
      });

      expect(mockPrisma.servicesCategory.findUnique).toHaveBeenCalledWith({
        where: { pageType: categoryData.pageType },
      });

      expect(mockPrisma.servicesCategory.create).toHaveBeenCalledWith({
        data: {
          name: categoryData.name,
          nameEn: categoryData.nameEn,
          nameBe: categoryData.nameBe,
          description: categoryData.description,
          descriptionEn: categoryData.descriptionEn,
          descriptionBe: categoryData.descriptionBe,
          pageType: categoryData.pageType,
          isActive: true,
          sortOrder: 0,
        },
      });

      expect(mockPrisma.servicesPageContent.upsert).toHaveBeenCalledWith({
        where: { pageType: categoryData.pageType },
        update: {},
        create: {
          pageType: categoryData.pageType,
          title: categoryData.name,
          titleEn: categoryData.nameEn,
          titleBe: categoryData.nameBe,
          subtitle: '',
          content: [],
        },
      });
    });

    it('должен вернуть ошибку 400, если pageType уже существует', async () => {
      const categoryData = {
        name: 'Тестовая категория',
        pageType: 'existing-category',
      };

      mockPrisma.servicesCategory.findUnique.mockResolvedValue({
        id: 1,
        pageType: 'existing-category',
      });

      const response = await request(app)
        .post('/api/services-categories')
        .send(categoryData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Page type already exists');
      expect(mockPrisma.servicesCategory.create).not.toHaveBeenCalled();
    });

    it('должен использовать значения по умолчанию для isActive и sortOrder', async () => {
      const categoryData = {
        name: 'Тестовая категория',
        pageType: 'test-category-defaults',
      };

      const mockCreatedCategory = {
        id: 2,
        ...categoryData,
        isActive: true,
        sortOrder: 0,
      };

      mockPrisma.servicesCategory.findUnique.mockResolvedValue(null);
      mockPrisma.servicesCategory.create.mockResolvedValue(mockCreatedCategory);
      mockPrisma.servicesPageContent.upsert.mockResolvedValue({});

      const response = await request(app)
        .post('/api/services-categories')
        .send(categoryData);

      expect(response.status).toBe(200);
      expect(mockPrisma.servicesCategory.create).toHaveBeenCalledWith({
        data: {
          name: categoryData.name,
          nameEn: undefined,
          nameBe: undefined,
          description: undefined,
          descriptionEn: undefined,
          descriptionBe: undefined,
          pageType: categoryData.pageType,
          isActive: true,
          sortOrder: 0,
        },
      });
    });

    it('должен обработать ошибку при создании страницы контента без прерывания процесса', async () => {
      const categoryData = {
        name: 'Тестовая категория',
        pageType: 'test-category-error',
      };

      const mockCreatedCategory = {
        id: 3,
        ...categoryData,
      };

      mockPrisma.servicesCategory.findUnique.mockResolvedValue(null);
      mockPrisma.servicesCategory.create.mockResolvedValue(mockCreatedCategory);
      mockPrisma.servicesPageContent.upsert.mockRejectedValue(new Error('Upsert failed'));

      const response = await request(app)
        .post('/api/services-categories')
        .send(categoryData);

      // Категория должна быть создана, даже если создание страницы контента не удалось
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(3);
    });

    it('должен вернуть ошибку 500 при внутренней ошибке сервера', async () => {
      const categoryData = {
        name: 'Тестовая категория',
        pageType: 'test-category-error',
      };

      mockPrisma.servicesCategory.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/services-categories')
        .send(categoryData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});

