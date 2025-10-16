import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllSocialWorkCategoriesQuery, useCreateSocialWorkCategoryMutation, useUpdateSocialWorkCategoryMutation, useDeleteSocialWorkCategoryMutation } from '@/app/services/socialWorkCategoryApi';
import { canAccessAdminPanel } from '@/utils/roleUtils';

interface SocialWorkCategoryFormData {
  name: string;
  nameEn: string;
  nameBe: string;
  description: string;
  descriptionEn: string;
  descriptionBe: string;
  pageType: string;
  isActive: boolean;
  sortOrder: number;
}

const initialFormData: SocialWorkCategoryFormData = {
  name: '',
  nameEn: '',
  nameBe: '',
  description: '',
  descriptionEn: '',
  descriptionBe: '',
  pageType: '',
  isActive: true,
  sortOrder: 0
};

export default function SocialWorkCategoryManagement() {
  const { data: categories, refetch } = useGetAllSocialWorkCategoriesQuery();
  const [createCategory] = useCreateSocialWorkCategoryMutation();
  const [updateCategory] = useUpdateSocialWorkCategoryMutation();
  const [deleteCategory] = useDeleteSocialWorkCategoryMutation();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = canAccessAdminPanel(roleName);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<SocialWorkCategoryFormData>(initialFormData);

  const handleCreateCategory = async () => {
    try {
      await createCategory(formData).unwrap();
      toast.success('Категория социальной работы успешно создана');
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании категории');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateCategory({ id: editingCategory.id, body: formData }).unwrap();
      toast.success('Категория социальной работы успешно обновлена');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData(initialFormData);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении категории');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Категория социальной работы успешно удалена');
        refetch();
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при удалении категории');
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      nameEn: category.nameEn || '',
      nameBe: category.nameBe || '',
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      descriptionBe: category.descriptionBe || '',
      pageType: category.pageType || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setIsEditDialogOpen(true);
  };


  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <Card><CardContent className="pt-6 text-center text-red-600">Доступ запрещен</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Управление категориями социальной работы</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white" style={{backgroundColor: '#213659', color: 'white'}}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id} className={`${!category.isActive ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    style={{backgroundColor: '#dc2626', color: 'white'}}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Тип страницы:</strong> {category.pageType}
                </div>
                <div>
                  <strong>Порядок:</strong> {category.sortOrder}
                </div>
                <div>
                  <strong>Статус:</strong> {category.isActive ? 'Активна' : 'Неактивна'}
                </div>
                <div>
                  <strong>Создано:</strong> {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {(category.nameEn || category.nameBe) && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Переводы:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {category.nameEn && <div><strong>EN:</strong> {category.nameEn}</div>}
                    {category.nameBe && <div><strong>BE:</strong> {category.nameBe}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Диалог создания категории */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Добавить категорию социальной работы</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой категории социальной работы.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название категории (Русский) *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название категории"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Название категории (Английский)</label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Название категории (Белорусский)</label>
                <Input
                  value={formData.nameBe}
                  onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
                  placeholder="Назва катэгорыі"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание (Русский)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание категории"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание (Английский)</label>
                <Input
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Category description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание (Белорусский)</label>
                <Input
                  value={formData.descriptionBe}
                  onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
                  placeholder="Апісанне катэгорыі"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Тип страницы *</label>
                <Input
                  value={formData.pageType}
                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                  placeholder="Например: trade-union, belaya-rus"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Уникальный идентификатор для URL страницы (только латинские буквы и дефисы)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm font-medium text-gray-700">Активна</span>
                </label>
                <label className="block text-sm font-medium">Порядок сортировки</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-20"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                Создать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования категории */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать категорию социальной работы</DialogTitle>
            <DialogDescription>
              Измените информацию о категории социальной работы.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название категории (Русский) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название категории"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название категории (Английский)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Название категории (Белорусский)</label>
              <Input
                value={formData.nameBe}
                onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
                placeholder="Назва катэгорыі"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Описание (Русский)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание категории"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Описание (Английский)</label>
              <Input
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Описание (Белорусский)</label>
              <Input
                value={formData.descriptionBe}
                onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
                placeholder="Апісанне катэгорыі"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Тип страницы *</label>
              <Input
                value={formData.pageType}
                onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                placeholder="Например: trade-union, belaya-rus"
              />
              <p className="text-xs text-gray-500 mt-1">
                Уникальный идентификатор для URL страницы (только латинские буквы и дефисы)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="text-sm font-medium text-gray-700">Активна</span>
              </label>
              <label className="block text-sm font-medium">Порядок сортировки</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateCategory}>
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
