//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Всегда включены
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Проверяем, было ли уже дано согласие
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Показываем баннер через небольшую задержку
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Необходимые cookies всегда включены
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(rejected));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-6xl mx-4 mb-4">
        <Card className="bg-white shadow-2xl border-2 border-blue-200">
          <div className="p-6">
            {!showSettings ? (
              // Основной баннер
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-12 h-12 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('cookie_title')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('cookie_message')}{' '}
                    <Link to="/cookie-policy" className="text-blue-600 hover:underline font-medium">
                      политикой использования cookie
                    </Link>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('settings')}
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {t('reject')}
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white whitespace-nowrap"
                  >
                    {t('accept_all')}
                  </Button>
                </div>
              </div>
            ) : (
              // Настройки cookie
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    {t('settings')} cookie
                  </h3>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Необходимые cookies */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {t('necessary_cookies')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Эти файлы необходимы для базовой работы сайта (авторизация, безопасность). 
                          Их нельзя отключить.
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Всегда включены
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Функциональные cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {t('functional_cookies')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Позволяют запоминать ваши предпочтения (язык, регион) и улучшают функциональность сайта.
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.functional}
                            onChange={(e) =>
                              setPreferences({ ...preferences, functional: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Аналитические cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {t('analytics_cookies')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Помогают понять, как посетители взаимодействуют с сайтом, собирая анонимную статистику.
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) =>
                              setPreferences({ ...preferences, analytics: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Маркетинговые cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {t('marketing_cookies')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Используются для показа релевантной рекламы и измерения эффективности рекламных кампаний.
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) =>
                              setPreferences({ ...preferences, marketing: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                  >
                    Отклонить все
                  </Button>
                  <Button
                    onClick={handleAcceptSelected}
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                  >
                    Сохранить настройки
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

