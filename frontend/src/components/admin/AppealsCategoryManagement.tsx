import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAppealsCategoriesQuery, useCreateAppealsCategoryMutation, useUpdateAppealsCategoryMutation, useDeleteAppealsCategoryMutation, useUpdateCategoriesOrderMutation } from '@/app/services/appealsCategoryApi';

interface FormData {
  name: string; nameEn: string; nameBe: string;
  description: string; descriptionEn: string; descriptionBe: string;
  pageType: string; isActive: boolean; sortOrder: number;
}

const initialForm: FormData = { name: '', nameEn: '', nameBe: '', description: '', descriptionEn: '', descriptionBe: '', pageType: '', isActive: true, sortOrder: 0 };

export default function AppealsCategoryManagement() {
  const { data: categories, refetch, error, isLoading } = useGetAppealsCategoriesQuery();
  const [createCategory] = useCreateAppealsCategoryMutation();
  const [updateCategory] = useUpdateAppealsCategoryMutation();
  const [deleteCategory] = useDeleteAppealsCategoryMutation();
  const [updateOrder] = useUpdateCategoriesOrderMutation();

  const { user } = useSelector((s: any) => s.auth);
  const role = (typeof user?.role === 'string' ? user.role : user?.role?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'ABOUT_ADMIN'].includes(role.toString().toUpperCase());

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const set = (k: keyof FormData, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const onCreate = async () => {
    try { 
      await createCategory(form).unwrap(); 
      toast.success('Создано'); 
      setCreateOpen(false); 
      setForm(initialForm); 
      refetch(); 
    }
    catch (e: any) { 
      toast.error(e?.data?.error || 'Ошибка'); 
    }
  };
  const onEdit = async () => {
    try { 
      await updateCategory({ id: editing.id, ...form }).unwrap(); 
      toast.success('Сохранено'); 
      setEditOpen(false); 
      setEditing(null); 
      setForm(initialForm); 
      refetch(); 
    }
    catch (e: any) { 
      toast.error(e?.data?.error || 'Ошибка'); 
    }
  };
  const onDelete = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;
    try { await deleteCategory(id).unwrap(); toast.success('Удалено'); refetch(); }
    catch (e: any) { toast.error(e?.data?.error || 'Ошибка'); }
  };

  const onDrop = async (dropIndex: number) => {
    if (dragIndex === null || !categories) return;
    const arr = [...categories];
    const item = arr[dragIndex];
    arr.splice(dragIndex, 1); arr.splice(dropIndex, 0, item);
    try {
      await updateOrder({ categories: arr.map((c, i) => ({ id: c.id, sortOrder: i })) }).unwrap();
      toast.success('Порядок обновлен'); refetch();
    } catch (e: any) { toast.error(e?.data?.error || 'Ошибка'); }
    setDragIndex(null);
  };

  if (!isAdmin) return <div className="p-6"><Card><CardContent className="p-6 text-center">Нет доступа</CardContent></Card></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Подкатегории "Обращения"</h1>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white" style={{backgroundColor: '#213659', color: 'white'}}><Plus className="w-4 h-4 mr-2"/>Добавить подкатегорию</Button>
      </div>

      {isLoading && <div className="py-6 text-center">Загрузка...</div>}
      {error && <div className="py-6 text-center text-red-600">Не удалось загрузить</div>}

      <div className="grid gap-4">
        {categories?.map((c, i) => (
          <Card key={c.id} draggable onDragStart={()=>setDragIndex(i)} onDragOver={(e)=>e.preventDefault()} onDrop={()=>onDrop(i)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{c.name}</h3>
                  {c.description && (
                    <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="mb-1"><strong>Тип страницы:</strong> {c.pageType}</div>
                      <div className="mb-1"><strong>Статус:</strong> {c.isActive ? 'Активна' : 'Неактивна'}</div>
                    </div>
                    <div>
                      <div className="mb-1"><strong>Порядок:</strong> {c.sortOrder}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-2">Переводы:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {c.nameEn && <div><strong>EN:</strong> {c.nameEn}</div>}
                      {c.nameBe && <div><strong>BE:</strong> {c.nameBe}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={()=>{setEditing(c); setForm({ name: c.name||'', nameEn: c.nameEn||'', nameBe: c.nameBe||'', description: c.description||'', descriptionEn: c.descriptionEn||'', descriptionBe: c.descriptionBe||'', pageType: c.pageType||'', isActive: c.isActive, sortOrder: c.sortOrder||0 }); setEditOpen(true);}}>
                    <Edit className="w-4 h-4"/>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={()=>onDelete(c.id)} style={{backgroundColor: '#dc2626', color: 'white'}}>
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       {/* Create */}
       <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader><DialogTitle>Создать</DialogTitle><DialogDescription>Добавьте новую подкатегорию</DialogDescription></DialogHeader>
           <form onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
             <div className="grid gap-4">
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Название (RU) *</label><Input value={form.name} onChange={e=>set('name', e.target.value)} required/></div>
                 <div><label className="text-sm">Page Type *</label><Input value={form.pageType} onChange={e=>set('pageType', e.target.value)} placeholder="e-appeals" required/></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Название (EN) *</label><Input value={form.nameEn} onChange={e=>set('nameEn', e.target.value)} required/></div>
                 <div><label className="text-sm">Название (BE) *</label><Input value={form.nameBe} onChange={e=>set('nameBe', e.target.value)} required/></div>
               </div>
               <div><label className="text-sm">Описание (RU) *</label><Input value={form.description} onChange={e=>set('description', e.target.value)} required/></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Описание (EN) *</label><Input value={form.descriptionEn} onChange={e=>set('descriptionEn', e.target.value)} required/></div>
                 <div><label className="text-sm">Описание (BE) *</label><Input value={form.descriptionBe} onChange={e=>set('descriptionBe', e.target.value)} required/></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Sort Order *</label><Input type="number" value={form.sortOrder} onChange={e=>set('sortOrder', parseInt(e.target.value)||0)} required/></div>
                 <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e=>set('isActive', e.target.checked)}/><span>Активна</span></div>
               </div>
             </div>
             <div className="flex justify-end gap-2 mt-4"><Button variant="outline" type="button" onClick={()=>setCreateOpen(false)}>Отмена</Button><Button type="submit">Создать</Button></div>
           </form>
         </DialogContent>
       </Dialog>

       {/* Edit */}
       <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader><DialogTitle>Редактировать</DialogTitle><DialogDescription>Измените параметры категории</DialogDescription></DialogHeader>
           <form onSubmit={(e) => { e.preventDefault(); onEdit(); }}>
             <div className="grid gap-4">
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Название (RU) *</label><Input value={form.name} onChange={e=>set('name', e.target.value)} required/></div>
                 <div><label className="text-sm">Page Type *</label><Input value={form.pageType} onChange={e=>set('pageType', e.target.value)} required/></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Название (EN) *</label><Input value={form.nameEn} onChange={e=>set('nameEn', e.target.value)} required/></div>
                 <div><label className="text-sm">Название (BE) *</label><Input value={form.nameBe} onChange={e=>set('nameBe', e.target.value)} required/></div>
               </div>
               <div><label className="text-sm">Описание (RU) *</label><Input value={form.description} onChange={e=>set('description', e.target.value)} required/></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Описание (EN) *</label><Input value={form.descriptionEn} onChange={e=>set('descriptionEn', e.target.value)} required/></div>
                 <div><label className="text-sm">Описание (BE) *</label><Input value={form.descriptionBe} onChange={e=>set('descriptionBe', e.target.value)} required/></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-sm">Sort Order *</label><Input type="number" value={form.sortOrder} onChange={e=>set('sortOrder', parseInt(e.target.value)||0)} required/></div>
                 <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e=>set('isActive', e.target.checked)}/><span>Активна</span></div>
               </div>
             </div>
             <div className="flex justify-end gap-2 mt-4"><Button variant="outline" type="button" onClick={()=>setEditOpen(false)}>Отмена</Button><Button type="submit">Сохранить</Button></div>
           </form>
         </DialogContent>
       </Dialog>
    </div>
  );
}


