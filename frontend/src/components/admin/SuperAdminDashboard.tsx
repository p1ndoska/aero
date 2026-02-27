import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Save, FolderOpen, Users, Building2, Newspaper, UserCheck, Briefcase, Building, Heart, Info, Plane, Mail, Settings, Image as ImageIcon, Calendar, BarChart3, FileText, Lock as LockIcon } from "lucide-react";
import { getRolePermissions } from "@/utils/roleUtils";
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from "@/app/services/roleApi";
import { useGetAllUsersQuery, useUpdateUserMutation, useDeleteUserMutation, useRegisterMutation } from "@/app/services/userApi";
//import { UserManagement } from "./UserManagement";
import CategoriesAdminPage from "./CategoriesAdminPage";
import BranchManagement from "./BranchManagement";
import NewsManagement from "./NewsManagement";
import ManagementManagement from "./ManagementManagement";
import VacancyManagement from "./VacancyManagement";
import OrganizationLogoManagement from "./OrganizationLogoManagement";
import SocialWorkCategoryManagement from "./SocialWorkCategoryManagement";
import AboutCompanyCategoryManagement from "./AboutCompanyCategoryManagement";
import AeronauticalInfoCategoryManagement from "./AeronauticalInfoCategoryManagement";
import AppealsCategoryManagement from "./AppealsCategoryManagement";
import ServicesCategoryManagement from "./ServicesCategoryManagement";
import ServiceRequestManagement from "./ServiceRequestManagement";
import ResumeManagement from "./ResumeManagement";
import HeroImageManagement from "./HeroImageManagement";
import ReceptionBookingsCalendar from "./ReceptionBookingsCalendar";
import StatisticsPanel from "./StatisticsPanel";

// lightweight hooks wrapper, since userApi doesn't export getAllUsers and updateUser hooks in current file
// We'll implement a tiny adapter in /components/admin/hooks/useUsersApi.ts

