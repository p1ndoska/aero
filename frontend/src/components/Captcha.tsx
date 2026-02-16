//@ts-nocheck
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';

interface CaptchaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function Captcha({
  value,
  onChange,
  error,
  required = true,
}: CaptchaProps) {
  const { t } = useLanguage();

  // Инициализация капчи при монтировании компонента
  useEffect(() => {
    // Загружаем капчу с 6 символами
    loadCaptchaEnginge(6);
  }, []);

  const reloadCaptcha = () => {
    // Перезагружаем капчу
    loadCaptchaEnginge(6);
    onChange(''); // Очищаем поле ввода при генерации новой капчи
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="antispamCode" className="text-sm font-medium">
          {t('enter_antispam_code') || 'Введите код безопасности'}
          {required && <span className="text-red-500"> *</span>}
        </Label>
        <div className="flex gap-2 mt-1 items-center">
          <Input
            id="antispamCode"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('enter_code') || 'Введите код'}
            required={required}
            className={`flex-1 ${error ? 'border-red-500' : ''}`}
          />
          <div className="flex items-center justify-center min-w-[120px] h-10 bg-gray-100 border border-gray-300 rounded">
            <LoadCanvasTemplateNoReload />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reloadCaptcha}
            className="px-3"
            title={t('refresh') || 'Обновить'}
          >
            🔄
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <p className="text-xs text-gray-500 mt-1">
          {t('enter_code_from_image') || 'Введите код, показанный на изображении'}
        </p>
      </div>
    </div>
  );
}

// Экспортируем функцию валидации из библиотеки
export { validateCaptcha };
