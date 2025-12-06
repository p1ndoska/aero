//@ts-nocheck
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Edit, Trash2, Image, Calendar, Tag, X } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslatedField } from "../../utils/translationHelpers";

interface Props {
    title: string;
    categoryName: string;
}

export const NewsCategoryPage: React.FC<Props> = ({ title, categoryName }) => {
    const { t, language } = useLanguage();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [createPhoto, setCreatePhoto] = useState<File | null>(null);
    const [editPhoto, setEditPhoto] = useState<File | null>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [createForm, setCreateForm] = useState({
        name: "",
        content: "",
        categoryId: "",
    });

    const [editForm, setEditForm] = useState({
        id: 0,
        name: "",
        content: "",
        categoryId: "",
    });

    const { data: allNews, isLoading, error, refetch } = useGetAllNewsQuery();
    const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
    const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
    const [deleteNews] = useDeleteNewsMutation();

    const { user } = useSelector((state: any) => state.auth);
    const roleValue = user?.role;
    const roleName = (typeof roleValue === "string" ? roleValue : roleValue?.name) ?? "";
    const isAdmin = roleName.toString().toUpperCase() === "SUPER_ADMIN" || 
                   roleName.toString().toLowerCase() === "admin" || 
                   roleName.toString().toLowerCase() === "administrator";

    const normalizedTarget = categoryName.trim().toLowerCase();
    const newsData = (allNews || []).filter((n) => (n?.newsCategory?.name || "").toString().trim().toLowerCase() === normalizedTarget);

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({
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

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createForm.name || !createForm.categoryId) {
            toast.error("Заполните обязательные поля");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", createForm.name);
            formData.append("content", createForm.content);
            formData.append("categoryId", createForm.categoryId);

            if (createPhoto) {
                formData.append("photo", createPhoto);
            }

            await createNews(formData).unwrap();
            toast.success("Новость успешно создана! 🎉");
            setCreateForm({ name: "", content: "", categoryId: "" });
            setCreatePhoto(null);
            if (createFileInputRef.current) {
                createFileInputRef.current.value = "";
            }
            setIsCreateDialogOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || "Ошибка при создании новости");
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
            toast.error("Заполните обязательные поля");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("content", editForm.content);
            formData.append("categoryId", editForm.categoryId);

            if (editPhoto) {
                formData.append("photo", editPhoto);
            }

            await updateNews({ id: editForm.id, formData }).unwrap();
            toast.success("Новость успешно обновлена! ✅");
            setIsEditDialogOpen(false);
            setSelectedNews(null);
            setEditPhoto(null);
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || "Ошибка при обновлении новости");
        }
    };

    const handleEditClick = (news: NewsItem) => {
        setSelectedNews(news);
        setEditForm({
            id: news.id,
            name: news.name,
            content: news.content || "",
            categoryId: news.categoryId.toString(),
        });
        setEditPhoto(null);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = async (news: NewsItem) => {
        const translatedName = getTranslatedField(news, 'name', language) || news.name;
        if (window.confirm(`${t('confirm_delete_news')} "${translatedName}"?`)) {
            try {
                await deleteNews(news.id).unwrap();
                toast.success("Новость успешно удалена! 🗑️");
                refetch();
            } catch (err: any) {
                toast.error(err.data?.error || "Ошибка при удалении новости");
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
                        <div className="text-center text-red-500">Ошибка при загрузке новостей</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#213659]">{title}</h1>
                {isAdmin && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#213659] hover:bg-[#1a2a4a]">
                                <Plus className="w-4 h-4 mr-2" />
                                Создать новость
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200">
                            <DialogHeader>
                                <DialogTitle className="text-[#213659]">Создание новости</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[#213659]">Заголовок *</Label>
                                    <Input id="name" name="name" value={createForm.name} onChange={handleCreateChange} required className="bg-white border-[#B1D1E0]" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content" className="text-[#213659]">Содержание</Label>
                                    <Textarea id="content" name="content" value={createForm.content} onChange={handleCreateChange} rows={4} className="bg-white border-[#B1D1E0]" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId" className="text-[#213659]">ID категории * <span className="text-xs text-[#6A81A9]">(страница: {categoryName})</span></Label>
                                    <Input id="categoryId" name="categoryId" type="number" value={createForm.categoryId} onChange={handleCreateChange} required className="bg-white border-[#B1D1E0]" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photo" className="text-[#213659]">Изображение</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="photo" type="file" accept="image/*" onChange={handleCreatePhotoChange} ref={createFileInputRef} className="bg-white border-[#B1D1E0]" />
                                        {createPhoto && (
                                            <Button type="button" variant="outline" size="sm" onClick={removeCreatePhoto}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {createPhoto && <p className="text-sm text-green-600">Файл выбран: {createPhoto.name}</p>}
                                </div>

                                <Button type="submit" className="w-full bg-[#213659] hover:bg-[#1a2a4a]" disabled={isCreating}>
                                    {isCreating ? "Создание..." : "Создать"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData?.map((news) => {
                    const translatedName = getTranslatedField(news, 'name', language) || news.name;
                    return (
                    <Card key={news.id} className="hover:shadow-lg transition-shadow bg-white p-0 overflow-hidden">
                        <Link to={`/news/${news.id}`} className="block">
                            {news.photo && (
                                <div className="relative h-48 overflow-hidden">
                                    <img src={`${BASE_URL}/${news.photo}`} alt={translatedName} className="w-full h-full object-cover" />
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
                                    Редактировать
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

            {!newsData?.length && (
                <div className="text-center py-12">
                    <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Новостей пока нет</h3>
                    <p className="text-gray-500">Создайте первую новость, нажав на кнопку выше</p>
                </div>
            )}
        </div>
    );
};

export default NewsCategoryPage; 