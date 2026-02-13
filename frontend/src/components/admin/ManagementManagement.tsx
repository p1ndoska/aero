import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Upload, X, Image as ImageIcon, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllManagersQuery, useCreateManagerMutation, useUpdateManagerMutation, useDeleteManagerMutation, useUpdateManagersOrderMutation } from '@/app/services/managementApi';
import { useUploadImageMutation } from '@/app/services/uploadApi';
import ReceptionScheduleCalendar from './ReceptionScheduleCalendar';
import type { Management, CreateManagementRequest } from '@/types/management';

export default function ManagementManagement() {
  const { token } = useSelector((state: any) => state.auth);
  const { data: managers, refetch, isLoading } = useGetAllManagersQuery();
  const [createManager, { isLoading: isCreating }] = useCreateManagerMutation();
  const [updateManager, { isLoading: isUpdating }] = useUpdateManagerMutation();
  const [deleteManager, { isLoading: isDeleting }] = useDeleteManagerMutation();
  const [updateManagersOrder, { isLoading: isUpdatingOrder }] = useUpdateManagersOrderMutation();
  const [uploadImage] = useUploadImageMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Management | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showScheduleCalendar, setShowScheduleCalendar] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateManagementRequest>({
    name: '',
    nameEn: '',
    nameBe: '',
    position: '',
    positionEn: '',
    positionBe: '',
    phone: '',
    offices: '',
    officesEn: '',
    officesBe: '',
    receptionSchedule: '',
    receptionScheduleEn: '',
    receptionScheduleBe: '',
    images: [],
    order: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      nameBe: '',
      position: '',
      positionEn: '',
      positionBe: '',
      phone: '',
      offices: '',
      officesEn: '',
      officesBe: '',
      receptionSchedule: '',
      receptionScheduleEn: '',
      receptionScheduleBe: '',
      images: [],
      order: 0
    });
    setSelectedImages([]);
    setPreviewImages([]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages(prev => [...prev, ...newImages]);
      
      const newPreviews: string[] = [];
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === newImages.length) {
              setPreviewImages(prev => [...prev, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const result = await uploadImage(formData).unwrap();
        uploadedUrls.push(result.url);
      } catch (error: any) {
        console.error('Ошибка загрузки изображения:', file.name, error);
        toast.error(error.data?.error || 'Не удалось загрузить изображение');
      }
    }
    
    return uploadedUrls;
  };

  const handleCreate = async () => {

    try {
      let uploadedImages: string[] = [];
      if (selectedImages.length > 0) {
        uploadedImages = await uploadImages(selectedImages);
      }

      const dataToSend = {
        ...formData,
        images: uploadedImages
      };

      await createManager(dataToSend).unwrap();
      toast.success('Руководитель успешно создан');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании руководителя');
    }
  };

  const handleEdit = (manager: Management) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      nameEn: manager.nameEn || '',
      nameBe: manager.nameBe || '',
      position: manager.position,
      positionEn: manager.positionEn || '',
      positionBe: manager.positionBe || '',
      phone: manager.phone,
      offices: manager.offices || '',
      officesEn: manager.officesEn || '',
      officesBe: manager.officesBe || '',
      receptionSchedule: manager.receptionSchedule,
      receptionScheduleEn: manager.receptionScheduleEn || '',
      receptionScheduleBe: manager.receptionScheduleBe || '',
      images: manager.images,
      order: manager.order
    });
    setSelectedImages([]);
    setPreviewImages([]);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingManager) {
      return;
    }

    try {
      let uploadedImages: string[] = [];
      if (selectedImages.length > 0) {
        uploadedImages = await uploadImages(selectedImages);
      }

      const dataToSend = {
        ...formData,
        images: [...formData.images, ...uploadedImages]
      };

      await updateManager({ id: editingManager.id, managerData: dataToSend }).unwrap();
      toast.success('Руководитель успешно обновлен');
      setIsEditDialogOpen(false);
      setEditingManager(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении руководителя');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого руководителя?')) {
      return;
    }

    try {
      await deleteManager(id).unwrap();
      toast.success('Руководитель успешно удален');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении руководителя');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!managers?.managers || index === 0) return;

    const currentManager = managers.managers[index];
    const previousManager = managers.managers[index - 1];

    // Проверяем, что значения валидны
    const currentId = currentManager.id != null ? Number(currentManager.id) : NaN;
    const previousId = previousManager.id != null ? Number(previousManager.id) : NaN;

    if (isNaN(currentId) || isNaN(previousId) || currentId <= 0 || previousId <= 0) {
      toast.error('Ошибка: некорректные данные для изменения порядка');
      return;
    }

    // Получаем текущие значения order или используем индексы
    let currentOrder = currentManager.order != null ? Number(currentManager.order) : index;
    let previousOrder = previousManager.order != null ? Number(previousManager.order) : index - 1;

    // Если оба order равны 0 или одинаковые, используем индексы
    if (currentOrder === previousOrder) {
      currentOrder = index;
      previousOrder = index - 1;
    }

    // Меняем порядок местами
    const newOrder = previousOrder;
    const oldOrder = currentOrder;

    const payload = {
      managers: [
        { id: currentId, order: newOrder },
        { id: previousId, order: oldOrder }
      ]
    };

    try {
      await updateManagersOrder(payload).unwrap();
      toast.success('Порядок обновлен');
      // Небольшая задержка перед refetch, чтобы дать время RTK Query обновить кэш
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error: any) {
      console.error('Ошибка при обновлении порядка:', error);
      const errorMessage = error.data?.error || error.error || error.message || 'Ошибка при обновлении порядка';
      toast.error(errorMessage);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!managers?.managers || index === managers.managers.length - 1) return;

    const currentManager = managers.managers[index];
    const nextManager = managers.managers[index + 1];

    // Проверяем, что значения валидны
    const currentId = currentManager.id != null ? Number(currentManager.id) : NaN;
    const nextId = nextManager.id != null ? Number(nextManager.id) : NaN;

    if (isNaN(currentId) || isNaN(nextId) || currentId <= 0 || nextId <= 0) {
      toast.error('Ошибка: некорректные данные для изменения порядка');
      return;
    }

    // Получаем текущие значения order или используем индексы
    let currentOrder = currentManager.order != null ? Number(currentManager.order) : index;
    let nextOrder = nextManager.order != null ? Number(nextManager.order) : index + 1;

    // Если оба order равны 0 или одинаковые, используем индексы
    if (currentOrder === nextOrder) {
      currentOrder = index;
      nextOrder = index + 1;
    }

    // Меняем порядок местами
    const newOrder = nextOrder;
    const oldOrder = currentOrder;

    const payload = {
      managers: [
        { id: currentId, order: newOrder },
        { id: nextId, order: oldOrder }
      ]
    };

    try {
      await updateManagersOrder(payload).unwrap();
      toast.success('Порядок обновлен');
      // Небольшая задержка перед refetch, чтобы дать время RTK Query обновить кэш
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error: any) {
      console.error('Ошибка при обновлении порядка:', error);
      const errorMessage = error.data?.error || error.error || error.message || 'Ошибка при обновлении порядка';
      toast.error(errorMessage);
    }
  };

  const renderForm = (isEdit: boolean = false) => (
    <form onSubmit={(e) => { e.preventDefault(); isEdit ? handleUpdate() : handleCreate(); }}>
      <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-[#213659] font-medium">ФИО руководителя (Русский) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Введите ФИО"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
            required
          />
        </div>
        <div>
          <Label htmlFor="position" className="text-[#213659] font-medium">Должность (Русский) *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Введите должность"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nameEn" className="text-[#213659] font-medium">ФИО руководителя (Английский)</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            placeholder="Enter full name"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
        <div>
          <Label htmlFor="positionEn" className="text-[#213659] font-medium">Должность (Английский)</Label>
          <Input
            id="positionEn"
            value={formData.positionEn}
            onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
            placeholder="Enter position"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nameBe" className="text-[#213659] font-medium">ФИО руководителя (Белорусский)</Label>
          <Input
            id="nameBe"
            value={formData.nameBe}
            onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
            placeholder="Увядзіце поўнае імя"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
        <div>
          <Label htmlFor="positionBe" className="text-[#213659] font-medium">Должность (Белорусский)</Label>
          <Input
            id="positionBe"
            value={formData.positionBe}
            onChange={(e) => setFormData({ ...formData, positionBe: e.target.value })}
            placeholder="Увядзіце пасаду"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-[#213659] font-medium">Телефон *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Введите телефон"
          className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="offices" className="text-[#213659] font-medium">Кабинеты (Русский)</Label>
          <Input
            id="offices"
            value={formData.offices}
            onChange={(e) => setFormData({ ...formData, offices: e.target.value })}
            placeholder="Введите номера кабинетов"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
        <div>
          <Label htmlFor="officesEn" className="text-[#213659] font-medium">Кабинеты (Английский)</Label>
          <Input
            id="officesEn"
            value={formData.officesEn}
            onChange={(e) => setFormData({ ...formData, officesEn: e.target.value })}
            placeholder="Enter office numbers"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
        <div>
          <Label htmlFor="officesBe" className="text-[#213659] font-medium">Кабинеты (Белорусский)</Label>
          <Input
            id="officesBe"
            value={formData.officesBe}
            onChange={(e) => setFormData({ ...formData, officesBe: e.target.value })}
            placeholder="Увядзіце нумары кабінетаў"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="receptionSchedule" className="text-[#213659] font-medium">Расписание приема (Русский) *</Label>
          <Input
            id="receptionSchedule"
            value={formData.receptionSchedule}
            onChange={(e) => setFormData({ ...formData, receptionSchedule: e.target.value })}
            placeholder="Укажите расписание приема"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
            required
          />
        </div>
        <div>
          <Label htmlFor="receptionScheduleEn" className="text-[#213659] font-medium">Расписание приема (Английский)</Label>
          <Input
            id="receptionScheduleEn"
            value={formData.receptionScheduleEn}
            onChange={(e) => setFormData({ ...formData, receptionScheduleEn: e.target.value })}
            placeholder="Enter reception schedule"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
        <div>
          <Label htmlFor="receptionScheduleBe" className="text-[#213659] font-medium">Расписание приема (Белорусский)</Label>
          <Input
            id="receptionScheduleBe"
            value={formData.receptionScheduleBe}
            onChange={(e) => setFormData({ ...formData, receptionScheduleBe: e.target.value })}
            placeholder="Укажыце расклад прыёму"
            className="bg-white border-[#B1D1E0] focus:border-[#213659]"
          />
        </div>
      </div>

      {/* Секция загрузки изображений */}
      <div>
        <Label className="text-[#213659] font-medium">Фотографии руководителя</Label>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-2 border-[#B1D1E0] hover:border-[#2A52BE] text-[#213659]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Выберите фотографии
          </Button>
        </div>
        
        {/* Превью выбранных изображений */}
        {(previewImages.length > 0 || (isEdit && formData.images.length > 0)) && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Выбранные изображения:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Существующие изображения */}
              {isEdit && formData.images.map((image, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={image}
                    alt={`Существующее фото ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                    onError={(e) => {
                      console.error('Ошибка загрузки существующего изображения:', image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {/* Новые изображения */}
              {previewImages.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={preview}
                    alt={`Новое фото ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопки формы */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}
        >
          Отмена
        </Button>
        <Button 
          type="submit"
          disabled={isEdit ? isUpdating : isCreating}
          className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
        >
          {isEdit ? (isUpdating ? 'Сохранение...' : 'Сохранить') : (isCreating ? 'Создание...' : 'Создать')}
        </Button>
      </div>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка руководителей...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
          <Users className="w-6 h-6" />
          Управление руководителями
        </h2>
        <p className="text-gray-600">Создавайте и редактируйте информацию о руководителях</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#213659] hover:bg-[#1a2a4a] text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить руководителя
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Создать нового руководителя</DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#213659]">Список руководителей</h3>
        {!managers?.managers?.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">Руководители не найдены</p>
            <p className="text-gray-500 text-sm">Нажмите "Добавить руководителя", чтобы создать первого руководителя</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {managers.managers.map((manager) => (
              <React.Fragment key={manager.id}>
                <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-[#213659] mb-2">{manager.name}</h4>
                    <div className="space-y-1">
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Должность:</span>
                        {manager.position}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Телефон:</span>
                        {manager.phone}
                      </p>
                      {manager.offices && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-medium">Кабинеты:</span>
                          {manager.offices}
                        </p>
                      )}
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Расписание приема:</span>
                        {manager.receptionSchedule}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(managers.managers.findIndex(m => m.id === manager.id))}
                        disabled={isUpdatingOrder || managers.managers.findIndex(m => m.id === manager.id) === 0}
                        className="border-[#B1D1E0] hover:border-[#2A52BE] text-[#213659] p-1 h-8"
                        title="Переместить вверх"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(managers.managers.findIndex(m => m.id === manager.id))}
                        disabled={isUpdatingOrder || managers.managers.findIndex(m => m.id === manager.id) === managers.managers.length - 1}
                        className="border-[#B1D1E0] hover:border-[#2A52BE] text-[#213659] p-1 h-8"
                        title="Переместить вниз"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScheduleCalendar(
                        showScheduleCalendar === manager.id ? null : manager.id
                      )}
                      className="border-[#B1D1E0] hover:border-[#2A52BE] text-[#213659]"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      {showScheduleCalendar === manager.id ? 'Скрыть' : 'Календарь'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(manager)}
                      className="border-[#B1D1E0] hover:border-[#2A52BE] text-[#213659]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(manager.id)}
                      disabled={isDeleting}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
                
                {manager.images && manager.images.length > 0 && (
                  <div>
                    <span className="font-medium text-[#213659]">Изображения:</span>
                    <div className="flex gap-2 mt-2">
                      {manager.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Изображение ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            console.error('Ошибка загрузки изображения руководителя:', image);
                            console.error('Статус:', e.currentTarget.src);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Изображение руководителя загружено успешно:', image);
                          }}
                        />
                      ))}
                      {manager.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{manager.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Календарь расписания для выбранного руководителя */}
              {showScheduleCalendar === manager.id && (
                <ReceptionScheduleCalendar manager={manager} />
              )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать руководителя</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}