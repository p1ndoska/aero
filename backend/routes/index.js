const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {UserController, AdminController, NewsController, CategoryController, RoleController, ManagementController, IncidentReportController, BranchController, VacancyController, VacancyPageContentController, HistoryPageContentController, AboutCompanyPageContentController, SecurityPolicyPageContentController, SocialWorkPageContentController, OrganizationLogoController, SocialWorkCategoryController, AboutCompanyCategoryController, AeronauticalInfoCategoryController, AppealsCategoryController, ServicesCategoryController, ReceptionSlotController, UserProfileController, AeronauticalInfoPageContentController, AppealsPageContentController, ServicesPageContentController, ServiceRequestController} = require("../controllers");
const {authenticationToken} = require("../middleware/auth");
const checkRole = require('../middleware/checkRole');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Папка для загрузки файлов
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Фильтр для проверки типа файла (только изображения)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения!'), false);
    }
};

// Фильтр для документов (резюме)
const documentFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только PDF и DOC/DOCX файлы!'), false);
    }
};

// Фильтр для любых файлов
const anyFileFilter = (req, file, cb) => {
    // Разрешаем любые файлы
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Ограничение размера файла до 20MB
    }
});

const uploadDocument = multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Ограничение размера файла до 20MB для документов
    }
});

const uploadAnyFile = multer({
    storage: storage,
    fileFilter: anyFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Ограничение размера файла до 20MB для любых файлов
    }
});

// Загрузка изображений
router.post('/upload', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ 
                    error: 'Файл слишком большой. Максимальный размер: 20MB' 
                });
            }
            return res.status(400).json({ error: 'Ошибка загрузки файла: ' + err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не был загружен' });
        }
        
        console.log('File uploaded:', req.file);
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log('File URL:', fileUrl);
        res.json({ url: fileUrl });
    });
});

// Загрузка любых файлов
router.post('/upload-file', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), (req, res) => {
    uploadAnyFile.single('file')(req, res, (err) => {
        if (err) {
            console.error('File upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ 
                    error: 'Файл слишком большой. Максимальный размер: 20MB' 
                });
            }
            return res.status(400).json({ error: 'Ошибка загрузки файла: ' + err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не был загружен' });
        }
        
        console.log('Any file uploaded:', req.file);
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log('File URL:', fileUrl);
        res.json({ url: fileUrl });
    });
});

//admin
router.post('/register', authenticationToken, checkRole(['SUPER_ADMIN']), AdminController.register);

//user
router.post('/login', UserController.login);
router.get('/users/:id', authenticationToken, checkRole(['SUPER_ADMIN']), UserController.getUserById);
router.put('/users/:id', authenticationToken, checkRole(['SUPER_ADMIN']), UserController.updateUser);
router.delete('/users/:id', authenticationToken, checkRole(['SUPER_ADMIN']), UserController.deleteUser);
router.get('/users', authenticationToken, checkRole(['SUPER_ADMIN']), UserController.getAllUsers);

//news
router.post('/news/create', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), uploadAnyFile.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), NewsController.createNews);
router.get('/news', NewsController.getAllNews);
router.get('/news/detail/:id', NewsController.getNewsById);
router.get('/news/category/:categoryId', NewsController.getNewsByCategory);
router.put('/news/:id', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), uploadAnyFile.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), NewsController.updateNews);
router.delete('/news/:id', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), NewsController.deleteNews);

//category
router.post('/category/create', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), CategoryController.createCategory);
router.get('/category', CategoryController.getCategories); // Публичный доступ для отображения в меню
router.get('/category/:id', CategoryController.getCategoryById); // Публичный доступ
router.put('/category/:id', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), CategoryController.updateCategory);
router.delete('/category/:id', authenticationToken, checkRole(['SUPER_ADMIN','NEWS_ADMIN']), CategoryController.deleteCategory);

