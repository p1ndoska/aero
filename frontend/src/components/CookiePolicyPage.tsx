//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, Info, Settings, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CookiePolicyPage() {
  const { language, t } = useLanguage();
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      setCookieConsent(JSON.parse(consent));
    }
  }, []);

  const handleResetConsent = () => {
    localStorage.removeItem('cookieConsent');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('cookie_policy') || 'Политика использования cookie'}
          </h1>
          <p className="text-lg text-gray-600">
            {t('company_name_short') || 'РУП «Белаэронавигация»'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('last_updated') || 'Последнее обновление'}: {new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'be' ? 'be-BY' : 'ru-RU', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Текущие настройки */}
        {cookieConsent && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('your_current_cookie_settings') || 'Ваши текущие настройки cookie'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.necessary ? 'bg-[#213659]' : 'bg-gray-300'
                  }`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{t('necessary_cookies') || 'Необходимые'}</p>
                  <p className="text-xs text-gray-600">{t('always_enabled') || 'Всегда включены'}</p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.functional ? 'bg-[#213659]' : 'bg-gray-300'
                  }`}>
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{t('functional_cookies') || 'Функциональные'}</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.functional ? (t('enabled') || 'Включены') : (t('disabled') || 'Отключены')}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.analytics ? 'bg-[#213659]' : 'bg-gray-300'
                  }`}>
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{t('analytics_cookies') || 'Аналитические'}</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.analytics ? (t('enabled') || 'Включены') : (t('disabled') || 'Отключены')}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.marketing ? 'bg-[#213659]' : 'bg-gray-300'
                  }`}>
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{t('marketing_cookies') || 'Маркетинговые'}</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.marketing ? (t('enabled') || 'Включены') : (t('disabled') || 'Отключены')}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResetConsent}
                variant="outline"
                className="w-full"
              >
                {t('change_cookie_settings') || 'Изменить настройки cookie'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Основной контент */}
        <div className="space-y-8">
          {/* Введение */}
          <Card>
            <CardHeader>
              <CardTitle>1. {t('what_are_cookies') || 'Что такое cookie?'}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {t('cookies_description') || 'Cookie (куки) — это небольшие текстовые файлы, которые веб-сайты сохраняют на вашем устройстве (компьютере, планшете или мобильном телефоне) при посещении. Они помогают веб-сайтам запоминать информацию о вашем визите, что делает последующие посещения более удобными и полезными.'}
              </p>
            </CardContent>
          </Card>

          {/* Типы cookie */}
          <Card>
            <CardHeader>
              <CardTitle>2. {t('what_types_of_cookies_do_we_use') || 'Какие типы cookie мы используем?'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Необходимые */}
              <div className="border-l-4 border-[#213659] pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#213659]" />
                  {t('necessary_cookies') || 'Необходимые cookie'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t('necessary_cookies_description') || 'Эти файлы необходимы для работы нашего веб-сайта. Без них невозможно предоставить запрашиваемые вами услуги.'}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t('examples_of_use') || 'Примеры использования:'}</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>{t('save_auth_state') || 'Сохранение состояния авторизации'}</li>
                    <li>{t('remember_cart_items') || 'Запоминание товаров в корзине'}</li>
                    <li>{t('security_protection') || 'Обеспечение безопасности и защита от мошенничества'}</li>
                    <li>{t('save_language_preferences') || 'Сохранение языковых предпочтений'}</li>
                  </ul>
                </div>
              </div>

              {/* Функциональные */}
              <div className="border-l-4 border-[#213659] pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#213659]" />
                  {t('functional_cookies') || 'Функциональные cookie'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t('functional_cookies_description') || 'Эти файлы позволяют веб-сайту запоминать ваши предпочтения и обеспечивают расширенную функциональность.'}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t('examples_of_use') || 'Примеры использования:'}</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>{t('remember_region_language') || 'Запоминание выбранного региона или языка'}</li>
                    <li>{t('save_display_settings') || 'Сохранение настроек отображения'}</li>
                    <li>{t('content_personalization') || 'Персонализация контента'}</li>
                    <li>{t('improve_user_experience') || 'Улучшение пользовательского опыта'}</li>
                  </ul>
                </div>
              </div>

              {/* Аналитические */}
              <div className="border-l-4 border-[#213659] pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#213659]" />
                  {t('analytics_cookies') || 'Аналитические cookie'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t('analytics_cookies_description') || 'Эти файлы помогают нам понять, как посетители взаимодействуют с нашим веб-сайтом, собирая анонимную информацию.'}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t('examples_of_use') || 'Примеры использования:'}</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>{t('count_visitors') || 'Подсчет количества посетителей'}</li>
                    <li>{t('analyze_popular_pages') || 'Анализ наиболее популярных страниц'}</li>
                    <li>{t('determine_traffic_sources') || 'Определение источников трафика'}</li>
                    <li>{t('improve_site_performance') || 'Улучшение производительности сайта'}</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    {t('we_may_use_services') || 'Мы можем использовать сервисы'}: Google Analytics, Яндекс.Метрика
                  </p>
                </div>
              </div>

              {/* Маркетинговые */}
              <div className="border-l-4 border-[#213659] pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#213659]" />
                  {t('marketing_cookies') || 'Маркетинговые cookie'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t('marketing_cookies_description') || 'Эти файлы используются для показа релевантной рекламы и измерения эффективности рекламных кампаний.'}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t('examples_of_use') || 'Примеры использования:'}</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>{t('show_personalized_ads') || 'Показ персонализированной рекламы'}</li>
                    <li>{t('track_conversions') || 'Отслеживание конверсий'}</li>
                    <li>{t('retargeting') || 'Ретаргетинг'}</li>
                    <li>{t('ad_campaign_analytics') || 'Аналитика рекламных кампаний'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Управление cookie */}
          <Card>
            <CardHeader>
              <CardTitle>3. {t('how_to_manage_cookies') || 'Как управлять cookie?'}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                {t('manage_cookies_description') || 'Вы можете контролировать и/или удалять cookie по своему усмотрению. Вы можете удалить все cookie, которые уже находятся на вашем компьютере, и настроить большинство браузеров так, чтобы они не сохранялись.'}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 mb-2">{t('browser_management') || 'Управление через браузер:'}</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Google Chrome:</strong> {t('chrome_cookie_path') || 'Настройки → Конфиденциальность и безопасность → Файлы cookie'}</li>
                  <li><strong>Mozilla Firefox:</strong> {t('firefox_cookie_path') || 'Настройки → Приватность и защита → Файлы cookie'}</li>
                  <li><strong>Safari:</strong> {t('safari_cookie_path') || 'Настройки → Конфиденциальность → Файлы cookie'}</li>
                  <li><strong>Microsoft Edge:</strong> {t('edge_cookie_path') || 'Настройки → Файлы cookie и разрешения сайтов'}</li>
                </ul>
              </div>
              <p className="text-gray-700">
                {t('disable_cookies_warning') || 'Обратите внимание, что если вы отключите cookie, некоторые функции нашего веб-сайта могут работать некорректно.'}
              </p>
            </CardContent>
          </Card>

          {/* Срок хранения */}
          <Card>
            <CardHeader>
              <CardTitle>4. {t('cookie_storage_period') || 'Срок хранения cookie'}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                {t('we_use_both_cookie_types') || 'Мы используем как сессионные, так и постоянные cookie:'}
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>{t('session_cookies') || 'Сессионные cookie'}</strong> — {t('session_cookies_description') || 'временные файлы, которые удаляются при закрытии браузера'}
                </li>
                <li>
                  <strong>{t('persistent_cookies') || 'Постоянные cookie'}</strong> — {t('persistent_cookies_description') || 'остаются на вашем устройстве до истечения срока действия или удаления вручную (обычно до 12 месяцев)'}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Контакты */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>5. {t('contact_information') || 'Контактная информация'}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                {t('cookie_policy_questions') || 'Если у вас есть вопросы о нашей политике использования cookie, свяжитесь с нами:'}
              </p>
              <div className="text-gray-700 space-y-2">
                <p><strong>{t('organization') || 'Организация'}:</strong> {t('company_full_name') || 'Республиканское унитарное предприятие по аэронавигационному обслуживанию воздушного движения «Белаэронавигация»'}</p>
                <p><strong>{t('address') || 'Адрес'}:</strong> {t('company_address') || 'г. Минск, ул. Короткевича, 19'}</p>
                <p><strong>Email:</strong> office@ban.by</p>
                <p><strong>{t('phone') || 'Телефон'}:</strong> +375 (17) 215-40-52</p>
                <p><strong>{t('phone') || 'Телефон'}:</strong> +375 (17) 213-41-63 ({t('fax') || 'факс'})</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Кнопка возврата */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
          >
            {t('go_back') || 'Вернуться назад'}
          </Button>
        </div>
      </div>
    </div>
  );
}

