import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Newspaper, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllNewsQuery, useCreateNewsMutation, useUpdateNewsMutation, useDeleteNewsMutation } from '@/app/services/newsApi';
import { useGetCategoriesQuery } from '@/app/services/categoryApi';
import type { NewsItem } from '@/types/News';
import { BASE_URL } from '@/constants';
import MultilingualContentEditor from './MultilingualContentEditor';
import type { ContentElement } from '@/types/branch';

interface CreateNewsRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  content?: ContentElement[] | string;
  contentEn?: ContentElement[] | string;
  contentBe?: ContentElement[] | string;
  photo?: File | null;
  images?: File[];
  categoryId: number;
}

export default function NewsManagement() {
  const { data: news, refetch, isLoading } = useGetAllNewsQuery();
  const { data: categories } = useGetCategoriesQuery();
  
  // Отладочная информация
  console.log('NewsManagement - categories:', categories);
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateNewsRequest>({
    name: '',
    nameEn: '',
    nameBe: '',
    content: [],
    contentEn: [],
    contentBe: [],
    photo: null,
    images: [],
    categoryId: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      nameBe: '',
      content: [],
      contentEn: [],
      contentBe: [],
      photo: null,
      images: [],
      categoryId: 0
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

  const handleCreate = async () => {

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nameEn', formData.nameEn || '');
      formDataToSend.append('nameBe', formData.nameBe || '');
      // Конвертируем массив контента в JSON строку
      const contentRu = Array.isArray(formData.content) ? JSON.stringify(formData.content) : (formData.content || '');
      const contentEn = Array.isArray(formData.contentEn) ? JSON.stringify(formData.contentEn) : (formData.contentEn || '');
      const contentBe = Array.isArray(formData.contentBe) ? JSON.stringify(formData.contentBe) : (formData.contentBe || '');
      formDataToSend.append('content', contentRu);
      formDataToSend.append('contentEn', contentEn);
      formDataToSend.append('contentBe', contentBe);
      formDataToSend.append('categoryId', formData.categoryId.toString());
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      // Добавляем дополнительные изображения
      selectedImages.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      await createNews(formDataToSend).unwrap();
      toast.success('Новость успешно создана');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании новости');
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    // Парсим контент из JSON строки, если это массив конструктора
    let contentRu: ContentElement[] | string = [];
    let contentEn: ContentElement[] | string = [];
    let contentBe: ContentElement[] | string = [];
    
    if (newsItem.content) {
      try {
        const parsed = JSON.parse(newsItem.content);
        contentRu = Array.isArray(parsed) ? parsed : newsItem.content;
      } catch {
        contentRu = newsItem.content;
      }
    }
    
    if (newsItem.contentEn) {
      try {
        const parsed = JSON.parse(newsItem.contentEn);
        contentEn = Array.isArray(parsed) ? parsed : newsItem.contentEn;
      } catch {
        contentEn = newsItem.contentEn;
      }
    }
    
    if (newsItem.contentBe) {
      try {
        const parsed = JSON.parse(newsItem.contentBe);
        contentBe = Array.isArray(parsed) ? parsed : newsItem.contentBe;
      } catch {
        contentBe = newsItem.contentBe;
      }
    }
    
    setFormData({
      name: newsItem.name,
      nameEn: newsItem.nameEn || '',
      nameBe: newsItem.nameBe || '',
      content: contentRu,
      contentEn: contentEn,
      contentBe: contentBe,
      photo: null,
      images: [],
      categoryId: newsItem.categoryId
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingNews) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nameEn', formData.nameEn || '');
      formDataToSend.append('nameBe', formData.nameBe || '');
      // Конвертируем массив контента в JSON строку
      const contentRu = Array.isArray(formData.content) ? JSON.stringify(formData.content) : (formData.content || '');
      const contentEn = Array.isArray(formData.contentEn) ? JSON.stringify(formData.contentEn) : (formData.contentEn || '');
      const contentBe = Array.isArray(formData.contentBe) ? JSON.stringify(formData.contentBe) : (formData.contentBe || '');
      formDataToSend.append('content', contentRu);
      formDataToSend.append('contentEn', contentEn);
      formDataToSend.append('contentBe', contentBe);
      formDataToSend.append('categoryId', formData.categoryId.toString());
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      // Добавляем дополнительные изображения
      selectedImages.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      await updateNews({ id: editingNews.id, formData: formDataToSend }).unwrap();
      toast.success('Новость успешно обновлена');
      setIsEditDialogOpen(false);
      setEditingNews(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении новости');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      return;
    }

    try {
      await deleteNews(id).unwrap();
      toast.success('Новость успешно удалена');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении новости');
    }
  };

  const renderForm = (isEdit: boolean = false) => (
    <form onSubmit={(e) => { e.preventDefault(); isEdit ? handleUpdate() : handleCreate(); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Название новости (RU) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название новости"
              className="h-12 text-base"
              required
            />
          </div>
          <div>
            <Label htmlFor="nameEn">Название новости (EN)</Label>
            <Input
              id="nameEn"
              value={formData.nameEn || ''}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="Enter news title"
              className="h-12 text-base"
            />
          </div>
          <div>
            <Label htmlFor="nameBe">Название новости (BE)</Label>
            <Input
              id="nameBe"
              value={formData.nameBe || ''}
              onChange={(e) => setFormData({ ...formData, nameBe: e.target.value })}
              placeholder="Увядзіце назву навіны"
              className="h-12 text-base"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId">Категория *</Label>
          <Select
            value={formData.categoryId > 0 ? formData.categoryId.toString() : ""}
            onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            required
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Загрузка категорий...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium mb-4">Содержание новости</Label>
          <MultilingualContentEditor
            titleRu=""
            subtitleRu=""
            contentRu={Array.isArray(formData.content) ? formData.content : []}
            titleEn=""
            subtitleEn=""
            contentEn={Array.isArray(formData.contentEn) ? formData.contentEn : []}
            titleBe=""
            subtitleBe=""
            contentBe={Array.isArray(formData.contentBe) ? formData.contentBe : []}
            onTitleRuChange={() => {}}
            onSubtitleRuChange={() => {}}
            onContentRuChange={(content) => setFormData({ ...formData, content })}
            onTitleEnChange={() => {}}
            onSubtitleEnChange={() => {}}
            onContentEnChange={(content) => setFormData({ ...formData, contentEn: content })}
            onTitleBeChange={() => {}}
            onSubtitleBeChange={() => {}}
            onContentBeChange={(content) => setFormData({ ...formData, contentBe: content })}
            titlePlaceholder=""
            subtitlePlaceholder=""
            hideTitleSubtitle={true}
          />
        </div>

      <div>
        <Label htmlFor="photo">Основное фото</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#213659] file:text-white hover:file:bg-[#1a2a47]"
        />
        {isEdit && editingNews?.photo && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Текущее фото:</p>
            <img 
              src={`${BASE_URL}${editingNews.photo.startsWith('/') ? '' : '/'}${editingNews.photo}`}
              alt="Текущее фото" 
              className="w-32 h-32 object-cover rounded border"
              onError={(e) => {
                console.error(' Ошибка загрузки изображения новости:', editingNews.photo);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log(' Изображение новости загружено:', editingNews.photo);
              }}
            />
          </div>
        )}
      </div>

      <div>
        <Label className="text-[#213659] font-medium">Дополнительные фото</Label>
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
            Выберите дополнительные фотографии
          </Button>
        </div>
        
        {/* Превью выбранных изображений */}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Выбранные изображения:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="outline"
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
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка новостей...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
          <Newspaper className="w-6 h-6" />
          Управление новостями
        </h2>
        <p className="text-gray-600">Создавайте и редактируйте новости для сайта</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#213659] hover:bg-[#1a2a4a] text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить новость
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Создать новую новость</DialogTitle>
            </DialogHeader>
            {renderForm()}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button 
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                {isCreating ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#213659]">Список новостей</h3>
        {!news?.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">Новости не найдены</p>
            <p className="text-gray-500 text-sm">Нажмите "Добавить новость", чтобы создать первую новость</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {news.map((newsItem) => (
              <div key={newsItem.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-[#213659] mb-2 break-words">{newsItem.name}</h4>
                    <div className="space-y-1">
                      <p className="text-gray-600 flex items-center gap-2 break-words">
                        <span className="font-medium flex-shrink-0">Категория:</span>
                        <span className="break-words">{newsItem.newsCategory?.name || 'Не назначена'}</span>
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="font-medium flex-shrink-0">Дата создания:</span>
                        <span>{new Date(newsItem.createdAt).toLocaleDateString('ru-RU')}</span>
                      </p>
                      {newsItem.content && (
                        <p className="text-gray-600 break-words">
                          <span className="font-medium">Содержание:</span>
                          <span className="ml-2 break-words">
                            {(() => {
                              const contentStr = typeof newsItem.content === 'string' 
                                ? newsItem.content 
                                : JSON.stringify(newsItem.content);
                              return contentStr.length > 100 
                                ? `${contentStr.substring(0, 100)}...` 
                                : contentStr;
                            })()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(newsItem)}
                      className="border-[#B1D1E0] hover:border-[#213659]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(newsItem.id)}
                      disabled={isDeleting}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
                
                {newsItem.photo && (
                  <div>
                    <span className="font-medium text-[#213659]">Фото:</span>
                    <div className="mt-2">
                      <img 
                        src={`${BASE_URL}${newsItem.photo.startsWith('/') ? '' : '/'}${newsItem.photo}`}
                        alt={newsItem.name}
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          console.error(' Ошибка загрузки изображения новости:', newsItem.photo);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EОшибка загрузки%3C/text%3E%3C/svg%3E';
                        }}
                        onLoad={() => {
                          console.log(' Изображение новости загружено:', newsItem.photo);
                        }}
                      />
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
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать новость</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
