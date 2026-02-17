//@ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import {
    FaPhone,
    FaEnvelope,
    FaSearch,
    FaUserCircle,
    FaLowVision,
    FaGlobe,
    FaInstagram,
    FaTelegram,
} from "react-icons/fa";

import {LoginForm} from "@/components/LoginForm.tsx";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice";
import { useGetCategoriesQuery } from "@/app/services/categoryApi";
import FloatingLanguageSwitcher from "./FloatingLanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
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
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedAirNavCategories, setExpandedAirNavCategories] = useState<Set<number>>(new Set());
    const [hoveredAirNavCategory, setHoveredAirNavCategory] = useState<number | null>(null);
    const [childMenuPosition, setChildMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [hoveredChildCategory, setHoveredChildCategory] = useState<number | null>(null);
    const [childCategoryMenuPosition, setChildCategoryMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [mainMenuPosition, setMainMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const categoryRefs = useRef<Map<number, HTMLElement>>(new Map());
    const childCategoryRefs = useRef<Map<number, HTMLElement>>(new Map());
    const menuItemRefs = useRef<Map<string, HTMLElement>>(new Map());
    const closeMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
    const closeChildMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: any) => state.auth);
    const { t, language } = useLanguage();
    const { isAccessibilityMode } = useAccessibility();

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMobileOpen(false);
        }
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

    // Построение дерева категорий аэронавигационной информации
    const buildAirNavTree = (categories: any[]) => {
        if (!categories || !Array.isArray(categories)) return [];
        
        // Фильтруем только активные категории
        const activeCategories = categories.filter((c: any) => c.isActive);
        
        const categoryMap = new Map();
        const rootCategories: any[] = [];
        
        // Создаем карту всех активных категорий с пустым массивом children
        activeCategories.forEach(cat => {
            categoryMap.set(cat.id, { 
                ...cat, 
                children: [] // Инициализируем пустым массивом, будем заполнять ниже
            });
        });
        
        // Строим дерево - используем parentId для связи
        activeCategories.forEach(cat => {
            const category = categoryMap.get(cat.id);
            if (!category) return; // Пропускаем, если категория не в карте
            
            if (cat.parentId && categoryMap.has(cat.parentId)) {
                // Если есть родитель и он активен, добавляем к нему
                const parent = categoryMap.get(cat.parentId);
                if (parent && !parent.children.some((c: any) => c.id === category.id)) {
                    parent.children.push(category);
                }
            } else if (!cat.parentId || cat.parentId === null) {
                // Если нет parentId, это корневая категория
                if (!rootCategories.some((c: any) => c.id === category.id)) {
                    rootCategories.push(category);
                }
            }
        });
        
        // Сортируем
        const sortCategories = (cats: any[]) => {
            cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            cats.forEach(cat => {
                if (cat.children && cat.children.length > 0) {
                    sortCategories(cat.children);
                }
            });
        };
        
        sortCategories(rootCategories);
        return rootCategories;
    };

    const airNavTree = aeronauticalInfoCategories && Array.isArray(aeronauticalInfoCategories) && aeronauticalInfoCategories.length > 0
        ? buildAirNavTree(aeronauticalInfoCategories)
        : [];

    // Функция для рендеринга дерева категорий в подменю
    const renderAirNavSubmenu = (categories: any[], level: number = 0): any[] => {
        const result: any[] = [];
        categories.forEach((category: any) => {
            result.push({
                name: getTranslatedField(category, 'name', language),
                href: `/air-navigation/${category.pageType}`,
                id: category.id,
                hasChildren: category.children && category.children.length > 0,
                level: level
            });
            if (category.children && category.children.length > 0) {
                result.push(...renderAirNavSubmenu(category.children, level + 1));
            }
        });
        return result;
    };

    // Динамическое подменю "Аэронавигационная информация" (для обратной совместимости)
    const airNavSubmenu = renderAirNavSubmenu(airNavTree);

    const toggleAirNavCategory = (categoryId: number) => {
        setExpandedAirNavCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

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
                        <a href="https://t.me/gp_belaeronavigatsia" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaTelegram className="text-gray-600 text-sm" />
                        </a>
                        <a href="https://www.instagram.com/gp_belaeronavigatsia/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <FaInstagram className="text-gray-600 text-sm" />
                        </a>
                    </div>
                )}
            </div>

            {/* Левое меню (desktop - 951px и больше) */}
            <aside
                className={
                    "hidden min-[951px]:block w-[260px] h-screen border bg-[#eff6ff] group fixed left-0 top-0 z-30 " +
                    (isAccessibilityMode ? "overflow-y-auto" : "")
                }
            >
                <div className="flex h-full flex-col">
                    <div className="p-4 flex items-center justify-center w-full">
                        <Link to="/" className="flex flex-col items-center text-center">
                            <img src="/logo.png" className="h-24 w-auto max-w-xs object-contain" alt="Логотип Белаэронавигация" />
                            <p className="text-sm font-light leading-relaxed max-w-xs mx-auto whitespace-pre-line text-[#213659] break-words">
                                {t('company_full_name')}
                            </p>
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 py-3 relative">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li
                                    key={item.href}
                                    className="relative"
                                    ref={(el) => {
                                        if (el) {
                                            menuItemRefs.current.set(item.href, el);
                                        } else {
                                            menuItemRefs.current.delete(item.href);
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        // Отменяем таймер закрытия, если он есть
                                        if (closeMenuTimerRef.current) {
                                            clearTimeout(closeMenuTimerRef.current);
                                            closeMenuTimerRef.current = null;
                                        }
                                        
                                        if (item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0) {
                                            const element = menuItemRefs.current.get(item.href);
                                            if (element) {
                                                const rect = element.getBoundingClientRect();
                                                setMainMenuPosition({
                                                    top: 0,
                                                    left: rect.right
                                                });
                                            }
                                            setActiveSubmenu(item.href);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Не закрываем меню сразу - даем время перейти на выпадающий список
                                        // Закрытие будет обработано выпадающим меню или переходной областью
                                    }}
                                >
                                    <Link
                                        to={item.href}
                                        className="block rounded-md px-3 py-2 text-[#213659] hover:bg-[#B1D1E0] transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    {/* Выпадающее меню через портал (первое меню) */}
                    {activeSubmenu && mainMenuPosition && typeof window !== 'undefined' && (() => {
                        const item = menuItems.find(i => i.href === activeSubmenu);
                        if (!item || !item.submenu || !Array.isArray(item.submenu) || item.submenu.length === 0) return null;
                        
                        return createPortal(
                            <>
                                {/* Невидимая область для плавного перехода от пункта меню к выпадающему списку */}
                                <div
                                    className="fixed z-40"
                                    style={{
                                        top: '0px',
                                        left: `${mainMenuPosition.left - 60}px`,
                                        width: '60px',
                                        height: '100vh',
                                        pointerEvents: 'auto'
                                    }}
                                    onMouseEnter={() => {
                                        // Отменяем таймер закрытия
                                        if (closeMenuTimerRef.current) {
                                            clearTimeout(closeMenuTimerRef.current);
                                            closeMenuTimerRef.current = null;
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Закрываем первое меню только если второе меню не открыто
                                        if (!hoveredAirNavCategory) {
                                            closeMenuTimerRef.current = setTimeout(() => {
                                                setActiveSubmenu(null);
                                                setMainMenuPosition(null);
                                                closeMenuTimerRef.current = null;
                                            }, 150);
                                        }
                                    }}
                                />
                                <div 
                                    className="fixed bg-[#eff6ff] border shadow-lg z-50 py-2"
                                    style={{
                                        top: '0px',
                                        left: `${mainMenuPosition.left}px`,
                                        width: '256px',
                                        height: '100vh',
                                        overflowY: 'auto',
                                        overflowX: 'visible'
                                    }}
                                    onMouseEnter={() => {
                                        // Отменяем таймер закрытия
                                        if (closeMenuTimerRef.current) {
                                            clearTimeout(closeMenuTimerRef.current);
                                            closeMenuTimerRef.current = null;
                                        }
                                        
                                        // Обновляем позицию при наведении на меню
                                        const element = menuItemRefs.current.get(activeSubmenu);
                                        if (element) {
                                            const rect = element.getBoundingClientRect();
                                            setMainMenuPosition({
                                                top: 0,
                                                left: rect.right
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Закрываем первое меню только если второе меню не открыто
                                        if (!hoveredAirNavCategory) {
                                            closeMenuTimerRef.current = setTimeout(() => {
                                                setActiveSubmenu(null);
                                                setMainMenuPosition(null);
                                                closeMenuTimerRef.current = null;
                                            }, 200);
                                        }
                                    }}
                                >
                                <ul className="relative">
                                    {item.href === '/air-navigation' ? (
                                        // Специальный рендеринг для аэронавигационной информации с иерархией
                                        airNavTree.length > 0 ? (
                                            airNavTree.map((category: any) => {
                                                const renderCategory = (cat: any, depth: number = 0) => {
                                                    const hasChildren = cat.children && Array.isArray(cat.children) && cat.children.length > 0;
                                                    const indent = depth * 16;
                                                    
                                                    return (
                                                        <li 
                                                            key={cat.id} 
                                                            className="relative"
                                                            ref={(el) => {
                                                                if (el) {
                                                                    categoryRefs.current.set(cat.id, el);
                                                                } else {
                                                                    categoryRefs.current.delete(cat.id);
                                                                }
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                // Отменяем таймер закрытия первого меню
                                                                if (closeMenuTimerRef.current) {
                                                                    clearTimeout(closeMenuTimerRef.current);
                                                                    closeMenuTimerRef.current = null;
                                                                }
                                                                
                                                                // Отменяем таймер закрытия второго меню, если он есть
                                                                if (closeChildMenuTimerRef.current) {
                                                                    clearTimeout(closeChildMenuTimerRef.current);
                                                                    closeChildMenuTimerRef.current = null;
                                                                }
                                                                
                                                                if (hasChildren) {
                                                                    const element = categoryRefs.current.get(cat.id);
                                                                    if (element) {
                                                                        const rect = element.getBoundingClientRect();
                                                                        setChildMenuPosition({
                                                                            top: 0,
                                                                            left: rect.right
                                                                        });
                                                                        setHoveredAirNavCategory(cat.id);
                                                                    }
                                                                }
                                                            }}
                                                            onMouseLeave={() => {
                                                                // Не закрываем меню сразу - даем время перейти на выпадающий список
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div style={{ width: `${indent}px` }} />
                                                                {hasChildren && (
                                                                    <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0 text-gray-500" />
                                                                )}
                                                                {!hasChildren && <div className="w-4 flex-shrink-0" />}
                                                                <Link
                                                                    to={`/air-navigation/${cat.pageType}`}
                                                                    className="flex-1 block px-2 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                                    onClick={() => {
                                                                        setActiveSubmenu(null);
                                                                        setMainMenuPosition(null);
                                                                    }}
                                                                >
                                                                    {getTranslatedField(cat, 'name', language)}
                                                                </Link>
                                                            </div>
                                                        </li>
                                                    );
                                                };
                                                return renderCategory(category);
                                            })
                                        ) : (
                                            <li className="px-4 py-2 text-sm text-gray-500">Нет категорий</li>
                                        )
                                    ) : (
                                        // Обычный рендеринг для других подменю
                                        item.submenu.map((subItem: any) => (
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
                                        ))
                                    )}
                                </ul>
                            </div>
                            </>,
                            document.body
                        );
                    })()}
                    
                    {/* Старый код - удаляем дубликат */}
                    {/* {item.submenu && Array.isArray(item.submenu) && item.submenu.length > 0 && activeSubmenu === item.href && (
                                        <div className="fixed bg-[#eff6ff] border rounded-md shadow-lg z-50 py-2" style={{ top: '0px', left: `${(document.querySelector('aside')?.getBoundingClientRect().right || 260) + 4}px`, width: '256px', height: '100vh', overflowY: 'auto', overflowX: 'visible' }}>
                                            <ul className="relative">
                                                {item.href === '/air-navigation' ? (
                                                    // Специальный рендеринг для аэронавигационной информации с иерархией
                                                    airNavTree.length > 0 ? (
                                                        airNavTree.map((category: any) => {
                                                            const renderCategory = (cat: any, depth: number = 0) => {
                                                                const hasChildren = cat.children && Array.isArray(cat.children) && cat.children.length > 0;
                                                                const indent = depth * 16;
                                                                
                                                                return (
                                                                    <li 
                                                                        key={cat.id} 
                                                                        className="relative"
                                                                        ref={(el) => {
                                                                            if (el) {
                                                                                categoryRefs.current.set(cat.id, el);
                                                                            } else {
                                                                                categoryRefs.current.delete(cat.id);
                                                                            }
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (hasChildren) {
                                                                                const element = categoryRefs.current.get(cat.id);
                                                                                if (element) {
                                                                                    const rect = element.getBoundingClientRect();
                                                                                    setChildMenuPosition({
                                                                                        top: rect.top,
                                                                                        left: rect.right + 4
                                                                                    });
                                                                                    setHoveredAirNavCategory(cat.id);
                                                                                }
                                                                            }
                                                                        }}
                                                                        onMouseLeave={() => {
                                                                            setHoveredAirNavCategory(null);
                                                                            setChildMenuPosition(null);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <div style={{ width: `${indent}px` }} />
                                                                            {hasChildren && (
                                                                                <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0 text-gray-500" />
                                                                            )}
                                                                            {!hasChildren && <div className="w-4 flex-shrink-0" />}
                                                                            <Link
                                                                                to={`/air-navigation/${cat.pageType}`}
                                                                                className="flex-1 block px-2 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                                                onClick={() => setActiveSubmenu(null)}
                                                                            >
                                                                                {getTranslatedField(cat, 'name', language)}
                                                                            </Link>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            };
                                                            return renderCategory(category);
                                                        })
                                                    ) : (
                                                        <li className="px-4 py-2 text-sm text-gray-500">Нет категорий</li>
                                                    )
                                                ) : (
                                                    // Обычный рендеринг для других подменю
                                                    item.submenu.map((subItem: any) => (
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
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    {/* Выпадающий список дочерних категорий через портал */}
                    {hoveredAirNavCategory && childMenuPosition && typeof window !== 'undefined' && (() => {
                        // Находим категорию в дереве
                        const findCategoryInTree = (categories: any[], id: number): any => {
                            for (const cat of categories) {
                                if (cat.id === id) return cat;
                                if (cat.children && cat.children.length > 0) {
                                    const found = findCategoryInTree(cat.children, id);
                                    if (found) return found;
                                }
                            }
                            return null;
                        };
                        
                        const category = findCategoryInTree(airNavTree, hoveredAirNavCategory);
                        if (!category || !category.children || category.children.length === 0) return null;
                        
                        return createPortal(
                            <>
                                {/* Невидимая область для плавного перехода от первого меню ко второму */}
                                <div
                                    className="fixed z-[90]"
                                    style={{
                                        top: '0px',
                                        left: `${childMenuPosition.left - 60}px`,
                                        width: '60px',
                                        height: '100vh',
                                        pointerEvents: 'auto'
                                    }}
                                    onMouseEnter={() => {
                                        // Отменяем таймер закрытия первого меню
                                        if (closeMenuTimerRef.current) {
                                            clearTimeout(closeMenuTimerRef.current);
                                            closeMenuTimerRef.current = null;
                                        }
                                        
                                        // Отменяем таймер закрытия второго меню
                                        if (closeChildMenuTimerRef.current) {
                                            clearTimeout(closeChildMenuTimerRef.current);
                                            closeChildMenuTimerRef.current = null;
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Устанавливаем таймер закрытия второго меню
                                        closeChildMenuTimerRef.current = setTimeout(() => {
                                            setHoveredAirNavCategory(null);
                                            setChildMenuPosition(null);
                                            setHoveredChildCategory(null);
                                            setChildCategoryMenuPosition(null);
                                            closeChildMenuTimerRef.current = null;
                                            
                                            // После закрытия второго меню закрываем и первое
                                            closeMenuTimerRef.current = setTimeout(() => {
                                                setActiveSubmenu(null);
                                                setMainMenuPosition(null);
                                                closeMenuTimerRef.current = null;
                                            }, 100);
                                        }, 150);
                                    }}
                                />
                                <div 
                                    className="fixed bg-[#eff6ff] border rounded-md shadow-lg z-[100] min-w-[250px]"
                                    style={{
                                        top: '0px',
                                        left: `${childMenuPosition.left}px`,
                                        height: '100vh',
                                        overflowY: 'auto',
                                        maxHeight: '100vh'
                                    }}
                                    onMouseEnter={() => {
                                        // Отменяем таймер закрытия первого меню
                                        if (closeMenuTimerRef.current) {
                                            clearTimeout(closeMenuTimerRef.current);
                                            closeMenuTimerRef.current = null;
                                        }
                                        
                                        // Отменяем таймер закрытия второго меню
                                        if (closeChildMenuTimerRef.current) {
                                            clearTimeout(closeChildMenuTimerRef.current);
                                            closeChildMenuTimerRef.current = null;
                                        }
                                        
                                        // Обновляем позицию при наведении на меню
                                        const element = categoryRefs.current.get(hoveredAirNavCategory);
                                        if (element) {
                                            const rect = element.getBoundingClientRect();
                                            setChildMenuPosition({
                                                top: 0,
                                                left: rect.right
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Устанавливаем таймер закрытия второго меню
                                        closeChildMenuTimerRef.current = setTimeout(() => {
                                            setHoveredAirNavCategory(null);
                                            setChildMenuPosition(null);
                                            setHoveredChildCategory(null);
                                            setChildCategoryMenuPosition(null);
                                            closeChildMenuTimerRef.current = null;
                                            
                                            // После закрытия второго меню закрываем и первое
                                            closeMenuTimerRef.current = setTimeout(() => {
                                                setActiveSubmenu(null);
                                                setMainMenuPosition(null);
                                                closeMenuTimerRef.current = null;
                                            }, 100);
                                        }, 150);
                                    }}
                                >
                                <div className="py-2">
                                    <ul>
                                        {category.children.map((child: any) => {
                                            const hasChildren = child.children && Array.isArray(child.children) && child.children.length > 0;
                                            return (
                                                <li 
                                                    key={child.id}
                                                    ref={(el) => {
                                                        if (el) {
                                                            childCategoryRefs.current.set(child.id, el);
                                                        } else {
                                                            childCategoryRefs.current.delete(child.id);
                                                        }
                                                    }}
                                                    onMouseEnter={() => {
                                                        // Отменяем таймер закрытия, если он есть
                                                        if (closeChildMenuTimerRef.current) {
                                                            clearTimeout(closeChildMenuTimerRef.current);
                                                            closeChildMenuTimerRef.current = null;
                                                        }
                                                        
                                                        if (hasChildren) {
                                                            const element = childCategoryRefs.current.get(child.id);
                                                            if (element) {
                                                                const rect = element.getBoundingClientRect();
                                                                setChildCategoryMenuPosition({
                                                                    top: 0,
                                                                    left: rect.right
                                                                });
                                                                setHoveredChildCategory(child.id);
                                                            }
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        // Не закрываем меню сразу - даем время перейти на выпадающий список
                                                    }}
                                                    className="relative"
                                                >
                                                    <Link
                                                        to={`/air-navigation/${child.pageType}`}
                                                        className="flex items-center block px-4 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                        onClick={() => {
                                                            setActiveSubmenu(null);
                                                            setHoveredAirNavCategory(null);
                                                            setChildMenuPosition(null);
                                                            setHoveredChildCategory(null);
                                                            setChildCategoryMenuPosition(null);
                                                        }}
                                                    >
                                                        <span className="flex-1">{getTranslatedField(child, 'name', language)}</span>
                                                        {hasChildren && (
                                                            <ChevronRight className="w-3 h-3 ml-2 flex-shrink-0 text-gray-500" />
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                            </>,
                            document.body
                        );
                    })()}
                    
                    {/* Выпадающий список дочерних подкатегорий через портал (второй уровень) */}
                    {hoveredChildCategory && childCategoryMenuPosition && typeof window !== 'undefined' && (() => {
                        // Находим категорию в дереве
                        const findCategoryInTree = (categories: any[], id: number): any => {
                            for (const cat of categories) {
                                if (cat.id === id) return cat;
                                if (cat.children && cat.children.length > 0) {
                                    const found = findCategoryInTree(cat.children, id);
                                    if (found) return found;
                                }
                            }
                            return null;
                        };
                        
                        // Ищем в дочерних элементах первой категории
                        const parentCategory = findCategoryInTree(airNavTree, hoveredAirNavCategory);
                        if (!parentCategory) return null;
                        
                        const category = findCategoryInTree(parentCategory.children || [], hoveredChildCategory);
                        if (!category || !category.children || category.children.length === 0) return null;
                        
                        return createPortal(
                            <div 
                                className="fixed bg-[#eff6ff] border rounded-md shadow-lg z-[110] min-w-[250px]"
                                style={{
                                    top: '0px',
                                    left: `${childCategoryMenuPosition.left}px`,
                                    height: '100vh',
                                    overflowY: 'auto',
                                    maxHeight: '100vh'
                                }}
                                onMouseEnter={() => {
                                    const element = childCategoryRefs.current.get(hoveredChildCategory);
                                    if (element) {
                                        const rect = element.getBoundingClientRect();
                                        setChildCategoryMenuPosition({
                                            top: 0,
                                            left: rect.right + 4
                                        });
                                    }
                                }}
                                onMouseLeave={() => {
                                    setHoveredChildCategory(null);
                                    setChildCategoryMenuPosition(null);
                                }}
                            >
                                <div className="py-2">
                                    <ul>
                                        {category.children.map((child: any) => (
                                            <li key={child.id}>
                                                <Link
                                                    to={`/air-navigation/${child.pageType}`}
                                                    className="block px-4 py-2 text-[#213659] hover:bg-[#B1D1E0]"
                                                    onClick={() => {
                                                        setActiveSubmenu(null);
                                                        setHoveredAirNavCategory(null);
                                                        setChildMenuPosition(null);
                                                        setHoveredChildCategory(null);
                                                        setChildCategoryMenuPosition(null);
                                                    }}
                                                >
                                                    {getTranslatedField(child, 'name', language)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>,
                            document.body
                        );
                    })()}

                    <div className="px-3 py-2 border-b">
                        <form onSubmit={handleSearch} className="flex items-center mb-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder={t('search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1 text-sm bg-transparent border-b border-[#213659] focus:outline-none focus:border-b-2 focus:border-[#213659]"
                                />
                                <button 
                                    type="submit"
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#213659] transition-colors"
                                >
                                    <FaSearch size={14} />
                                </button>
                            </div>
                        </form>
                        
                        <div className="flex flex-col gap-1 mt-2">
                            <AccessibilitySettings />
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

                    {/* Контакты - прижаты к низу */}
                    <div className="mt-auto">
                        <div className="border-t p-3 text-xs text-[#6A81A9]">
                            <h3 className="font-semibold mb-1 text-[#213659]">{t('contacts')}</h3>
                            <div className="space-y-0.5">
                                <div className="flex items-center">
                                    <FaPhone className="mr-1" size={10} />
                                    <span>+375 (17) 215-40-52</span>
                                </div>
                                <div className="flex items-center">
                                    <FaPhone className="mr-1" size={10} />
                                    <span>+375 (17) 213-41-63 (факс)</span>
                                </div>
                                <div className="flex items-center">
                                    <FaEnvelope className="mr-1" size={10} />
                                    <span>office@ban.by</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-3 text-xs text-[#6A81A9]">
                            <p>{t('address')}: {t('minsk_address')}</p>
                            <p>{t('working_hours')}: {t('working_time')}</p>
                        </div>
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
                                                {item.href === '/air-navigation' ? (
                                                    // Специальный рендеринг для аэронавигационной информации с иерархией
                                                    airNavTree.length > 0 ? (
                                                        airNavTree.map((category: any) => {
                                                            const renderCategory = (cat: any, depth: number = 0) => {
                                                                const hasChildren = cat.children && Array.isArray(cat.children) && cat.children.length > 0;
                                                                const isExpanded = expandedAirNavCategories.has(cat.id);
                                                                const indent = depth * 12;
                                                                
                                                                return (
                                                                    <li key={cat.id}>
                                                                        <div className="flex items-center">
                                                                            <div style={{ width: `${indent}px` }} />
                                                                            {hasChildren && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        toggleAirNavCategory(cat.id);
                                                                                    }}
                                                                                    className="p-1 hover:bg-[#B1D1E0] rounded mr-1 flex-shrink-0"
                                                                                >
                                                                                    {isExpanded ? (
                                                                                        <ChevronDown className="w-3 h-3" />
                                                                                    ) : (
                                                                                        <ChevronRight className="w-3 h-3" />
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                            {!hasChildren && <div className="w-4 flex-shrink-0" />}
                                                                            <Link
                                                                                to={`/air-navigation/${cat.pageType}`}
                                                                                className="flex-1 block px-2 py-1 text-sm text-[#213659] hover:bg-[#B1D1E0] rounded"
                                                                            >
                                                                                {getTranslatedField(cat, 'name', language)}
                                                                            </Link>
                                                                        </div>
                                                                        {hasChildren && isExpanded && (
                                                                            <ul className="pl-4 space-y-1 mt-1">
                                                                                {cat.children.map((child: any) => (
                                                                                    <li key={child.id}>
                                                                                        <Link
                                                                                            to={`/air-navigation/${child.pageType}`}
                                                                                            className="block px-2 py-1 text-sm text-[#213659] hover:bg-[#B1D1E0] rounded"
                                                                                        >
                                                                                            {getTranslatedField(child, 'name', language)}
                                                                                        </Link>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </li>
                                                                );
                                                            };
                                                            return renderCategory(category);
                                                        })
                                                    ) : (
                                                        <li className="px-3 py-1 text-sm text-gray-500">Нет категорий</li>
                                                    )
                                                ) : (
                                                    // Обычный рендеринг для других подменю
                                                    item.submenu.map((subItem: any) => (
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
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </details>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="border-t pt-4 mt-4 space-y-2">
                        <form onSubmit={handleSearch} className="mb-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1 text-sm bg-white border border-[#213659] rounded focus:outline-none focus:border-[#213659] focus:ring-1 focus:ring-[#213659]"
                                />
                                <button 
                                    type="submit"
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#213659] transition-colors"
                                >
                                    <FaSearch size={14} />
                                </button>
                            </div>
                        </form>
                        
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