//role
router.post('/role/create', authenticationToken, checkRole(['SUPER_ADMIN']), RoleController.createRole);
router.get('/role', authenticationToken, checkRole(['SUPER_ADMIN']), RoleController.getRoles);
router.get('/role/:id', authenticationToken, checkRole(['SUPER_ADMIN']), RoleController.getRoleById);
router.put('/role/:id', authenticationToken, checkRole(['SUPER_ADMIN']), RoleController.updateRole);
router.delete('/role/:id', authenticationToken, checkRole(['SUPER_ADMIN']), RoleController.deleteRole);

//management
router.post('/management/create', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ManagementController.createManager);
router.get('/management/:id', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ManagementController.getManagerById);
router.get('/management/:id/available-slots', ManagementController.getAvailableSlots);
router.get('/management', ManagementController.getManagers);
router.put('/management/:id', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ManagementController.updateManager);
router.delete('/management/:id', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ManagementController.deleteManager);

//reception slots
router.get('/reception-slots/:managementId', ReceptionSlotController.getSlotsByManager);
router.post('/reception-slots/:managementId', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.createSlots);
router.post('/reception-slots/:slotId/book', ReceptionSlotController.bookSlot);
router.post('/reception-slots/:slotId/cancel', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.cancelBooking);
router.delete('/reception-slots/:managementId', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.deleteSlots);
// Важно: более специфичный маршрут должен быть ПЕРЕД параметризованным
router.get('/reception-slots/all/booked', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.getAllBookedSlots);
router.get('/reception-slots/:managementId/booked', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.getBookedSlots);

//recurring schedules
router.post('/reception-slots/:managementId/recurring', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.createRecurringSchedule);
router.get('/reception-slots/:managementId/recurring-templates', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.getRecurringTemplates);
router.delete('/reception-slots/recurring-templates/:templateId', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.deleteRecurringTemplate);
router.put('/reception-slots/recurring-templates/:templateId', authenticationToken, checkRole(['SUPER_ADMIN','MEDIA_ADMIN']), ReceptionSlotController.updateRecurringTemplate);

