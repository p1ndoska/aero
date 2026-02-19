import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import Captcha, { validateCaptcha } from './Captcha';
import { BASE_URL } from '@/constants';

interface FormData {
  // Вопросы
  overallQuality: string;
  timeliness: string;
  airacAccuracy: string;
  airacAvailability: string;
  aipAccuracy: string;
  aipClarity: string;
  aicAccuracy: string;
  aicAvailability: string;
  notamList: string;
  notamClarity: string;
  notamCompleteness: string;
  websiteRating: string;
  
  // Дополнительные поля
  comments: string;
  organizationName: string;
  positionAndName: string;
  completionDate: string;
  antispamCode: string;
}

const ratingOptions = [
  { value: 'good', label: 'Хорошо' },
  { value: 'satisfactory', label: 'Удовлетворительно' },
  { value: 'poor', label: 'Плохо' },
];

const SAIConsumerQuestionnaireForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    overallQuality: '',
    timeliness: '',
    airacAccuracy: '',
    airacAvailability: '',
    aipAccuracy: '',
    aipClarity: '',
    aicAccuracy: '',
    aicAvailability: '',
    notamList: '',
    notamClarity: '',
    notamCompleteness: '',
    websiteRating: '',
    comments: '',
    organizationName: '',
    positionAndName: '',
    completionDate: '',
    antispamCode: ''
  });

  const { t, language } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    const requiredFields: (keyof FormData)[] = [
      'overallQuality',
      'timeliness',
      'airacAccuracy',
      'airacAvailability',
      'aipAccuracy',
      'aipClarity',
      'aicAccuracy',
      'aicAvailability',
      'notamList',
      'notamClarity',
      'notamCompleteness',
      'websiteRating',
      'organizationName',
      'positionAndName',
      'completionDate',
      'antispamCode'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Заполните все обязательные поля');
      setErrors({ general: 'Заполните все обязательные поля' });
      return;
    }

    // Проверка капчи
    if (!validateCaptcha(formData.antispamCode)) {
      toast.error('Неверный код безопасности');
      setErrors({ antispamCode: 'Неверный код безопасности' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${BASE_URL}/api/sai-questionnaire/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при отправке анкеты');
      }

      toast.success('Анкета успешно отправлена! Спасибо за сотрудничество!');
      
      // Сброс формы
      setFormData({
        overallQuality: '',
        timeliness: '',
        airacAccuracy: '',
        airacAvailability: '',
        aipAccuracy: '',
        aipClarity: '',
        aicAccuracy: '',
        aicAvailability: '',
        notamList: '',
        notamClarity: '',
        notamCompleteness: '',
        websiteRating: '',
        comments: '',
        organizationName: '',
        positionAndName: '',
        completionDate: '',
        antispamCode: ''
      });
      setErrors({});
      
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast.error(error.message || 'Ошибка при отправке анкеты');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Устанавливаем текущую дату по умолчанию
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      completionDate: prev.completionDate || today
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center bg-white">
            <CardTitle className="text-3xl font-bold text-[#213659] mb-4">
              Анкета потребителя САИ Республики Беларусь
            </CardTitle>
            <div className="text-center">
              <p className="text-xl font-semibold text-red-600 mb-4">
                Уважаемые дамы и господа!
              </p>
              <p className="text-gray-700 leading-relaxed">
                Мы были бы Вам признательны, если Вы уделите несколько свободных минут и ответите на наши вопросы. 
                Этот вопросник поможет нам оценить уровень Вашего удовлетворения работой САИ Республики Беларусь. 
                Полученный результат послужит улучшению качества нашей работы.
              </p>
            </div>
          </CardHeader>
          <CardContent className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Вопрос 1 */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  1. Как Вы в целом оцениваете качество обеспечения аэронавигационной информацией? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.overallQuality}
                  onValueChange={(value) => handleInputChange('overallQuality', value)}
                >
                  <SelectTrigger className={errors.overallQuality ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className = 'bg-white'>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Вопрос 2 */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  2. Как Вы оцениваете своевременность опубликования аэронавигационной информации? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.timeliness}
                  onValueChange={(value) => handleInputChange('timeliness', value)}
                >
                  <SelectTrigger className={errors.timeliness ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className = 'bg-white'>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Вопрос 3 */}
              <div className="space-y-4 border-l-4 border-blue-200 pl-4">
                <Label className="text-base font-medium">
                  3. Как Вы оцениваете поправки по циклу AIRAC?
                </Label>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Точность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.airacAccuracy}
                    onValueChange={(value) => handleInputChange('airacAccuracy', value)}
                  >
                    <SelectTrigger className={errors.airacAccuracy ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Доступность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.airacAvailability}
                    onValueChange={(value) => handleInputChange('airacAvailability', value)}
                  >
                    <SelectTrigger className={errors.airacAvailability ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Вопрос 4 */}
              <div className="space-y-4 border-l-4 border-blue-200 pl-4">
                <Label className="text-base font-medium">
                  4. Как Вы оцениваете дополнения к AIP?
                </Label>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Точность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.aipAccuracy}
                    onValueChange={(value) => handleInputChange('aipAccuracy', value)}
                  >
                    <SelectTrigger className={errors.aipAccuracy ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Ясность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.aipClarity}
                    onValueChange={(value) => handleInputChange('aipClarity', value)}
                  >
                    <SelectTrigger className={errors.aipClarity ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Вопрос 5 */}
              <div className="space-y-4 border-l-4 border-blue-200 pl-4">
                <Label className="text-base font-medium">
                  5. Как Вы оцениваете циркуляры аэронавигационной информации?
                </Label>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Точность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.aicAccuracy}
                    onValueChange={(value) => handleInputChange('aicAccuracy', value)}
                  >
                    <SelectTrigger className={errors.aicAccuracy ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Доступность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.aicAvailability}
                    onValueChange={(value) => handleInputChange('aicAvailability', value)}
                  >
                    <SelectTrigger className={errors.aicAvailability ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Вопрос 6 */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  6. Как Вы оцениваете списки действующих НОТАМ? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.notamList}
                  onValueChange={(value) => handleInputChange('notamList', value)}
                >
                  <SelectTrigger className={errors.notamList ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className = 'bg-white'>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Вопрос 7 */}
              <div className="space-y-4 border-l-4 border-blue-200 pl-4">
                <Label className="text-base font-medium">
                  7. Как Вы оцениваете информацию, публикуемую НОТАМ?
                </Label>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Ясность информации <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.notamClarity}
                    onValueChange={(value) => handleInputChange('notamClarity', value)}
                  >
                    <SelectTrigger className={errors.notamClarity ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 ml-4">
                  <Label className="text-sm">
                    Полнота <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.notamCompleteness}
                    onValueChange={(value) => handleInputChange('notamCompleteness', value)}
                  >
                    <SelectTrigger className={errors.notamCompleteness ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите оценку" />
                    </SelectTrigger>
                    <SelectContent className = 'bg-white'>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Вопрос 8 */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  8. Как Вы оцениваете нашу страницу в сети Internet на сайте: <a href="http://www.ban.by" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://www.ban.by</a>? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.websiteRating}
                  onValueChange={(value) => handleInputChange('websiteRating', value)}
                >
                  <SelectTrigger className={errors.websiteRating ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите оценку" />
                  </SelectTrigger>
                  <SelectContent className = 'bg-white'>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Комментарии */}
              <div className="space-y-2">
                <Label htmlFor="comments">Ваши комментарии:</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Введите ваши комментарии..."
                  rows={4}
                  className="resize-y"
                />
              </div>

              {/* Название организации */}
              <div className="space-y-2">
                <Label htmlFor="organizationName">
                  Название организации <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="Введите название организации"
                  className={errors.organizationName ? 'border-red-500' : ''}
                  required
                />
              </div>

              {/* Должность и ФИО */}
              <div className="space-y-2">
                <Label htmlFor="positionAndName">
                  Должность и ФИО <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="positionAndName"
                  value={formData.positionAndName}
                  onChange={(e) => handleInputChange('positionAndName', e.target.value)}
                  placeholder="Введите должность и ФИО"
                  className={errors.positionAndName ? 'border-red-500' : ''}
                  required
                />
              </div>

              {/* Дата заполнения */}
              <div className="space-y-2">
                <Label htmlFor="completionDate">
                  Дата заполнения <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange('completionDate', e.target.value)}
                  className={errors.completionDate ? 'border-red-500' : ''}
                  required
                />
              </div>

              {/* Капча */}
              <div className="space-y-2">
                <Captcha
                  value={formData.antispamCode}
                  onChange={(value) => handleInputChange('antispamCode', value)}
                  error={errors.antispamCode}
                  required
                />
              </div>

              {/* Кнопка отправки */}
              <div className="flex flex-col items-center space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2 bg-[#213659] hover:bg-[#213659] text-white text-lg font-medium"
                >
                  {isSubmitting ? 'Отправка...' : 'ОТПРАВИТЬ'}
                </Button>
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> - поля, обязательные для заполнения
                </p>
              </div>
            </form>

            {/* Сообщение благодарности */}
            <div className="mt-8 text-center bg-blue-100 py-4 px-6 rounded-lg">
              <p className="text-xl font-bold text-orange-600">
                Спасибо за сотрудничество!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SAIConsumerQuestionnaireForm;

