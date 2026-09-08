//@ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types/language';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Globe, Check } from 'lucide-react';

const languageOptions = [
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'be' as Language, name: 'Беларуская', flag: '🇧🇾' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <>
      {/* Кнопка переключателя языка */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-[#B1D1E0] transition-colors"
      >
        <div className="relative">
          <Globe className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <span className="text-xs font-medium text-[var(--color-primary)] uppercase">
          {currentLanguage?.code || 'RU'}
        </span>
      </Button>

      {/* Диалог выбора языка */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Выберите язык / Choose Language / Выберыце мову
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {languageOptions.map((option) => (
              <Button
                key={option.code}
                variant={language === option.code ? "default" : "ghost"}
                onClick={() => handleLanguageChange(option.code)}
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <span className="text-2xl">{option.flag}</span>
                <span className="flex-1 text-left">{option.name}</span>
                {language === option.code && (
                  <Check className="w-5 h-5 text-white" />
                )}
              </Button>
            ))}
          </div>
          
          {/* Информация о языке */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Текущий язык:</strong> {currentLanguage?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Язык сохраняется в вашем браузере
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Компактная версия для мобильных устройств
export function CompactLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <>
      {/* Компактная кнопка */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#B1D1E0] transition-colors"
      >
        <Globe className="w-4 h-4 text-[var(--color-primary)]" />
        <span className="text-sm font-medium text-[var(--color-primary)] uppercase">
          {currentLanguage?.code || 'RU'}
        </span>
      </button>

      {/* Диалог выбора языка */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Выберите язык
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {languageOptions.map((option) => (
              <Button
                key={option.code}
                variant={language === option.code ? "default" : "ghost"}
                onClick={() => handleLanguageChange(option.code)}
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <span className="text-2xl">{option.flag}</span>
                <span className="flex-1 text-left">{option.name}</span>
                {language === option.code && (
                  <Check className="w-5 h-5 text-white" />
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
