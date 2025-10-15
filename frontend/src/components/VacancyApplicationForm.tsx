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
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? 'border-red-500' : ''}
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

