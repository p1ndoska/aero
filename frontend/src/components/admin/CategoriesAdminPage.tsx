//@ts-nocheck
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Edit, Trash2, Plus } from "lucide-react";
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "@/app/services/categoryApi";
import { useGetAllNewsQuery } from "@/app/services/newsApi";
import { canAccessAdminPanel } from "@/utils/roleUtils";

const CategoriesAdminPage = () => {
    const { user } = useSelector((state: any) => state.auth);
    const roleValue = user?.role;
    const roleName = (typeof roleValue === "string" ? roleValue : roleValue?.name) ?? "";
    const isAdmin = canAccessAdminPanel(roleName);

    const { data, isLoading, refetch } = useGetCategoriesQuery();
    const { data: allNews } = useGetAllNewsQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    // Функция для подсчета новостей в категории
    const getNewsCountForCategory = (categoryId: number) => {
        return allNews?.filter(news => news.categoryId === categoryId).length || 0;
    };

    const [newName, setNewName] = useState("");
    const [newNameEn, setNewNameEn] = useState("");
    const [newNameBe, setNewNameBe] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingNameEn, setEditingNameEn] = useState("");
    const [editingNameBe, setEditingNameBe] = useState("");

    useEffect(() => {
        if (!isAdmin) {
            toast.error("Доступ запрещен: только для администраторов");
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6 text-center text-red-600">Доступ запрещен</CardContent>
                </Card>
            </div>
        );
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) {
            toast.error("Введите название категории");
            return;
        }
        try {
            await createCategory({ 
                name, 
                nameEn: newNameEn.trim() || undefined,
                nameBe: newNameBe.trim() || undefined
            }).unwrap();
            toast.success("Категория создана");
            setNewName("");
            setNewNameEn("");
            setNewNameBe("");
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || "Ошибка создания категории");
        }
    };

    const startEdit = (id: number, currentName: string, currentNameEn?: string, currentNameBe?: string) => {
        setEditingId(id);
        setEditingName(currentName);
        setEditingNameEn(currentNameEn || "");
        setEditingNameBe(currentNameBe || "");
    };

    const applyEdit = async () => {
        if (!editingId) return;
        const name = editingName.trim();
        if (!name) {
            toast.error("Введите название категории");
            return;
        }
        try {
            await updateCategory({ 
                id: editingId, 
                name,
                nameEn: editingNameEn.trim() || undefined,
                nameBe: editingNameBe.trim() || undefined
            }).unwrap();
            toast.success("Категория обновлена");
            setEditingId(null);
            setEditingName("");
            setEditingNameEn("");
            setEditingNameBe("");
            refetch();
        } catch (err: any) {
            toast.error(err.data?.error || "Ошибка обновления категории");
        }
    };

    const handleDelete = async (id: number, categoryName: string) => {
        if (!confirm(`Удалить категорию "${categoryName}"? Это действие необратимо.`)) return;
        try {
            await deleteCategory({ id }).unwrap();
            toast.success(`Категория "${categoryName}" успешно удалена`);
            refetch();
        } catch (err: any) {
            // Если есть связанные новости, предлагаем каскадное удаление
            if (err.data?.error && err.data.error.includes('содержится')) {
                const newsCount = err.data.newsCount;
                const shouldCascade = confirm(
                    `В категории "${categoryName}" содержится ${newsCount} новостей.\n\n` +
                    `Хотите удалить категорию вместе с новостями?\n\n` +
                    `ВНИМАНИЕ: Это действие необратимо!`
                );
                
                if (shouldCascade) {
                    try {
                        const result = await deleteCategory({ id, cascade: true }).unwrap();
                        toast.success(result.message);
                        refetch();
                    } catch (cascadeErr: any) {
                        toast.error(cascadeErr.data?.error || "Ошибка при каскадном удалении");
                    }
                }
            } else {
                toast.error(err.data?.error || "Ошибка удаления категории");
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[var(--color-primary)]">Категории новостей</h1>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-[var(--color-primary)]">Добавить категорию</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="new-category" className="text-[var(--color-primary)]">Название (RU) *</Label>
                                <Input id="new-category" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-white border-[#B1D1E0]" required />
                            </div>
                            <div>
                                <Label htmlFor="new-category-en" className="text-[var(--color-primary)]">Название (EN)</Label>
                                <Input id="new-category-en" value={newNameEn} onChange={(e) => setNewNameEn(e.target.value)} className="bg-white border-[#B1D1E0]" />
                            </div>
                            <div>
                                <Label htmlFor="new-category-be" className="text-[var(--color-primary)]">Название (BE)</Label>
                                <Input id="new-category-be" value={newNameBe} onChange={(e) => setNewNameBe(e.target.value)} className="bg-white border-[#B1D1E0]" />
                            </div>
                        </div>
                        <Button type="submit" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white" disabled={isCreating}>
                            <Plus className="w-4 h-4 mr-2" />Создать
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-[var(--color-primary)]">Список категорий</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        💡 Категории можно удалить вместе с новостями. При попытке удалить категорию с новостями система предложит каскадное удаление.
                    </p>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-[var(--color-primary)]">Загрузка...</div>
                    ) : !data?.length ? (
                        <div className="text-[#6A81A9]">Категорий нет</div>
                    ) : (
                        <div className="space-y-3">
                            {data.map((c) => (
                                    <div key={c.id} className="border border-[#B1D1E0] p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                        {editingId === c.id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label className="text-[var(--color-primary)]">Название (RU) *</Label>
                                                        <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-white border-[#B1D1E0] focus:border-[var(--color-primary)]" required />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[var(--color-primary)]">Название (EN)</Label>
                                                        <Input value={editingNameEn} onChange={(e) => setEditingNameEn(e.target.value)} className="bg-white border-[#B1D1E0] focus:border-[var(--color-primary)]" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[var(--color-primary)]">Название (BE)</Label>
                                                        <Input value={editingNameBe} onChange={(e) => setEditingNameBe(e.target.value)} className="bg-white border-[#B1D1E0] focus:border-[var(--color-primary)]" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={applyEdit} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white" disabled={isUpdating}>Сохранить</Button>
                                                    <Button variant="outline" onClick={() => { setEditingId(null); setEditingName(""); setEditingNameEn(""); setEditingNameBe(""); }}>Отмена</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="text-[var(--color-primary)] font-medium">{c.name}</div>
                                                    {(c.nameEn || c.nameBe) && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {c.nameEn && <span>EN: {c.nameEn}</span>}
                                                            {c.nameEn && c.nameBe && <span> | </span>}
                                                            {c.nameBe && <span>BE: {c.nameBe}</span>}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Новостей: {getNewsCountForCategory(c.id)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => startEdit(c.id, c.name, c.nameEn, c.nameBe)} className="hover:bg-blue-50">
                                                        <Edit className="w-4 h-4 mr-1" /> Редактировать
                                                    </Button>
                                                    <button 
                                                        onClick={() => handleDelete(c.id, c.name)} 
                                                        disabled={isDeleting}
                                                        title={`Удалить категорию "${c.name}"`}
                                                        className="bg-white hover:bg-gray-50 text-red-600 border border-solid border-red-600 px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoriesAdminPage; 