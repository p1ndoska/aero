import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Phone, User } from 'lucide-react';
import { useGetAvailableSlotsQuery } from '@/app/services/managementApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import type { Management, TimeSlot } from '@/types/management';

interface ReceptionBookingProps {
  manager: Management;
  onBookAppointment?: (slot: TimeSlot) => void;
}

export default function ReceptionBooking({ manager, onBookAppointment }: ReceptionBookingProps) {
  const { language } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Получаем доступные слоты на ближайшие 30 дней
  const { data: slotsData, isLoading, error } = useGetAvailableSlotsQuery({
    id: manager.id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = () => {
    if (selectedSlot && onBookAppointment) {
      onBookAppointment(selectedSlot);
    } else {
      // Если нет обработчика, показываем информацию о записи
      alert(`Для записи на прием к ${getTranslatedField(manager, 'name', language)} свяжитесь по телефону: ${manager.phone}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Загрузка доступных слотов...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !slotsData) {
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

  const { availableSlots, scheduleData } = slotsData;

  // Группируем слоты по датам
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Запись на прием
        </CardTitle>
        <div className="text-sm text-gray-600">
          Расписание: {getTranslatedField(manager, 'receptionSchedule', language)}
        </div>
      </CardHeader>
      <CardContent>
        {scheduleData?.requiresContact ? (
          <div className="text-center">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                По предварительной записи
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Для записи на прием необходимо предварительно связаться по телефону
            </p>
            <a 
              href={`tel:${manager.phone}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Записаться по телефону
            </a>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(slotsByDate).map(([date, slots]) => (
                <div key={date} className="border rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">
                    {formatDate(slots[0].startTime)}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSlotSelect(slot)}
                        className="text-xs"
                        disabled={!slot.isAvailable}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(slot.startTime)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedSlot && (
              <div className="border-t pt-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <User className="w-4 h-4" />
                    Выбранное время
                  </div>
                  <div className="text-sm text-blue-700">
                    {formatDate(selectedSlot.startTime)} в {formatTime(selectedSlot.startTime)}
                  </div>
                </div>
                <Button 
                  onClick={handleBookAppointment}
                  className="w-full bg-[#213659] hover:bg-[#1a2a4a] text-white"
                >
                  Записаться на прием
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="mb-2">Нет доступных слотов для записи</p>
            <p className="text-sm">
              Для записи на прием свяжитесь по телефону: 
              <a href={`tel:${manager.phone}`} className="text-blue-600 hover:text-blue-800 ml-1">
                {manager.phone}
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
