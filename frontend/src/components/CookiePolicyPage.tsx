//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, Info, Settings, Calendar } from 'lucide-react';
import AnalyticsDemo from './AnalyticsDemo';

export default function CookiePolicyPage() {
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
            Политика использования cookie
          </h1>
          <p className="text-lg text-gray-600">
            РУП «Белаэронавигация»
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU', { 
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
                Ваши текущие настройки cookie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.necessary ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">Необходимые</p>
                  <p className="text-xs text-gray-600">Всегда включены</p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.functional ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">Функциональные</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.functional ? 'Включены' : 'Отключены'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.analytics ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">Аналитические</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.analytics ? 'Включены' : 'Отключены'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    cookieConsent.marketing ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">Маркетинговые</p>
                  <p className="text-xs text-gray-600">
                    {cookieConsent.marketing ? 'Включены' : 'Отключены'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResetConsent}
                variant="outline"
                className="w-full"
              >
                Изменить настройки cookie
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Основной контент */}
        <div className="space-y-8">
          {/* Введение */}
          <Card>
            <CardHeader>
              <CardTitle>1. Что такое cookie?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Cookie (куки) — это небольшие текстовые файлы, которые веб-сайты сохраняют на вашем 
                устройстве (компьютере, планшете или мобильном телефоне) при посещении. Они помогают 
                веб-сайтам запоминать информацию о вашем визите, что делает последующие посещения более 
                удобными и полезными.
              </p>
            </CardContent>
          </Card>

          {/* Типы cookie */}
          <Card>
            <CardHeader>
              <CardTitle>2. Какие типы cookie мы используем?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Необходимые */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Необходимые cookie
                </h3>
                <p className="text-gray-700 mb-3">
                  Эти файлы необходимы для работы нашего веб-сайта. Без них невозможно предоставить 
                  запрашиваемые вами услуги.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Примеры использования:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Сохранение состояния авторизации</li>
                    <li>Запоминание товаров в корзине</li>
                    <li>Обеспечение безопасности и защита от мошенничества</li>
                    <li>Сохранение языковых предпочтений</li>
                  </ul>
                </div>
              </div>

              {/* Функциональные */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Функциональные cookie
                </h3>
                <p className="text-gray-700 mb-3">
                  Эти файлы позволяют веб-сайту запоминать ваши предпочтения и обеспечивают 
                  расширенную функциональность.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Примеры использования:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Запоминание выбранного региона или языка</li>
                    <li>Сохранение настроек отображения</li>
                    <li>Персонализация контента</li>
                    <li>Улучшение пользовательского опыта</li>
                  </ul>
                </div>
              </div>

              {/* Аналитические */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  Аналитические cookie
                </h3>
                <p className="text-gray-700 mb-3">
                  Эти файлы помогают нам понять, как посетители взаимодействуют с нашим веб-сайтом, 
                  собирая анонимную информацию.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Примеры использования:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Подсчет количества посетителей</li>
                    <li>Анализ наиболее популярных страниц</li>
                    <li>Определение источников трафика</li>
                    <li>Улучшение производительности сайта</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    Мы можем использовать сервисы: Google Analytics, Яндекс.Метрика
                  </p>
                </div>
              </div>

              {/* Маркетинговые */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Маркетинговые cookie
                </h3>
                <p className="text-gray-700 mb-3">
                  Эти файлы используются для показа релевантной рекламы и измерения эффективности 
                  рекламных кампаний.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Примеры использования:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Показ персонализированной рекламы</li>
                    <li>Отслеживание конверсий</li>
                    <li>Ретаргетинг</li>
                    <li>Аналитика рекламных кампаний</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Управление cookie */}
          <Card>
            <CardHeader>
              <CardTitle>3. Как управлять cookie?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                Вы можете контролировать и/или удалять cookie по своему усмотрению. Вы можете удалить 
                все cookie, которые уже находятся на вашем компьютере, и настроить большинство 
                браузеров так, чтобы они не сохранялись.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900 mb-2">Управление через браузер:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Google Chrome:</strong> Настройки → Конфиденциальность и безопасность → Файлы cookie</li>
                  <li><strong>Mozilla Firefox:</strong> Настройки → Приватность и защита → Файлы cookie</li>
                  <li><strong>Safari:</strong> Настройки → Конфиденциальность → Файлы cookie</li>
                  <li><strong>Microsoft Edge:</strong> Настройки → Файлы cookie и разрешения сайтов</li>
                </ul>
              </div>
              <p className="text-gray-700">
                Обратите внимание, что если вы отключите cookie, некоторые функции нашего веб-сайта 
                могут работать некорректно.
              </p>
            </CardContent>
          </Card>

          {/* Срок хранения */}
          <Card>
            <CardHeader>
              <CardTitle>4. Срок хранения cookie</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                Мы используем как сессионные, так и постоянные cookie:
              </p>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <strong>Сессионные cookie</strong> — временные файлы, которые удаляются при закрытии браузера
                </li>
                <li>
                  <strong>Постоянные cookie</strong> — остаются на вашем устройстве до истечения срока действия или удаления вручную (обычно до 12 месяцев)
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Контакты */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>5. Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                Если у вас есть вопросы о нашей политике использования cookie, свяжитесь с нами:
              </p>
              <div className="text-gray-700 space-y-2">
                <p><strong>Организация:</strong> Республиканское унитарное предприятие по аэронавигационному обслуживанию воздушного движения «Белаэронавигация»</p>
                <p><strong>Адрес:</strong> г. Минск, ул. Аэронавигационная, 1</p>
                <p><strong>Email:</strong> info@belaeronavigation.by</p>
                <p><strong>Телефон:</strong> +375 (17) 123-45-67</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Кнопка возврата */}
        {/* Демонстрация работы с куки */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Демонстрация работы настроек куки</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsDemo />
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
          >
            Вернуться назад
          </Button>
        </div>
      </div>
    </div>
  );
}

