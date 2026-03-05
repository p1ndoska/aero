// Типы для конструктора форм

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'textarea' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'number' 
  | 'date' 
  | 'file'
  | 'captcha';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: FormFieldOption[]; // Для select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
}

export interface FormConfig {
  fields: FormField[];
  submitButtonText?: string;
  successMessage?: string;
}

