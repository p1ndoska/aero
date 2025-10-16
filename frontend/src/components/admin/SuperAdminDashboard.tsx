import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Save, FolderOpen, Users, Building2, Newspaper, UserCheck, Briefcase, Building, Heart, Info, Plane, Mail, Settings } from "lucide-react";
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
        if (permissions.canManageRoles) return 'roles';
        if (permissions.canManageUsers) return 'users';
        if (permissions.canManageNews) return 'categories';
        if (permissions.canManageBranches) return 'branches';
        if (permissions.canManageNews) return 'news';
        if (permissions.canManageManagement) return 'management';
        if (permissions.canManageVacancies) return 'vacancies';
        if (permissions.canManageLogos) return 'logos';
        if (permissions.canManageSocial) return 'social-categories';
        if (permissions.canManageAbout) return 'about-company-categories';
        if (permissions.canManageAirNav) return 'aeronautical-info-categories';
        if (permissions.canManageAppeals) return 'appeals-categories';
        if (permissions.canManageServices) return 'services-categories';
        return 'roles';
    };

    const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'categories' | 'branches' | 'news' | 'management' | 'vacancies' | 'logos' | 'social-categories' | 'about-company-categories' | 'aeronautical-info-categories' | 'appeals-categories' | 'services-categories'>(getFirstAvailableTab());

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
                   </div>

            {/* Контент вкладок */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                {activeTab === 'roles' && permissions.canManageRoles && <RolesPanel />}
                {activeTab === 'users' && permissions.canManageUsers && <UsersPanel />}
                {activeTab === 'categories' && permissions.canManageNews && <CategoriesAdminPage />}
                {activeTab === 'branches' && permissions.canManageBranches && <BranchManagement />}
                {activeTab === 'news' && permissions.canManageNews && <NewsManagement />}
                {activeTab === 'management' && permissions.canManageManagement && <ManagementManagement />}
                {activeTab === 'vacancies' && permissions.canManageVacancies && <VacancyManagement />}
                {activeTab === 'logos' && permissions.canManageLogos && <OrganizationLogoManagement />}
                {activeTab === 'social-categories' && permissions.canManageSocial && <SocialWorkCategoryManagement />}
                {activeTab === 'about-company-categories' && permissions.canManageAbout && <AboutCompanyCategoryManagement />}
                {activeTab === 'aeronautical-info-categories' && permissions.canManageAirNav && <AeronauticalInfoCategoryManagement />}
                {activeTab === 'appeals-categories' && permissions.canManageAppeals && <AppealsCategoryManagement />}
                {activeTab === 'services-categories' && permissions.canManageServices && <ServicesCategoryManagement />}
            </div>
        </div>
    );
}

function RolesPanel() {
    const { data: roles, refetch } = useGetRolesQuery();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const [newRole, setNewRole] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newRole.trim().toUpperCase();
        if (!name) return;
        try {
            await createRole({ name }).unwrap();
            toast.success("Роль создана");
            setNewRole("");
            refetch();
        } catch (e: any) { toast.error(e.data?.error || "Ошибка"); }
    };

    const save = async () => {
        if (!editingId) return;
        const name = editingName.trim().toUpperCase();
        if (!name) return;
        try {
            await updateRole({ id: editingId, name }).unwrap();
            toast.success("Роль обновлена");
            setEditingId(null); setEditingName(""); refetch();
        } catch (e: any) { toast.error(e.data?.error || "Ошибка"); }
    };

    const remove = async (id: number) => {
        if (!confirm("Удалить роль?")) return;
        try { await deleteRole(id).unwrap(); toast.success("Удалено"); refetch(); }
        catch (e: any) { toast.error(e.data?.error || "Ошибка"); }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                       <h2 className="text-2xl font-bold text-[#213659] mb-2">Управление ролями</h2>
                <p className="text-gray-600">Создавайте и редактируйте роли пользователей</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <form onSubmit={add} className="flex items-end gap-3">
                    <div className="flex-1">
                               <Label className="text-[#213659] font-medium">Название роли</Label>
                               <Input
                                   value={newRole}
                                   onChange={(e)=>setNewRole(e.target.value)}
                                   className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                                   placeholder="Введите название роли"
                               />
                    </div>
                           <Button type="submit" className="bg-[#213659] hover:bg-[#1a2a4a] text-white" disabled={isCreating}>
                        <Plus className="w-4 h-4 mr-2"/>
                        {isCreating ? 'Создание...' : 'Создать'}
                    </Button>
                </form>
            </div>

            <div className="space-y-3">
                       <h3 className="text-lg font-semibold text-[#213659]">Существующие роли</h3>
                {roles?.map((r)=> (
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
                                <Button variant="destructive" size="sm" onClick={()=>remove(r.id)}>
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
    const { data: roles } = useGetRolesQuery();
    const [updateUser, { isLoading }] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [register] = useRegisterMutation();

    const [selected, setSelected] = useState<Record<number, string>>({});
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

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
        return matchesSearch && matchesRole;
    }) || [];

    // Получение уникальных ролей для фильтра
    const availableRoles = users?.users ? [...new Set(users.users.map((user: any) => user.role?.name).filter(Boolean))] : [];

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
                        value={newUser.role || undefined} 
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles?.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        type="submit" 
                        className="bg-[#2A52BE] hover:bg-[#1e3a8a]"
                        disabled={!newUser.firstName?.trim() || !newUser.lastName?.trim() || !newUser.email?.trim() || !newUser.password?.trim() || !newUser.role?.trim()}
                    >
                        Создать пользователя
                    </Button>
                </form>

                {/* Поиск и фильтрация */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg bg-white">
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
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
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
                            <div className="text-sm text-gray-500">
                                {u.firstName && u.lastName && `${u.firstName} ${u.lastName} • `}
                                Текущая роль: {u.role?.name || 'Не назначена'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select 
                                value={selected[u.id] || undefined} 
                                onValueChange={(value) => setSelected({ ...selected, [u.id]: value })}
                            >
                                <SelectTrigger className="w-60 bg-white border-[#B1D1E0] focus:border-[#213659]">
                                    <SelectValue placeholder="Выберите новую роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles?.map((role) => (
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
