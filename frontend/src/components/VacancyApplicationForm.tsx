//@ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateApplicationMutation } from '@/app/services/vacancyApi';
import type { Vacancy } from '@/types/vacancy';
import { useLanguage } from '@/contexts/LanguageContext';
import Captcha, { validateCaptcha } from './Captcha';


interface VacancyApplicationFormProps {
  vacancy: Vacancy;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VacancyApplicationForm({
  vacancy,
  isOpen,
  onClose,
  onSuccess,
}: VacancyApplicationFormProps) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });
  const [antispamCode, setAntispamCode] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Функция форматирования телефона в формате +375 (XX) XXX-XX-XX
  const formatPhoneNumber = (value: string): string => {
    // Удаляем все символы, кроме цифр и +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Если пользователь удаляет символы, разрешаем это
    if (cleaned.length < 4) {
      // Если меньше 4 символов, возвращаем то, что есть (может быть +375 или часть)
      if (cleaned.startsWith('+')) {
        return cleaned;
      }
      if (cleaned.startsWith('375')) {
        return '+' + cleaned;
      }
      return cleaned ? '+' + cleaned : '';
    }
    
    // Если начинается не с +375, исправляем
    if (!cleaned.startsWith('+375')) {
      if (cleaned.startsWith('375')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('+')) {
        // Если начинается с +, но не с +375, заменяем на +375
        const digits = cleaned.substring(1);
        if (digits.startsWith('375')) {
          cleaned = '+' + digits;
        } else {
          cleaned = '+375' + digits;
        }
      } else {
        // Если не начинается с +, добавляем +375
        cleaned = '+375' + cleaned;
      }
    }
    
    // Ограничиваем длину (максимум 13 символов: +375 + 9 цифр)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    // Извлекаем только цифры после +375 (максимум 9)
    const digits = cleaned.substring(4);
    
    // Форматируем: +375 (XX) XXX-XX-XX
    let formatted = '+375';
    
    if (digits.length > 0) {
      const code = digits.substring(0, 2); // Код оператора (2 цифры)
      formatted += ` (${code}`;
      
      if (digits.length > 2) {
        const part1 = digits.substring(2, 5); // Первая часть (3 цифры)
        formatted += `) ${part1}`;
        
        if (digits.length > 5) {
          const part2 = digits.substring(5, 7); // Вторая часть (2 цифры)
          formatted += `-${part2}`;
          
          if (digits.length > 7) {
            const part3 = digits.substring(7, 9); // Третья часть (2 цифры)
            formatted += `-${part3}`;
          }
        }
      } else {
        formatted += ')';
      }
    }
    
    return formatted;
  };

  // Функция валидации телефона в формате +375 (XX) XXX-XX-XX
  const validatePhoneNumber = (phone: string): boolean => {
    // Удаляем все символы форматирования и проверяем формат
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Должно быть: +375 + 9 цифр = 13 символов
    const phoneRegex = /^\+375\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    // Очищаем ошибку при вводе
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ваше полное имя';
    }

    // Проверка капчи
    if (!antispamCode || !validateCaptcha(antispamCode)) {
      toast.error(t('invalid_security_code') || 'Неверный код безопасности');
      setErrors({ ...errors, captcha: t('invalid_security_code') || 'Неверный код безопасности' });
      return;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Введите номер в формате +375 (XX) XXX-XX-XX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка размера файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 10MB');
        return;
      }

      // Проверка типа файла
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Разрешены только PDF и DOC/DOCX файлы');
        return;
      }

      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('vacancyId', vacancy.id.toString());
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      if (formData.coverLetter.trim()) {
        formDataToSend.append('coverLetter', formData.coverLetter);
      }
      
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      await createApplication(formDataToSend).unwrap();
      
      toast.success('Ваш отклик успешно отправлен!');
      
      // Сброс формы
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
      });
      setResumeFile(null);
      setErrors({});
      
      onSuccess();
    } catch (error: any) {
      console.error('Application error:', error);
      toast.error(error.data?.error || 'Ошибка при отправке отклика. Попробуйте еще раз.');
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
    });
    setResumeFile(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Отклик на вакансию: {vacancy.title}</DialogTitle>
          <DialogDescription>
            Заполните форму ниже для подачи заявки на вакансию
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-base">
                Полное имя <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-base">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-base">
                Телефон <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+375 (XX) XXX-XX-XX"
                className={errors.phone ? 'border-red-500' : ''}
                maxLength={19} // +375 (XX) XXX-XX-XX = 19 символов
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="coverLetter" className="text-base">
                Сопроводительное письмо
              </Label>
              <Textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                placeholder="Расскажите, почему вы подходите для этой позиции..."
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Опишите ваш опыт, навыки и мотивацию для работы в нашей компании
              </p>
            </div>

            <div>
              <Label htmlFor="resume" className="text-base">
                Резюме (PDF, DOC, DOCX)
              </Label>
              <div className="mt-2">
                {!resumeFile ? (
                  <label
                    htmlFor="resume"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Нажмите, чтобы загрузить резюме
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Максимальный размер файла: 10MB
                      </p>
                    </div>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{resumeFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(resumeFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Примечание:</strong> После отправки отклика наши специалисты по подбору
              персонала рассмотрят вашу заявку и свяжутся с вами в случае заинтересованности.
            </p>
          </div>

          {/* Капча */}
          <Captcha
              value={antispamCode}
              onChange={(value) => {
                setAntispamCode(value);
                if (errors.captcha) {
                  setErrors({ ...errors, captcha: '' });
                }
              }}
              error={errors.captcha}
              required
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
              {isLoading ? 'Отправка...' : 'Отправить отклик'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

