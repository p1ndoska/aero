import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, User, Phone, Mail, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSlotsByManagerQuery, useBookSlotMutation } from '@/app/services/receptionSlotApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import type { Management, ReceptionSlot } from '@/types/management';

interface ReceptionBookingCalendarProps {
  manager: Management;
}

export default function ReceptionBookingCalendar({ manager }: ReceptionBookingCalendarProps) {
  const { language } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<ReceptionSlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  const [bookSlot] = useBookSlotMutation();

  // Получаем доступные слоты на ближайшие 30 дней
  const { data: availableSlots, isLoading, error } = useGetSlotsByManagerQuery({
    managementId: manager.id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSlotSelect = (slot: ReceptionSlot) => {
    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !email.trim()) {
      toast.error('Заполните email');
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Введите корректный email');
      return;
    }

    try {
      await bookSlot({
        slotId: selectedSlot.id,
        data: { email, notes: notes.trim() || undefined }
      }).unwrap();

      toast.success('Запись на прием успешно оформлена!');
      setIsBookingDialogOpen(false);
      setEmail('');
      setNotes('');
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при записи на прием');
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Фильтруем только доступные слоты
  const freeSlots = availableSlots?.filter(slot => 
    slot.isAvailable && !slot.isBooked && 
    new Date(slot.startTime) > new Date()
  ) || [];

  // Группируем слоты по датам
  const slotsByDate = freeSlots.reduce((acc, slot) => {
    const date = slot.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, ReceptionSlot[]>);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Загрузка доступных слотов...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !availableSlots) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Запись на прием
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 mb-4">
            Расписание приема не настроено или произошла ошибка
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Для записи на прием свяжитесь по телефону:
            </p>
            <a 
              href={`tel:${manager.phone}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Phone className="w-4 h-4" />
              {manager.phone}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Запись на прием к {getTranslatedField(manager, 'name', language)}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Выберите удобную дату и время (каждый прием длится 10 минут)
        </div>
      </CardHeader>
      <CardContent>
        {freeSlots.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(slotsByDate).map(([date, slots]) => (
                <div key={date} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-gray-900 mb-4 text-lg">
                    {formatFullDate(slots[0].date)}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {slots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSlotSelect(slot)}
                        className={`text-xs h-14 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          selectedSlot?.id === slot.id 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg' 
                            : 'hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-semibold leading-tight">{formatTime(slot.startTime)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Clock className="w-4 h-4" />
                <span>Каждый прием длится ровно 10 минут</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-2">Нет доступных слотов для записи</p>
            <p className="text-sm mb-4">
              Возможно, все слоты заняты или расписание еще не настроено
            </p>
            <a 
              href={`tel:${manager.phone}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Записаться по телефону
            </a>
          </div>
        )}

        {/* Диалог записи на прием */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Запись на прием
              </DialogTitle>
              <DialogDescription>
                Подтвердите данные для записи на прием
              </DialogDescription>
            </DialogHeader>
            
            {selectedSlot && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800 font-medium mb-1">
                    Выбранное время:
                  </div>
                  <div className="text-blue-700">
                    {formatFullDate(selectedSlot.date)} в {formatTime(selectedSlot.startTime)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Длительность: 10 минут
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    На этот email будет отправлено подтверждение записи
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-700 font-medium">Дополнительная информация</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Причина обращения (необязательно)"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
              <Button 
                onClick={handleBookSlot}
                disabled={!email.trim()}
                className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Записаться
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
