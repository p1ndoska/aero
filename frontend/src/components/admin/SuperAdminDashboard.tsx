import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Save, FolderOpen, Users, Building2, Newspaper, UserCheck, Briefcase, Building, Heart, Info, Plane, Mail, Settings } from "lucide-react";
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from "@/app/services/roleApi";
import { useGetAllUsersQuery, useUpdateUserMutation } from "@/app/services/userApi";
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
    const isSuper = roleName.toString().toUpperCase() === 'SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'categories' | 'branches' | 'news' | 'management' | 'vacancies' | 'logos' | 'social-categories' | 'about-company-categories' | 'aeronautical-info-categories' | 'appeals-categories' | 'services-categories'>('roles');

    // Принудительное обновление данных при переключении на вкладку логотипов
    useEffect(() => {
        if (activeTab === 'logos') {
            console.log('SuperAdminDashboard: Switched to logos tab, forcing data refresh...');
            // Принудительно обновляем данные для логотипов
            window.dispatchEvent(new CustomEvent('refresh-organization-logos'));
        }
    }, [activeTab]);

    if (!isSuper) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card><CardContent className="pt-6 text-center text-red-600">Доступ запрещен</CardContent></Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
                   {/* Навигационные кнопки в виде закругленных белых квадратов */}
                   <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
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
                   </div>

            {/* Контент вкладок */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                {activeTab === 'roles' && <RolesPanel />}
                {activeTab === 'users' && <UsersPanel />}
                {activeTab === 'categories' && <CategoriesAdminPage />}
                {activeTab === 'branches' && <BranchManagement />}
                {activeTab === 'news' && <NewsManagement />}
                {activeTab === 'management' && <ManagementManagement />}
                {activeTab === 'vacancies' && <VacancyManagement />}
                {activeTab === 'logos' && <OrganizationLogoManagement />}
                {activeTab === 'social-categories' && <SocialWorkCategoryManagement />}
                {activeTab === 'about-company-categories' && <AboutCompanyCategoryManagement />}
                {activeTab === 'aeronautical-info-categories' && <AeronauticalInfoCategoryManagement />}
                {activeTab === 'appeals-categories' && <AppealsCategoryManagement />}
                {activeTab === 'services-categories' && <ServicesCategoryManagement />}
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
    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const [selected, setSelected] = useState<Record<number, string>>({});

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

    return (
        <div className="space-y-6">
            <div className="text-center">
                       <h2 className="text-2xl font-bold text-[#213659] mb-2">Управление пользователями</h2>
                <p className="text-gray-600">Изменяйте роли пользователей системы</p>
            </div>

            <div className="space-y-3">
                       <h3 className="text-lg font-semibold text-[#213659]">Список пользователей</h3>
                {!users?.users?.length ? (
                    <div className="text-center py-8 text-[#6A81A9] bg-gray-50 rounded-lg">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Нет пользователей</p>
                    </div>
                ) : users.users.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 border border-gray-200 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                               <div className="text-[#213659] font-medium">{u.email}</div>
                            <div className="text-sm text-gray-500">Текущая роль: {u.role?.name || 'Не назначена'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Новая роль" 
                                value={selected[u.id] ?? ""} 
                                       onChange={(e)=>setSelected({ ...selected, [u.id]: e.target.value })}
                                       className="w-60 bg-white border-[#B1D1E0] focus:border-[#213659]"
                            />
                            <Button 
                                onClick={()=>save(u.id)} 
                                       className="bg-[#2A52BE] hover:bg-[#1e3a8a]"
                                disabled={isLoading || !selected[u.id]}
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
