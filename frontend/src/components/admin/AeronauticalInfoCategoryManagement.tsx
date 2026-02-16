import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAeronauticalInfoCategoriesQuery, useCreateAeronauticalInfoCategoryMutation, useUpdateAeronauticalInfoCategoryMutation, useDeleteAeronauticalInfoCategoryMutation, useUpdateCategoriesOrderMutation } from '@/app/services/aeronauticalInfoCategoryApi';
import { canAccessAdminPanel } from '@/utils/roleUtils';
import type { AeronauticalInfoCategory } from '@/app/services/aeronauticalInfoCategoryApi';

interface AeronauticalInfoCategoryFormData {
  name: string;
  nameEn: string;
  nameBe: string;
  description: string;
  descriptionEn: string;
  descriptionBe: string;
  pageType: string;
  isActive: boolean;
  sortOrder: number;
  parentId: number | null;
}

const initialFormData: AeronauticalInfoCategoryFormData = {
  name: '',
  nameEn: '',
  nameBe: '',
  description: '',
  descriptionEn: '',
  descriptionBe: '',
  pageType: '',
  isActive: true,
  sortOrder: 0,
  parentId: null
};

export default function AeronauticalInfoCategoryManagement() {
  const { data: categories, refetch, error, isLoading } = useGetAeronauticalInfoCategoriesQuery();
  const [createCategory] = useCreateAeronauticalInfoCategoryMutation();
  const [updateCategory] = useUpdateAeronauticalInfoCategoryMutation();
  const [deleteCategory] = useDeleteAeronauticalInfoCategoryMutation();
  const [updateOrder] = useUpdateCategoriesOrderMutation();

  // Debug information отключена

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = canAccessAdminPanel(roleName);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<AeronauticalInfoCategoryFormData>(initialFormData);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Функция для построения дерева категорий
  const buildCategoryTree = useMemo(() => {
    if (!categories) return [];
    
    const categoryMap = new Map<number, AeronauticalInfoCategory & { children: AeronauticalInfoCategory[] }>();
    const rootCategories: (AeronauticalInfoCategory & { children: AeronauticalInfoCategory[] })[] = [];
    
    // Создаем карту всех категорий
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });
    
    // Строим дерево
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        parent.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });
    
    // Сортируем корневые категории и их детей
    const sortCategories = (cats: typeof rootCategories) => {
      cats.sort((a, b) => a.sortOrder - b.sortOrder);
      cats.forEach(cat => {
        if (cat.children.length > 0) {
          sortCategories(cat.children as typeof rootCategories);
        }
      });
    };
    
    sortCategories(rootCategories);
    return rootCategories;
  }, [categories]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Функция для получения всех категорий в плоском виде для выбора родителя
  const getAllCategoriesFlat = useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => !editingCategory || cat.id !== editingCategory.id);
  }, [categories, editingCategory]);

  const handleInputChange = (field: keyof AeronauticalInfoCategoryFormData, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCategory = async () => {
    try {
      const dataToSend = {
        ...formData,
        parentId: formData.parentId || null
      };
      await createCategory(dataToSend).unwrap();
      toast.success('Категория успешно создана');
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при создании категории');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      const dataToSend = {
        id: editingCategory.id,
        ...formData,
        parentId: formData.parentId || null
      };
      await updateCategory(dataToSend).unwrap();
      toast.success('Категория успешно обновлена');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData(initialFormData);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при обновлении категории');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      await deleteCategory(id).unwrap();
      toast.success('Категория успешно удалена');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при удалении категории');
    }
  };

  const handleEditClick = (category: any) => {
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
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId || null
    });
    setIsEditDialogOpen(true);
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
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при обновлении порядка');
    }
    
    setIsDragging(false);
    setDragIndex(null);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">У вас нет прав для доступа к этой странице</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление подкатегориями аэронавигационной информации</h1>
        <Button onClick={() => {
          setFormData(initialFormData);
          setIsCreateDialogOpen(true);
        }} className="bg-[#213659] hover:bg-[#1a2a4a] text-white" style={{backgroundColor: '#213659', color: 'white'}}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить подкатегорию
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p>Загрузка категорий...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-8 text-red-600">
          <p>Ошибка загрузки категорий</p>
          <Button onClick={() => refetch()} className="mt-2">
            Попробовать снова
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {buildCategoryTree.map((category) => {
          const renderCategory = (cat: AeronauticalInfoCategory & { children: AeronauticalInfoCategory[] }, level: number = 0) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCategories.has(cat.id);
            const indent = level * 24;
            
            return (
              <div key={cat.id}>
                <Card className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" style={{ marginLeft: `${indent}px` }}>
                        <div className="flex items-center gap-2 mb-2">
                          {hasChildren && (
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {!hasChildren && <div className="w-6" />}
                          <h3 className="text-lg font-semibold">{cat.name}</h3>
                          {cat.parent && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Подкатегория: {cat.parent.name}
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-sm text-gray-600 mb-3 ml-8">{cat.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm ml-8">
                          <div>
                            <div className="mb-1"><strong>Тип страницы:</strong> {cat.pageType}</div>
                            <div className="mb-1"><strong>Статус:</strong> {cat.isActive ? 'Активна' : 'Неактивна'}</div>
                          </div>
                          <div>
                            <div className="mb-1"><strong>Порядок:</strong> {cat.sortOrder}</div>
                            {cat.createdAt && (
                              <div className="mb-1"><strong>Создано:</strong> {new Date(cat.createdAt).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded ml-8">
                          <div className="font-medium mb-2">Переводы:</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {cat.nameEn && <div><strong>EN:</strong> {cat.nameEn}</div>}
                            {cat.nameBe && <div><strong>BE:</strong> {cat.nameBe}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(cat)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(cat.id)} style={{backgroundColor: '#dc2626', color: 'white'}}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {hasChildren && isExpanded && (
                  <div>
                    {cat.children.map((child) => renderCategory(child as AeronauticalInfoCategory & { children: AeronauticalInfoCategory[] }, level + 1))}
                  </div>
                )}
              </div>
            );
          };
          
          return renderCategory(category);
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle className="bg-white">Создать подкатегорию</DialogTitle>
            <DialogDescription className="bg-white">
              Заполните форму для создания новой подкатегории аэронавигационной информации
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }}>
            <div className="grid gap-4 py-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название (RU)</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Название на русском"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Type</label>
                  <Input
                    value={formData.pageType}
                    onChange={(e) => handleInputChange('pageType', e.target.value)}
                    placeholder="page-type"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название (EN)</label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    placeholder="Name in English"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Название (BE)</label>
                  <Input
                    value={formData.nameBe}
                    onChange={(e) => handleInputChange('nameBe', e.target.value)}
                    placeholder="Назва на беларускай"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Описание (RU)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Описание на русском"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Описание (EN)</label>
                  <Input
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    placeholder="Description in English"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание (BE)</label>
                  <Input
                    value={formData.descriptionBe}
                    onChange={(e) => handleInputChange('descriptionBe', e.target.value)}
                    placeholder="Апісанне на беларускай"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Родительская категория</label>
                  <Select
                    value={formData.parentId?.toString() || 'none'}
                    onValueChange={(value) => handleInputChange('parentId', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите родительскую категорию" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none" className="bg-white">Нет (корневая категория)</SelectItem>
                      {getAllCategoriesFlat.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="bg-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Порядок сортировки</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Активна
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 bg-white">
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                Создать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle className="bg-white">Редактировать подкатегорию</DialogTitle>
            <DialogDescription className="bg-white">
              Измените данные подкатегории аэронавигационной информации
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEditCategory(); }}>
            <div className="grid gap-4 py-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название (RU)</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Название на русском"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Type</label>
                  <Input
                    value={formData.pageType}
                    onChange={(e) => handleInputChange('pageType', e.target.value)}
                    placeholder="page-type"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название (EN)</label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    placeholder="Name in English"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Название (BE)</label>
                  <Input
                    value={formData.nameBe}
                    onChange={(e) => handleInputChange('nameBe', e.target.value)}
                    placeholder="Назва на беларускай"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Описание (RU)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Описание на русском"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Описание (EN)</label>
                  <Input
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    placeholder="Description in English"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание (BE)</label>
                  <Input
                    value={formData.descriptionBe}
                    onChange={(e) => handleInputChange('descriptionBe', e.target.value)}
                    placeholder="Апісанне на беларускай"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Родительская категория</label>
                  <Select
                    value={formData.parentId?.toString() || 'none'}
                    onValueChange={(value) => handleInputChange('parentId', value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите родительскую категорию" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none" className="bg-white">Нет (корневая категория)</SelectItem>
                      {getAllCategoriesFlat.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="bg-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Порядок сортировки</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium">
                  Активна
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 bg-white">
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
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
}
