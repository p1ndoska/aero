//@ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../types/language';
import { canUseFunctional } from '../utils/cookieConsent';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы
const translations = {
  ru: {
    // Общие
    'welcome': 'Добро пожаловать',
    'home': 'Главная',
    'about': 'О предприятии',
    'news': 'Новости',
    'activity': 'Услуги',
    'air_navigation': 'Аэронавигационная информация',
    'services': 'Услуги',
    'contacts': 'Контакты',
    'search': 'Поиск',
    'login': 'Войти',
    'logout': 'Выйти',
    'admin_panel': 'Панель администратора',
    'useful_links': 'Полезные ссылки',
    'cookie_policy': 'Политика использования cookie',
    'company_name_short': 'РУП «Белаэронавигация»',
    'all_rights_reserved': 'Все права защищены',
    
    // О предприятии
    'about_company': 'О предприятии',
    'management': 'Руководство',
    'structure': 'Структура предприятия',
    'branches': 'Наши филиалы',
    'security_policy': 'Политика безопасности',
    'history': 'История',
    'vacancies': 'Открытые вакансии',
    
    // Новости
    'all_news': 'Все новости',
    'company_news': 'Новости предприятия',
    'flight_safety': 'Безопасность полетов',
    'information_security': 'Информационная безопасность',
    'emergency': 'МЧС информирует',
    'police': 'МВД информирует',
    'energy_saving': 'Энергосбережение',
    
    // Деятельность
    'international': 'Международное сотрудничество',
    'standards': 'Стандарты в области аэронавигации',
    'hr_policy': 'Кадровая политика',
    'information_systems': 'Информационные системы',
    'training_center': 'Центр профессиональной подготовки',
    'airport': 'Аэропортовая деятельность',
    'support': 'Обеспечение деятельности предприятия',
    'quality_policy': 'Политика в области качества',
    'anti_corruption': 'Противодействие коррупции',
    'regulations': 'Нормативные документы',
    
    // Аэронавигация
    'eaip': 'Сборник аэронавигационной информации (EAIP)',
    'eaip_vfr': 'Сборник аэронавигационной информации для визуальных полетов (EAIP VFR)',
    'etod': 'Электронные данные о местности и препятствиях (ETOD)',
    'aip_supplements': 'Дополнения к сборнику аэронавигационной информации (AIP SUP)',
    'notam': 'Уведомления авиационным службам (NOTAM)',
    'aircraft_operations': 'Эксплуатация воздушных судов',
    'air_traffic_services': 'Службы воздушного движения',
    'aeronautical_information': 'Аэронавигационная информация',
    'airspace': 'Воздушное пространство',
    'airports': 'Аэродромы',
    'radio_navigation': 'Радионавигация',
    'weather': 'Метеорология',
    'search_rescue': 'Поиск и спасание',
    'aircraft_accidents': 'Авиационные происшествия',
    
    // Услуги
    'air_navigation_services': 'Аэронавигационное обслуживание',
    'meteorological_services': 'Метеорологическое обслуживание',
    'aeronautical_information_services': 'Аэронавигационное информационное обслуживание',
    'search_rescue_services': 'Службы поиска и спасания',
    'training_services': 'Услуги по подготовке персонала',
    'consulting_services': 'Консультационные услуги',
    'technical_support': 'Техническая поддержка',
    
    // Контакты
    'address': 'Адрес',
    'phone': 'Телефон',
    'email': 'Email',
    'working_hours': 'Время работы',
    'minsk_address': 'г. Минск, ул.  Короткевича, 19',
    'working_time': 'Пн-Пт 8:00-17:00',
    
    // Вакансии
    'vacancy_title': 'Открытые вакансии',
    'vacancy_subtitle': 'Присоединяйтесь к нашей команде профессионалов',
    'apply': 'Откликнуться',
    'details': 'Подробнее',
    'requirements': 'Требования',
    'conditions': 'Условия работы',
    'salary': 'Зарплата',
    'location': 'Местоположение',
    'employment_type': 'Тип занятости',
    
    // Cookie
    'cookie_title': 'Мы используем cookie-файлы',
    'cookie_message': 'Мы используем cookie-файлы для улучшения работы сайта, анализа трафика и персонализации контента.',
    'cookie_policy_link': 'Подробнее',
    'accept_all': 'Принять все',
    'reject': 'Отклонить',
    'settings': 'Настроить',
    'cookies': 'cookie',
    'necessary_cookies': 'Необходимые cookie',
    'necessary_cookies_description': 'Необходимы для работы сайта и не могут быть отключены.',
    'functional_cookies': 'Функциональные cookie',
    'functional_cookies_description': 'Используются для улучшения функциональности сайта.',
    'analytics_cookies': 'Аналитические cookie',
    'analytics_cookies_description': 'Помогают понять, как посетители взаимодействуют с сайтом.',
    'marketing_cookies': 'Маркетинговые cookie',
    'marketing_cookies_description': 'Используются для показа релевантной рекламы.',
    'save_preferences': 'Сохранить настройки',
    
    // Админ панель
    'user_management': 'Управление пользователями',
    'role_management': 'Управление ролями',
    'news_management': 'Управление новостями',
    'category_management': 'Управление категориями',
    'branch_management': 'Управление филиалами',
    'vacancy_management': 'Управление вакансиями',
    'management_management': 'Управление руководителями',
    
    // Дополнительно
    'loading': 'Загрузка...',
    'error': 'Ошибка',
    'no_data': 'Нет данных',
    'read_more': 'Читать далее',
    'back': 'Назад',
    'save': 'Сохранить',
    'cancel': 'Отмена',
    'delete': 'Удалить',
    'edit': 'Редактировать',
    'add': 'Добавить',
    'close': 'Закрыть',
    'showing': 'Показано',
    'of': 'из',
    'to_top': 'К началу списка',
    
    // Меню и навигация
    'appeals': 'Обращения',
    'social_ideological_work': 'Социальная и идеологическая работа',
    'electronic_appeals': 'Электронные обращения',
    'voluntary_report': 'Добровольное сообщение о небезопасном событии',
    'appeal_methods': 'Способы подачи обращений и порядок рассмотрения',
    'reception_schedules': 'Графики приема',
    'consumer_questionnaire': 'Анкета потребителя аэронавигационных услуг',
    'united_trade_union': 'Объединенная профсоюзная организация',
    'white_rus': 'Белая Русь',
    'brsm': 'БРСМ',
    'belarusian_women_union': 'Белорусский союз женщин',
    'healthy_lifestyle': 'За здоровый образ жизни',
    'improvement_year': 'Год благоустройства',
    'memory_pain': 'Память и боль белорусской земли',
    'version_visually_impaired': 'Версия для слабовидящих',
    
    // Заголовки блоков
    'left_upper_block': 'Левый верхний блок',
    'left_middle_block': 'Левый средний блок',
    'left_lower_block': 'Левый нижний блок',
    
    // Название предприятия
    'company_full_name': 'Республиканское унитарное предприятие по аэронавигационному обслуживанию воздушного движения «Белаэронавигация»',
    
    // Личный кабинет
    'profile': 'Личный кабинет',
    'personal_info': 'Личная информация',
    'account_settings': 'Настройки аккаунта',
    'security': 'Безопасность',
    'profile_completeness': 'Заполненность профиля',
    'registration_date': 'Регистрация',
    'last_login': 'Последний вход',
    'email_verified': 'Подтвержден',
    'email_not_verified': 'Не подтвержден',
    'account_active': 'Активен',
    'account_blocked': 'Заблокирован',
    'change_password': 'Изменить пароль',
    'current_password': 'Текущий пароль',
    'new_password': 'Новый пароль',
    'confirm_password': 'Подтвердите пароль',
    'delete_account': 'Удалить аккаунт',
    'delete_account_warning': 'Внимание! Это действие необратимо. Все ваши данные будут удалены навсегда.',
    'confirm_password_delete': 'Подтвердите паролем',
    'male': 'Мужской',
    'female': 'Женский',
    'other': 'Другой',
    'choose_gender': 'Выберите пол',
    'about_me': 'О себе',
    
    // Поиск
    'search_results': 'Результаты поиска',
    'search_query': 'По запросу',
    'search_found': 'найдено',
    'search_results_count': 'результатов',
    'search_no_results': 'Ничего не найдено',
    'search_no_results_desc': 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.',
    'search_min_chars': 'Введите поисковый запрос (минимум 2 символа)',
    'search_loading': 'Поиск...',
    'search_error': 'Ошибка поиска',
    'search_error_desc': 'Произошла ошибка при выполнении поиска. Попробуйте позже.',
  },
  
  en: {
    // General
    'welcome': 'Welcome',
    'home': 'Home',
    'about': 'About',
    'news': 'News',
    'activity': 'Services',
    'air_navigation': 'Air Navigation Information',
    'services': 'Services',
    'contacts': 'Contacts',
    'search': 'Search',
    'login': 'Login',
    'logout': 'Logout',
    'admin_panel': 'Admin Panel',
    'useful_links': 'Useful Links',
    'cookie_policy': 'Cookie Policy',
    'company_name_short': 'RUE "Belaeronavigatsia"',
    'all_rights_reserved': 'All rights reserved',
    
    // About
    'about_company': 'About Company',
    'management': 'Management',
    'structure': 'Company Structure',
    'branches': 'Our Branches',
    'security_policy': 'Security Policy',
    'history': 'History',
    'vacancies': 'Open Vacancies',
    
    // News
    'all_news': 'All News',
    'company_news': 'Company News',
    'flight_safety': 'Flight Safety',
    'information_security': 'Information Security',
    'emergency': 'Emergency Services',
    'police': 'Police Information',
    'energy_saving': 'Energy Saving',
    
    // Activity
    'international': 'International Cooperation',
    'standards': 'Air Navigation Standards',
    'hr_policy': 'HR Policy',
    'information_systems': 'Information Systems',
    'training_center': 'Professional Training Center',
    'airport': 'Airport Activities',
    'support': 'Company Support',
    'quality_policy': 'Quality Policy',
    'anti_corruption': 'Anti-Corruption',
    'regulations': 'Regulatory Documents',
    
    // Air Navigation
    'eaip': 'Electronic Aeronautical Information Publication (EAIP)',
    'eaip_vfr': 'Electronic Aeronautical Information Publication for Visual Flight Rules (EAIP VFR)',
    'etod': 'Electronic Terrain and Obstacle Data (ETOD)',
    'aip_supplements': 'Aeronautical Information Publication Supplements (AIP SUP)',
    'notam': 'Notices to Airmen (NOTAM)',
    'aircraft_operations': 'Aircraft Operations',
    'air_traffic_services': 'Air Traffic Services',
    'aeronautical_information': 'Aeronautical Information',
    'airspace': 'Airspace',
    'airports': 'Airports',
    'radio_navigation': 'Radio Navigation',
    'weather': 'Meteorology',
    'search_rescue': 'Search and Rescue',
    'aircraft_accidents': 'Aircraft Accidents',
    
    // Services
    'air_navigation_services': 'Air Navigation Services',
    'meteorological_services': 'Meteorological Services',
    'aeronautical_information_services': 'Aeronautical Information Services',
    'search_rescue_services': 'Search and Rescue Services',
    'training_services': 'Training Services',
    'consulting_services': 'Consulting Services',
    'technical_support': 'Technical Support',
    
    // Contacts
    'address': 'Address',
    'phone': 'Phone',
    'email': 'Email',
    'working_hours': 'Working Hours',
    'minsk_address': 'Minsk, Aerohavigation Street, 1',
    'working_time': 'Mon-Fri 8:00-17:00',
    
    // Vacancies
    'vacancy_title': 'Open Vacancies',
    'vacancy_subtitle': 'Join our team of professionals',
    'apply': 'Apply',
    'details': 'Details',
    'requirements': 'Requirements',
    'conditions': 'Working Conditions',
    'salary': 'Salary',
    'location': 'Location',
    'employment_type': 'Employment Type',
    
    // Cookie
    'cookie_title': 'We use cookies',
    'cookie_message': 'We use cookies to improve website performance, analyze traffic and personalize content.',
    'cookie_policy_link': 'Learn more',
    'accept_all': 'Accept All',
    'reject': 'Reject',
    'settings': 'Settings',
    'cookies': 'cookies',
    'necessary_cookies': 'Necessary cookies',
    'necessary_cookies_description': 'Required for the site to function and cannot be disabled.',
    'functional_cookies': 'Functional cookies',
    'functional_cookies_description': 'Used to improve website functionality.',
    'analytics_cookies': 'Analytics cookies',
    'analytics_cookies_description': 'Help understand how visitors interact with the site.',
    'marketing_cookies': 'Marketing cookies',
    'marketing_cookies_description': 'Used to display relevant advertising.',
    'save_preferences': 'Save Preferences',
    
    // Admin Panel
    'user_management': 'User Management',
    'role_management': 'Role Management',
    'news_management': 'News Management',
    'category_management': 'Category Management',
    'branch_management': 'Branch Management',
    'vacancy_management': 'Vacancy Management',
    'management_management': 'Management Management',
    
    // Additional
    'loading': 'Loading...',
    'error': 'Error',
    'no_data': 'No data',
    'read_more': 'Read more',
    'back': 'Back',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'close': 'Close',
    'showing': 'Showing',
    'of': 'of',
    'to_top': 'To the top',
    
    // Menu and navigation
    'appeals': 'Appeals',
    'social_ideological_work': 'Social and Ideological Work',
    'electronic_appeals': 'Electronic Appeals',
    'voluntary_report': 'Voluntary Report on Unsafe Event',
    'appeal_methods': 'Methods of Submitting Appeals and Procedure for Consideration',
    'reception_schedules': 'Reception Schedules',
    'consumer_questionnaire': 'Questionnaire for Consumer of Air Navigation Services',
    'united_trade_union': 'United Trade Union Organization',
    'white_rus': 'White Rus',
    'brsm': 'BRSM',
    'belarusian_women_union': 'Belarusian Women Union',
    'healthy_lifestyle': 'For Healthy Lifestyle',
    'improvement_year': 'Year of Improvement',
    'memory_pain': 'Memory and Pain of the Belarusian Land',
    'version_visually_impaired': 'Version for Visually Impaired',
    
    // Block headers
    'left_upper_block': 'Left Upper Block',
    'left_middle_block': 'Left Middle Block',
    'left_lower_block': 'Left Lower Block',
    
    // Company name
    'company_full_name': 'Republican Unitary Enterprise for Aeronautical Air Traffic Services «Belaeronavigatsia»',
    
    // User Profile
    'profile': 'User Profile',
    'personal_info': 'Personal Information',
    'account_settings': 'Account Settings',
    'security': 'Security',
    'profile_completeness': 'Profile Completeness',
    'registration_date': 'Registration',
    'last_login': 'Last Login',
    'email_verified': 'Verified',
    'email_not_verified': 'Not Verified',
    'account_active': 'Active',
    'account_blocked': 'Blocked',
    'change_password': 'Change Password',
    'current_password': 'Current Password',
    'new_password': 'New Password',
    'confirm_password': 'Confirm Password',
    'delete_account': 'Delete Account',
    'delete_account_warning': 'Warning! This action is irreversible. All your data will be permanently deleted.',
    'confirm_password_delete': 'Confirm Password',
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    'choose_gender': 'Choose Gender',
    'about_me': 'About Me',
    
    // Search
    'search_results': 'Search Results',
    'search_query': 'For query',
    'search_found': 'found',
    'search_results_count': 'results',
    'search_no_results': 'No Results Found',
    'search_no_results_desc': 'No results found for your query. Try modifying your search.',
    'search_min_chars': 'Enter search query (minimum 2 characters)',
    'search_loading': 'Searching...',
    'search_error': 'Search Error',
    'search_error_desc': 'An error occurred while searching. Please try again later.',
  },
  
  be: {
    // Агульныя
    'welcome': 'Сардэчна запрашаем',
    'home': 'Галоўная',
    'about': 'Пра прадпрыемства',
    'news': 'Навіны',
    'activity': 'Дзейнасць',
    'air_navigation': 'Аэранавігацыйная інфармацыя',
    'services': 'Паслугі',
    'contacts': 'Кантакты',
    'search': 'Пошук',
    'login': 'Увайсці',
    'logout': 'Выйсці',
    'admin_panel': 'Панэль адміністратара',
    'useful_links': 'Карысныя спасылкі',
    'cookie_policy': 'Палітыка выкарыстання cookie',
    'company_name_short': 'РУП «Белаэранавігацыя»',
    'all_rights_reserved': 'Усе правы абаронены',
    
    // Пра прадпрыемства
    'about_company': 'Пра прадпрыемства',
    'management': 'Кіраўніцтва',
    'structure': 'Структура прадпрыемства',
    'branches': 'Нашы філіялы',
    'security_policy': 'Палітыка бяспекі',
    'history': 'Гісторыя',
    'vacancies': 'Адкрытыя вакансіі',
    
    // Навіны
    'all_news': 'Усе навіны',
    'company_news': 'Навіны прадпрыемства',
    'flight_safety': 'Бяспека палётаў',
    'information_security': 'Інфармацыйная бяспека',
    'emergency': 'МНС інфармуе',
    'police': 'МУС інфармуе',
    'energy_saving': 'Энергазберажэнне',
    
    // Дзейнасць
    'international': 'Міжнароднае супрацоўніцтва',
    'standards': 'Стандарты ў галіне аэранавігацыі',
    'hr_policy': 'Кадравая палітыка',
    'information_systems': 'Інфармацыйныя сістэмы',
    'training_center': 'Цэнтр прафесійнай падрыхтоўкі',
    'airport': 'Аэрапортавая дзейнасць',
    'support': 'Забеспячэнне дзейнасці прадпрыемства',
    'quality_policy': 'Палітыка ў галіне якасці',
    'anti_corruption': 'Супрацьдзеянне карупцыі',
    'regulations': 'Нарматыўныя дакументы',
    
    // Аэранавігацыя
    'eaip': 'Зборнік аэранавігацыйнай інфармацыі (EAIP)',
    'eaip_vfr': 'Зборнік аэранавігацыйнай інфармацыі для візуальных палётаў (EAIP VFR)',
    'etod': 'Электронныя даныя аб мясцовасці і перашкодах (ETOD)',
    'aip_supplements': 'Дапаўненні да зборніка аэранавігацыйнай інфармацыі (AIP SUP)',
    'notam': 'Паведамленні авіяцыйным службам (NOTAM)',
    'aircraft_operations': 'Эксплуатацыя паветраных суднаў',
    'air_traffic_services': 'Службы паветранага руху',
    'aeronautical_information': 'Аэранавігацыйная інфармацыя',
    'airspace': 'Паветранная прастора',
    'airports': 'Аэрадромы',
    'radio_navigation': 'Радыёнавігацыя',
    'weather': 'Метэаралогія',
    'search_rescue': 'Пошук і ратаванне',
    'aircraft_accidents': 'Авіяцыйныя здарэнні',
    
    // Паслугі
    'air_navigation_services': 'Аэранавігацыйнае абслугоўванне',
    'meteorological_services': 'Метэаралагічнае абслугоўванне',
    'aeronautical_information_services': 'Аэранавігацыйнае інфармацыйнае абслугоўванне',
    'search_rescue_services': 'Службы пошуку і ратавання',
    'training_services': 'Паслугі па падрыхтоўцы персаналу',
    'consulting_services': 'Кансультацыйныя паслугі',
    'technical_support': 'Тэхнічная падтрымка',
    
    // Кантакты
    'address': 'Адрас',
    'phone': 'Тэлефон',
    'email': 'Email',
    'working_hours': 'Час работы',
    'minsk_address': 'г. Мінск, вул. Аэранавігацыйная, 1',
    'working_time': 'Пн-Пт 8:00-17:00',
    
    // Вакансіі
    'vacancy_title': 'Адкрытыя вакансіі',
    'vacancy_subtitle': 'Далучайцеся да нашай каманды прафесіяналаў',
    'apply': 'Адгукнуцца',
    'details': 'Падрабязна',
    'requirements': 'Патрабаванні',
    'conditions': 'Умовы работы',
    'salary': 'Зарплата',
    'location': 'Месцазнаходжанне',
    'employment_type': 'Тып занятасці',
    
    // Cookie
    'cookie_title': 'Мы выкарыстоўваем cookie-файлы',
    'cookie_message': 'Мы выкарыстоўваем cookie-файлы для паляпшэння работы сайта, аналізу трафіку і персаналізацыі кантэнту.',
    'cookie_policy_link': 'Падрабязней',
    'accept_all': 'Прыняць усе',
    'reject': 'Адхіліць',
    'settings': 'Налады',
    'cookies': 'cookie',
    'necessary_cookies': 'Неабходныя cookie',
    'necessary_cookies_description': 'Неабходны для работы сайта і не могуць быць адключаны.',
    'functional_cookies': 'Функцыянальныя cookie',
    'functional_cookies_description': 'Выкарыстоўваюцца для паляпшэння функцыянальнасці сайта.',
    'analytics_cookies': 'Аналітычныя cookie',
    'analytics_cookies_description': 'Дапамагаюць зразумець, як наведвальнікі ўзаемадзейнічаюць з сайтам.',
    'marketing_cookies': 'Маркетынгавыя cookie',
    'marketing_cookies_description': 'Выкарыстоўваюцца для паказу рэлевантнай рэкламы.',
    'save_preferences': 'Захаваць налады',
    
    // Адмін панэль
    'user_management': 'Кіраванне карыстальнікамі',
    'role_management': 'Кіраванне ролямі',
    'news_management': 'Кіраванне навінамі',
    'category_management': 'Кіраванне катэгорыямі',
    'branch_management': 'Кіраванне філіяламі',
    'vacancy_management': 'Кіраванне вакансіямі',
    'management_management': 'Кіраванне кіраўніцтвам',
    
    // Дадаткова
    'loading': 'Загрузка...',
    'error': 'Памылка',
    'no_data': 'Няма даных',
    'read_more': 'Чытаць далей',
    'back': 'Назад',
    'save': 'Захаваць',
    'cancel': 'Адмена',
    'delete': 'Выдаліць',
    'edit': 'Рэдагаваць',
    'add': 'Дадаць',
    'close': 'Зачыніць',
    'showing': 'Паказана',
    'of': 'з',
    'to_top': 'Да пачатку спісу',
    
    // Меню і навігацыя
    'appeals': 'Звароты',
    'social_ideological_work': 'Сацыяльная і ідэалагічная работа',
    'electronic_appeals': 'Электронныя звароты',
    'voluntary_report': 'Добраахвотнае паведамленне аб небяспечнай падзеі',
    'appeal_methods': 'Спосабы падачы зваротаў і парадак разгляду',
    'reception_schedules': 'Графікі прыёму',
    'consumer_questionnaire': 'Анкета спажыўца аэранавігацыйных паслуг',
    'united_trade_union': 'Аб\'яднаная прафсаюзная арганізацыя',
    'white_rus': 'Белая Русь',
    'brsm': 'БРСМ',
    'belarusian_women_union': 'Беларускі саюз жанчын',
    'healthy_lifestyle': 'За здаровы лад жыцця',
    'improvement_year': 'Год аблашчэння',
    'memory_pain': 'Памяць і боль беларускай зямлі',
    'version_visually_impaired': 'Версія для слабавідучых',
    
    // Загалоўкі блокаў
    'left_upper_block': 'Левы верхні блок',
    'left_middle_block': 'Левы сярэдні блок',
    'left_lower_block': 'Левы ніжні блок',
    
    // Назва прадпрыемства
    'company_full_name': 'Рэспубліканскае унітарнае прадпрыемства па аэранавігацыйным абслугоўванні паветранага руху «Белаэранавігацыя»',
    
    // Асабісты кабінет
    'profile': 'Асабісты кабінет',
    'personal_info': 'Асабістая інфармацыя',
    'account_settings': 'Налады аккаунта',
    'security': 'Бяспека',
    'profile_completeness': 'Запоўненасць профілю',
    'registration_date': 'Рэгістрацыя',
    'last_login': 'Апошні ўваход',
    'email_verified': 'Пацверджаны',
    'email_not_verified': 'Не пацверджаны',
    'account_active': 'Актыўны',
    'account_blocked': 'Заблакіраваны',
    'change_password': 'Змяніць пароль',
    'current_password': 'Бягучы пароль',
    'new_password': 'Новы пароль',
    'confirm_password': 'Пацвердзіце пароль',
    'delete_account': 'Выдаліць аккаунт',
    'delete_account_warning': 'Увага! Гэта дзеянне незваротнае. Усе вашы даныя будуць выдалены назаўсёды.',
    'confirm_password_delete': 'Пацвердзіце паролем',
    'male': 'Мужчынскі',
    'female': 'Жаночы',
    'other': 'Іншы',
    'choose_gender': 'Выберыце пол',
    'about_me': 'Пра сябе',
    
    // Пошук
    'search_results': 'Вынікі пошуку',
    'search_query': 'Па запыце',
    'search_found': 'знойдзена',
    'search_results_count': 'вынікаў',
    'search_no_results': 'Нічога не знойдзена',
    'search_no_results_desc': 'Па вашым запыце нічога не знойдзена. Паспрабуйце змяніць пошукавы запыт.',
    'search_min_chars': 'Увядзіце пошукавы запыт (мінімум 2 сімвалы)',
    'search_loading': 'Пошук...',
    'search_error': 'Памылка пошуку',
    'search_error_desc': 'Адбылася памылка пры выкананні пошуку. Паспрабуйце пазней.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Получаем язык из localStorage только если разрешены функциональные куки
    if (canUseFunctional()) {
      const savedLanguage = localStorage.getItem('language') as Language;
      return savedLanguage && ['ru', 'en', 'be'].includes(savedLanguage) ? savedLanguage : 'ru';
    }
    return 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Сохраняем в localStorage только если разрешены функциональные куки
    if (canUseFunctional()) {
      localStorage.setItem('language', lang);
    }
    
    // Обновляем HTML lang атрибут и отключаем авто-перевод
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('translate', 'no');
  };

  const t = (key: string): string => {
    const translation = translations[language][key];
    return translation || key; // Возвращаем ключ, если перевод не найден
  };

  // Устанавливаем язык при загрузке и отключаем авто-перевод
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('translate', 'no');
    
    // Дополнительно отключаем авто-перевод для Google Chrome
    const metaGoogle = document.querySelector('meta[name="google"]');
    if (!metaGoogle) {
      const meta = document.createElement('meta');
      meta.name = 'google';
      meta.content = 'notranslate';
      document.head.appendChild(meta);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
