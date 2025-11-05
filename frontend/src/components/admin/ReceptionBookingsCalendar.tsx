import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, User, Phone, MessageSquare, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAllBookedSlotsQuery, useCancelBookingMutation } from '@/app/services/receptionSlotApi';
import { toast } from 'sonner';
import type { ReceptionSlot } from '@/types/management';

interface BookingSlot extends ReceptionSlot {
  management?: {
    id: number;
    name: string;
    position: string;
    phone: string;
  };
}

export default function ReceptionBookingsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Вычисляем диапазон дат для текущего месяца
  const startDate = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1);
    return date.toISOString().split('T')[0];
  }, [currentMonth, currentYear]);

  const endDate = useMemo(() => {
    const date = new Date(currentYear, currentMonth + 1, 0);
    return date.toISOString().split('T')[0];
  }, [currentMonth, currentYear]);

  const { data: bookedSlots, refetch, isLoading } = useGetAllBookedSlotsQuery({
    startDate,
    endDate
  });

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleCancelBooking = async (slotId: number) => {
    if (!confirm('Вы уверены, что хотите отменить эту запись? Слот станет доступным для новой записи.')) {
      return;
    }

    try {
      await cancelBooking(slotId).unwrap();
      toast.success('Запись успешно отменена');
      setIsDetailsDialogOpen(false);
      setSelectedSlot(null);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при отмене записи');
    }
  };

  const handleSlotClick = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    setIsDetailsDialogOpen(true);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Группируем слоты по руководителям
  const slotsByManager = useMemo(() => {
    if (!bookedSlots) return {};
    
    return (bookedSlots as BookingSlot[]).reduce((acc, slot) => {
      const managerId = slot.management?.id || 'unknown';
      if (!acc[managerId]) {
        acc[managerId] = {
          manager: slot.management,
          slots: []
        };
      }
      acc[managerId].slots.push(slot);
      return acc;
    }, {} as Record<number | string, { manager?: BookingSlot['management']; slots: BookingSlot[] }>);
  }, [bookedSlots]);

  // Генерируем дни месяца (неделя начинается с понедельника)
  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // getDay() возвращает 0-6 (0 = воскресенье), преобразуем в 0-6 (0 = понедельник)
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6; // Воскресенье становится 6
    
    const days: (Date | null)[] = [];
    
    // Заполняем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Получаем слоты для конкретной даты и руководителя
  const getSlotsForDate = (date: Date | null, managerId: number | string) => {
    if (!date || !slotsByManager[managerId]) return [];
    
    const dateKey = date.toISOString().split('T')[0];
    return slotsByManager[managerId].slots.filter(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      return slotDate === dateKey;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#213659] mb-2">Записи на приемы</h2>
          <p className="text-gray-600">Календарь записей на приемы к руководителям</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Навигация по месяцам */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl font-semibold text-[#213659] min-w-[200px] text-center">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">Загрузка записей...</div>
          </CardContent>
        </Card>
      ) : Object.keys(slotsByManager).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Нет записей на приемы в выбранном месяце</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(slotsByManager).map(([managerId, managerData]) => (
            <Card key={managerId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#213659]" />
                  {managerData.manager?.name || 'Неизвестный руководитель'}
                  {managerData.manager?.position && (
                    <span className="text-sm font-normal text-gray-600">
                      - {managerData.manager.position}
                    </span>
                  )}
                  <Badge variant="secondary" className="ml-auto">
                    {managerData.slots.length} {managerData.slots.length === 1 ? 'запись' : 'записей'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Календарная сетка */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Заголовки дней недели */}
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {weekDays.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Ячейки календаря */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((date, index) => {
                      const daySlots = getSlotsForDate(date, managerId);
                      const isToday = date && 
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();
                      const isCurrentMonth = date !== null;

                      return (
                        <div
                          key={index}
                          className={`min-h-[130px] border-r border-b border-gray-200 p-2 ${
                            !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                          } ${isToday ? 'bg-blue-50 ring-2 ring-blue-400' : ''} ${
                            daySlots.length > 0 ? 'bg-blue-50/40 ring-1 ring-blue-200' : ''
                          }`}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-medium mb-1.5 flex items-center justify-between ${
                                isToday ? 'text-blue-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                <span>{date.getDate()}</span>
                                {daySlots.length > 0 && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-200 text-blue-800 border-blue-300">
                                    {daySlots.length}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                                {daySlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="bg-gradient-to-r from-[#213659] to-[#1a2a4a] border-2 border-[#0f1e3a] rounded-md px-2 py-2 text-xs group relative cursor-pointer hover:from-[#1a2a4a] hover:to-[#0f1e3a] hover:shadow-lg transition-all shadow-md ring-1 ring-blue-300"
                                    onClick={() => handleSlotClick(slot)}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-blue-200" />
                                          <span className="text-white">{formatTime(slot.startTime)}</span>
                                        </div>
                                        <div className="text-blue-100 truncate text-[10px] mt-1 font-medium">
                                          {slot.bookedBy || 'Гость'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог с деталями записи */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#213659]" />
              Детали записи на прием
            </DialogTitle>
            <DialogDescription>
              Информация о записи на прием
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-800 font-medium mb-1">
                  Дата и время:
                </div>
                <div className="text-blue-700">
                  {new Date(selectedSlot.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-blue-700">
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </div>
              </div>

              {selectedSlot.management && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Руководитель:</div>
                  <div className="text-gray-900 font-semibold">{selectedSlot.management.name}</div>
                  <div className="text-sm text-gray-600">{selectedSlot.management.position}</div>
                  {selectedSlot.management.phone && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedSlot.management.phone}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Записался:
                </div>
                <div className="text-gray-900">{selectedSlot.bookedBy || 'Не указано'}</div>
              </div>

              {selectedSlot.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Примечания:
                  </div>
                  <div className="text-gray-900 italic">{selectedSlot.notes}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Закрыть
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCancelBooking(selectedSlot.id)}
                  disabled={isCancelling}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отменить запись
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
