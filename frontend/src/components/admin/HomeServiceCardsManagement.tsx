import { useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useCreateHomeServiceCardMutation,
    useDeleteHomeServiceCardMutation,
    useGetAdminHomeServiceCardsQuery,
    useUpdateHomeServiceCardMutation,
    type HomeServiceCard,
} from '@/app/services/homeServiceCardApi';
import { BASE_URL } from '@/constants';

type CardForm = {
    title: string;
    titleEn: string;
    titleBe: string;
    href: string;
    sortOrder: string;
    isActive: boolean;
    image: File | null;
    imageUrl: string;
};

const emptyForm: CardForm = {
    title: '',
    titleEn: '',
    titleBe: '',
    href: '',
    sortOrder: '0',
    isActive: true,
    image: null,
    imageUrl: '',
};

const toFormData = (form: CardForm) => {
    const body = new FormData();
    body.append('title', form.title);
    body.append('titleEn', form.titleEn);
    body.append('titleBe', form.titleBe);
    body.append('href', form.href);
    body.append('sortOrder', form.sortOrder);
    body.append('isActive', String(form.isActive));
    if (form.image) body.append('image', form.image);
    else if (form.imageUrl) body.append('imageUrl', form.imageUrl);
    return body;
};

const imageSrc = (url?: string | null) => (
    url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : undefined
);

export default function HomeServiceCardsManagement() {
    const { data: cards = [], isLoading } = useGetAdminHomeServiceCardsQuery();
    const [createCard] = useCreateHomeServiceCardMutation();
    const [updateCard] = useUpdateHomeServiceCardMutation();
    const [deleteCard] = useDeleteHomeServiceCardMutation();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<CardForm>(emptyForm);

    const startCreate = () => {
        setEditingId(null);
        setIsFormOpen(true);
        setForm({ ...emptyForm, sortOrder: String(cards.length) });
    };

    const startEdit = (card: HomeServiceCard) => {
        setEditingId(card.id);
        setIsFormOpen(true);
        setForm({
            title: card.title,
            titleEn: card.titleEn || '',
            titleBe: card.titleBe || '',
            href: card.href,
            sortOrder: String(card.sortOrder),
            isActive: card.isActive,
            image: null,
            imageUrl: card.imageUrl || '',
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setIsFormOpen(false);
        setForm(emptyForm);
    };

    const save = async () => {
        if (!form.title.trim() || !form.href.trim()) {
            toast.error('Заполните название и ссылку');
            return;
        }

        try {
            const body = toFormData(form);
            if (editingId === null) {
                await createCard(body).unwrap();
                toast.success('Карточка создана');
            } else {
                await updateCard({ id: editingId, body }).unwrap();
                toast.success('Карточка обновлена');
            }
            resetForm();
        } catch {
            toast.error('Не удалось сохранить карточку');
        }
    };

    const remove = async (id: number) => {
        if (!window.confirm('Удалить карточку?')) return;
        try {
            await deleteCard(id).unwrap();
            if (editingId === id) resetForm();
            toast.success('Карточка удалена');
        } catch {
            toast.error('Не удалось удалить карточку');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Карточки услуг на главной</h2>
                    <p className="text-sm text-muted-foreground">Управление названием, ссылкой и изображением карточки.</p>
                </div>
                <Button onClick={startCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить карточку
                </Button>
            </div>

            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId === null ? 'Новая карточка' : 'Редактирование карточки'}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="home-card-title">Название</Label>
                            <Input id="home-card-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-card-href">Страница или ссылка</Label>
                            <Input id="home-card-href" placeholder="/services/example" value={form.href} onChange={(event) => setForm({ ...form, href: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-card-title-en">Название (EN)</Label>
                            <Input id="home-card-title-en" value={form.titleEn} onChange={(event) => setForm({ ...form, titleEn: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-card-title-be">Название (BE)</Label>
                            <Input id="home-card-title-be" value={form.titleBe} onChange={(event) => setForm({ ...form, titleBe: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-card-order">Порядок</Label>
                            <Input id="home-card-order" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-card-image">Изображение</Label>
                            <Input id="home-card-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} />
                            {form.imageUrl && !form.image && <img className="h-20 w-32 rounded object-cover" src={imageSrc(form.imageUrl)} alt={form.title} />}
                        </div>
                        <div className="flex items-center gap-2">
                            <input id="home-card-active" type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
                            <Label htmlFor="home-card-active">Показывать на главной</Label>
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button onClick={save}>Сохранить</Button>
                            <Button variant="outline" onClick={resetForm}>
                                <X className="mr-2 h-4 w-4" />
                                Отмена
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {isLoading && <p>Загрузка карточек...</p>}
                {cards.map((card) => (
                    <Card key={card.id}>
                        <CardContent className="flex items-center gap-4 p-4">
                            {card.imageUrl ? (
                                <img className="h-16 w-24 rounded object-cover" src={imageSrc(card.imageUrl)} alt={card.title} />
                            ) : (
                                <div className="h-16 w-24 rounded bg-muted" />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">{card.title}</p>
                                <p className="truncate text-sm text-muted-foreground">{card.href}</p>
                            </div>
                            <Button variant="outline" size="icon" onClick={() => startEdit(card)} aria-label="Редактировать">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => remove(card.id)} aria-label="Удалить">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
