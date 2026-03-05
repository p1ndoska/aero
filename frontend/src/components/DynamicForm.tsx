import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FormField } from '@/types/form';
import { toast } from 'sonner';
import Captcha, { validateCaptcha } from './Captcha';
import * as yup from 'yup';
import { useSubmitDynamicFormMutation } from '@/app/services/formSubmissionApi';

interface DynamicFormProps {
  fields: FormField[];
  submitButtonText?: string;
  successMessage?: string;
}

export default function DynamicForm({
  fields,
  submitButtonText = 'Отправить',
  successMessage = 'Форма успешно отправлена',
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDynamicForm] = useSubmitDynamicFormMutation();

  const validationSchema = useMemo(() => {
    const shape: Record<string, yup.AnySchema> = {};

    for (const field of fields) {
      // Капчу и группы чекбоксов валидируем отдельно
      if (field.type === 'captcha' || field.type === 'checkbox') continue;

      const label = field.label || 'Это поле';
      let schema: yup.AnySchema;

      switch (field.type) {
        case 'number': {
          let numberSchema = yup
            .number()
            .typeError(`Поле "${label}" должно быть числом`);

          if (field.validation?.min !== undefined) {
            numberSchema = numberSchema.min(field.validation.min, `Значение поля "${label}" не может быть меньше ${field.validation.min}`);
          }
          if (field.validation?.max !== undefined) {
            numberSchema = numberSchema.max(field.validation.max, `Значение поля "${label}" не может быть больше ${field.validation.max}`);
          }

          schema = numberSchema;
          break;
        }
        default: {
          // text, email, tel, textarea, select, radio, file и др. — как строки
          let stringSchema = yup.string();

          if (field.type === 'email') {
            stringSchema = stringSchema.email(`Поле "${label}" должно содержать корректный email`);
          }

          if (field.validation?.minLength !== undefined) {
            stringSchema = stringSchema.min(field.validation.minLength, `Поле "${label}" должно содержать не менее ${field.validation.minLength} символов`);
          }
          if (field.validation?.maxLength !== undefined) {
            stringSchema = stringSchema.max(field.validation.maxLength, `Поле "${label}" должно содержать не более ${field.validation.maxLength} символов`);
          }

          if (field.validation?.pattern) {
            try {
              const regex = new RegExp(field.validation.pattern);
              stringSchema = stringSchema.matches(regex, field.validation.message || `Поле "${label}" имеет неверный формат`);
            } catch {
              // игнорируем некорректный regex
            }
          }

          schema = stringSchema;
        }
      }

      if (field.required) {
        schema = schema.required(`Поле "${label}" обязательно для заполнения`);
      }

      shape[field.id] = schema;
    }

    return yup.object().shape(shape);
  }, [fields]);

  if (!fields || fields.length === 0) {
    return null;
  }

  const handleChange = (id: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const validate = async () => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Показываем первое сообщение об ошибке (или можно объединить все)
        const message = err.errors[0] || 'Проверьте корректность заполнения формы';
        toast.error(message);
        return false;
      }
      toast.error('Ошибка валидации формы');
      return false;
    }

    // Дополнительная проверка капчи и групп чекбоксов
    for (const field of fields) {
      const rawValue = values[field.id];

      if (field.type === 'captcha') {
        const captchaValue = typeof rawValue === 'string' ? rawValue : '';
        if (!captchaValue || !validateCaptcha(captchaValue)) {
          toast.error('Неверный код безопасности');
          return false;
        }
      }

      if (field.type === 'checkbox' && field.required) {
        const selected = Array.isArray(rawValue) ? rawValue : [];
        if (selected.length === 0) {
          const label = field.label || 'Это поле';
          toast.error(`Выберите хотя бы один вариант в "${label}"`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      const formName = fields.find((f) => f.label)?.label || 'Динамическая форма';
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

      // Преобразуем данные: вместо технических id полей отправляем человеко-понятные названия
      const dataForEmail: Record<string, any> = {};
      for (const field of fields) {
        if (field.type === 'captcha') continue;
        const rawValue = values[field.id];
        const hasValue =
          rawValue !== undefined &&
          rawValue !== null &&
          !(typeof rawValue === 'string' && rawValue.trim() === '') &&
          !(Array.isArray(rawValue) && rawValue.length === 0);
        if (!hasValue) continue;

        const label = field.label || field.placeholder || field.id;
        dataForEmail[label] = rawValue;
      }

      await submitDynamicForm({
        formName,
        pageUrl,
        data: dataForEmail,
      }).unwrap();

      toast.success(successMessage);
      setValues({});
    } catch (error: any) {
      const message =
        error?.data?.error ||
        error?.message ||
        'Ошибка при отправке формы';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = values[field.id] ?? '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type === 'text' ? 'text' : field.type}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(field.id, e.target.value)}
            rows={3}
          />
        );
      case 'checkbox': {
        const current = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1">
            {field.options?.map((opt) => {
              const optionValue = opt.value || opt.id;
              const checked = current.includes(optionValue);
              return (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const prev = Array.isArray(values[field.id]) ? (values[field.id] as string[]) : [];
                      const next = isChecked
                        ? [...prev, optionValue]
                        : prev.filter((v) => v !== optionValue);
                      handleChange(field.id, next);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case 'select':
        return (
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
          >
            <option value="">Выберите...</option>
            {field.options?.map((opt) => {
              const optionValue = opt.value || opt.id;
              return (
                <option key={opt.id} value={optionValue}>
                  {opt.label}
                </option>
              );
            })}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-1">
            {field.options?.map((opt) => {
              const optionValue = opt.value || opt.id;
              return (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={() => handleChange(field.id, optionValue)}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleChange(field.id, file.name);
              }
            }}
          />
        );
      case 'captcha':
        return (
          <Captcha
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => handleChange(field.id, val)}
            required={field.required}
            placeholder={field.helpText || field.placeholder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            {field.type !== 'captcha' && (
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>
            )}
            {renderField(field)}
            {field.helpText && field.type !== 'captcha' && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        ))}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
          >
            {isSubmitting ? 'Отправка...' : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
}


