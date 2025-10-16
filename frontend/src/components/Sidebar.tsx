//@ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
    FaPhone,
    FaEnvelope,
    FaSearch,
    FaUserCircle,
    FaLowVision,
    FaGlobe,
    FaFacebook,
    FaInstagram,
    FaTelegram,
    FaYoutube,
} from "react-icons/fa";

import {LoginForm} from "@/components/LoginForm.tsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice";
import { useGetCategoriesQuery } from "@/app/services/categoryApi";
import FloatingLanguageSwitcher from "./FloatingLanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslatedField } from "../utils/translationHelpers";
import { canAccessAdminPanel } from "../utils/roleUtils";
import { useGetAllSocialWorkCategoriesQuery } from '../app/services/socialWorkCategoryApi';
import { useGetAllAboutCompanyCategoriesQuery } from '../app/services/aboutCompanyCategoryApi';
import { useGetAeronauticalInfoCategoriesQuery } from '../app/services/aeronauticalInfoCategoryApi';
import { useGetAppealsCategoriesQuery } from '../app/services/appealsCategoryApi';
import { useGetAllServicesCategoriesQuery } from '../app/services/servicesCategoryApi';

export const Sidebar = () => {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [showSocialMedia, setShowSocialMedia] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: any) => state.auth);
    const { t, language } = useLanguage();

    const handleLogout = () => {
        dispatch(logout());
    };

    const roleValue = user?.role;
    const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
    const roleLower = roleName.toString().toLowerCase();
    
    // Отладочная информация отключена

    const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useGetCategoriesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const { data: socialWorkCategories, isLoading: socialWorkCategoriesLoading } = useGetAllSocialWorkCategoriesQuery();
    const { data: aboutCompanyCategories } = useGetAllAboutCompanyCategoriesQuery();
    const { data: aeronauticalInfoCategories } = useGetAeronauticalInfoCategoriesQuery();
    const { data: appealsCategories } = useGetAppealsCategoriesQuery();
    const { data: servicesCategories } = useGetAllServicesCategoriesQuery();

    const newsSubmenu = categories && Array.isArray(categories) && categories.length > 0
        ? [{ name: t('all_news') || "Все новости", href: "/news" }, ...categories.map((c: any) => ({ name: getTranslatedField(c, 'name', language), href: `/news/category/${c.id}` }))]
        : [
            { name: t('all_news') || "Все новости", href: "/news" },
            { name: t('news_company') || "Новости предприятия", href: "/news/company" },
            { name: t('flight_safety') || "Безопасность полетов", href: "/news/flight-safety" },
            { name: t('information_security') || "Информационная безопасность", href: "/news/information-security" },
            { name: t('mchs_informs') || "МЧС информирует", href: "/news/emergency" },
            { name: t('mvd_informs') || "МВД информирует", href: "/news/police" },
            { name: t('energy_saving') || "Энергосбережение", href: "/news/energy-saving" },
        ];

    // Создаем динамическое подменю для социальной работы
    const socialWorkSubmenu = socialWorkCategories && Array.isArray(socialWorkCategories) && socialWorkCategories.length > 0
        ? socialWorkCategories.map((category: any) => ({ 
            name: getTranslatedField(category, 'name', language), 
            href: `/social/${category.pageType}` 
        }))
        : [
            { name: t('united_trade_union'), href: "/social/trade-union" },
            { name: t('white_rus'), href: "/social/belaya-rus" },
            { name: t('brsm'), href: "/social/brsm" },
            { name: t('belarusian_women_union'), href: "/social/women-union" },
            { name: t('healthy_lifestyle'), href: "/social/healthy-lifestyle" },
            { name: t('improvement_year'), href: "/social/improvement-year" },
            { name: t('memory_pain'), href: "/social/memory" },
        ];

    // Динамическое подменю для услуг
    const servicesSubmenu = servicesCategories && Array.isArray(servicesCategories) && servicesCategories.length > 0
        ? servicesCategories
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((category: any) => ({
                name: getTranslatedField(category, 'name', language),
                href: `/services/${category.pageType}`
            }))
        : null; // null вместо пустого массива, чтобы не показывать подменю

    // Динамическое подменю "О предприятии"
    const aboutSubmenu = aboutCompanyCategories && Array.isArray(aboutCompanyCategories) && aboutCompanyCategories.length > 0
        ? aboutCompanyCategories
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((category: any) => ({
                name: getTranslatedField(category, 'name', language),
                href: `/about/${category.pageType}`
            }))
        : [];

    // Динамическое подменю "Аэронавигационная информация"
    const airNavSubmenu = aeronauticalInfoCategories && Array.isArray(aeronauticalInfoCategories) && aeronauticalInfoCategories.length > 0
        ? aeronauticalInfoCategories
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((category: any) => ({
                name: getTranslatedField(category, 'name', language),
                href: `/air-navigation/${category.pageType}`
            }))
        : [];

    // Динамическое подменю "Обращения"
    const appealsSubmenu = appealsCategories && Array.isArray(appealsCategories) && appealsCategories.length > 0
        ? appealsCategories
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((category: any) => ({
                name: getTranslatedField(category, 'name', language),
                href: category.pageType === 'e-appeals' 
                    ? 'https://xn--80abnmycp7evc.xn--90ais/' 
                    : `/appeals/${category.pageType}`,
                external: category.pageType === 'e-appeals'
            }))
        : [];

    const menuItems = [
        {
            name: t('about'),
            href: "/about",
            submenu: aboutSubmenu,
        },
        {
            name: t('news'),
            href: "/news",
            submenu: newsSubmenu,
        },
        {
            name: t('services'),
            href: "/services",
            submenu: servicesSubmenu,
        },
        {
            name: t('air_navigation'),
            href: "/air-navigation",
            submenu: airNavSubmenu,
        },
        {
            name: t('appeals'),
            href: "/appeals",
            submenu: appealsSubmenu,
        },
        {
            name: t('social_ideological_work'),
            href: "/social",
            submenu: socialWorkSubmenu,
        },
    ];

    return (
        <div className="flex h-full w-full">
            <LoginForm
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            {/* Кнопка меню для мобильных (768px и меньше) */}
            <button
                className="min-[769px]:hidden fixed top-4 left-4 z-50 flex flex-col gap-1.5 p-2 bg-white rounded-lg shadow-md"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <span
                    className={`h-0.5 w-6 bg-[#213659] rounded transition-transform duration-300 ${isMobileOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                />
                <span
                    className={`h-0.5 w-6 bg-[#213659] rounded transition-opacity duration-300 ${isMobileOpen ? "opacity-0" : "opacity-100"
                    }`}
                />
                <span
                    className={`h-0.5 w-6 bg-[#213659] rounded transition-transform duration-300 ${isMobileOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                />
            </button>

            {/* Правые кружки (язык + соцсети) */}
            <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
                {/* Переключение языка */}
                <div className="flex flex-col items-center gap-1">
                    <FloatingLanguageSwitcher />
                </div>

                {/* Кружок для соцсетей */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => setShowSocialMedia(!showSocialMedia)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        {showSocialMedia ? (
                            <ChevronUp className="text-[#213659]" size={16} />
                        ) : (
                            <ChevronDown className="text-[#213659]" size={16} />
                        )}
                    </button>
                </div>

                {/* Соцсети */}
                {showSocialMedia && (
                    <div className="flex flex-col gap-2 mt-2 bg-white p-2 rounded-lg shadow-md border border-gray-200">
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaFacebook className="text-gray-600 text-sm" />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaInstagram className="text-gray-600 text-sm" />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaTelegram className="text-gray-600 text-sm" />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaYoutube className="text-gray-600 text-sm" />
                        </a>
                    </div>
                )}
            </div>

            {/* Левое меню (desktop - 769px и больше) */}
            <aside className="hidden min-[951px]:block w-[260px] h-full border bg-[#eff6ff] group">
                <div className="flex h-full flex-col">
                    <div className="p-4 flex items-center justify-center w-full">
                        <Link to="/" className="flex flex-col items-center text-center">
                            <img src="/logo.png" className="h-20 w-auto max-w-xs object-contain" alt="Логотип Белаэронавигация" />
                            <p className="text-sm md:text-base lg:text-lg font-light leading-relaxed max-w-xs mx-auto whitespace-pre-line text-[#213659] break-words">
                                {t('company_full_name')}
                            </p>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 py-6 relative capitalize">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li
                                    key={item.href}
                                    className="relative"
                                    onMouseEnter={() => (item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0) ? setActiveSubmenu(item.href) : undefined}
                                    onMouseLeave={() => setActiveSubmenu(null)}
                                >
                                    <Link
                                        to={item.href}
                                        className="block rounded-md px-3 py-2 text-[#213659] hover:bg-[#B1D1E0] transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                    {item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0 && activeSubmenu === item.href && (
                                        <div className="absolute left-full top-0 ml-1 w-64 bg-[#eff6ff] border rounded-md shadow-lg z-50 py-2">
                                            <ul>
                                                {item.submenu.map((subItem: any) => (
                                                    <li key={subItem.href}>
                                                        {subItem.external ? (
                                                            <a
                                                                href={subItem.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block px-4 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                            >
                                                                {subItem.name}
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                to={subItem.href}
                                                                className="block px-4 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="px-4 py-3 border-b">
                        <div className="flex items-center mb-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder={t('search')}
                                    className="w-full pl-8 pr-3 py-1 text-sm bg-transparent border-b border-[#213659] focus:outline-none focus:border-b-2 focus:border-[#213659]"
                                />
                                <FaSearch className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-[#213659]">
                                <FaLowVision size={14} />
                                {t('version_visually_impaired')}
                            </Button>
                            {!isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs flex items-center gap-1 text-[#213659]"
                                    onClick={() => setIsLoginModalOpen(true)}
                                >
                                    <FaUserCircle size={14} />
                                    {t('login')}
                                </Button>
                            ) : (
                                <>
                                    {canAccessAdminPanel(roleName) && (
                                        <Link to="/admin" className="text-left">
                                            <Button variant="outline" size="sm" className="w-full">{t('admin_panel')}</Button>
                                        </Link>
                                    )}
                                    <Link to="/profile" className="text-left">
                                        <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                                            <FaUserCircle size={12} />
                                            Личный кабинет
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#213659] truncate max-w-[120px]" title={user?.email}>
                                            {user?.firstName || user?.email}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-red-600"
                                            onClick={handleLogout}
                                        >
                                            {t('logout')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Контакты */}
                    <div className="border-t p-4 text-sm text-[#6A81A9]">
                        <h3 className="font-semibold mb-2 text-[#213659]">{t('contacts')}</h3>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <FaPhone className="mr-2" size={12} />
                                <span>+375 (17) 123-45-67</span>
                            </div>
                            <div className="flex items-center">
                                <FaPhone className="mr-2" size={12} />
                                <span>+375 (17) 987-65-43</span>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="mr-2" size={12} />
                                <span>info@belaeronavigation.by</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t p-4 text-sm text-[#6A81A9]">
                        <p>{t('address')}: {t('minsk_address')}</p>
                        <p>{t('working_hours')}: {t('working_time')}</p>
                    </div>
                </div>
            </aside>

            {/* Мобильное меню (768px и меньше) */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#eff6ff] shadow-lg z-40 transform transition-transform duration-300 min-[769px]:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-4 flex flex-col h-full">
                    <Link to="/" className="mb-4">
                        <img src="/logo.png" className="h-16 w-auto object-contain" alt="Логотип Белаэронавигация" />
                    </Link>
                    <nav className="flex-1 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.href}>
                                    <details className="group">
                                        <summary className="flex justify-between items-center px-3 py-2 cursor-pointer text-[#213659] hover:bg-[#B1D1E0] rounded-md">
                                            {item.name}
                                            {item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0 && (
                                                <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                                            )}
                                        </summary>
                                        {item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0 && (
                                            <ul className="pl-4 space-y-1 mt-1">
                                                {item.submenu.map((subItem: any) => (
                                                    <li key={subItem.href}>
                                                        {subItem.external ? (
                                                            <a
                                                                href={subItem.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block px-3 py-1 text-sm text-[#213659] hover:bg-[#B1D1E0] rounded"
                                                            >
                                                                {subItem.name}
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                to={subItem.href}
                                                                className="block px-3 py-1 text-sm text-[#213659] hover:bg-[#B1D1E0] rounded"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </details>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="border-t pt-4 mt-4 space-y-2">
                        <button className="flex items-center gap-2 text-[#213659] text-sm">
                            <FaLowVision size={14} />
                            {t('version_visually_impaired')}
                        </button>

                        {!isAuthenticated ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs flex items-center gap-1 text-[#213659]"
                                onClick={() => setIsLoginModalOpen(true)}
                            >
                                <FaUserCircle size={14} />
                                Войти
                            </Button>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#213659] truncate" title={user?.email}>
                                    {user?.firstName || user?.email}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-red-600"
                                    onClick={handleLogout}
                                >
                                    Выйти
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
