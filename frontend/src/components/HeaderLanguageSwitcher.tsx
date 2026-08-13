//@ts-nocheck
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types/language';

const languageOptions: Language[] = ['ru', 'en', 'be'];

interface HeaderLanguageSwitcherProps {
  mobile?: boolean;
}

export default function HeaderLanguageSwitcher({ mobile = false }: HeaderLanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    const currentIndex = languageOptions.indexOf(language);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + 1) % languageOptions.length;
    setLanguage(languageOptions[nextIndex]);
  };

  return (
    <button
      type="button"
      className={mobile ? 'header-mobile__lang-btn' : 'site-header__lang-btn'}
      onClick={handleLanguageToggle}
      aria-label="Switch language"
    >
      {(language || 'ru').toUpperCase()}
    </button>
  );
}