//branch
router.get('/branch', BranchController.getAllBranches); // Публичный доступ для отображения филиалов
router.post('/branch', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), BranchController.createBranch);
router.get('/branch/:id', BranchController.getBranchById); // Публичный доступ для просмотра деталей филиала
router.put('/branch/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), BranchController.updateBranch);
router.delete('/branch/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), BranchController.deleteBranch);

// //incident report
// router.post('/report/create', IncidentReportController.createReport);
// router.get('/report/:id', IncidentReportController.getReportById);
// router.get('/report/', IncidentReportController.getReports);
// router.delete('/report/:id', IncidentReportController.deleteReport);

//vacancies
router.post('/vacancies', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.createVacancy);
router.get('/vacancies', VacancyController.getAllVacancies);
router.get('/vacancies/:id', VacancyController.getVacancyById);
router.put('/vacancies/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.updateVacancy);
router.delete('/vacancies/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.deleteVacancy);

//vacancy applications
router.post('/vacancy-applications', uploadDocument.single('resume'), VacancyController.createApplication);
router.get('/vacancy-applications', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.getAllApplications);
router.get('/vacancy-applications/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.getApplicationById);
router.put('/vacancy-applications/:id/status', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.updateApplicationStatus);
router.delete('/vacancy-applications/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyController.deleteApplication);

//vacancy page content
router.get('/vacancy-page-content', VacancyPageContentController.getPageContent);
router.put('/vacancy-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), VacancyPageContentController.updatePageContent);

//user profile routes
router.get('/profile', authenticationToken, UserProfileController.getProfile);
router.put('/profile', authenticationToken, UserProfileController.updateProfile);
router.put('/profile/password', authenticationToken, UserProfileController.changePassword);
router.put('/profile/force-change-password', authenticationToken, UserProfileController.forceChangePassword);
router.get('/profile/stats', authenticationToken, UserProfileController.getUserStats);
router.delete('/profile', authenticationToken, UserProfileController.deleteAccount);

//history page content routes
router.get('/history-page-content', HistoryPageContentController.getHistoryPageContent);
router.put('/history-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), HistoryPageContentController.updateHistoryPageContent);

//about company page content routes
router.get('/about-company-page-content', AboutCompanyPageContentController.getAboutCompanyPageContent);
router.post('/about-company-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyPageContentController.createAboutCompanyPageContent);
router.get('/about-company-page-content/:pageType', AboutCompanyPageContentController.getAboutCompanyPageContentByPageType);
router.put('/about-company-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyPageContentController.updateAboutCompanyPageContent);
router.put('/about-company-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyPageContentController.updateAboutCompanyPageContentByPageType);

//security policy page content routes
router.get('/security-policy-page-content', SecurityPolicyPageContentController.getSecurityPolicyPageContent);
router.put('/security-policy-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), SecurityPolicyPageContentController.updateSecurityPolicyPageContent);

//social work page content routes
router.get('/social-work-page-content/:pageType', SocialWorkPageContentController.getSocialWorkPageContent);
router.put('/social-work-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), SocialWorkPageContentController.updateSocialWorkPageContent);
router.get('/social-work-pages', SocialWorkPageContentController.getAllSocialWorkPages);

//organization logos routes
router.get('/organization-logos', OrganizationLogoController.getAllOrganizationLogos);
router.get('/organization-logos/:id', OrganizationLogoController.getOrganizationLogo);
router.post('/organization-logos', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), OrganizationLogoController.createOrganizationLogo);
router.put('/organization-logos/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), OrganizationLogoController.updateOrganizationLogo);
router.delete('/organization-logos/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), OrganizationLogoController.deleteOrganizationLogo);
router.put('/organization-logos/order', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), OrganizationLogoController.updateLogosOrder);

//social work categories routes
router.get('/social-work-categories', SocialWorkCategoryController.getAllSocialWorkCategories);
router.get('/social-work-categories/:id', SocialWorkCategoryController.getSocialWorkCategory);
router.post('/social-work-categories', authenticationToken, checkRole(['SUPER_ADMIN', 'SOCIAL_ADMIN']), SocialWorkCategoryController.createSocialWorkCategory);
router.put('/social-work-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SOCIAL_ADMIN']), SocialWorkCategoryController.updateSocialWorkCategory);
router.delete('/social-work-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SOCIAL_ADMIN']), SocialWorkCategoryController.deleteSocialWorkCategory);
router.put('/social-work-categories/order', authenticationToken, checkRole(['SUPER_ADMIN', 'SOCIAL_ADMIN']), SocialWorkCategoryController.updateCategoriesOrder);

//about company categories routes
router.get('/about-company-categories', AboutCompanyCategoryController.getAllCategories);
router.get('/about-company-categories/:id', AboutCompanyCategoryController.getCategoryById);
router.post('/about-company-categories', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyCategoryController.createCategory);
router.put('/about-company-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyCategoryController.updateCategory);
router.delete('/about-company-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'ABOUT_ADMIN']), AboutCompanyCategoryController.deleteCategory);

//aeronautical info categories routes
router.get('/aeronautical-info-categories', AeronauticalInfoCategoryController.getAllAeronauticalInfoCategories);
router.get('/aeronautical-info-categories/:id', AeronauticalInfoCategoryController.getAeronauticalInfoCategory);
router.post('/aeronautical-info-categories', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoCategoryController.createAeronauticalInfoCategory);
router.put('/aeronautical-info-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoCategoryController.updateAeronauticalInfoCategory);
router.delete('/aeronautical-info-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoCategoryController.deleteAeronauticalInfoCategory);
router.put('/aeronautical-info-categories/order', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoCategoryController.updateCategoriesOrder);

// appeals categories routes
router.get('/appeals-categories', AppealsCategoryController.getAll);
router.get('/appeals-categories/:id', AppealsCategoryController.getById);
router.post('/appeals-categories', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsCategoryController.create);
router.put('/appeals-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsCategoryController.update);
router.delete('/appeals-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsCategoryController.remove);
router.put('/appeals-categories/order', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsCategoryController.updateOrder);

//services categories routes
router.get('/services-categories', ServicesCategoryController.getAll);
router.get('/services-categories/:id', ServicesCategoryController.getById);
router.post('/services-categories', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesCategoryController.create);
router.put('/services-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesCategoryController.update);
router.delete('/services-categories/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesCategoryController.remove);
router.put('/services-categories/order', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesCategoryController.updateOrder);

//aeronautical info page content routes
router.get('/aeronautical-info-page-content/:pageType', AeronauticalInfoPageContentController.getAeronauticalInfoPageContentByPageType);
router.post('/aeronautical-info-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoPageContentController.createAeronauticalInfoPageContent);
router.put('/aeronautical-info-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoPageContentController.updateAeronauticalInfoPageContentByPageType);
router.delete('/aeronautical-info-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'AIRNAV_ADMIN']), AeronauticalInfoPageContentController.deleteAeronauticalInfoPageContent);

//appeals page content routes
router.get('/appeals-page-content/:pageType', AppealsPageContentController.getAppealsPageContentByPageType);
router.post('/appeals-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsPageContentController.createAppealsPageContent);
router.put('/appeals-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsPageContentController.updateAppealsPageContentByPageType);
router.delete('/appeals-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'APPEALS_ADMIN']), AppealsPageContentController.deleteAppealsPageContent);

//services page content routes
router.get('/services-page-content/:pageType', ServicesPageContentController.getServicesPageContent);
router.post('/services-page-content', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesPageContentController.createServicesPageContent);
router.put('/services-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesPageContentController.updateServicesPageContent);
router.delete('/services-page-content/:pageType', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServicesPageContentController.deleteServicesPageContent);

//ELT document routes
const ELTDocumentController = require('../controllers/ELTDocumentController');

// Настройка multer для загрузки документов ELT (PDF, DOCX)
const eltDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `elt-contract-${uniqueSuffix}${ext}`);
  }
});

const eltDocumentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только PDF и DOC/DOCX файлы!'), false);
  }
};

const uploadELTDocument = multer({
  storage: eltDocumentStorage,
  fileFilter: eltDocumentFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // Ограничение размера файла до 20MB
  }
});

router.post('/elt-document/upload', authenticationToken, checkRole(['SUPER_ADMIN', 'ACTIVITY_ADMIN']), (req, res, next) => {
  uploadELTDocument.single('document')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Файл слишком большой. Максимальный размер: 20MB' });
        }
        return res.status(400).json({ error: 'Ошибка загрузки файла: ' + err.message });
      }
      return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
    }
    next();
  });
}, ELTDocumentController.uploadDocument);
router.get('/elt-document', ELTDocumentController.getDocument);
router.delete('/elt-document', authenticationToken, checkRole(['SUPER_ADMIN', 'ACTIVITY_ADMIN']), ELTDocumentController.deleteDocument);

// ELT instruction routes
router.post('/elt-instruction/upload', authenticationToken, checkRole(['SUPER_ADMIN', 'ACTIVITY_ADMIN']), (req, res, next) => {
  uploadELTDocument.single('instruction')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Файл слишком большой. Максимальный размер: 20MB' });
        }
        return res.status(400).json({ error: 'Ошибка загрузки файла: ' + err.message });
      }
      return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
    }
    next();
  });
}, ELTDocumentController.uploadInstruction);
router.get('/elt-instruction', ELTDocumentController.getInstruction);
router.delete('/elt-instruction', authenticationToken, checkRole(['SUPER_ADMIN', 'ACTIVITY_ADMIN']), ELTDocumentController.deleteInstruction);

//service requests routes
router.post('/service-requests', ServiceRequestController.createServiceRequest);
router.get('/service-requests', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServiceRequestController.getAllServiceRequests);
router.get('/service-requests/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServiceRequestController.getServiceRequestById);
router.put('/service-requests/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServiceRequestController.updateServiceRequest);
router.delete('/service-requests/:id', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServiceRequestController.deleteServiceRequest);
router.get('/service-requests-stats', authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN']), ServiceRequestController.getServiceRequestStats);

//questionnaire routes
router.use('/questionnaire', require('./questionnaire'));

//voluntary report routes
router.use('/voluntary-report', require('./voluntaryReport'));

//ELT registration routes
router.use('/elt-registration', require('./eltRegistration'));

//ELT deregistration routes
router.use('/elt-deregistration', require('./eltDeregistration'));

module.exports = router;