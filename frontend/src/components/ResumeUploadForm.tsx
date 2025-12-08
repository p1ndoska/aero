//@ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '@/constants';

interface ResumeUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResumeUploadForm({
  isOpen,
  onClose,
  onSuccess,
}: ResumeUploadFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Функция форматирования телефона в формате +375 (XX) XXX-XX-XX
  const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.length < 4) {
      if (cleaned.startsWith('+')) {
        return cleaned;
      }
      if (cleaned.startsWith('375')) {
        return '+' + cleaned;
      }
      return cleaned ? '+' + cleaned : '';
    }
    
    if (!cleaned.startsWith('+375')) {
      if (cleaned.startsWith('375')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('+')) {
        const digits = cleaned.substring(1);
        if (digits.startsWith('375')) {
          cleaned = '+' + digits;
        } else {
          cleaned = '+375' + digits;
        }
      } else {
        cleaned = '+375' + cleaned;
      }
    }
    
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    const digits = cleaned.substring(4);
    let formatted = '+375';
    
    if (digits.length > 0) {
      const code = digits.substring(0, 2);
      formatted += ` (${code}`;
      
      if (digits.length > 2) {
        const part1 = digits.substring(2, 5);
        formatted += `) ${part1}`;
        
        if (digits.length > 5) {
          const part2 = digits.substring(5, 7);
          formatted += `-${part2}`;
          
          if (digits.length > 7) {
            const part3 = digits.substring(7, 9);
            formatted += `-${part3}`;
          }
        }
      } else {
        formatted += ')';
      }
    }
    
    return formatted;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+375\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ваше полное имя';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Введите номер в формате +375 (XX) XXX-XX-XX';
    }

    if (!resumeFile) {
      newErrors.resume = 'Загрузите файл резюме';
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
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast.error('Разрешены только PDF, DOC, DOCX и TXT файлы');
        return;
      }

      setResumeFile(file);
      if (errors.resume) {
        setErrors({ ...errors, resume: '' });
      }
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

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      if (formData.phone.trim()) {
        formDataToSend.append('phone', formData.phone);
      }
      formDataToSend.append('resume', resumeFile!);

      const apiUrl = `${BASE_URL}/api/resume/upload`;
      console.log('Uploading resume to:', apiUrl);
      console.log('BASE_URL:', BASE_URL);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Проверяем, является ли ответ JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при загрузке резюме');
        } else {
          // Если ответ не JSON, читаем как текст
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          throw new Error(`Ошибка ${response.status}: ${text.substring(0, 100)}`);
        }
      }

      const result = await response.json();
      
      toast.success('Резюме успешно отправлено!');
      
      // Сброс формы
      setFormData({
        fullName: '',
        email: '',
        phone: '',
      });
      setResumeFile(null);
      setErrors({});
      
      onSuccess();
    } catch (error: any) {
      console.error('Resume upload error:', error);
      toast.error(error.message || 'Ошибка при отправке резюме. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
    });
    setResumeFile(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Отправить резюме</DialogTitle>
          <DialogDescription>
            Загрузите ваше резюме, и мы свяжемся с вами при появлении подходящих вакансий
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
                Телефон
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+375 (XX) XXX-XX-XX"
                className={errors.phone ? 'border-red-500' : ''}
                maxLength={19}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="resume" className="text-base">
                Резюме (PDF, DOC, DOCX, TXT) <span className="text-red-500">*</span>
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
                      accept=".pdf,.doc,.docx,.txt"
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
              {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Примечание:</strong> После отправки резюме наши специалисты по подбору
              персонала рассмотрят ваше резюме и свяжутся с вами при появлении подходящих вакансий.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
              {isLoading ? 'Отправка...' : 'Отправить резюме'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

