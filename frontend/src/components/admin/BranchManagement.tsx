import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, X, Building2, Upload, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation } from '@/app/services/branchApi';
import ContentConstructor from './ContentConstructor';
import type { Branch, CreateBranchRequest } from '@/types/branch';
import { useSelector } from 'react-redux';
import { BASE_URL } from '@/constants';
import { fetchWithAuth } from '@/utils/apiHelpers';

type PhoneItem = { 
  label: string; 
  labelEn?: string; 
  labelBe?: string; 
  number: string; 
};

export default function BranchManagement() {
  const { token } = useSelector((state: any) => state.auth);
  const { data: branches, refetch, isLoading } = useGetAllBranchesQuery();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [phones, setPhones] = useState<PhoneItem[]>([{ label: '', number: '' }]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateBranchRequest>({
    name: '',
    nameEn: '',
    nameBe: '',
    address: '',
    addressEn: '',
    addressBe: '',
    phone: '',
    email: '',
    description: '',
    descriptionEn: '',
    descriptionBe: '',
    workHours: null,
    services: null,
    coordinates: { latitude: '', longitude: '' },
    images: [],
    content: [],
    contentEn: [],
    contentBe: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      nameBe: '',
      address: '',
      addressEn: '',
      addressBe: '',
      phone: '',
      email: '',
      description: '',
      descriptionEn: '',
      descriptionBe: '',
      workHours: null,
      services: null,
      coordinates: { latitude: '', longitude: '' },
      images: [],
      content: [],
      contentEn: [],
      contentBe: []
    });
    setPhones([{ label: '', labelEn: '', labelBe: '', number: '' }]);
    setSelectedImages([]);
    setPreviewImages([]);
    setMainImageIndex(0);
    setScrollPosition(0);
  };

  const handleCreate = async () => {
    // Валидация телефонов: хотя бы одна запись с номером
    const normalizedPhones = phones
      .map(p => ({ 
        label: p.label?.trim() || '', 
        labelEn: p.labelEn?.trim() || '', 
        labelBe: p.labelBe?.trim() || '', 
        number: p.number?.trim() || '' 
      }))
      .filter(p => p.number.length > 0);
    if (normalizedPhones.length === 0) {
      toast.error('Добавьте хотя бы один контактный телефон');
      return;
    }

    try {
      // Загрузка изображений если выбраны
      let uploadedImages: string[] = [];
      if (selectedImages.length > 0) {
        uploadedImages = await uploadImages(selectedImages);
      }
      // Перемещаем главное изображение в начало массива
      if (uploadedImages.length > 0 && mainImageIndex < uploadedImages.length) {
        const mainImg = uploadedImages[mainImageIndex];
        uploadedImages = uploadedImages.filter((_, idx) => idx !== mainImageIndex);
        uploadedImages.unshift(mainImg);
      }
      // Преобразуем content в JSON строку для отправки
      // Всегда отправляем контент, даже если массив пустой
      const dataToSend = {
        ...formData,
        content: formData.content ? JSON.stringify(formData.content) : JSON.stringify([]),
        contentEn: formData.contentEn ? JSON.stringify(formData.contentEn) : JSON.stringify([]),
        contentBe: formData.contentBe ? JSON.stringify(formData.contentBe) : JSON.stringify([]),
        images: uploadedImages,
        // Сохраняем телефоны в JSON поле services, чтобы не менять backend-схему
        services: { phones: normalizedPhones }
      } as any;
      
      await createBranch(dataToSend).unwrap();
      toast.success('Филиал успешно создан');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Ошибка создания филиала:', error);
      toast.error(error.data?.error || 'Ошибка при создании филиала');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    
    // Парсим content из JSON строки для всех языков
    const parseContent = (content: any): any[] => {
      if (!content) return [];
      try {
        if (typeof content === 'string') {
          return JSON.parse(content);
        } else if (Array.isArray(content)) {
          return content;
        }
        return [];
      } catch (error) {
        console.error('Ошибка парсинга content:', error);
        return [];
      }
    };
    
    setFormData({
      name: branch.name,
      nameEn: branch.nameEn || '',
      nameBe: branch.nameBe || '',
      address: branch.address,
      addressEn: branch.addressEn || '',
      addressBe: branch.addressBe || '',
      phone: branch.phone,
      email: branch.email,
      description: branch.description || '',
      descriptionEn: branch.descriptionEn || '',
      descriptionBe: branch.descriptionBe || '',
      workHours: branch.workHours,
      services: branch.services,
      coordinates: branch.coordinates || { latitude: '', longitude: '' },
      images: branch.images,
      content: parseContent(branch.content),
      contentEn: parseContent(branch.contentEn),
      contentBe: parseContent(branch.contentBe)
    });
    // Инициализируем список телефонов из services.phones, если есть
    try {
      const svc = branch.services as any;
      if (svc && Array.isArray(svc.phones)) {
        setPhones(
          svc.phones.map((p: any) => ({ 
            label: String(p.label || ''), 
            labelEn: String(p.labelEn || ''), 
            labelBe: String(p.labelBe || ''), 
            number: String(p.number || '') 
          }))
        );
      } else {
        setPhones([{ label: '', labelEn: '', labelBe: '', number: '' }]);
      }
    } catch {
      setPhones([{ label: '', labelEn: '', labelBe: '', number: '' }]);
    }
    setSelectedImages([]);
    setPreviewImages([]);
    setMainImageIndex(0);
    setScrollPosition(0);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingBranch) return;

    try {
      const normalizedPhones = phones
        .map(p => ({ 
          label: p.label?.trim() || '', 
          labelEn: p.labelEn?.trim() || '', 
          labelBe: p.labelBe?.trim() || '', 
          number: p.number?.trim() || '' 
        }))
        .filter(p => p.number.length > 0);
      if (normalizedPhones.length === 0) {
        toast.error('Добавьте хотя бы один контактный телефон');
        return;
      }
      // Загрузка новых изображений если выбраны
      let uploadedImages: string[] = [];
      if (selectedImages.length > 0) {
        uploadedImages = await uploadImages(selectedImages);
      }
      // Перемещаем главное изображение в начало массива
      if (uploadedImages.length > 0 && mainImageIndex < uploadedImages.length) {
        const mainImg = uploadedImages[mainImageIndex];
        uploadedImages = uploadedImages.filter((_, idx) => idx !== mainImageIndex);
        uploadedImages.unshift(mainImg);
      }
      // Преобразуем content в JSON строку для отправки
      // Всегда отправляем контент, даже если массив пустой
      const dataToSend = {
        ...formData,
        content: formData.content ? JSON.stringify(formData.content) : JSON.stringify([]),
        contentEn: formData.contentEn ? JSON.stringify(formData.contentEn) : JSON.stringify([]),
        contentBe: formData.contentBe ? JSON.stringify(formData.contentBe) : JSON.stringify([]),
        services: { phones: normalizedPhones },
        images: [...(formData.images || []), ...uploadedImages]
      } as any;
      
      await updateBranch({ id: editingBranch.id, branchData: dataToSend }).unwrap();
      toast.success('Филиал успешно обновлен');
      setIsEditDialogOpen(false);
      setEditingBranch(null);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Ошибка обновления филиала:', error);
      toast.error(error.data?.error || 'Ошибка при обновлении филиала');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот филиал?')) {
      return;
    }

    try {
      await deleteBranch(id).unwrap();
      toast.success('Филиал успешно удален');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении филиала');
    }
  };

  const renderContentPreview = (content: any) => {
    if (!content) {
      return <span className="text-gray-500 text-sm">Контент не добавлен</span>;
    }

    let parsedContent = [];
    try {
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      } else {
        parsedContent = content;
      }
    } catch (error) {
      console.error('Ошибка парсинга content для превью:', error);
      return <span className="text-gray-500 text-sm">Ошибка загрузки контента</span>;
    }

    if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
      return <span className="text-gray-500 text-sm">Контент не добавлен</span>;
    }

    return (
      <div className="space-y-1">
        {parsedContent.slice(0, 2).map((element: any, index: number) => (
          <div key={index} className="text-xs text-gray-600">
            {element.type === 'heading' && `📝 ${element.content}`}
            {element.type === 'paragraph' && `📄 ${element.content.substring(0, 50)}${element.content.length > 50 ? '...' : ''}`}
            {element.type === 'link' && `🔗 ${element.content}`}
            {element.type === 'image' && `🖼️ ${element.props?.alt || 'Изображение'}`}
          </div>
        ))}
        {parsedContent.length > 2 && (
          <div className="text-xs text-gray-500">... и еще {parsedContent.length - 2} элементов</div>
        )}
      </div>
    );
  };

  const renderFormContent = (isEdit: boolean = false) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Название филиала (RU) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название филиала"
              required
            />
          </div>
          <div>
            <Label htmlFor="nameEn">Название филиала (EN)</Label>
            <Input
              id="nameEn"
              value={formData.nameEn || ''}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="Enter branch name"
            />
          </div>
          <div>
            <Label htmlFor="nameBe">Название филиала (BE)</Label>
            <Input
              id="nameBe"
              value={formData.nameBe || ''}
              onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
              placeholder="Увядзіце назву філіяла"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Введите email"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Введите телефон"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="address">Адрес (RU) *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Введите адрес"
              required
            />
          </div>
          <div>
            <Label htmlFor="addressEn">Адрес (EN)</Label>
            <Input
              id="addressEn"
              value={formData.addressEn || ''}
              onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
              placeholder="Enter address"
            />
          </div>
          <div>
            <Label htmlFor="addressBe">Адрес (BE)</Label>
            <Input
              id="addressBe"
              value={formData.addressBe || ''}
              onChange={(e) => setFormData({ ...formData, addressBe: e.target.value })}
              placeholder="Увядзіце адрас"
            />
          </div>
        </div>

        {/* Координаты */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📍 Координаты филиала</h4>
            <p className="text-xs text-blue-600 mb-3">
              Укажите точные координаты для отображения на карте. 
              Координаты можно найти в Google Maps или Яндекс.Картах.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Широта (Latitude)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.coordinates?.latitude || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { 
                      ...formData.coordinates, 
                      latitude: e.target.value 
                    } 
                  })}
                  placeholder="Например: 53.9045"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Долгота (Longitude)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.coordinates?.longitude || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { 
                      ...formData.coordinates, 
                      longitude: e.target.value 
                    } 
                  })}
                  placeholder="Например: 27.5615"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="description">Описание (RU)</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Введите описание"
            />
          </div>
          <div>
            <Label htmlFor="descriptionEn">Описание (EN)</Label>
            <Input
              id="descriptionEn"
              value={formData.descriptionEn || ''}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Enter description"
            />
          </div>
          <div>
            <Label htmlFor="descriptionBe">Описание (BE)</Label>
            <Input
              id="descriptionBe"
              value={formData.descriptionBe || ''}
              onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
              placeholder="Увядзіце апісанне"
            />
          </div>
        </div>

      {/* Контактные телефоны (динамический список с многоязычными подписями) */}
      <div>
        <Label className="mb-2 block">Контактные телефоны</Label>
        <div className="space-y-4">
          {phones.map((phoneItem, phoneIndex) => (
            <div key={phoneIndex} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Подпись (RU)</Label>
                  <Input
                    placeholder="Например, Начальник филиала"
                    value={phoneItem.label || ''}
                    onChange={(e) => {
                      const updated = [...phones];
                      updated[phoneIndex].label = e.target.value;
                      setPhones(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Подпись (EN)</Label>
                  <Input
                    placeholder="For example, Branch Manager"
                    value={phoneItem.labelEn || ''}
                    onChange={(e) => {
                      const updated = [...phones];
                      updated[phoneIndex].labelEn = e.target.value;
                      setPhones(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Подпись (BE)</Label>
                  <Input
                    placeholder="Напрыклад, Начальнік філіяла"
                    value={phoneItem.labelBe || ''}
                    onChange={(e) => {
                      const updated = [...phones];
                      updated[phoneIndex].labelBe = e.target.value;
                      setPhones(updated);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="md:col-span-2">
                  <Label className="text-xs text-gray-600 mb-1 block">Номер телефона</Label>
                  <Input
                    placeholder="+375 (XX) XXX-XX-XX"
                    value={phoneItem.number || ''}
                    onChange={(e) => {
                      const updated = [...phones];
                      updated[phoneIndex].number = e.target.value;
                      setPhones(updated);
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-end md:col-span-2">
                  {phoneIndex === phones.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={() => setPhones((prev) => {
                        const arr = [...prev];
                        arr.push({ label: '', labelEn: '', labelBe: '', number: '' });
                        return arr;
                      })}
                    >
                      Добавить
                    </Button>
                  )}
                  {phones.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-10"
                      onClick={() => setPhones((prev) => prev.filter((_, i) => i !== phoneIndex))}
                    >
                      Удалить
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Изображения филиала */}
      <div>
        <Label className="mb-2 block">Фотографии филиала</Label>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e)} />
        {/* Выбор папки (Chromium) */}
        <input ref={dirInputRef} type="file" multiple className="hidden" onChange={(e) => handleFolderSelect(e)} {...({ webkitdirectory: 'true' } as any)} />
        <div className="flex gap-2 mb-3">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Выбрать файлы
          </Button>
          <Button type="button" variant="outline" onClick={() => dirInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4 mr-2" /> Выбрать папку
          </Button>
        </div>
        {(previewImages.length > 0 || (isEdit && formData.images && formData.images.length > 0)) && (
          <div className="space-y-4">
            {/* Горизонтальная прокрутка для фотографий с стрелками */}
            <div className="relative">
              {/* Стрелка влево */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md"
                onClick={() => scrollLeft()}
                disabled={scrollPosition <= 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Стрелка вправо */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md"
                onClick={() => scrollRight()}
                disabled={scrollPosition >= getMaxScroll()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-3 pb-2 px-8" style={{ minWidth: 'max-content' }}>
                {/* Существующие изображения */}
                {isEdit && (formData.images || []).map((url, i) => (
                  <div key={`exist-${i}`} className="relative flex-shrink-0">
                    <img 
                      src={`${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`} 
                      alt={`img-${i}`} 
                      className="w-24 h-24 object-cover rounded border cursor-pointer"
                      onError={(e) => {
                        console.error(' Ошибка загрузки изображения:', url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      onClick={() => setFormData({ ...formData, images: (formData.images || []).filter((_, idx) => idx !== i) })}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {/* Новые превью */}
                {previewImages.map((src, i) => (
                  <div key={`new-${i}`} className="relative flex-shrink-0">
                    <img 
                      src={src} 
                      alt={`new-${i}`} 
                      className={`w-24 h-24 object-cover rounded border cursor-pointer ${
                        (isEdit ? (formData.images || []).length : 0) + i === mainImageIndex ? 'ring-2 ring-[#2A52BE]' : ''
                      }`}
                      onClick={() => setMainImageIndex((isEdit ? (formData.images || []).length : 0) + i)}
                    />
                    <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      onClick={() => removeImage(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                    {(isEdit ? (formData.images || []).length : 0) + i === mainImageIndex && (
                      <div className="absolute -bottom-1 -right-1 bg-[#2A52BE] text-white text-xs px-1 rounded">
                        Главная
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </div>
            </div>
            {/* Информация о главном фото */}
            {((isEdit && formData.images && formData.images.length > 0) || previewImages.length > 0) && (
              <div className="text-sm text-gray-600">
                <p>💡 Кликните на фото, чтобы выбрать главное (будет отображаться в списке филиалов)</p>
                {mainImageIndex < (isEdit ? (formData.images || []).length : 0) + previewImages.length && (
                  <p>Выбрано главное фото: {mainImageIndex + 1} из {(isEdit ? (formData.images || []).length : 0) + previewImages.length}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Конструктор контента для всех языков с вкладками */}
      <div className="space-y-4">
        <Label>Конструктор контента</Label>
        <Tabs defaultValue="ru" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ru">Русский</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="be">Беларуская</TabsTrigger>
          </TabsList>
          <TabsContent value="ru" className="space-y-4 mt-4">
            <ContentConstructor
              content={formData.content || []}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </TabsContent>
          <TabsContent value="en" className="space-y-4 mt-4">
            <ContentConstructor
              content={formData.contentEn || []}
              onChange={(contentEn) => setFormData({ ...formData, contentEn })}
            />
          </TabsContent>
          <TabsContent value="be" className="space-y-4 mt-4">
            <ContentConstructor
              content={formData.contentBe || []}
              onChange={(contentBe) => setFormData({ ...formData, contentBe })}
            />
          </TabsContent>
        </Tabs>
      </div>
      </div>
  );

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const list = Array.from(files);
    setSelectedImages((prev) => [...prev, ...list]);
    const readers: Promise<string>[] = list.map((f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string) || '');
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then((arr) => setPreviewImages((prev) => [...prev, ...arr]));
    e.currentTarget.value = '';
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // Такой input отдаст файлы всей папки (Chromium)
    handleImageSelect(e);
  }

  function removeImage(index: number) {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    for (const file of files) {
      // Проверяем размер файла на фронтенде
      if (file.size > maxSize) {
        toast.error(`Файл "${file.name}" слишком большой. Максимальный размер: 20MB`);
        continue;
      }
      
      const fd = new FormData();
      fd.append('image', file);
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin);
        const resp = await fetchWithAuth(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: fd,
        });
        if (resp.ok) {
          const json = await resp.json();
          urls.push(json.url);
        } else {
          let errorMessage = 'Не удалось загрузить изображение';
          try {
            const errorData = await resp.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Если не удалось распарсить JSON, используем текст ответа
            const text = await resp.text().catch(() => '');
            if (text.includes('File too large')) {
              errorMessage = 'Файл слишком большой. Максимальный размер: 20MB';
            } else if (text.includes('MulterError')) {
              errorMessage = 'Ошибка загрузки файла';
            }
          }
          console.error('Ошибка загрузки изображения:', file.name, errorMessage);
          toast.error(errorMessage);
        }
      } catch (err: any) {
        // Не показываем ошибку, если это 401 (уже выполнен logout и перенаправление)
        if (err?.message?.includes('Unauthorized')) {
          return urls;
        }
        console.error('Ошибка загрузки изображения:', err);
        toast.error('Ошибка соединения при загрузке изображения');
      }
    }
    return urls;
  }

  // Функции для прокрутки стрелками
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 120; // Ширина фото + отступ
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 120; // Ширина фото + отступ
      const maxScroll = getMaxScroll();
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const getMaxScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      return container.scrollWidth - container.clientWidth;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка филиалов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
          <Building2 className="w-6 h-6" />
          Управление филиалами
        </h2>
        <p className="text-gray-600">Создавайте и редактируйте филиалы с помощью конструктора контента</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#213659] hover:bg-[#1a2a4a] text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить филиал
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Создать новый филиал</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом филиале и используйте конструктор контента для добавления дополнительной информации.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              {renderFormContent()}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating}
                  className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                >
                  {isCreating ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#213659]">Список филиалов</h3>
        {!branches?.branches?.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">Филиалы не найдены</p>
            <p className="text-gray-500 text-sm">Нажмите "Добавить филиал", чтобы создать первый филиал</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {branches.branches.map((branch) => (
              <div key={branch.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-[#213659] mb-2">{branch.name}</h4>
                    <div className="space-y-1">
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Адрес:</span>
                        {branch.address}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Телефон:</span>
                        {branch.phone}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        {branch.email}
                      </p>
                      {branch.coordinates && (branch.coordinates.latitude || branch.coordinates.longitude) && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-medium">Координаты:</span>
                          {branch.coordinates.latitude && branch.coordinates.longitude 
                            ? `${branch.coordinates.latitude}, ${branch.coordinates.longitude}`
                            : 'Не указаны'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(branch)}
                      className="border-[#B1D1E0] hover:border-[#213659]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                      disabled={isDeleting}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
                
                {branch.description && (
                  <div className="mb-4">
                    <span className="font-medium text-[#213659]">Описание:</span>
                    <p className="text-gray-600 mt-1">{branch.description}</p>
                  </div>
                )}

                <div className="mb-4">
                  <span className="font-medium text-[#213659]">Контент:</span>
                  <div className="mt-2">
                    {renderContentPreview(branch.content || [])}
                  </div>
                </div>

                {branch.images && branch.images.length > 0 && (
                  <div>
                    <span className="font-medium text-[#213659]">Изображения:</span>
                    <div className="flex gap-2 mt-2">
                      {branch.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={`${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`}
                          alt={`Изображение ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            console.error(' Ошибка загрузки изображения филиала:', image);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3EОшибка%3C/text%3E%3C/svg%3E';
                          }}
                          onLoad={() => {
                            console.log(' Изображение филиала загружено:', image);
                          }}
                        />
                      ))}
                      {branch.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{branch.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать филиал</DialogTitle>
            <DialogDescription>
              Измените информацию о филиале и используйте конструктор контента для редактирования дополнительной информации.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            {renderFormContent(true)}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                type="submit"
                disabled={isUpdating}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
