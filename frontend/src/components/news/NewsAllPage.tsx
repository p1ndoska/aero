//@ts-nocheck
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslatedField } from "../../utils/translationHelpers";
import {
    useGetAllNewsQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} from "@/app/services/newsApi";
import type { NewsItem } from "@/types/News.ts";
import { BASE_URL } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Image, Calendar, Tag, X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetCategoriesQuery } from "@/app/services/categoryApi";

export const NewsAllPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [createPhoto, setCreatePhoto] = useState<File | null>(null);
    const [editPhoto, setEditPhoto] = useState<File | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const additionalImagesRef = useRef<HTMLInputElement>(null);

    const { data: categories } = useGetCategoriesQuery();

    const [createForm, setCreateForm] = useState({
        name: "",
        nameEn: "",
        nameBe: "",
        content: "",
        contentEn: "",
        contentBe: "",
        categoryId: 0,
    });

    const [editForm, setEditForm] = useState({
        id: 0,
        name: "",
        nameEn: "",
        nameBe: "",
        content: "",
        contentEn: "",
        contentBe: "",
        categoryId: 0,
    });

    const { data: newsData, isLoading, error, refetch } = useGetAllNewsQuery();
    const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
    const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
    const [deleteNews] = useDeleteNewsMutation();

    const { user } = useSelector((state: any) => state.auth);
    const roleValue = user?.role;
    const roleName = (typeof roleValue === "string" ? roleValue : roleValue?.name) ?? "";
    const isAdmin = roleName.toString().toUpperCase() === "SUPER_ADMIN" || 
                   roleName.toString().toLowerCase() === "admin" || 
                   roleName.toString().toLowerCase() === "administrator";

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreatePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCreatePhoto(file);
        }
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

    const resetCreateForm = () => {
        setCreateForm({
            name: "",
            nameEn: "",
            nameBe: "",
            content: "",
            contentEn: "",
            contentBe: "",
            categoryId: 0,
        });
        setCreatePhoto(null);
        setSelectedImages([]);
        setPreviewImages([]);
        if (createFileInputRef.current) {
            createFileInputRef.current.value = "";
        }
        if (additionalImagesRef.current) {
            additionalImagesRef.current.value = "";
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createForm.name || !createForm.categoryId) {
            toast.error(t('fill_required_fields'));
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", createForm.name);
            formData.append("nameEn", createForm.nameEn || "");
            formData.append("nameBe", createForm.nameBe || "");
            formData.append("content", createForm.content || "");
            formData.append("contentEn", createForm.contentEn || "");
            formData.append("contentBe", createForm.contentBe || "");
            formData.append("categoryId", createForm.categoryId.toString());

            if (createPhoto) {
                formData.append("photo", createPhoto);
            }

            selectedImages.forEach((image) => {
                formData.append("images", image);
            });

            await createNews(formData).unwrap();
            toast.success(t('news_created_successfully'));
            resetCreateForm();
            setIsCreateDialogOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || t('error_creating_news'));
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditPhoto(file);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editForm.name || !editForm.categoryId) {
            toast.error(t('fill_required_fields'));
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("nameEn", editForm.nameEn || "");
            formData.append("nameBe", editForm.nameBe || "");
            formData.append("content", editForm.content || "");
            formData.append("contentEn", editForm.contentEn || "");
            formData.append("contentBe", editForm.contentBe || "");
            formData.append("categoryId", editForm.categoryId.toString());

            if (editPhoto) {
                formData.append("photo", editPhoto);
            }

            selectedImages.forEach((image) => {
                formData.append("images", image);
            });

            await updateNews({ id: editForm.id, formData }).unwrap();
            toast.success(t('news_updated_successfully'));
            setIsEditDialogOpen(false);
            setSelectedNews(null);
            setEditPhoto(null);
            setSelectedImages([]);
            setPreviewImages([]);
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || t('error_updating_news'));
        }
    };

    const handleEditClick = (news: NewsItem) => {
        setSelectedNews(news);
        setEditForm({
            id: news.id,
            name: news.name || "",
            nameEn: news.nameEn || "",
            nameBe: news.nameBe || "",
            content: news.content || "",
            contentEn: news.contentEn || "",
            contentBe: news.contentBe || "",
            categoryId: news.categoryId,
        });
        setEditPhoto(null);
        setSelectedImages([]);
        setPreviewImages([]);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = async (news: NewsItem) => {
        const translatedName = getTranslatedField(news, 'name', language) || news.name;
        if (window.confirm(`${t('confirm_delete_news')} "${translatedName}"?`)) {
            try {
                await deleteNews(news.id).unwrap();
                toast.success(t('news_deleted_successfully'));
                refetch();
            } catch (err: any) {
                toast.error(err.data?.error || t('error_deleting_news'));
            }
        }
    };

    const removeCreatePhoto = () => {
        setCreatePhoto(null);
        if (createFileInputRef.current) {
            createFileInputRef.current.value = "";
        }
    };

    const removeEditPhoto = () => {
        setEditPhoto(null);
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-500">{t('error_loading_news')}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#213659]">{t('all_news')}</h1>
                {isAdmin && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#213659] hover:bg-[#1a2a4a]">
                                <Plus className="w-4 h-4 mr-2" />
                                {t('create_news')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
                            <DialogHeader>
                                <DialogTitle>{t('creating_news')}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="name">Название новости (RU) *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={createForm.name}
                                                onChange={handleCreateChange}
                                                placeholder="Введите название новости"
                                                className="h-12 text-base"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="nameEn">Название новости (EN)</Label>
                                            <Input
                                                id="nameEn"
                                                name="nameEn"
                                                value={createForm.nameEn || ''}
                                                onChange={handleCreateChange}
                                                placeholder="Enter news title"
                                                className="h-12 text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="nameBe">Название новости (BE)</Label>
                                            <Input
                                                id="nameBe"
                                                name="nameBe"
                                                value={createForm.nameBe || ''}
                                                onChange={handleCreateChange}
                                                placeholder="Увядзіце назву навіны"
                                                className="h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="categoryId">Категория *</Label>
                                        <Select
                                            value={createForm.categoryId > 0 ? createForm.categoryId.toString() : ""}
                                            onValueChange={(value) => setCreateForm({ ...createForm, categoryId: parseInt(value) })}
                                            required
                                        >
                                            <SelectTrigger className="h-12 text-base">
                                                <SelectValue placeholder="Выберите категорию" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                {categories && categories.length > 0 ? (
                                                    categories.map((category: any) => {
                                                        const translatedCategoryName = getTranslatedField(category, 'name', language) || category.name;
                                                        return (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {translatedCategoryName}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <SelectItem value="" disabled>
                                                        {t('loading_categories')}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="content">Содержание (RU)</Label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                value={createForm.content || ''}
                                                onChange={handleCreateChange}
                                                placeholder="Введите содержание новости"
                                                className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contentEn">Содержание (EN)</Label>
                                            <textarea
                                                id="contentEn"
                                                name="contentEn"
                                                value={createForm.contentEn || ''}
                                                onChange={handleCreateChange}
                                                placeholder="Enter news content"
                                                className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contentBe">Содержание (BE)</Label>
                                            <textarea
                                                id="contentBe"
                                                name="contentBe"
                                                value={createForm.contentBe || ''}
                                                onChange={handleCreateChange}
                                                placeholder="Увядзіце змест навіны"
                                                className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                            />
                                        </div>
                                </div>

                                    <div>
                                        <Label htmlFor="photo">Основное фото</Label>
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCreatePhotoChange}
                                            ref={createFileInputRef}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#213659] file:text-white hover:file:bg-[#1a2a47]"
                                        />
                                </div>

                                    <div>
                                        <Label className="text-[#213659] font-medium">Дополнительные фото</Label>
                                        <div className="mt-2">
                                            <input
                                                ref={additionalImagesRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => additionalImagesRef.current?.click()}
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
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={isCreating}
                                        className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                                    >
                                        {isCreating ? t('creating') : t('create')}
                                </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData?.map((news) => {
                    const translatedName = getTranslatedField(news, 'name', language) || news.name;
                    const translatedContent = getTranslatedField(news, 'content', language) || news.content;
                    return (
                    <Card key={news.id} className="hover:shadow-lg transition-shadow bg-white p-0 overflow-hidden">
                        <Link to={`/news/${news.id}`} className="block">
                            {news.photo && (
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={`${BASE_URL}${news.photo.startsWith('/') ? news.photo : '/' + news.photo}`} 
                                        alt={translatedName} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('❌ Ошибка загрузки изображения новости:', news.photo);
                                            const imageUrl = `${BASE_URL}${news.photo.startsWith('/') ? news.photo : '/' + news.photo}`;
                                            console.error('❌ Полный URL:', imageUrl);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                            console.log('✅ Изображение новости загружено:', news.photo);
                                        }}
                                    />
                                </div>
                            )}
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-[#213659] line-clamp-2">{translatedName}</CardTitle>
                            </CardHeader>
                        </Link>

                        {isAdmin && (
                            <div className="flex gap-2 pt-4 px-6">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(news)} className="flex-1">
                                    <Edit className="w-4 h-4 mr-1" />
                                    {t('edit_news')}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(news)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </Card>
                    );
                })}
            </div>

            {/* Диалог редактирования новости */}
            {isAdmin && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
                        <DialogHeader>
                            <DialogTitle>{t('editing_news')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="edit-name">Название новости (RU) *</Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditFormChange}
                                            placeholder="Введите название новости"
                                            className="h-12 text-base"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-nameEn">Название новости (EN)</Label>
                                        <Input
                                            id="edit-nameEn"
                                            name="nameEn"
                                            value={editForm.nameEn || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Enter news title"
                                            className="h-12 text-base"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-nameBe">Название новости (BE)</Label>
                                        <Input
                                            id="edit-nameBe"
                                            name="nameBe"
                                            value={editForm.nameBe || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Увядзіце назву навіны"
                                            className="h-12 text-base"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="edit-categoryId">Категория *</Label>
                                    <Select
                                        value={editForm.categoryId > 0 ? editForm.categoryId.toString() : ""}
                                        onValueChange={(value) => setEditForm({ ...editForm, categoryId: parseInt(value) })}
                                        required
                                    >
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Выберите категорию" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                            {categories && categories.length > 0 ? (
                                                categories.map((category: any) => {
                                                    const translatedCategoryName = getTranslatedField(category, 'name', language) || category.name;
                                                    return (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {translatedCategoryName}
                                                        </SelectItem>
                                                    );
                                                })
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    {t('loading_categories')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="edit-content">Содержание (RU)</Label>
                                        <textarea
                                            id="edit-content"
                                            name="content"
                                            value={editForm.content || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Введите содержание новости"
                                            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-contentEn">Содержание (EN)</Label>
                                        <textarea
                                            id="edit-contentEn"
                                            name="contentEn"
                                            value={editForm.contentEn || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Enter news content"
                                            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-contentBe">Содержание (BE)</Label>
                                        <textarea
                                            id="edit-contentBe"
                                            name="contentBe"
                                            value={editForm.contentBe || ''}
                                            onChange={handleEditFormChange}
                                            placeholder="Увядзіце змест навіны"
                                            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#213659] focus:border-[#213659] resize-vertical text-base"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="edit-photo">Основное фото</Label>
                                    <Input
                                        id="edit-photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditPhotoChange}
                                        ref={editFileInputRef}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#213659] file:text-white hover:file:bg-[#1a2a47]"
                                    />
                                    {selectedNews?.photo && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">Текущее фото:</p>
                                            <img 
                                                src={`${BASE_URL}${selectedNews.photo.startsWith('/') ? '' : '/'}${selectedNews.photo}`}
                                                alt="Текущее фото" 
                                                className="w-32 h-32 object-cover rounded border"
                                                onError={(e) => {
                                                    console.error('❌ Ошибка загрузки изображения новости:', selectedNews.photo);
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-[#213659] font-medium">Дополнительные фото</Label>
                                    <div className="mt-2">
                                        <input
                                            ref={additionalImagesRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => additionalImagesRef.current?.click()}
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
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={isUpdating}
                                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                                >
                                    {isUpdating ? t('saving') : t('save')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {!newsData?.length && (
                <div className="text-center py-12">
                    <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_news_yet')}</h3>
                    <p className="text-gray-500">{t('create_first_news')}</p>
                </div>
            )}
        </div>
    );
};

export default NewsAllPage; 