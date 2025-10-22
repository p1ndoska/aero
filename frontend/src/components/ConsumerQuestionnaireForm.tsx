import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { questionnaireService, type QuestionnaireData } from '@/app/services/questionnaireService';

interface FormData {
  userAddress: string;
  userName: string;
  phone: string;
  email: string;
  phraseologyQuality: string;
  informationTimeliness: string;
  equipmentQuality: string;
  proceduresQuality: string;
  satisfactionReasons: string;
  suggestions: string;
  completionDate: string;
  antispamCode: string;
}

const ConsumerQuestionnaireForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userAddress: '',
    userName: '',
    phone: '',
    email: '',
    phraseologyQuality: '',
    informationTimeliness: '',
    equipmentQuality: '',
    proceduresQuality: '',
    satisfactionReasons: '',
    suggestions: '',
    completionDate: '',
    antispamCode: ''
  });

  const [captchaCode, setCaptchaCode] = useState('D4SJU.CU');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    const requiredFields = ['userAddress', 'phone', 'email', 'phraseologyQuality', 'informationTimeliness', 'equipmentQuality', 'proceduresQuality', 'completionDate', 'antispamCode'];
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

    setIsSubmitting(true);
    
    try {
      // Подготовка данных для отправки
      const questionnaireData: QuestionnaireData = {
        userAddress: formData.userAddress,
        userName: formData.userName,
        phone: formData.phone,
        email: formData.email,
        phraseologyQuality: formData.phraseologyQuality,
        informationTimeliness: formData.informationTimeliness,
        equipmentQuality: formData.equipmentQuality,
        proceduresQuality: formData.proceduresQuality,
        satisfactionReasons: formData.satisfactionReasons,
        suggestions: formData.suggestions,
        completionDate: formData.completionDate,
        antispamCode: formData.antispamCode
      };
      
      // Отправка анкеты
      await questionnaireService.sendQuestionnaire(questionnaireData);
      
      toast.success('Анкета успешно отправлена!');
      
      // Сброс формы
      setFormData({
        userAddress: '',
        userName: '',
        phone: '',
        email: '',
        phraseologyQuality: '',
        informationTimeliness: '',
        equipmentQuality: '',
        proceduresQuality: '',
        satisfactionReasons: '',
        suggestions: '',
        completionDate: '',
        antispamCode: ''
      });
      generateNewCaptcha();
      
    } catch (error) {
      console.error('Ошибка отправки анкеты:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при отправке анкеты');
    } finally {
      setIsSubmitting(false);
    }
  };

  const satisfactionOptions = [
    { value: '5', label: '5 баллов - высокая степень удовлетворенности' },
    { value: '4', label: '4 балла - хорошая степень удовлетворенности' },
    { value: '3', label: '3 балла - средняя степень удовлетворенности' },
    { value: '2', label: '2 балла - низкая степень удовлетворенности' },
    { value: '1', label: '1 балл - полная неудовлетворенность' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#213659] mb-4">
          Анкета потребителя аэронавигационных услуг Республики Беларусь
        </h1>
        <div className="text-[#213659] font-medium mb-4">
          Уважаемые Коллеги!
        </div>
        <div className="text-gray-700 space-y-3 max-w-4xl mx-auto">
          <p>
            Благодарим Вас за сотрудничество с Государственным предприятием БЕЛАЭРОНАВИГАЦИЯ. 
            Ваше мнение о качестве предоставляемых аэронавигационных услуг имеет для нас большое значение 
            и поможет нам улучшить качество обслуживания.
          </p>
          <p>
            Просим Вас ответить на вопросы, представленные ниже.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Информация о пользователе */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#213659]">
              1. ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userAddress" className="text-sm font-medium">
                  Адресс пользователя: *
                </Label>
                <Input
                  id="userAddress"
                  value={formData.userAddress}
                  onChange={(e) => handleInputChange('userAddress', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="userName" className="text-sm font-medium">
                  Наименование пользователя:
                </Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Телефон: *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail: *
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
            </div>
          </CardContent>
        </Card>

        {/* Удовлетворенность услугами */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#213659]">
              2. УДОВЛЕТВОРЕННОСТЬ ОКАЗЫВАЕМОЙ АЭРОНАВИГАЦИОННОЙ УСЛУГОЙ
            </CardTitle>
            <div className="text-sm text-gray-600 space-y-1">
              <p>5 баллов - высокая степень удовлетворенности</p>
              <p>4 балла - хорошая степень удовлетворенности</p>
              <p>3 балла - средняя степень удовлетворенности</p>
              <p>2 балла - низкая степень удовлетворенности</p>
              <p>1 балл - полная неудовлетворенность</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phraseologyQuality" className="text-sm font-medium">
                  Качество ведения фразеологии радиообмена авиационным персоналом: *
                </Label>
                <Select
                  value={formData.phraseologyQuality}
                  onValueChange={(value) => handleInputChange('phraseologyQuality', value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {satisfactionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="informationTimeliness" className="text-sm font-medium">
                  Своевременность информирования о воздушной обстановке: *
                </Label>
                <Select
                  value={formData.informationTimeliness}
                  onValueChange={(value) => handleInputChange('informationTimeliness', value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {satisfactionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipmentQuality" className="text-sm font-medium">
                  Качество работы радиотехнических средств: *
                </Label>
                <Select
                  value={formData.equipmentQuality}
                  onValueChange={(value) => handleInputChange('equipmentQuality', value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {satisfactionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="proceduresQuality" className="text-sm font-medium">
                  Качество процедур обслуживания воздушного движения: *
                </Label>
                <Select
                  value={formData.proceduresQuality}
                  onValueChange={(value) => handleInputChange('proceduresQuality', value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {satisfactionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные поля */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="satisfactionReasons" className="text-sm font-medium">
                Поясните причины снижения оценки удовлетворенности:
              </Label>
              <Textarea
                id="satisfactionReasons"
                value={formData.satisfactionReasons}
                onChange={(e) => handleInputChange('satisfactionReasons', e.target.value)}
                className="mt-1 min-h-[100px]"
                placeholder="Опишите причины снижения оценки..."
              />
            </div>
            <div>
              <Label htmlFor="suggestions" className="text-sm font-medium">
                Ваши замечания, пожелания и предложения по улучшению качества аэронавигационных услуг нашим предприятием:
              </Label>
              <Textarea
                id="suggestions"
                value={formData.suggestions}
                onChange={(e) => handleInputChange('suggestions', e.target.value)}
                className="mt-1 min-h-[100px]"
                placeholder="Ваши предложения по улучшению..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="completionDate" className="text-sm font-medium">
                  Дата заполнения: *
                </Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange('completionDate', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="antispamCode" className="text-sm font-medium">
                  Введите антиспам код: *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="antispamCode"
                    value={formData.antispamCode}
                    onChange={(e) => handleInputChange('antispamCode', e.target.value)}
                    required
                    className="flex-1"
                  />
                  <div className="flex items-center justify-center w-24 h-10 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                    {captchaCode}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateNewCaptcha}
                    className="px-3"
                  >
                    Обновить
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка отправки */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#213659] hover:bg-[#1a2a4a] text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}
          </Button>
        </div>

        {/* Примечание о обязательных полях */}
        <div className="text-center text-red-600 text-sm">
          * - поля, обязательные для заполнения
        </div>
      </form>
    </div>
  );
};

export default ConsumerQuestionnaireForm;
