import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: 'default' | 'arial';
  contrast: 'normal' | 'high';
  colorScheme: 'normal' | 'dark' | 'inverted';
  grayscale: boolean; // черно-белый режим
  hideImages: boolean; // отключить изображения
  reduceMotion: boolean;
  showFocus: boolean;
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
  grayscale: false,
  hideImages: false,
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
    try {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [isAccessibilityMode, setIsAccessibilityMode] = useState(() => {
    return localStorage.getItem('accessibility-mode') === 'true';
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(updatedSettings));
    } catch {
      /* ignore */
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    } catch {
      /* ignore */
    }
  };

  const toggleAccessibilityMode = () => {
    const newMode = !isAccessibilityMode;
    setIsAccessibilityMode(newMode);
    if (newMode && settings.fontSize === 1) {
      const preset = { ...settings, fontSize: 1.25 };
      setSettings(preset);
      try {
        localStorage.setItem('accessibility-settings', JSON.stringify(preset));
      } catch {
        /* ignore */
      }
    }
    try {
      localStorage.setItem('accessibility-mode', newMode.toString());
    } catch {
      /* ignore */
    }
  };

  // Применение стилей к документу
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isAccessibilityMode) {
      root.classList.add('accessibility-mode');
      root.style.setProperty('--accessibility-font-size', settings.fontSize.toString());
      root.style.setProperty('--accessibility-line-height', settings.lineHeight.toString());
      root.style.setProperty('--accessibility-letter-spacing', `${settings.letterSpacing}px`);
      root.style.setProperty('--accessibility-font-family', settings.fontFamily === 'arial' ? 'Arial, sans-serif' : 'inherit');
      
      if (settings.contrast === 'high') {
        body.classList.add('high-contrast');
      } else {
        body.classList.remove('high-contrast');
      }
      
      body.classList.remove('color-scheme-normal', 'color-scheme-dark', 'color-scheme-inverted');
      body.classList.add(`color-scheme-${settings.colorScheme}`);
      
      if (settings.reduceMotion) {
        body.classList.add('reduce-motion');
      } else {
        body.classList.remove('reduce-motion');
      }
      
      if (settings.showFocus) {
        body.classList.add('show-focus');
      } else {
        body.classList.remove('show-focus');
      }
      
      if (settings.grayscale) {
        body.classList.add('a11y-grayscale');
      } else {
        body.classList.remove('a11y-grayscale');
      }
      
      if (settings.hideImages) {
        body.classList.add('a11y-hide-images');
      } else {
        body.classList.remove('a11y-hide-images');
      }
      
      body.classList.add('accessibility-mode');
    } else {
      root.classList.remove('accessibility-mode');
      body.classList.remove('accessibility-mode', 'high-contrast', 'reduce-motion', 'show-focus', 'a11y-grayscale', 'a11y-hide-images');
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
