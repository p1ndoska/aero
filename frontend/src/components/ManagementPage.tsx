import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGetAllManagersQuery } from '@/app/services/managementApi';
import { useGetSlotsByManagerQuery, useBookSlotMutation } from '@/app/services/receptionSlotApi';
import { Users, Phone, MapPin, Clock, Calendar, UserPlus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import { toast } from 'sonner';
import type { TimeSlot, Management } from '@/types/management';

export default function ManagementPage() {
  const { language } = useLanguage();
  const { data: managers, isLoading, error } = useGetAllManagersQuery();
  const [selectedManagerForBooking, setSelectedManagerForBooking] = useState<number | null>(null);
  const [expandedManager, setExpandedManager] = useState<number | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    notes: ''
  });

  const [bookSlot] = useBookSlotMutation();

  const handleBookAppointment = (slot: any, manager: Management) => {
    setSelectedSlot(slot);
    setSelectedManagerForBooking(manager.id);
    setIsBookingDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !bookingForm.fullName || !bookingForm.email) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      await bookSlot({
        slotId: selectedSlot.id,
        data: {
          email: bookingForm.email,
          fullName: bookingForm.fullName,
          notes: bookingForm.notes
        }
      }).unwrap();

      toast.success('Запись на прием успешно оформлена!');
      setIsBookingDialogOpen(false);
      setBookingForm({ fullName: '', email: '', notes: '' });
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
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о руководителях...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">Ошибка загрузки данных</p>
            <p className="text-sm">Попробуйте обновить страницу</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#213659] mb-4 flex items-center justify-space-between gap-3">
          <Users className="w-8 h-8" />
          РУКОВОДСТВО ГОСУДАРСТВЕННОГО ПРЕДПРИЯТИЯ «БЕЛАЭРОНАВИГАЦИЯ»        </h1>

      </div>

      {!managers?.managers?.length ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">Информация о руководителях отсутствует</p>
          <p className="text-gray-500 text-sm">Данные будут добавлены в ближайшее время</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {managers.managers.map((manager) => (
            <Card key={manager.id} className="hover:shadow-lg transition-shadow duration-300 border-[#B1D1E0] bg-white">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {manager.images && manager.images.length > 0 ? (
                    <img
                      src={manager.images[0]}
                      alt={manager.name}
                      className="w-56 h-80 md:w-64 md:h-96 lg:w-80 lg:h-[28rem] rounded-xl object-cover object-center mx-auto mb-4 border-4 border-[#213659]"
                      onError={(e) => {
                        console.error('❌ Ошибка загрузки изображения для', manager.name, ':', manager.images[0]);
                        e.currentTarget.style.display = 'none';
                        // Показываем заглушку при ошибке
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Изображение загружено для', manager.name, ':', manager.images[0]);
                      }}
                    />
                  ) : null}
                  {(!manager.images || manager.images.length === 0) && (
                    <div className="w-56 h-80 md:w-64 md:h-96 lg:w-80 lg:h-[28rem] rounded-xl bg-[#213659] mx-auto mb-4 flex items-center justify-center border-4 border-[#213659]">
                      <Users className="w-16 h-16 md:w-20 md:h-20 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-[#213659] mb-1">{manager.name}</h3>
                  <p className="text-[#6A81A9] font-medium">{manager.position}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#213659]" />
                    <span className="text-gray-700">{manager.phone}</span>
                  </div>

                  {manager.offices && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#213659]" />
                      <span className="text-gray-700">Кабинеты: {manager.offices}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#213659]" />
                    <span className="text-gray-700">
                      Расписание приема: {getTranslatedField(manager, 'receptionSchedule', language)}
                    </span>
                  </div>
                </div>

                {/* Кнопка записи на прием */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedManagerForBooking(
                      selectedManagerForBooking === manager.id ? null : manager.id
                    )}
                    className="w-full flex items-center justify-center gap-2 bg-[#213659] text-white hover:bg-[#1a2a4a] border-[#213659]"
                  >
                    <UserPlus className="w-4 h-4" />
                    {selectedManagerForBooking === manager.id ? 'Скрыть запись' : 'Записаться на прием'}
                  </Button>
                </div>

                {/* Компонент записи на прием */}
                {selectedManagerForBooking === manager.id && (
                  <ManagerBookingSection
                    manager={manager}
                    onBookAppointment={handleBookAppointment}
                  />
                )}

                {/* Дополнительные изображения */}
                {manager.images && manager.images.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Дополнительные фото:</p>
                    <div className="flex gap-2 flex-wrap">
                      {manager.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${manager.name} - фото ${index + 2}`}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            console.error('❌ Ошибка загрузки дополнительного изображения для', manager.name, ':', image);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('✅ Дополнительное изображение загружено для', manager.name, ':', image);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог записи на прием */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Запись на прием</DialogTitle>
            <DialogDescription>
              Заполните форму для записи на прием к руководителю
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedSlot && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Выбранное время:</strong> {formatDate(selectedSlot.date)} в {formatTime(selectedSlot.startTime)}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="fullName" className="text-[#213659] font-medium">ФИО *</Label>
              <Input
                id="fullName"
                value={bookingForm.fullName}
                onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                placeholder="Введите ваше полное имя"
                className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-[#213659] font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                placeholder="Введите ваш email"
                className="bg-white border-[#B1D1E0] focus:border-[#213659]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-[#213659] font-medium">Дополнительная информация</Label>
              <Input
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Опишите цель визита (необязательно)"
                className="bg-white border-[#B1D1E0] focus:border-[#213659]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              disabled={!bookingForm.fullName || !bookingForm.email}
              className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Записаться
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент секции записи на прием для руководителя
function ManagerBookingSection({ 
  manager, 
  onBookAppointment 
}: { 
  manager: Management; 
  onBookAppointment: (slot: any, manager: Management) => void;
}) {
  // Получаем доступные слоты для этого руководителя
  const { data: availableSlots, isLoading: slotsLoading } = useGetSlotsByManagerQuery({
    managementId: manager.id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Фильтруем только доступные слоты
  const freeSlots = availableSlots?.filter(slot => slot.isAvailable && !slot.isBooked) || [];

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Доступные слоты для записи
      </h4>
      
      {slotsLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#213659] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Загрузка расписания...</p>
        </div>
      ) : freeSlots.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {freeSlots.slice(0, 8).map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{formatDate(slot.date)}</span>
                <span className="text-gray-600 ml-2">{formatTime(slot.startTime)}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onBookAppointment(slot, manager)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Записаться
              </Button>
            </div>
          ))}
          {freeSlots.length > 8 && (
            <p className="text-xs text-gray-500 text-center py-2">
              И еще {freeSlots.length - 8} доступных слотов
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Нет доступных слотов для записи</p>
          <p className="text-xs mt-1">Обратитесь к администратору для настройки расписания</p>
        </div>
      )}
    </div>
  );
}