export default function SuperAdminDashboard() {
    const { user } = useSelector((state: any) => state.auth);
    const roleValue = user?.role;
    const roleName = (typeof roleValue === "string" ? roleValue : roleValue?.name) ?? "";
    const permissions = getRolePermissions(roleName);
    
    // Проверяем, есть ли у пользователя хотя бы одно разрешение
    const canAccess = Object.values(permissions).some(permission => permission === true);
    
    // Отключена избыточная отладка

    // Определяем первую доступную вкладку
    const getFirstAvailableTab = () => {
        // Статистика доступна только SUPER_ADMIN (первая вкладка по умолчанию)
        if (permissions.canManageRoles) return 'statistics';
        if (permissions.canManageUsers) return 'users';
        if (permissions.canManageNews) return 'categories';
        if (permissions.canManageBranches) return 'branches';
        if (permissions.canManageNews) return 'news';
        if (permissions.canManageManagement) return 'management';
        if (permissions.canManageVacancies) return 'vacancies';
        if (permissions.canManageVacancies) return 'resumes';
        if (permissions.canManageLogos) return 'logos';
        if (permissions.canManageSocial) return 'social-categories';
        if (permissions.canManageAbout) return 'about-company-categories';
        if (permissions.canManageAirNav) return 'aeronautical-info-categories';
        if (permissions.canManageAppeals) return 'appeals-categories';
        if (permissions.canManageServices) return 'services-categories';
        return 'roles';
    };

    const [activeTab, setActiveTab] = useState<
        'roles'
        | 'content-roles'
        | 'users'
        | 'categories'
        | 'branches'
        | 'news'
        | 'management'
        | 'vacancies'
        | 'resumes'
        | 'logos'
        | 'social-categories'
        | 'about-company-categories'
        | 'aeronautical-info-categories'
        | 'appeals-categories'
        | 'services-categories'
        | 'service-requests'
        | 'hero-image'
        | 'reception-bookings'
        | 'statistics'
    >(getFirstAvailableTab());

    // Принудительное обновление данных при переключении на вкладку логотипов
    useEffect(() => {
        if (activeTab === 'logos') {
            console.log('SuperAdminDashboard: Switched to logos tab, forcing data refresh...');
            // Принудительно обновляем данные для логотипов
            window.dispatchEvent(new CustomEvent('refresh-organization-logos'));
        }
    }, [activeTab]);

    if (!canAccess) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card><CardContent className="pt-6 text-center text-red-600">Доступ запрещен. Недостаточно прав для доступа к панели администратора.</CardContent></Card>
            </div>
        );
    }
    

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
                   {/* Навигационные кнопки в виде закругленных белых квадратов */}
                   <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
                       {/* Статистика - только SUPER_ADMIN */}
                       {permissions.canManageRoles && (
                           <div 
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'statistics' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('statistics')}
                           >
                               <div className="text-center">
                                   <BarChart3 className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'statistics' ? 'text-[#213659]' : 'text-[#213659]'}`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Статистика
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Управление ролями - только SUPER_ADMIN */}
                       {permissions.canManageRoles && (
                <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'roles' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                    onClick={() => setActiveTab('roles')}
                >
                    <div className="text-center">
                                   <Edit className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'roles' ? 'text-[#213659]' : 'text-[#213659]'}`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                            Управление ролями
                        </h3>
                    </div>
                </div>
                       )}

                       {/* Роли доступа к контенту - отдельная вкладка, использует те же роли */}
                       {permissions.canManageRoles && (
                           <div 
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'content-roles' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('content-roles')}
                           >
                               <div className="text-center">
                                   <LockIcon className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Роли доступа к контенту
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Управление пользователями - только SUPER_ADMIN */}
                       {permissions.canManageUsers && (
                <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'users' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                    onClick={() => setActiveTab('users')}
                >
                    <div className="text-center">
                                   <Users className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                            Управление пользователями
                        </h3>
                    </div>
                </div>
                       )}

                       {/* Управление категориями новостей - NEWS_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageNews && (
                <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'categories' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                    onClick={() => setActiveTab('categories')}
                >
                    <div className="text-center">
                                   <FolderOpen className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                            Управление категориями
                        </h3>
                    </div>
                </div>
                       )}

                       {/* Управление филиалами - MEDIA_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageBranches && (
                <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'branches' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                    onClick={() => setActiveTab('branches')}
                >
                    <div className="text-center">
                                   <Building2 className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                            Управление филиалами
                        </h3>
                    </div>
                </div>
                       )}

                       {/* Управление новостями - NEWS_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageNews && (
                       <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'news' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('news')}
                       >
                           <div className="text-center">
                                   <Newspaper className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Управление новостями
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Управление руководителями - MEDIA_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageManagement && (
                       <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'management' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('management')}
                       >
                           <div className="text-center">
                                   <UserCheck className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Управление руководителями
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Управление вакансиями - MEDIA_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageVacancies && (
                       <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'vacancies' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('vacancies')}
                       >
                           <div className="text-center">
                                   <Briefcase className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Управление вакансиями
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Управление резюме - MEDIA_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageVacancies && (
                       <div 
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'resumes' 
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]' 
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('resumes')}
                       >
                           <div className="text-center">
                                   <FileText className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Управление резюме
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Логотипы организаций - MEDIA_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageLogos && (
                       <div
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'logos'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('logos')}
                       >
                           <div className="text-center">
                                   <Building className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Логотипы организаций
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Управление изображением верхнего блока - SUPER_ADMIN и MEDIA_ADMIN */}
                       {(permissions.canManageRoles || permissions.canManageHomePage) && (
                       <div
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'hero-image'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('hero-image')}
                       >
                           <div className="text-center">
                                   <ImageIcon className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Изображение верхнего блока
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Категории соц. работы - SOCIAL_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageSocial && (
                       <div
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'social-categories'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('social-categories')}
                       >
                           <div className="text-center">
                                   <Heart className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Категории соц. работы
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Подкатегории "О предприятии" - ABOUT_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageAbout && (
                       <div
                           className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                               activeTab === 'about-company-categories'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                   : 'border-gray-200 hover:border-[#2A52BE]'
                           }`}
                           onClick={() => setActiveTab('about-company-categories')}
                       >
                           <div className="text-center">
                                   <Info className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                   Подкатегории "О предприятии"
                               </h3>
                           </div>
                       </div>
                       )}

                       {/* Подкатегории "Аэронавигационная информация" - AIRNAV_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageAirNav && (
                           <div
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'aeronautical-info-categories'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('aeronautical-info-categories')}
                           >
                               <div className="text-center">
                                   <Plane className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Подкатегории "Аэронавигационная информация"
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Подкатегории "Обращения" - APPEALS_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageAppeals && (
                           <div
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'appeals-categories'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('appeals-categories')}
                           >
                               <div className="text-center">
                                   <Mail className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Подкатегории "Обращения"
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Подкатегории "Услуги" - SERVICES_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageServices && (
                           <div
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'services-categories'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('services-categories')}
                           >
                               <div className="text-center">
                                   <Settings className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Подкатегории "Услуги"
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Заявки на услуги - SERVICES_ADMIN и SUPER_ADMIN */}
                       {permissions.canManageServices && (
                           <div
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'service-requests'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('service-requests')}
                           >
                               <div className="text-center">
                                   <Mail className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Заявки на услуги
                                   </h3>
                               </div>
                           </div>
                       )}

                       {/* Записи на приемы - MEDIA_ADMIN и SUPER_ADMIN */}
                       {(permissions.canManageManagement || permissions.canManageRoles) && (
                           <div
                               className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 ${
                                   activeTab === 'reception-bookings'
                                       ? 'border-[#2A52BE] bg-[#E8F0FF]'
                                       : 'border-gray-200 hover:border-[#2A52BE]'
                               }`}
                               onClick={() => setActiveTab('reception-bookings')}
                           >
                               <div className="text-center">
                                   <Calendar className={`w-8 h-8 mx-auto mb-3 text-[#213659]`} />
                                   <h3 className={`font-semibold text-sm text-[#213659]`}>
                                       Записи на приемы
                                   </h3>
                               </div>
                           </div>
                       )}
                   </div>

            {/* Контент вкладок */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                {activeTab === 'statistics' && permissions.canManageRoles && <StatisticsPanel />}
                {activeTab === 'roles' && permissions.canManageRoles && <RolesPanel />}
                {activeTab === 'content-roles' && permissions.canManageRoles && <ContentRolesPanel />}
                {activeTab === 'users' && permissions.canManageUsers && <UsersPanel />}
                {activeTab === 'categories' && permissions.canManageNews && <CategoriesAdminPage />}
                {activeTab === 'branches' && permissions.canManageBranches && <BranchManagement />}
                {activeTab === 'news' && permissions.canManageNews && <NewsManagement />}
                {activeTab === 'management' && permissions.canManageManagement && <ManagementManagement />}
                {activeTab === 'vacancies' && permissions.canManageVacancies && <VacancyManagement />}
                {activeTab === 'resumes' && permissions.canManageVacancies && <ResumeManagement />}
                {activeTab === 'logos' && permissions.canManageLogos && <OrganizationLogoManagement />}
                {activeTab === 'social-categories' && permissions.canManageSocial && <SocialWorkCategoryManagement />}
                {activeTab === 'about-company-categories' && permissions.canManageAbout && <AboutCompanyCategoryManagement />}
                {activeTab === 'aeronautical-info-categories' && permissions.canManageAirNav && <AeronauticalInfoCategoryManagement />}
                {activeTab === 'appeals-categories' && permissions.canManageAppeals && <AppealsCategoryManagement />}
                {activeTab === 'services-categories' && permissions.canManageServices && <ServicesCategoryManagement />}
                {activeTab === 'service-requests' && permissions.canManageServices && <ServiceRequestManagement />}
                {activeTab === 'hero-image' && (permissions.canManageRoles || permissions.canManageHomePage) && <HeroImageManagement />}
                {(activeTab === 'reception-bookings' && (permissions.canManageManagement || permissions.canManageRoles)) && <ReceptionBookingsCalendar />}
            </div>
        </div>
    );
}

