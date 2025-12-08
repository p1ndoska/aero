import React, { useEffect } from 'react';
import { loadAnalyticsScript, loadMarketingScript, canUseAnalytics, canUseMarketing } from '../utils/cookieConsent';

const AnalyticsDemo: React.FC = () => {
  useEffect(() => {
    // Загружаем аналитические скрипты только при согласии пользователя
    if (canUseAnalytics()) {
      // Пример загрузки Google Analytics
      loadAnalyticsScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID', 'google-analytics');
      
      // Инициализация Google Analytics
      const script = document.createElement('script');
      script.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
      `;
      document.head.appendChild(script);
      
      console.log('Analytics enabled - tracking user interactions');
    } else {
      console.log('Analytics disabled - respecting user privacy preferences');
    }

    // Загружаем маркетинговые скрипты только при согласии пользователя
    if (canUseMarketing()) {
      // Пример загрузки Facebook Pixel
      loadMarketingScript('https://connect.facebook.net/en_US/fbevents.js', 'facebook-pixel');
      
      console.log('Marketing scripts enabled');
    } else {
      console.log('Marketing scripts disabled - respecting user privacy preferences');
    }
  }, []);

  const handleTrackEvent = () => {
    if (canUseAnalytics()) {
      // Отправляем событие в Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'button_click', {
          event_category: 'engagement',
          event_label: 'analytics_demo_button'
        });
      }
      console.log('Event tracked to analytics');
    } else {
      console.log('Event not tracked - analytics disabled');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Демонстрация работы с куки</h3>
      
      <div className="space-y-2 mb-4">
        <p>
          <strong>Аналитика:</strong> {canUseAnalytics() ? '✅ Включена' : '❌ Отключена'}
        </p>
        <p>
          <strong>Маркетинг:</strong> {canUseMarketing() ? '✅ Включен' : '❌ Отключен'}
        </p>
      </div>

      <button
        onClick={handleTrackEvent}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Отправить тестовое событие
      </button>

      <p className="text-sm text-gray-600 mt-2">
        Откройте консоль браузера, чтобы увидеть логи работы с куки
      </p>
    </div>
  );
};

export default AnalyticsDemo;





