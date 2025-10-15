import React from 'react';
import { Upload } from 'lucide-react';

interface LogoUploadProps {
  logoUrl: string;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  uploadId: string;
  required?: boolean;
}

export default function LogoUpload({ 
  logoUrl, 
  onFileUpload, 
  isUploading, 
  uploadId,
  required = false
}: LogoUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Логотип организации{required && ' *'}
      </label>
      <div className="space-y-3">
        {/* Загрузка файла */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file);
              }
            }}
            className="hidden"
            id={uploadId}
            disabled={isUploading}
            required={required}
          />
          {/* Скрытое поле для валидации */}
          {required && (
            <input
              type="text"
              value={logoUrl || ''}
              onChange={() => {}}
              className="hidden"
              required
            />
          )}
          <label
            htmlFor={uploadId}
            className="cursor-pointer flex flex-col items-center"
          >
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-blue-600 font-medium">Загрузка...</span>
                <span className="text-xs text-gray-500 mt-1">Пожалуйста, подождите</span>
              </>
            ) : logoUrl ? (
              <>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-green-600 font-medium">Файл загружен</span>
                <span className="text-xs text-gray-500 mt-1">Нажмите для изменения</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Выберите файл логотипа</span>
                <span className="text-xs text-gray-500 mt-1">
                  Поддерживаются: PNG, JPG, JPEG, GIF (макс. 5MB)
                </span>
              </>
            )}
          </label>
        </div>
        
        {/* Предпросмотр логотипа */}
        {logoUrl && (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium text-gray-700">Предпросмотр:</span>
            <div className="border rounded-lg p-3 bg-gray-50">
              <img
                src={logoUrl}
                alt="Предпросмотр логотипа"
                className="h-24 w-auto object-contain max-w-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-red-500 text-sm">Ошибка загрузки изображения</span>';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
