import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAllManagersQuery } from '@/app/services/managementApi';
import { Users, Phone, MapPin, Clock, Calendar, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import ReceptionBookingCalendar from './ReceptionBookingCalendar';
import type { TimeSlot } from '@/types/management';

export default function ManagementPage() {
  const { language } = useLanguage();
  const { data: managers, isLoading, error } = useGetAllManagersQuery();
  const [selectedManagerForBooking, setSelectedManagerForBooking] = useState<number | null>(null);
  
  // Отладочная информация
  console.log('ManagementPage - isLoading:', isLoading);
  console.log('ManagementPage - error:', error);
  console.log('ManagementPage - managers:', managers);

  const handleBookAppointment = (slot: TimeSlot) => {
    // Здесь можно добавить логику для записи на прием
    console.log('Booking appointment for slot:', slot);
    alert(`Запись на прием на ${new Date(slot.startTime).toLocaleDateString('ru-RU')} в ${new Date(slot.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`);
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
                  <ReceptionBookingCalendar
                    manager={manager}
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
    </div>
  );
}
