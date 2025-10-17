import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Mail, Phone, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ContentConstructor from './admin/ContentConstructor';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import { getRolePermissions } from '@/utils/roleUtils';
import { useGetAppealsPageContentByPageTypeQuery, useUpdateAppealsPageContentByPageTypeMutation } from '@/app/services/appealsPageContentApi';

interface FormData {
  fullName: string;
  organization: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  compilationDate: string;
  compilationTime: string;
  recurrenceProbability: string;
  consequences: string;
  antispamCode: string;
}

const VoluntaryReportForm: React.FC = () => {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useSelector((s: any) => s.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const permissions = getRolePermissions(roleName);
  const canManage = permissions.canManageAirNav || permissions.canManageRoles; // SUPER_ADMIN имеет все права via canManageRoles

  // Контент страницы (заголовок, подзаголовок, конструктор контента)
  const { data: pageContent, refetch } = useGetAppealsPageContentByPageTypeQuery('voluntary-report');
  const [updatePageContent, { isLoading: isSaving }] = useUpdateAppealsPageContentByPageTypeMutation();

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

  useEffect(() => {
    if (pageContent) {
      setEditableTitle(getTranslatedField(pageContent, 'title', language) || 'Добровольное сообщение о небезопасном событии');
      setEditableSubtitle(getTranslatedField(pageContent, 'subtitle', language) || '');
      setEditableContent(Array.isArray((pageContent as any).content) ? (pageContent as any).content : []);
    }
  }, [pageContent, language]);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    organization: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventDescription: '',
    compilationDate: '',
    compilationTime: '',
    recurrenceProbability: '',
    consequences: '',
    antispamCode: ''
  });

  const [captchaCode, setCaptchaCode] = useState('28CdkX7');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    const requiredFields = ['eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'compilationDate', 'compilationTime', 'recurrenceProbability', 'consequences', 'antispamCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Проверка капчи
    if (formData.antispamCode !== captchaCode) {
      toast.error('Неверный код безопасности');
      return;
    }

    // Здесь можно добавить отправку данных на сервер
    toast.success('Сообщение успешно отправлено');
    
    // Сброс формы
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
      consequences: '',
      antispamCode: ''
    });
    generateNewCaptcha();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#213659] text-center">
            ДОБРОВОЛЬНОЕ СООБЩЕНИЕ О НЕБЕЗОПАСНОМ СОБЫТИИ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated && canManage && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsContentEditorOpen(true)}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Управление контентом
              </Button>
            </div>
          )}
          <div className="text-sm text-gray-700 mb-6 leading-relaxed">
            <p className="mb-4">
              Информация, включаемая в данное сообщение, служит исключительно целям повышения безопасности полетов. 
              Ф.И.О составителя сообщения можно не указывать. Если имя, должность, контактные данные составителя 
              указываются, то они НЕ БУДУТ СОХРАНЯТЬСЯ, после проверки поступившей информации. Ни при каких 
              обстоятельствах личность составителя не будет раскрыта или сообщена другому должностному лицу 
              предприятия или иной организации.
            </p>
            <p className="text-red-600 font-medium">
              Если имя и должность указываются, то после рассмотрения они будут исключены из сообщения.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Первая часть формы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">Ф.И.О.</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="organization">Организация/должность, контактные данные</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="eventDate">Дата события *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="eventTime">Время события *</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="eventLocation">Место события *</Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="eventDescription">Описание события *</Label>
                <Textarea
                  id="eventDescription"
                  value={formData.eventDescription}
                  onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                  className="mt-1 min-h-[150px]"
                  required
                />
              </div>
            </div>

            {/* Вторая часть формы */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-[#213659]">Дополнительная информация</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="compilationDate">Дата составления информации о событии *</Label>
                  <Input
                    id="compilationDate"
                    type="date"
                    value={formData.compilationDate}
                    onChange={(e) => handleInputChange('compilationDate', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="compilationTime">Время составления информации о событии *</Label>
                  <Input
                    id="compilationTime"
                    type="time"
                    value={formData.compilationTime}
                    onChange={(e) => handleInputChange('compilationTime', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recurrenceProbability">Вероятность повторения подобного события? *</Label>
                  <Select value={formData.recurrenceProbability} onValueChange={(value) => handleInputChange('recurrenceProbability', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите вариант" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-low">Очень низкая</SelectItem>
                      <SelectItem value="low">Низкая</SelectItem>
                      <SelectItem value="medium">Средняя</SelectItem>
                      <SelectItem value="high">Высокая</SelectItem>
                      <SelectItem value="very-high">Очень высокая</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="consequences">Каковы будут последствия события, если оно повторится? *</Label>
                  <Select value={formData.consequences} onValueChange={(value) => handleInputChange('consequences', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите вариант" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Минимальные</SelectItem>
                      <SelectItem value="minor">Незначительные</SelectItem>
                      <SelectItem value="moderate">Умеренные</SelectItem>
                      <SelectItem value="serious">Серьезные</SelectItem>
                      <SelectItem value="critical">Критические</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="antispamCode">Введите антиспам код: *</Label>
                  <div className="flex gap-4 mt-1">
                    <Input
                      id="antispamCode"
                      value={formData.antispamCode}
                      onChange={(e) => handleInputChange('antispamCode', e.target.value)}
                      className="flex-1"
                      required
                    />
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded border">
                      <span className="font-mono text-sm">{captchaCode}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateNewCaptcha}
                        className="p-1 h-8 w-8"
                      >
                        ↻
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button type="submit" className="bg-[#213659] hover:bg-[#1a2d4a] text-white px-8 py-3 text-lg">
                ОТПРАВИТЬ
              </Button>
            </div>

            <p className="text-red-600 text-sm text-center mt-4">
              * - обязательные поля для заполнения
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Модалка управления контентом */}
      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Управление контентом страницы</DialogTitle>
            <DialogDescription>
              Здесь вы можете изменить заголовок, подзаголовок и содержимое страницы.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="subtitle">Подзаголовок</Label>
              <Input id="subtitle" value={editableSubtitle} onChange={(e) => setEditableSubtitle(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 inline-block">Содержимое</Label>
              <ContentConstructor
                content={editableContent || []}
                onChange={(updated) => setEditableContent(updated)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  try {
                    const body: any = {
                      pageType: 'voluntary-report',
                      title: editableTitle,
                      subtitle: editableSubtitle,
                      content: editableContent,
                    };
                    // @ts-ignore strict unions across apis
                    const result = await updatePageContent({ pageType: 'voluntary-report', body });
                    if ('unwrap' in (result as any)) await (result as any).unwrap();
                    toast.success('Контент успешно обновлен');
                    setIsContentEditorOpen(false);
                    refetch();
                  } catch (e) {
                    toast.error('Ошибка при сохранении контента');
                  }
                }}
                className="bg-[#213659] hover:bg-[#1a2d4a] text-white"
                disabled={isSaving}
              >
                Сохранить изменения
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Альтернативные способы отправки */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#213659]">
            ДРУГИЕ СПОСОБЫ ОТПРАВКИ ФОРМЫ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-6">
            После заполнения Вашей части формы вы можете направить ее в отдел движения по любому указанному ниже адресу.
          </p>

          <div className="space-y-6">
            {/* Скачивание формы */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-[#213659]" />
                <span className="font-medium">Добровольное сообщение о небезопасном событии</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Форма для заполнения в формате Word</p>
              <p className="text-xs text-gray-500">Размер файла: 0 Kb</p>
            </div>

            {/* Способы отправки */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#213659] mt-0.5" />
                <div>
                  <p className="font-medium">1. Ящик для добровольных сообщений</p>
                  <p className="text-sm text-gray-600">ул. Короткевича, д.19, г.Минск</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#213659] mt-0.5" />
                <div>
                  <p className="font-medium">2. Почтовый адрес</p>
                  <p className="text-sm text-gray-600">
                    ул. Короткевича, д. 19, 220039, г. Минск, Республика Беларусь,<br />
                    начальнику отдела движения государственного предприятия «Белаэронавигация»
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#213659] mt-0.5" />
                <div>
                  <p className="font-medium">3. Электронная почта</p>
                  <p className="text-sm text-gray-600">safety@ban.by</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#213659] mt-0.5" />
                <div>
                  <p className="font-medium">4. Телефон/факс</p>
                  <p className="text-sm text-gray-600">+375 (17) 215-41-40</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoluntaryReportForm;
