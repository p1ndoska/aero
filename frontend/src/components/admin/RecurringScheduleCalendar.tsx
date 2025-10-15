import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Check, X, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  useCreateRecurringScheduleMutation, 
  useGetRecurringTemplatesQuery,
  useDeleteRecurringTemplateMutation,
  useUpdateRecurringTemplateMutation 
} from '@/app/services/receptionSlotApi';
import type { Management } from '@/types/management';

interface RecurringScheduleCalendarProps {
  manager: Management;
}

export default function RecurringScheduleCalendar({ manager }: RecurringScheduleCalendarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [monthsAhead, setMonthsAhead] = useState(3);

  const [createRecurringSchedule] = useCreateRecurringScheduleMutation();
  const [deleteTemplate] = useDeleteRecurringTemplateMutation();
  const [updateTemplate] = useUpdateRecurringTemplateMutation();

  // Получаем существующие шаблоны
  const { data: templates, refetch } = useGetRecurringTemplatesQuery(manager.id);

  const handleCreateRecurringSchedule = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const result = await createRecurringSchedule({
        managementId: manager.id,
        data: {
          selectedDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime,
          endTime,
          slotDuration: 10, // 10 минут на прием
          monthsAhead
        }
      }).unwrap();

      toast.success(result.message);
      setIsCreateDialogOpen(false);
      setSelectedDate(undefined);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании повторяющегося расписания');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот шаблон? Все связанные слоты будут удалены.')) {
      try {
        await deleteTemplate(templateId).unwrap();
        toast.success('Шаблон удален');
        refetch();
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при удалении шаблона');
      }
    }
  };

  const handleToggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      await updateTemplate({
        templateId,
        data: { isActive: !isActive }
      }).unwrap();
      
      toast.success(isActive ? 'Шаблон деактивирован' : 'Шаблон активирован');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении шаблона');
    }
  };

  const getWeekdayName = (weekday: number) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[weekday];
  };

  const getWeekNumberName = (weekNumber: number) => {
    const weeks = ['', 'первую', 'вторую', 'третью', 'четвертую', 'пятую'];
    return weeks[weekNumber] || `${weekNumber}-ю`;
  };

  // Функция для проверки, используется ли уже такая дата в шаблонах
  const isDateUsedInTemplates = (date: Date) => {
    if (!templates) return false;
    
    const weekday = date.getDay();
    const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7);
    
    return templates.some(template => 
      template.weekday === weekday && template.weekNumber === weekNumber
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Повторяющееся расписание для {manager.name}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Создайте расписание, которое будет автоматически повторяться каждый месяц
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Кнопка добавления повторяющегося расписания */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить повторяющееся расписание
          </Button>
          <div className="text-sm text-gray-500">
            Выберите дату, система автоматически определит паттерн
          </div>
        </div>

        {/* Список существующих шаблонов */}
        {templates && templates.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Активные шаблоны:</h4>
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      {getWeekdayName(template.weekday)} ({getWeekNumberName(template.weekNumber)} неделя)
                    </div>
                    <div className="text-sm text-gray-600">
                      {template.startTime} - {template.endTime} (слоты по {template.slotDuration} мин)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Создано: {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleTemplate(template.id, template.isActive)}
                      className={template.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                    >
                      {template.isActive ? 'Деактивировать' : 'Активировать'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {template.description && (
                  <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    {template.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Repeat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Повторяющиеся расписания не настроены</p>
            <p className="text-sm">Нажмите "Добавить повторяющееся расписание" для создания</p>
          </div>
        )}

        {/* Диалог создания повторяющегося расписания */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Создать повторяющееся расписание</DialogTitle>
              <DialogDescription>
                Выберите конкретную дату в календаре, и система автоматически создаст расписание для каждого такого дня месяца
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-[#213659] font-medium">Выберите дату *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={ru}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      modifiers={{
                        used: (date) => isDateUsedInTemplates(date)
                      }}
                      modifiersClassNames={{
                        used: "bg-blue-100 text-blue-800 font-bold"
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>Например, выберите второй понедельник января, и система создаст расписание для каждого второго понедельника месяца</p>
                  <p>Синие даты в календаре уже используются в существующих шаблонах</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-[#213659] font-medium">Время начала *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-[#213659] font-medium">Время окончания *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="monthsAhead" className="text-[#213659] font-medium">Создать слоты на (месяцев вперед)</Label>
                <Input
                  id="monthsAhead"
                  type="number"
                  min="1"
                  max="12"
                  value={monthsAhead}
                  onChange={(e) => setMonthsAhead(parseInt(e.target.value) || 3)}
                  className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Количество месяцев вперед, для которых создавать слоты
                </p>
              </div>

              {/* Предварительный просмотр */}
              {selectedDate && (
                <div className={`mt-4 p-3 rounded-lg ${isDateUsedInTemplates(selectedDate) ? 'bg-yellow-50' : 'bg-green-50'}`}>
                  {isDateUsedInTemplates(selectedDate) ? (
                    <div className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ Внимание: Этот день недели уже используется
                    </div>
                  ) : (
                    <div className="text-sm text-green-800 font-medium mb-2">
                      Предварительный просмотр:
                    </div>
                  )}
                  <div className={`text-sm ${isDateUsedInTemplates(selectedDate) ? 'text-yellow-700' : 'text-green-700'}`}>
                    <p>Будет создано расписание для каждого <strong>
                      {getWeekdayName(selectedDate.getDay())} 
                      ({getWeekNumberName(Math.ceil((selectedDate.getDate() + selectedDate.getDay()) / 7))} неделя)
                    </strong> месяца</p>
                    <p>Время: <strong>{startTime} - {endTime}</strong></p>
                    <p>Слоты по 10 минут на период: <strong>{monthsAhead} месяцев</strong></p>
                    {isDateUsedInTemplates(selectedDate) && (
                      <p className="mt-2 text-yellow-800 font-medium">
                        Существующий шаблон для этого дня будет заменен новым
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreateRecurringSchedule}
                disabled={!selectedDate || !startTime || !endTime}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Создать повторяющееся расписание
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
