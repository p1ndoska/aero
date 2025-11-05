import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { canUseFunctional } from '../utils/cookieConsent';

interface AccessibilitySettings {
  fontSize: number; // множитель размера шрифта (1.0 - 3.0)
  lineHeight: number; // множитель межстрочного интервала (1.0 - 2.0)
  letterSpacing: number; // межбуквенный интервал (0 - 2px)
  fontFamily: 'default' | 'arial'; // семейство шрифтов
  contrast: 'normal' | 'high'; // контрастность
  colorScheme: 'normal' | 'dark' | 'inverted'; // цветовая схема
  reduceMotion: boolean; // уменьшить анимации
  showFocus: boolean; // показать фокус
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isAccessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 1.0,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontFamily: 'default',
  contrast: 'normal',
  colorScheme: 'normal',
  reduceMotion: false,
  showFocus: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Загружаем настройки только если разрешены функциональные куки
    if (canUseFunctional()) {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    return defaultSettings;
  });

  const [isAccessibilityMode, setIsAccessibilityMode] = useState(() => {
    // Загружаем режим доступности только если разрешены функциональные куки
    if (canUseFunctional()) {
      return localStorage.getItem('accessibility-mode') === 'true';
    }
    return false;
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Сохраняем только если разрешены функциональные куки
    if (canUseFunctional()) {
      localStorage.setItem('accessibility-settings', JSON.stringify(updatedSettings));
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    
    // Сохраняем только если разрешены функциональные куки
    if (canUseFunctional()) {
      localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    }
  };

  const toggleAccessibilityMode = () => {
    const newMode = !isAccessibilityMode;
    setIsAccessibilityMode(newMode);
    
    // Сохраняем только если разрешены функциональные куки
    if (canUseFunctional()) {
      localStorage.setItem('accessibility-mode', newMode.toString());
    }
  };

  // Применение стилей к документу
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isAccessibilityMode) {
      // Размер шрифта
      root.style.setProperty('--accessibility-font-size', settings.fontSize.toString());
      
      // Межстрочный интервал
      root.style.setProperty('--accessibility-line-height', settings.lineHeight.toString());
      
      // Межбуквенный интервал
      root.style.setProperty('--accessibility-letter-spacing', `${settings.letterSpacing}px`);
      
      // Семейство шрифтов
      root.style.setProperty('--accessibility-font-family', settings.fontFamily === 'arial' ? 'Arial, sans-serif' : 'inherit');
      
      // Контрастность
      if (settings.contrast === 'high') {
        body.classList.add('high-contrast');
      } else {
        body.classList.remove('high-contrast');
      }
      
      // Цветовая схема
      body.classList.remove('color-scheme-normal', 'color-scheme-dark', 'color-scheme-inverted');
      body.classList.add(`color-scheme-${settings.colorScheme}`);
      
      // Уменьшение анимаций
      if (settings.reduceMotion) {
        body.classList.add('reduce-motion');
      } else {
        body.classList.remove('reduce-motion');
      }
      
      // Показ фокуса
      if (settings.showFocus) {
        body.classList.add('show-focus');
      } else {
        body.classList.remove('show-focus');
      }
      
      body.classList.add('accessibility-mode');
    } else {
      // Сброс всех стилей доступности
      body.classList.remove('accessibility-mode', 'high-contrast', 'reduce-motion', 'show-focus');
      body.classList.remove('color-scheme-normal', 'color-scheme-dark', 'color-scheme-inverted');
      root.style.removeProperty('--accessibility-font-size');
      root.style.removeProperty('--accessibility-line-height');
      root.style.removeProperty('--accessibility-letter-spacing');
      root.style.removeProperty('--accessibility-font-family');
    }
  }, [isAccessibilityMode, settings]);

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    isAccessibilityMode,
    toggleAccessibilityMode,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
