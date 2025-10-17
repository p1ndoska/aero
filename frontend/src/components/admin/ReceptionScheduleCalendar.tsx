import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Check, X, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateSlotsMutation, useDeleteSlotsMutation, useGetSlotsByManagerQuery } from '@/app/services/receptionSlotApi';
import RecurringScheduleCalendar from './RecurringScheduleCalendar';
import type { Management } from '@/types/management';

interface ReceptionScheduleCalendarProps {
  manager: Management;
}

interface ScheduleSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function ReceptionScheduleCalendar({ manager }: ReceptionScheduleCalendarProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'recurring'>('single');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [createdSlots, setCreatedSlots] = useState<ScheduleSlot[]>([]);
  const [slotDuration, setSlotDuration] = useState<number>(10);

  const [createSlots] = useCreateSlotsMutation();
  const [deleteSlots] = useDeleteSlotsMutation();

  // Получаем существующие слоты на ближайшие 30 дней
  const { data: existingSlots, refetch } = useGetSlotsByManagerQuery({
    managementId: manager.id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleCreateSlots = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const result = await createSlots({
        managementId: manager.id,
        data: {
          date: selectedDate,
          startTime,
          endTime,
          slotDuration: Math.max(5, Math.min(120, slotDuration)) // настраиваемый шаг
        }
      }).unwrap();

      toast.success(`Создано ${result.slots.count} слотов по ${Math.max(5, Math.min(120, slotDuration))} минут`);
      setCreatedSlots([]);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании слотов');
    }
  };

  const handleDeleteSlots = async (date: string) => {
    if (window.confirm(`Удалить все слоты на ${new Date(date).toLocaleDateString('ru-RU')}?`)) {
      try {
        await deleteSlots({
          managementId: manager.id,
          data: { date }
        }).unwrap();

        toast.success('Слоты удалены');
        refetch();
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при удалении слотов');
      }
    }
  };

  const generatePreviewSlots = () => {
    if (!selectedDate || !startTime || !endTime) return [];

    const slots: ScheduleSlot[] = [];
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    
    const current = new Date(start);
    while (current < end) {
      const stepMs = Math.max(5, Math.min(120, slotDuration)) * 60000;
      const slotEnd = new Date(current.getTime() + stepMs);
      if (slotEnd <= end) {
        slots.push({
          id: `${current.getTime()}`,
          date: selectedDate,
          startTime: current.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5)
        });
      }
      current.setMinutes(current.getMinutes() + Math.max(5, Math.min(120, slotDuration)));
    }

    return slots;
  };

  const previewSlots = generatePreviewSlots();

  // Группируем существующие слоты по датам
  const slotsByDate = existingSlots?.reduce((acc, slot) => {
    const date = slot.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, typeof existingSlots>) || {};

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Календарь приема для {manager.name}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Настройте расписание приема по датам и времени
        </div>
        
        {/* Переключатель вкладок */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('single')}
            className={activeTab === 'single' ? 'bg-blue-600 text-white' : ''}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Разовые слоты
          </Button>
          <Button
            variant={activeTab === 'recurring' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recurring')}
            className={activeTab === 'recurring' ? 'bg-green-600 text-white' : ''}
          >
            <Repeat className="w-4 h-4 mr-2" />
            Повторяющееся расписание
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Содержимое для разовых слотов */}
        {activeTab === 'single' && (
          <>
            {/* Кнопка добавления слотов */}
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить слоты
              </Button>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Label htmlFor="slotDuration" className="text-[#213659] font-medium">Длительность слота (мин):</Label>
                <Input
                  id="slotDuration"
                  type="number"
                  min={5}
                  max={120}
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value) || 10)}
                  className="w-24 bg-white border-[#B1D1E0] focus:border-[#213659]"
                />
              </div>
            </div>

        {/* Список существующих слотов */}
        {Object.keys(slotsByDate).length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Настроенные слоты:</h4>
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-gray-900 text-lg">
                    {formatDate(date)}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {slots.length} слотов
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlots(date)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 text-xs">
                  {slots.slice(0, 24).map((slot, index) => (
                    <div 
                      key={slot.id}
                      className={`p-2 rounded-lg text-center border-2 flex flex-col items-center justify-center gap-1 min-h-[3.5rem] transition-all duration-200 hover:scale-105 ${
                        slot.isBooked 
                          ? 'bg-red-50 text-red-700 border-red-300 shadow-sm' 
                          : 'bg-green-50 text-green-700 border-green-300 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-semibold leading-tight">{formatTime(slot.startTime)}</span>
                    </div>
                  ))}
                  {slots.length > 24 && (
                    <div className="p-1.5 text-gray-500 border border-gray-200 rounded flex flex-col items-center justify-center min-h-[3rem]">
                      <span className="text-xs">+{slots.length - 24}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Слоты для записи не настроены</p>
            <p className="text-sm">Нажмите "Добавить слоты" для настройки расписания</p>
          </div>
        )}
          </>
        )}

        {/* Содержимое для повторяющегося расписания */}
        {activeTab === 'recurring' && (
          <RecurringScheduleCalendar manager={manager} />
        )}

        {/* Диалог создания слотов */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Добавить слоты для записи на прием</DialogTitle>
              <DialogDescription>
                Укажите дату, временной промежуток и длительность слота
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="date" className="text-[#213659] font-medium">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                />
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

              {/* Предварительный просмотр слотов */}
              {previewSlots.length > 0 && (
                <div>
                  <Label className="text-[#213659] font-medium">Предварительный просмотр:</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      Будет создано {previewSlots.length} слотов по {Math.max(5, Math.min(120, slotDuration))} минут:
                    </div>
                    <div className="grid grid-cols-6 gap-1 text-xs max-h-32 overflow-y-auto">
                      {previewSlots.map((slot) => (
                        <div key={slot.id} className="p-1 bg-blue-100 text-blue-800 rounded text-center">
                          {slot.startTime}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreateSlots}
                disabled={!selectedDate || !startTime || !endTime || previewSlots.length === 0}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Создать {previewSlots.length} слотов
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
