import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetAllAboutCompanyCategoriesQuery,
  useCreateAboutCompanyCategoryMutation,
  useUpdateAboutCompanyCategoryMutation,
  useDeleteAboutCompanyCategoryMutation,
  type AboutCompanyCategory,
  type CreateAboutCompanyCategoryRequest,
} from '@/app/services/aboutCompanyCategoryApi';

export default function AboutCompanyCategoryManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AboutCompanyCategory | null>(null);
  const [formData, setFormData] = useState<CreateAboutCompanyCategoryRequest>({
    name: '',
    nameEn: '',
    nameBe: '',
    description: '',
    descriptionEn: '',
    descriptionBe: '',
    pageType: '',
    isActive: true,
    sortOrder: 0,
  });

  const { data: categories = [], isLoading, refetch } = useGetAllAboutCompanyCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateAboutCompanyCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAboutCompanyCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAboutCompanyCategoryMutation();

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      nameBe: '',
      description: '',
      descriptionEn: '',
      descriptionBe: '',
      pageType: '',
      isActive: true,
      sortOrder: 0,
    });
    setEditingCategory(null);
    setIsCreateDialogOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Валидация: все поля обязательны
    const requiredTextFields = [
      formData.name,
      formData.nameEn,
      formData.nameBe,
      formData.description,
      formData.descriptionEn,
      formData.descriptionBe,
      formData.pageType,
    ];

    const allFilled = requiredTextFields.every((v) => typeof v === 'string' && v.trim().length > 0);
    const sortOrderValid = typeof formData.sortOrder === 'number' && !Number.isNaN(formData.sortOrder);

    if (!allFilled || !sortOrderValid) {
      toast.error('Заполните все поля формы, включая порядок сортировки');
      return;
    }

    try {
      await createCategory(formData).unwrap();
      toast.success('Категория успешно создана');
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании категории');
    }
  };

  const handleEdit = (category: AboutCompanyCategory) => {
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      nameBe: category.nameBe || '',
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      descriptionBe: category.descriptionBe || '',
      pageType: category.pageType,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setEditingCategory(category);
    setIsCreateDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Валидация: все поля обязательны
    if (!editingCategory) return;

    const requiredTextFields = [
      formData.name,
      formData.nameEn,
      formData.nameBe,
      formData.description,
      formData.descriptionEn,
      formData.descriptionBe,
      formData.pageType,
    ];

    const allFilled = requiredTextFields.every((v) => typeof v === 'string' && v.trim().length > 0);
    const sortOrderValid = typeof formData.sortOrder === 'number' && !Number.isNaN(formData.sortOrder);

    if (!allFilled || !sortOrderValid) {
      toast.error('Заполните все поля формы, включая порядок сортировки');
      return;
    }

    try {
      await updateCategory({
        id: editingCategory.id,
        data: formData,
      }).unwrap();
      toast.success('Категория успешно обновлена');
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении категории');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      await deleteCategory(id).unwrap();
      toast.success('Категория успешно удалена');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении категории');
    }
  };

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление подкатегориями "О предприятии"</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить подкатегорию
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
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
                    onClick={() => handleEdit(category)}
                    disabled={isUpdating}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white border border-solid border-white"
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Редактировать подкатегорию' : 'Создать новую подкатегорию'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название (RU) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pageType">Тип страницы *</Label>
                <Input
                  id="pageType"
                  value={formData.pageType}
                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                  placeholder="например: management, structure"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameEn">Название (EN) *</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameBe">Название (BE) *</Label>
                <Input
                  id="nameBe"
                  value={formData.nameBe}
                  onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Описание (RU) *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descriptionEn">Описание (EN) *</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descriptionBe">Описание (BE) *</Label>
                <Textarea
                  id="descriptionBe"
                  value={formData.descriptionBe}
                  onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Порядок сортировки *</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Активна</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white" 
                disabled={isCreating || isUpdating}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
