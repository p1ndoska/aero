import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { voluntaryReportService, type VoluntaryReportData } from '@/app/services/voluntaryReportService';
import { toast } from 'sonner';

export default function VoluntaryReportForm() {
  const [formData, setFormData] = useState<VoluntaryReportData>({
    fullName: '',
    organization: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventDescription: '',
    compilationDate: '',
    compilationTime: '',
    recurrenceProbability: '',
    consequences: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof VoluntaryReportData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.eventDate || !formData.eventTime || !formData.eventLocation || 
        !formData.eventDescription || !formData.compilationDate || !formData.compilationTime || 
        !formData.recurrenceProbability || !formData.consequences) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      await voluntaryReportService.sendVoluntaryReport(formData);
      toast.success('Сообщение успешно отправлено');
      
      // Очистка формы
      setFormData({
        fullName: '',
        organization: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        eventDescription: '',
        compilationDate: '',
        compilationTime: '',
        recurrenceProbability: '',
        consequences: ''
      });
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      toast.error('Ошибка при отправке сообщения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white rounded-lg shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center" style={{ color: '#213659' }}>
            ДОБРОВОЛЬНОЕ СООБЩЕНИЕ О НЕБЕЗОПАСНОМ СОБЫТИИ
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Информация, включаемая в данное сообщение, служит исключительно целям повышения безопасности полетов. 
              Ф.И.О составителя сообщения можно не указывать. Если имя, должность, контактные данные составителя 
              указываются, то они НЕ БУДУТ СОХРАНЯТЬСЯ, после проверки поступившей информации. Ни при каких 
              обстоятельствах личность составителя не будет раскрыта или сообщена другому должностному лицу 
              предприятия или иной организации.
            </p>
            <p className="text-sm text-red-600 font-medium">
              Если имя и должность указываются, то после рассмотрения они будут исключены из сообщения.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Информация о составителе */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Информация о составителе</h3>
              
              <div>
                <Label htmlFor="fullName">Ф.И.О.</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Введите Ф.И.О."
                />
              </div>

              <div>
                <Label htmlFor="organization">Организация/должность, контактные данные</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Введите организацию/должность, контактные данные"
                />
              </div>
            </div>

            {/* Информация о событии */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Информация о событии</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Дата события *</Label>
                  <div className="relative">
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="eventTime">Время события *</Label>
                  <div className="relative">
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      required
                    />
                    <ClockIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation">Место события *</Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  placeholder="Введите место события"
                  required
                />
              </div>

              <div>
                <Label htmlFor="eventDescription">Описание события *</Label>
                <Textarea
                  id="eventDescription"
                  value={formData.eventDescription}
                  onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                  placeholder="Подробно опишите событие"
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Дополнительная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compilationDate">Дата составления информации о событии *</Label>
                  <div className="relative">
                    <Input
                      id="compilationDate"
                      type="date"
                      value={formData.compilationDate}
                      onChange={(e) => handleInputChange('compilationDate', e.target.value)}
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="compilationTime">Время составления информации о событии *</Label>
                  <div className="relative">
                    <Input
                      id="compilationTime"
                      type="time"
                      value={formData.compilationTime}
                      onChange={(e) => handleInputChange('compilationTime', e.target.value)}
                      required
                    />
                    <ClockIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="recurrenceProbability">Вероятность повторения подобного события? *</Label>
                <Select
                  value={formData.recurrenceProbability}
                  onValueChange={(value) => handleInputChange('recurrenceProbability', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="очень высокая">Очень высокая</SelectItem>
                    <SelectItem value="высокая">Высокая</SelectItem>
                    <SelectItem value="средняя">Средняя</SelectItem>
                    <SelectItem value="низкая">Низкая</SelectItem>
                    <SelectItem value="очень низкая">Очень низкая</SelectItem>
                    <SelectItem value="неизвестно">Неизвестно</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="consequences">Каковы будут последствия события, если оно повторится? *</Label>
                <Select
                  value={formData.consequences}
                  onValueChange={(value) => handleInputChange('consequences', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вариант" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="катастрофические">Катастрофические</SelectItem>
                    <SelectItem value="критические">Критические</SelectItem>
                    <SelectItem value="значительные">Значительные</SelectItem>
                    <SelectItem value="незначительные">Незначительные</SelectItem>
                    <SelectItem value="минимальные">Минимальные</SelectItem>
                    <SelectItem value="неизвестно">Неизвестно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white px-8 py-2 hover:opacity-90"
                style={{ 
                  backgroundColor: '#213659'
                }}
              >
                {isSubmitting ? 'Отправка...' : 'ОТПРАВИТЬ СООБЩЕНИЕ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}