function RolesPanel() {
    // Вкладка только для просмотра системных ролей (read-only)
    const { data: roles, isLoading, isError, error } = useGetRolesQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    const coreRolesOrder = [
        'SUPER_ADMIN',
        'NEWS_ADMIN',
        'ABOUT_ADMIN',
        'SERVICES_ADMIN',
        'AIRNAV_ADMIN',
        'APPEALS_ADMIN',
        'SOCIAL_ADMIN',
        'MEDIA_ADMIN',
        'USER',
    ];

    const sortedRoles = roles
        ? [...roles].sort((a: any, b: any) => {
            const ia = coreRolesOrder.indexOf((a.name || '').toUpperCase());
            const ib = coreRolesOrder.indexOf((b.name || '').toUpperCase());
            if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        })
        : [];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#213659] mb-2">Системные роли (только чтение)</h2>
                <p className="text-gray-600">
                    Эти роли используются для прав доступа в системе. Их нельзя редактировать из панели администратора.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#213659]">Список ролей</h3>
                {isLoading && <div className="text-center py-4 text-gray-500">Загрузка ролей...</div>}
                {isError && (
                    <div className="text-center py-4 text-red-500">
                        Ошибка загрузки ролей: {error ? ('data' in error && error.data ? JSON.stringify(error.data) : 'Неизвестная ошибка') : 'Неизвестная ошибка'}
                    </div>
                )}
                {!isLoading && !isError && (!roles || roles.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                        Роли не найдены
                    </div>
                )}
                {!isLoading && !isError && sortedRoles.length > 0 && sortedRoles.map((r: any) => (
                    <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 border border-gray-200 p-4 bg-white rounded-lg"
                    >
                        <div>
                            <div className="text-[#213659] font-medium uppercase tracking-wide">{r.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                ID: {r.id}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">
                            Только для чтения
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContentRolesPanel() {
    // Вкладка для создания / редактирования ролей доступа к контенту
    const { data: roles, isLoading, isError, error } = useGetRolesQuery(undefined, {
        refetchOnMountOrArgChange: true
    });
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [newRoleName, setNewRoleName] = useState("");

    const coreRoles = [
        'SUPER_ADMIN',
        'NEWS_ADMIN',
        'ABOUT_ADMIN',
        'SERVICES_ADMIN',
        'AIRNAV_ADMIN',
        'APPEALS_ADMIN',
        'SOCIAL_ADMIN',
        'MEDIA_ADMIN',
        'USER',
    ];

    const save = async () => {
        if (!editingId) return;
        const name = editingName.trim().toUpperCase();
        if (!name) return;
        try {
            await updateRole({ id: editingId, name }).unwrap();
            toast.success("Роль обновлена");
            setEditingId(null); setEditingName("");
        } catch (e: any) { toast.error(e.data?.error || "Ошибка"); }
    };

    const remove = async (id: number, name: string) => {
        const upper = (name || '').toUpperCase();
        if (coreRoles.includes(upper)) {
            toast.error("Системные роли удалить нельзя");
            return;
        }
        if (!confirm(`Удалить роль "${name}"?`)) return;
        try { 
            await deleteRole(id).unwrap(); 
            toast.success("Роль удалена");
        }
        catch (e: any) { toast.error(e.data?.error || "Ошибка"); }
    };

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newRoleName.trim().toUpperCase();
        if (!name) {
            toast.error("Введите название роли");
            return;
        }
        if (coreRoles.includes(name)) {
            toast.error("Эта роль зарезервирована системой");
            return;
        }
        try {
            await createRole({ name }).unwrap();
            toast.success("Роль создана");
            setNewRoleName("");
        } catch (e: any) {
            toast.error(e.data?.error || "Ошибка создания роли");
        }
    };

    const contentRoles = roles
        ? roles.filter((r: any) => !coreRoles.includes((r.name || '').toUpperCase()))
        : [];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#213659] mb-2">Роли доступа к контенту</h2>
                <p className="text-gray-600">
                    Здесь вы можете создать дополнительные роли, которые будут использоваться для ограничения доступа к блокам контента.
                </p>
            </div>

            {/* Создание новой роли */}
            <form onSubmit={create} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex-1">
                    <Label className="text-sm text-[#213659]">Название новой роли</Label>
                    <Input
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Например: CONTENT_MANAGERS"
                        className="mt-1 bg-white border-[#B1D1E0] focus:border-[#213659]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Рекомендуется использовать ЛАТИНСКИЕ БУКВЫ и подчеркивания (например, CONTENT_PILOTS).
                    </p>
                </div>
                <Button
                    type="submit"
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                    disabled={isCreating}
                >
                    {isCreating ? 'Создание...' : 'Создать роль'}
                </Button>
            </form>

            {/* Список ролей */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#213659]">Дополнительные роли</h3>
                {isLoading && <div className="text-center py-4 text-gray-500">Загрузка ролей...</div>}
                {isError && (
                    <div className="text-center py-4 text-red-500">
                        Ошибка загрузки ролей: {error ? ('data' in error && error.data ? JSON.stringify(error.data) : 'Неизвестная ошибка') : 'Неизвестная ошибка'}
                    </div>
                )}
                {!isLoading && !isError && contentRoles.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        Пока нет дополнительных ролей. Создайте первую роль выше.
                    </div>
                )}
                {!isLoading && !isError && contentRoles.length > 0 && contentRoles.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-3 border border-gray-200 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                        {editingId === r.id ? (
                            <>
                                <Input 
                                    value={editingName} 
                                    onChange={(e)=>setEditingName(e.target.value)} 
                                    className="bg-white border-[#B1D1E0] focus:border-[#213659] flex-1"
                                />
                                <Button onClick={save} className="bg-[#213659] hover:bg-[#1a2a4a] text-white" disabled={isUpdating}>
                                    <Save className="w-4 h-4 mr-1"/>
                                    {isUpdating ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                                <Button variant="outline" onClick={()=>{setEditingId(null); setEditingName("")}}>
                                    Отмена
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 text-[#213659] font-medium">{r.name}</div>
                                <Button variant="outline" size="sm" onClick={()=>{setEditingId(r.id); setEditingName(r.name)}}>
                                    <Edit className="w-4 h-4 mr-1"/>
                                    Редактировать
                                </Button>
                                <Button variant="destructive" size="sm" onClick={()=>remove(r.id, r.name)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersPanel() {
    const { data: users, refetch } = useGetAllUsersQuery();
    const { data: roles, isLoading: isLoadingRoles, isError: isErrorRoles } = useGetRolesQuery(undefined, {
        refetchOnMountOrArgChange: true
    });
    const [updateUser, { isLoading }] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [register] = useRegisterMutation();

    const [selected, setSelected] = useState<Record<number, string>>({});
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [createdDateFrom, setCreatedDateFrom] = useState("");
    const [createdDateTo, setCreatedDateTo] = useState("");
    const [lastLoginDateFrom, setLastLoginDateFrom] = useState("");
    const [lastLoginDateTo, setLastLoginDateTo] = useState("");


    const save = async (id: number) => {
        const roleName = selected[id];
        if (!roleName) return;
        try {
            await updateUser({ id, userData: { role: roleName } }).unwrap();
            toast.success("Роль пользователя обновлена");
            refetch();
        } catch (e: any) {
            toast.error(e.data?.error || "Ошибка обновления роли");
        }
    };

    const onDelete = async (id: number) => {
        if (!confirm('Удалить пользователя?')) return;
        try {
            await deleteUser(id).unwrap();
            toast.success('Пользователь удален');
            refetch();
        } catch (e: any) {
            toast.error(e.data?.error || 'Ошибка удаления пользователя');
        }
    };

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Отладочная информация
        console.log('Creating user with data:', newUser);
        console.log('FirstName:', newUser.firstName, 'LastName:', newUser.lastName, 'Email:', newUser.email, 'Password:', newUser.password, 'Role:', newUser.role);
        
        // Упрощенная проверка полей
        if (!newUser.firstName || newUser.firstName.trim() === '') {
            toast.error('Введите имя');
            return;
        }
        if (!newUser.lastName || newUser.lastName.trim() === '') {
            toast.error('Введите фамилию');
            return;
        }
        if (!newUser.email || newUser.email.trim() === '') {
            toast.error('Введите email');
            return;
        }
        if (!newUser.password || newUser.password.trim() === '') {
            toast.error('Введите пароль');
            return;
        }
        if (!newUser.role || newUser.role.trim() === '') {
            toast.error('Выберите роль');
            return;
        }
        
        try {
            await register(newUser).unwrap();
            toast.success('Пользователь создан');
            setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "" });
            refetch();
        } catch (e: any) {
            toast.error(e.data?.error || 'Ошибка создания пользователя');
        }
    };

    // Фильтрация и поиск пользователей
    const filteredUsers = users?.users?.filter((user: any) => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = !roleFilter || user.role?.name === roleFilter;
        
        // Фильтр по дате создания
        let matchesCreatedDate = true;
        if (createdDateFrom || createdDateTo) {
            const userCreatedDate = user.createdAt ? new Date(user.createdAt) : null;
            if (userCreatedDate) {
                if (createdDateFrom) {
                    const fromDate = new Date(createdDateFrom);
                    fromDate.setHours(0, 0, 0, 0);
                    if (userCreatedDate < fromDate) {
                        matchesCreatedDate = false;
                    }
                }
                if (createdDateTo) {
                    const toDate = new Date(createdDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (userCreatedDate > toDate) {
                        matchesCreatedDate = false;
                    }
                }
            } else {
                matchesCreatedDate = false;
            }
        }
        
        // Фильтр по дате последнего входа
        let matchesLastLogin = true;
        if (lastLoginDateFrom || lastLoginDateTo) {
            const userLastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
            if (userLastLogin) {
                if (lastLoginDateFrom) {
                    const fromDate = new Date(lastLoginDateFrom);
                    fromDate.setHours(0, 0, 0, 0);
                    if (userLastLogin < fromDate) {
                        matchesLastLogin = false;
                    }
                }
                if (lastLoginDateTo) {
                    const toDate = new Date(lastLoginDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (userLastLogin > toDate) {
                        matchesLastLogin = false;
                    }
                }
            } else {
                // Если фильтр установлен, но у пользователя нет даты входа, исключаем его
                if (lastLoginDateFrom || lastLoginDateTo) {
                    matchesLastLogin = false;
                }
            }
        }
        
        return matchesSearch && matchesRole && matchesCreatedDate && matchesLastLogin;
    }) || [];

    // Получение уникальных ролей для фильтра
    // Используем роли из запроса roles, если они доступны, иначе из пользователей
    const availableRoles = roles && roles.length > 0 
        ? roles.map((role: any) => role.name)
        : (users?.users ? [...new Set(users.users.map((user: any) => user.role?.name).filter(Boolean))] : []);

    return (
        <div className="space-y-6">
            <div className="text-center">
                       <h2 className="text-2xl font-bold text-[#213659] mb-2">Управление пользователями</h2>
                <p className="text-gray-600">Создание, изменение ролей и удаление пользователей</p>
            </div>

            <div className="space-y-6">
                <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <Input required placeholder="Имя" value={newUser.firstName} onChange={(e)=>setNewUser({ ...newUser, firstName: e.target.value })} />
                    <Input required placeholder="Фамилия" value={newUser.lastName} onChange={(e)=>setNewUser({ ...newUser, lastName: e.target.value })} />
                    <Input required type="email" placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser({ ...newUser, email: e.target.value })} />
                    <Input required type="password" placeholder="Пароль" value={newUser.password} onChange={(e)=>setNewUser({ ...newUser, password: e.target.value })} />
                    <Select 
                        value={newUser.role || ""} 
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingRoles ? "Загрузка ролей..." : isErrorRoles ? "Ошибка загрузки ролей" : "Выберите роль"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                            {isLoadingRoles && <SelectItem value="loading" disabled>Загрузка...</SelectItem>}
                            {isErrorRoles && <SelectItem value="error" disabled>Ошибка загрузки ролей</SelectItem>}
                            {!isLoadingRoles && !isErrorRoles && (!roles || roles.length === 0) && <SelectItem value="empty" disabled>Роли не найдены</SelectItem>}
                            {!isLoadingRoles && !isErrorRoles && roles && roles.length > 0 && roles.map((role) => (
                                <SelectItem key={role.id} value={role.name} className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        type="submit" 
                        className="bg-[#213659] hover:bg-[#213659] text-white"
                        disabled={!newUser.firstName?.trim() || !newUser.lastName?.trim() || !newUser.email?.trim() || !newUser.password?.trim() || !newUser.role?.trim()}
                    >
                        Создать пользователя
                    </Button>
                </form>

                {/* Поиск и фильтрация */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="search" className="text-sm font-medium text-[#213659] mb-2 block">Поиск по email или имени</Label>
                            <Input
                                id="search"
                                placeholder="Введите email или имя..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="roleFilter" className="text-sm font-medium text-[#213659] mb-2 block">Фильтр по роли</Label>
                            <div className="flex gap-2">
                                <Select value={roleFilter || undefined} onValueChange={setRoleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Все роли" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role} value={role} className="focus:bg-[#EFF6FF] focus:text-[#213659]">{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {roleFilter && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setRoleFilter("")}
                                        className="px-3"
                                    >
                                        Очистить
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Фильтры по датам */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <Label className="text-sm font-medium text-[#213659] mb-2 block">Фильтр по дате создания</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="createdFrom" className="text-xs text-gray-600 mb-1 block">От</Label>
                                    <Input
                                        id="createdFrom"
                                        type="date"
                                        value={createdDateFrom}
                                        onChange={(e) => setCreatedDateFrom(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="createdTo" className="text-xs text-gray-600 mb-1 block">До</Label>
                                    <Input
                                        id="createdTo"
                                        type="date"
                                        value={createdDateTo}
                                        onChange={(e) => setCreatedDateTo(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            {(createdDateFrom || createdDateTo) && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setCreatedDateFrom("");
                                        setCreatedDateTo("");
                                    }}
                                    className="mt-2 w-full"
                                >
                                    Очистить фильтр по дате создания
                                </Button>
                            )}
                        </div>
                        
                        <div>
                            <Label className="text-sm font-medium text-[#213659] mb-2 block">Фильтр по дате последнего входа</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="lastLoginFrom" className="text-xs text-gray-600 mb-1 block">От</Label>
                                    <Input
                                        id="lastLoginFrom"
                                        type="date"
                                        value={lastLoginDateFrom}
                                        onChange={(e) => setLastLoginDateFrom(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastLoginTo" className="text-xs text-gray-600 mb-1 block">До</Label>
                                    <Input
                                        id="lastLoginTo"
                                        type="date"
                                        value={lastLoginDateTo}
                                        onChange={(e) => setLastLoginDateTo(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            {(lastLoginDateFrom || lastLoginDateTo) && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setLastLoginDateFrom("");
                                        setLastLoginDateTo("");
                                    }}
                                    className="mt-2 w-full"
                                >
                                    Очистить фильтр по дате входа
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

            <div className="space-y-3">
                       <h3 className="text-lg font-semibold text-[#213659]">
                           Список пользователей 
                           {filteredUsers.length !== users?.users?.length && (
                               <span className="text-sm text-gray-500 ml-2">
                                   (показано {filteredUsers.length} из {users?.users?.length})
                               </span>
                           )}
                       </h3>
                    {!filteredUsers.length ? (
                    <div className="text-center py-8 text-[#6A81A9] bg-gray-50 rounded-lg">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>{searchTerm || roleFilter ? 'Пользователи не найдены' : 'Нет пользователей'}</p>
                    </div>
                    ) : filteredUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 border border-gray-200 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                               <div className="text-[#213659] font-medium">{u.email}</div>
                            <div className="text-sm text-gray-500 mb-1">
                                {u.firstName && u.lastName && `${u.firstName} ${u.lastName} • `}
                                Текущая роль: {u.role?.name || 'Не назначена'}
                            </div>
                            <div className="text-xs text-gray-400 space-y-0.5">
                                <div>
                                    Дата создания: {u.createdAt ? new Date(u.createdAt).toLocaleString('ru-RU', { 
                                        year: 'numeric', 
                                        month: '2-digit', 
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Не указана'}
                                </div>
                                <div>
                                    Последний вход: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ru-RU', { 
                                        year: 'numeric', 
                                        month: '2-digit', 
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Никогда'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select 
                                value={selected[u.id] || ""} 
                                onValueChange={(value) => setSelected({ ...selected, [u.id]: value })}
                            >
                                <SelectTrigger className="w-60 bg-white border-[#B1D1E0] focus:border-[#213659]">
                                    <SelectValue placeholder={isLoadingRoles ? "Загрузка ролей..." : isErrorRoles ? "Ошибка загрузки ролей" : "Выберите новую роль"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingRoles && <SelectItem value="loading" disabled>Загрузка...</SelectItem>}
                                    {isErrorRoles && <SelectItem value="error" disabled>Ошибка загрузки ролей</SelectItem>}
                                    {!isLoadingRoles && !isErrorRoles && (!roles || roles.length === 0) && <SelectItem value="empty" disabled>Роли не найдены</SelectItem>}
                                    {!isLoadingRoles && !isErrorRoles && roles && roles.length > 0 && roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={()=>save(u.id)} 
                                       className="bg-[#2A52BE] hover:bg-[#1e3a8a]"
                                disabled={isLoading || !selected[u.id]}
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                            <Button type="button" onClick={()=>onDelete(u.id)} className="bg-red-600 hover:bg-red-700 text-white">Удалить</Button>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
