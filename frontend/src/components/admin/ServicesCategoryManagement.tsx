import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  useGetAllServicesCategoriesQuery,
  useCreateServicesCategoryMutation,
  useUpdateServicesCategoryMutation,
  useDeleteServicesCategoryMutation,
  useUpdateServicesCategoriesOrderMutation,
} from '../../app/services/servicesCategoryApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Save, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ServicesCategory {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType: string;
  isActive: boolean;
  sortOrder: number;
}

const ServicesCategoryManagement = () => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServicesCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: categories = [], isLoading, error } = useGetAllServicesCategoriesQuery();
  const [createCategory] = useCreateServicesCategoryMutation();
  const [updateCategory] = useUpdateServicesCategoryMutation();
  const [deleteCategory] = useDeleteServicesCategoryMutation();
  const [updateOrder] = useUpdateServicesCategoriesOrderMutation();

  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    // Проверяем все обязательные поля
    const requiredFields = [
      { field: 'name', value: formData.name, label: 'Название (RU)' },
      { field: 'nameEn', value: formData.nameEn, label: 'Название (EN)' },
      { field: 'nameBe', value: formData.nameBe, label: 'Название (BE)' },
      { field: 'description', value: formData.description, label: 'Описание (RU)' },
      { field: 'descriptionEn', value: formData.descriptionEn, label: 'Описание (EN)' },
      { field: 'descriptionBe', value: formData.descriptionBe, label: 'Описание (BE)' },
      { field: 'pageType', value: formData.pageType, label: 'Тип страницы' },
    ];
    
    const emptyFields = requiredFields.filter(f => !f.value || f.value.trim().length === 0);
    const sortValid = typeof formData.sortOrder === 'number' && !Number.isNaN(formData.sortOrder);
    
    if (emptyFields.length > 0) {
      const missingFields = emptyFields.map(f => f.label).join(', ');
      toast.error(`Заполните обязательные поля: ${missingFields}`);
      return;
    }
    
    if (!sortValid) {
      toast.error('Введите корректный порядок сортировки');
      return;
    }
    try {
      await createCategory(formData).unwrap();
      toast.success('Подкатегория успешно создана');
      setIsCreateDialogOpen(false);
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
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Ошибка при создании подкатегории');
    }
  };

  const handleEdit = (category: ServicesCategory) => {
    setEditingCategory(category);
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
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    
    // Проверяем все обязательные поля
    const requiredFields = [
      { field: 'name', value: formData.name, label: 'Название (RU)' },
      { field: 'nameEn', value: formData.nameEn, label: 'Название (EN)' },
      { field: 'nameBe', value: formData.nameBe, label: 'Название (BE)' },
      { field: 'description', value: formData.description, label: 'Описание (RU)' },
      { field: 'descriptionEn', value: formData.descriptionEn, label: 'Описание (EN)' },
      { field: 'descriptionBe', value: formData.descriptionBe, label: 'Описание (BE)' },
      { field: 'pageType', value: formData.pageType, label: 'Тип страницы' },
    ];
    
    const emptyFields = requiredFields.filter(f => !f.value || f.value.trim().length === 0);
    const sortValid = typeof formData.sortOrder === 'number' && !Number.isNaN(formData.sortOrder);
    
    if (emptyFields.length > 0) {
      const missingFields = emptyFields.map(f => f.label).join(', ');
      toast.error(`Заполните обязательные поля: ${missingFields}`);
      return;
    }
    
    if (!sortValid) {
      toast.error('Введите корректный порядок сортировки');
      return;
    }
    try {
      await updateCategory({ id: editingCategory.id, ...formData }).unwrap();
      toast.success('Подкатегория успешно обновлена');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Ошибка при обновлении подкатегории');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подкатегорию?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Подкатегория удалена');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Ошибка при удалении подкатегории');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (dragIndex === null || dragIndex === dropIndex || !categories) return;
    
    const newCategories = [...categories];
    const draggedCategory = newCategories[dragIndex];
    newCategories.splice(dragIndex, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);
    
    // Update sort order
    const updatedCategories = newCategories.map((category, index) => ({
      id: category.id,
      sortOrder: index
    }));
    
    try {
      await updateOrder({ categories: updatedCategories }).unwrap();
      toast.success('Порядок категорий обновлен');
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error('Ошибка при обновлении порядка');
    }
    
    setIsDragging(false);
    setDragIndex(null);
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки данных</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление подкатегориями услуг</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#213659] hover:bg-[#1a2a4a] text-white" style={{backgroundColor: '#213659', color: 'white'}}>
              Добавить подкатегорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать подкатегорию услуг</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); handleCreate();}}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название (RU) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pageType">Тип страницы *</Label>
                  <Input
                    id="pageType"
                    value={formData.pageType}
                    onChange={(e) => handleInputChange('pageType', e.target.value)}
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
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameBe">Название (BE) *</Label>
                  <Input
                    id="nameBe"
                    value={formData.nameBe}
                    onChange={(e) => handleInputChange('nameBe', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Описание (RU) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descriptionEn">Описание (EN) *</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionBe">Описание (BE) *</Label>
                  <Textarea
                    id="descriptionBe"
                    value={formData.descriptionBe}
                    onChange={(e) => handleInputChange('descriptionBe', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Активна</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                  Создать
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`${isDragging && dragIndex === index ? 'shadow-lg opacity-50' : ''} cursor-move`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="mb-1"><strong>Тип страницы:</strong> {category.pageType}</div>
                      <div className="mb-1"><strong>Статус:</strong> {category.isActive ? 'Активна' : 'Неактивна'}</div>
                    </div>
                    <div>
                      <div className="mb-1"><strong>Порядок:</strong> {category.sortOrder}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-2">Переводы:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {category.nameEn && <div><strong>EN:</strong> {category.nameEn}</div>}
                      {category.nameBe && <div><strong>BE:</strong> {category.nameBe}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`/services/${category.pageType}`, '_blank')}
                    title="Открыть страницу"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} style={{backgroundColor: '#dc2626', color: 'white'}}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать подкатегорию услуг</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); handleUpdate();}}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Название (RU)</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-pageType">Тип страницы</Label>
                <Input
                  id="edit-pageType"
                  value={formData.pageType}
                  onChange={(e) => handleInputChange('pageType', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nameEn">Название (EN)</Label>
                <Input
                  id="edit-nameEn"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-nameBe">Название (BE)</Label>
                <Input
                  id="edit-nameBe"
                  value={formData.nameBe}
                  onChange={(e) => handleInputChange('nameBe', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Описание (RU)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-descriptionEn">Описание (EN)</Label>
                <Textarea
                  id="edit-descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-descriptionBe">Описание (BE)</Label>
                <Textarea
                  id="edit-descriptionBe"
                  value={formData.descriptionBe}
                  onChange={(e) => handleInputChange('descriptionBe', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="edit-isActive">Активна</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
              <Button type="submit" className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesCategoryManagement;
