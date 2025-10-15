import React, { useEffect, useRef } from 'react';

interface YandexMapProps {
  address: string;
  branchName: string;
  height?: string;
  className?: string;
}

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({ 
  address, 
  branchName, 
  height = 'h-96', 
  className = '' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Проверяем, загружена ли API Яндекс.Карт
    if (!window.ymaps) {
      console.warn('Yandex Maps API не загружена');
      // Показываем сообщение об ошибке в контейнере карты
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; text-align: center; padding: 20px;">
            <div>
              <p>Карта временно недоступна</p>
              <p style="font-size: 12px; margin-top: 8px;">Не удалось загрузить Яндекс.Карты</p>
            </div>
          </div>
        `;
      }
      return;
    }

    // Инициализация карты
    window.ymaps.ready(() => {
      if (!mapRef.current) return;

      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: [53.9006, 27.5590], // Координаты Минска по умолчанию
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstance.current = map;

      // Геокодирование адреса
      window.ymaps.geocode(address).then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        
        if (firstGeoObject) {
          // Получаем координаты найденного адреса
          const coordinates = firstGeoObject.geometry.getCoordinates();
          
          // Центрируем карту на найденном адресе
          map.setCenter(coordinates, 15);
          
          // Добавляем метку
          const placemark = new window.ymaps.Placemark(coordinates, {
            balloonContent: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #213659; font-weight: bold;">${branchName}</h3>
                <p style="margin: 0; color: #666;">${address}</p>
              </div>
            `,
            hintContent: branchName
          }, {
            iconLayout: 'default#image',
            iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#213659" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            `),
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -16]
          });
          
          map.geoObjects.add(placemark);
          
          // Открываем балун при клике на метку
          placemark.events.add('click', () => {
            placemark.balloon.open();
          });
        } else {
          console.warn('Адрес не найден:', address);
          // Если адрес не найден, показываем карту Минска с уведомлением
          const notification = new window.ymaps.Placemark([53.9006, 27.5590], {
            balloonContent: `
              <div style="padding: 10px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: #213659;">${branchName}</h3>
                <p style="margin: 0; color: #666;">${address}</p>
                <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">
                  Точное местоположение не найдено
                </p>
              </div>
            `
          });
          map.geoObjects.add(notification);
        }
      }).catch((error: any) => {
        console.error('Ошибка геокодирования:', error);
      });
    });

    // Очистка при размонтировании компонента
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, [address, branchName]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${height} rounded-lg overflow-hidden border-2 border-[#B1D1E0] ${className}`}
      style={{ minHeight: '384px' }}
    />
  );
};

export default YandexMap;


