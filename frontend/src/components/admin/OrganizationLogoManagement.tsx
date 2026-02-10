import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Move, Link, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllOrganizationLogosQuery, useCreateOrganizationLogoMutation, useUpdateOrganizationLogoMutation, useDeleteOrganizationLogoMutation, useUpdateLogosOrderMutation } from '@/app/services/organizationLogoApi';
import { useUploadImageMutation } from '@/app/services/uploadApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { canAccessAdminPanel } from '@/utils/roleUtils';
import { getTranslatedField } from '../../utils/translationHelpers';
import { INTERNAL_PAGES, getPagesByCategory } from '../../utils/internalPages';
import LogoUpload from './LogoUpload';

interface OrganizationLogoFormData {
  name: string;
  nameEn: string;
  nameBe: string;
  logoUrl: string;
  internalPath: string;
  isActive: boolean;
  sortOrder: number;
}

const initialFormData: OrganizationLogoFormData = {
  name: '',
  nameEn: '',
  nameBe: '',
  logoUrl: '',
  internalPath: '',
  isActive: true,
  sortOrder: 0
};

export default function OrganizationLogoManagement() {
  const { language } = useLanguage();
  const { data: logos, refetch, isLoading, error } = useGetAllOrganizationLogosQuery();
  const [createLogo] = useCreateOrganizationLogoMutation();
  const [updateLogo] = useUpdateOrganizationLogoMutation();
  const [deleteLogo] = useDeleteOrganizationLogoMutation();
  const [updateOrder] = useUpdateLogosOrderMutation();
  const [uploadImage] = useUploadImageMutation();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = canAccessAdminPanel(roleName);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [formData, setFormData] = useState<OrganizationLogoFormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);

  // Принудительное обновление данных при монтировании компонента
  useEffect(() => {
    console.log('OrganizationLogoManagement: Component mounted, refetching data...');
    refetch();
  }, [refetch]);

  // Прослушивание события принудительного обновления
  useEffect(() => {
    const handleRefresh = () => {
      console.log('OrganizationLogoManagement: Received refresh event, refetching data...');
      refetch();
    };

    window.addEventListener('refresh-organization-logos', handleRefresh);
    return () => {
      window.removeEventListener('refresh-organization-logos', handleRefresh);
    };
  }, [refetch]);

  // Отладочная информация
  useEffect(() => {
    console.log('OrganizationLogoManagement: Data state changed:', { 
      logos: logos?.length || 0, 
      isLoading, 
      error: !!error 
    });
    
    if (logos && logos.length > 0) {
      console.log('OrganizationLogoManagement: Logo URLs:', logos.map(logo => ({
        id: logo.id,
        name: logo.name,
        logoUrl: logo.logoUrl,
        isActive: logo.isActive
      })));
    }
  }, [logos, isLoading, error]);

  const handleFileUpload = async (file: File) => {
    // Проверка размера файла (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB в байтах
    if (file.size > maxSize) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверка типа файла
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Поддерживаются только файлы: PNG, JPG, JPEG, GIF');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadImage(formData).unwrap();
      setFormData(prev => ({ ...prev, logoUrl: response.url }));
      toast.success('Файл успешно загружен');
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateLogo = async () => {
    // Валидация обязательных полей
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Название организации (Русский) обязательно для заполнения');
      return;
    }
    
    if (!formData.logoUrl || formData.logoUrl.trim() === '') {
      toast.error('Логотип организации обязателен для загрузки');
      return;
    }
    
    try {
      await createLogo(formData).unwrap();
      toast.success('Логотип организации успешно создан');
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании логотипа');
    }
  };

  const handleUpdateLogo = async () => {
    if (!editingLogo) return;
    
    // Валидация обязательных полей
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Название организации (Русский) обязательно для заполнения');
      return;
    }
    
    try {
      await updateLogo({ id: editingLogo.id, body: formData }).unwrap();
      toast.success('Логотип организации успешно обновлен');
      setFormData(initialFormData);
      setIsEditDialogOpen(false);
      setEditingLogo(null);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении логотипа');
    }
  };

  const handleDeleteLogo = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот логотип?')) {
      try {
        await deleteLogo(id).unwrap();
        toast.success('Логотип организации успешно удален');
        refetch();
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при удалении логотипа');
      }
    }
  };

  const handleEditLogo = (logo: any) => {
    setEditingLogo(logo);
    setFormData({
      name: logo.name || '',
      nameEn: logo.nameEn || '',
      nameBe: logo.nameBe || '',
      logoUrl: logo.logoUrl || '',
      internalPath: logo.internalPath || '',
      isActive: logo.isActive,
      sortOrder: logo.sortOrder
    });
    setIsEditDialogOpen(true);
  };

  const handleMoveUp = async (index: number) => {
    if (!logos || index === 0) return;
    
    const newLogos = [...logos];
    [newLogos[index], newLogos[index - 1]] = [newLogos[index - 1], newLogos[index]];
    
    const updateData = newLogos.map((logo, idx) => ({
      id: logo.id,
      sortOrder: idx
    }));
    
    try {
      await updateOrder({ logos: updateData }).unwrap();
      refetch();
    } catch (error: any) {
      toast.error('Ошибка при изменении порядка');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!logos || index === logos.length - 1) return;
    
    const newLogos = [...logos];
    [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
    
    const updateData = newLogos.map((logo, idx) => ({
      id: logo.id,
      sortOrder: idx
    }));
    
    try {
      await updateOrder({ logos: updateData }).unwrap();
      refetch();
    } catch (error: any) {
      toast.error('Ошибка при изменении порядка');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для доступа к этой странице.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка логотипов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">Не удалось загрузить логотипы организаций.</p>
          <Button onClick={() => refetch()} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Управление логотипами организаций</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить логотип
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos && logos.length > 0 ? logos.map((logo, index) => (
          <Card key={logo.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg break-words">
                  {getTranslatedField(logo, 'name', language)}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === (logos?.length || 0) - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={logo.isActive ? "default" : "secondary"}>
                  {logo.isActive ? 'Активна' : 'Неактивна'}
                </Badge>
                <Badge variant="outline">Порядок: {logo.sortOrder}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                    {logo.logoUrl && logo.logoUrl.trim() !== '' ? (
                      <img
                        src={logo.logoUrl}
                        alt={getTranslatedField(logo, 'name', language)}
                        className="max-w-full max-h-full object-contain"
                        onLoad={() => {
                          console.log('OrganizationLogoManagement: Image loaded successfully:', logo.logoUrl);
                        }}
                        onError={(e) => {
                          console.error('OrganizationLogoManagement: Image failed to load:', logo.logoUrl, e);
                          e.currentTarget.style.display = 'none';
                          // Показываем заглушку вместо скрытия
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                                <div class="text-center">
                                  <div class="text-2xl mb-1">📷</div>
                                  <div>Ошибка загрузки</div>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏢</div>
                          <div>Нет логотипа</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {logo.internalPath && logo.internalPath !== "" && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      <Link className="w-3 h-3 mr-1" />
                      Внутренняя ссылка
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {INTERNAL_PAGES.find(page => page.value === logo.internalPath)?.label || logo.internalPath}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLogo(logo)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteLogo(logo.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет логотипов организаций</h3>
            <p className="text-gray-500 mb-4">Добавьте первый логотип организации, чтобы начать работу.</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить логотип
            </Button>
          </div>
        )}
      </div>

      {/* Диалог создания логотипа */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Добавить логотип организации</DialogTitle>
            <DialogDescription>
              Заполните информацию о логотипе организации для отображения на главной странице.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateLogo(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название организации (Русский) *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название организации"
                  required
                />
              </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название организации (Английский)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название организации (Белорусский)</label>
              <Input
                value={formData.nameBe}
                onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
                placeholder="Назва арганізацыі"
              />
            </div>
            <LogoUpload
              logoUrl={formData.logoUrl}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              uploadId="logo-upload"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Внутренняя страница сайта</label>
              <Select
                value={formData.internalPath || "none"}
                onValueChange={(value) => setFormData({ ...formData, internalPath: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страницу сайта" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="none">Без ссылки</SelectItem>
                  {Object.entries(getPagesByCategory()).map(([category, pages]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category === 'about' ? 'О компании' : 
                         category === 'social' ? 'Социальная работа' : 
                         category === 'news' ? 'Новости' : 'Другое'}
                      </div>
                      {pages.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Порядок сортировки</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                >
                  Создать
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования логотипа */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать логотип организации</DialogTitle>
            <DialogDescription>
              Измените информацию о логотипе организации.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateLogo(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название организации (Русский) *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название организации"
                  required
                />
              </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название организации (Английский)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название организации (Белорусский)</label>
              <Input
                value={formData.nameBe}
                onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
                placeholder="Назва арганізацыі"
              />
            </div>
            <LogoUpload
              logoUrl={formData.logoUrl}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              uploadId="logo-upload-edit"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Внутренняя страница сайта</label>
              <Select
                value={formData.internalPath || "none"}
                onValueChange={(value) => setFormData({ ...formData, internalPath: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страницу сайта" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="none">Без ссылки</SelectItem>
                  {Object.entries(getPagesByCategory()).map(([category, pages]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category === 'about' ? 'О компании' : 
                         category === 'social' ? 'Социальная работа' : 
                         category === 'news' ? 'Новости' : 'Другое'}
                      </div>
                      {pages.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium">Активна</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Порядок сортировки</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-24"
                />
              </div>
            </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
