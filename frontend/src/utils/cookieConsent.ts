// Утилита для работы с настройками куки
export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const getCookieConsent = (): CookieConsent | null => {
  try {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) return null;
    
    const parsed = JSON.parse(consent);
    
    // Проверяем, что все необходимые поля присутствуют
    if (typeof parsed.necessary !== 'boolean' || 
        typeof parsed.functional !== 'boolean' || 
        typeof parsed.analytics !== 'boolean' || 
        typeof parsed.marketing !== 'boolean') {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
};

export const hasCookieConsent = (): boolean => {
  return getCookieConsent() !== null;
};

export const canUseAnalytics = (): boolean => {
  const consent = getCookieConsent();
  return consent?.analytics === true;
};

export const canUseMarketing = (): boolean => {
  const consent = getCookieConsent();
  return consent?.marketing === true;
};

export const canUseFunctional = (): boolean => {
  const consent = getCookieConsent();
  return consent?.functional === true;
};

export const canUseNecessary = (): boolean => {
  // Необходимые куки всегда разрешены
  return true;
};

// Функция для условного выполнения кода в зависимости от согласия
export const withConsent = (
  type: 'analytics' | 'marketing' | 'functional' | 'necessary',
  callback: () => void
): void => {
  let canExecute = false;
  
  switch (type) {
    case 'analytics':
      canExecute = canUseAnalytics();
      break;
    case 'marketing':
      canExecute = canUseMarketing();
      break;
    case 'functional':
      canExecute = canUseFunctional();
      break;
    case 'necessary':
      canExecute = canUseNecessary();
      break;
  }
  
  if (canExecute) {
    callback();
  }
};

// Функция для загрузки аналитических скриптов
export const loadAnalyticsScript = (scriptSrc: string, scriptId: string): void => {
  withConsent('analytics', () => {
    // Проверяем, не загружен ли уже скрипт
    if (document.getElementById(scriptId)) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.id = scriptId;
    script.async = true;
    document.head.appendChild(script);
    
    console.log(`Analytics script ${scriptId} loaded with user consent`);
  });
};

// Функция для загрузки маркетинговых скриптов
export const loadMarketingScript = (scriptSrc: string, scriptId: string): void => {
  withConsent('marketing', () => {
    if (document.getElementById(scriptId)) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.id = scriptId;
    script.async = true;
    document.head.appendChild(script);
    
    console.log(`Marketing script ${scriptId} loaded with user consent`);
  });
};


