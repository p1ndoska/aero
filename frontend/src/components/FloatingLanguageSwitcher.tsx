//@ts-nocheck
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types/language';
import { FaGlobe } from 'react-icons/fa';

const languageOptions: Language[] = ['ru', 'en', 'be'];

export default function FloatingLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    const currentIndex = languageOptions.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOptions.length;
    setLanguage(languageOptions[nextIndex]);
  };

  return (
    <>
      {/* Кнопка переключателя языка */}
      <button
        onClick={handleLanguageToggle}
        className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
      >
        <FaGlobe className="text-[#213659]" />
      </button>
      
      {/* Код языка под кнопкой */}
      <span className="text-xs font-medium text-[#213659]">
        {language?.toUpperCase() || 'RU'}
      </span>
    </>
  );
}
