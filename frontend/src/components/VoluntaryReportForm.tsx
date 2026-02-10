import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { voluntaryReportService, type VoluntaryReportData } from '@/app/services/voluntaryReportService';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VoluntaryReportForm() {
  const { t } = useLanguage();
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

  const [captchaCode, setCaptchaCode] = useState('');
  const [antispamCode, setAntispamCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Генерация капчи при монтировании компонента
  useEffect(() => {
    generateNewCaptcha();
  }, []);

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setAntispamCode(''); // Очищаем поле ввода при генерации новой капчи
  };

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
      toast.error(t('fill_all_required_fields'));
      return;
    }

    // Проверка капчи
    if (!antispamCode || antispamCode !== captchaCode) {
      toast.error(t('invalid_security_code') || 'Неверный код безопасности');
      generateNewCaptcha(); // Генерируем новую капчу при ошибке
      return;
    }

    setIsSubmitting(true);

    try {
      await voluntaryReportService.sendVoluntaryReport(formData);
      toast.success(t('voluntary_report_sent_successfully'));
      
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
      toast.error(t('error_sending_voluntary_report'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white rounded-lg shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center" style={{ color: '#213659' }}>
            {t('voluntary_report_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              {t('voluntary_report_description')}
            </p>
            <p className="text-sm text-red-600 font-medium">
              {t('voluntary_report_warning')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Информация о составителе */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('compiler_information')}</h3>
              
              <div>
                <Label htmlFor="fullName">{t('full_name')}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder={t('enter_full_name')}
                />
              </div>

              <div>
                <Label htmlFor="organization">{t('organization_position_contacts')}</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder={t('enter_organization_position_contacts')}
                />
              </div>
            </div>

            {/* Информация о событии */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('event_information')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">{t('event_date')} *</Label>
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
                  <Label htmlFor="eventTime">{t('event_time')} *</Label>
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
                <Label htmlFor="eventLocation">{t('event_location')} *</Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  placeholder={t('enter_event_location')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="eventDescription">{t('event_description')} *</Label>
                <Textarea
                  id="eventDescription"
                  value={formData.eventDescription}
                  onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                  placeholder={t('describe_event_in_detail')}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('additional_information')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compilationDate">{t('compilation_date')} *</Label>
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
                  <Label htmlFor="compilationTime">{t('compilation_time')} *</Label>
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
                <Label htmlFor="recurrenceProbability">{t('recurrence_probability')} *</Label>
                <Select
                  value={formData.recurrenceProbability}
                  onValueChange={(value) => handleInputChange('recurrenceProbability', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="очень высокая">{t('very_high')}</SelectItem>
                    <SelectItem value="высокая">{t('high')}</SelectItem>
                    <SelectItem value="средняя">{t('medium')}</SelectItem>
                    <SelectItem value="низкая">{t('low')}</SelectItem>
                    <SelectItem value="очень низкая">{t('very_low')}</SelectItem>
                    <SelectItem value="неизвестно">{t('unknown')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="consequences">{t('event_consequences')} *</Label>
                <Select
                  value={formData.consequences}
                  onValueChange={(value) => handleInputChange('consequences', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="катастрофические">{t('catastrophic')}</SelectItem>
                    <SelectItem value="критические">{t('critical')}</SelectItem>
                    <SelectItem value="значительные">{t('significant')}</SelectItem>
                    <SelectItem value="незначительные">{t('minor')}</SelectItem>
                    <SelectItem value="минимальные">{t('minimal')}</SelectItem>
                    <SelectItem value="неизвестно">{t('unknown')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Капча */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="antispamCode" className="text-sm font-medium">
                  {t('enter_antispam_code') || 'Введите код безопасности'}: *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="antispamCode"
                    value={antispamCode}
                    onChange={(e) => setAntispamCode(e.target.value)}
                    placeholder={t('enter_code') || 'Введите код'}
                    required
                    className="flex-1"
                  />
                  <div className="flex items-center justify-center w-24 h-10 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-bold">
                    {captchaCode}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateNewCaptcha}
                    className="px-3"
                    title={t('refresh') || 'Обновить'}
                  >
                    🔄
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('enter_code_from_image') || 'Введите код, показанный на изображении'}
                </p>
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
                {isSubmitting ? t('sending') : t('send_message')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}