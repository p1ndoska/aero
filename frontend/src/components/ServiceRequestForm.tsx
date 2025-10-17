import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceRequestFormProps {
  serviceType: string;
  serviceName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  serviceType,
  serviceName,
  onSuccess,
  onClose
}) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    subject: '',
    description: '',
    priority: 'medium',
    preferredDate: '',
    budget: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.fullName || !formData.email || !formData.subject || !formData.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Некорректный формат email адреса');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          serviceType,
          serviceName,
          preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при отправке заявки');
      }

      const result = await response.json();
      
      toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      
      // Сброс формы
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        position: '',
        subject: '',
        description: '',
        priority: 'medium',
        preferredDate: '',
        budget: '',
        notes: ''
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onClose) {
        onClose();
      }

    } catch (error: any) {
      console.error('Error submitting service request:', error);
      toast.error(error.message || 'Ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTranslatedText = (ru: string, en: string, be: string) => {
    switch (language) {
      case 'en': return en;
      case 'be': return be;
      default: return ru;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#213659] text-center">
          {getTranslatedText(
            'Заявка на услугу',
            'Service Request',
            'Заяўка на паслугу'
          )}
        </CardTitle>
        <p className="text-center text-gray-600">
          {getTranslatedText(
            `Услуга: ${serviceName}`,
            `Service: ${serviceName}`,
            `Паслуга: ${serviceName}`
          )}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Контактная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#213659]">
              {getTranslatedText(
                'Контактная информация',
                'Contact Information',
                'Кантактная інфармацыя'
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {getTranslatedText('ФИО *', 'Full Name *', 'ПІБ *')}
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  {getTranslatedText('Email *', 'Email *', 'Email *')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  {getTranslatedText('Телефон', 'Phone', 'Тэлефон')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="organization" className="text-sm font-medium">
                  {getTranslatedText('Организация', 'Organization', 'Арганізацыя')}
                </Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="position" className="text-sm font-medium">
                  {getTranslatedText('Должность', 'Position', 'Пасада')}
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Информация о заявке */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#213659]">
              {getTranslatedText(
                'Информация о заявке',
                'Request Information',
                'Інфармацыя пра заяўку'
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">
                  {getTranslatedText('Тема заявки *', 'Request Subject *', 'Тэма заяўкі *')}
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="priority" className="text-sm font-medium">
                  {getTranslatedText('Приоритет', 'Priority', 'Прыярытэт')}
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      {getTranslatedText('Низкий', 'Low', 'Нізкі')}
                    </SelectItem>
                    <SelectItem value="medium">
                      {getTranslatedText('Средний', 'Medium', 'Сярэдні')}
                    </SelectItem>
                    <SelectItem value="high">
                      {getTranslatedText('Высокий', 'High', 'Высокі')}
                    </SelectItem>
                    <SelectItem value="urgent">
                      {getTranslatedText('Срочный', 'Urgent', 'Тэрміновы')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preferredDate" className="text-sm font-medium">
                  {getTranslatedText('Предпочтительная дата', 'Preferred Date', 'Пераважная дата')}
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="budget" className="text-sm font-medium">
                  {getTranslatedText('Бюджет', 'Budget', 'Бюджэт')}
                </Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder={getTranslatedText('Укажите бюджет', 'Specify budget', 'Пакажыце бюджэт')}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                {getTranslatedText('Описание заявки *', 'Request Description *', 'Апісанне заяўкі *')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={4}
                className="mt-1"
                placeholder={getTranslatedText(
                  'Опишите детали вашей заявки...',
                  'Describe the details of your request...',
                  'Апішыце дэталі вашай заяўкі...'
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                {getTranslatedText('Дополнительные заметки', 'Additional Notes', 'Дадатковыя заўвагі')}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder={getTranslatedText(
                  'Любая дополнительная информация...',
                  'Any additional information...',
                  'Любая дадатковая інфармацыя...'
                )}
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-6">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {getTranslatedText('Отмена', 'Cancel', 'Скасаваць')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#213659] hover:bg-[#1a2d4a]"
            >
              {isSubmitting 
                ? getTranslatedText('Отправка...', 'Sending...', 'Адпраўка...')
                : getTranslatedText('Отправить заявку', 'Submit Request', 'Адправіць заяўку')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;

