import React, { useEffect, useRef } from 'react';

interface YandexMapProps {
  address: string;
  branchName: string;
  height?: string;
  className?: string;
  coordinates?: {
    latitude: string | number;
    longitude: string | number;
  };
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
  className = '',
  coordinates 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    console.log('YandexMap useEffect triggered for:', branchName, 'coordinates:', coordinates);
    
    // Предотвращаем двойную инициализацию
    if (isInitialized.current) {
      console.log('Map already initialized, skipping...');
      return;
    }
    
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
      
      // Очищаем предыдущую карту, если она существует
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }

      console.log('Creating new map for:', branchName);
      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: [53.9006, 27.5590], // Координаты Минска по умолчанию
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstance.current = map;
      isInitialized.current = true;

      // Если есть координаты, используем их напрямую
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        const lat = parseFloat(coordinates.latitude.toString());
        const lng = parseFloat(coordinates.longitude.toString());
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const coords = [lat, lng];
          
          // Центрируем карту на указанных координатах
          map.setCenter(coords, 15);
          
          // Добавляем метку
          const placemark = new window.ymaps.Placemark(coords, {
            balloonContent: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #213659; font-weight: bold;">${branchName}</h3>
                <p style="margin: 0; color: #666;">${address}</p>
                <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">Координаты: ${lat}, ${lng}</p>
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
          
          return;
        }
      }

      // Если координат нет или они невалидны, используем геокодирование адреса
      window.ymaps.geocode(address).then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        
        if (firstGeoObject) {
          // Получаем координаты найденного адреса
          const coords = firstGeoObject.geometry.getCoordinates();
          
          // Центрируем карту на найденном адресе
          map.setCenter(coords, 15);
          
          // Добавляем метку
          const placemark = new window.ymaps.Placemark(coords, {
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
                <h3 style="margin: 0 0 8px 0; color: #213659; font-weight: bold;">${branchName}</h3>
                <p style="margin: 0; color: #666;">Адрес не найден: ${address}</p>
                <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">Проверьте правильность адреса</p>
              </div>
            `,
            hintContent: 'Адрес не найден'
          }, {
            iconLayout: 'default#image',
            iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ff6b6b" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">!</text>
              </svg>
            `),
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -16]
          });
          
          map.geoObjects.add(notification);
        }
      }).catch((error: any) => {
        console.error('Ошибка геокодирования:', error);
        // Показываем сообщение об ошибке
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; text-align: center; padding: 20px;">
              <div>
                <p>Ошибка загрузки карты</p>
                <p style="font-size: 12px; margin-top: 8px;">Не удалось найти адрес: ${address}</p>
              </div>
            </div>
          `;
        }
      });
    });

    // Очистка при размонтировании
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      isInitialized.current = false;
    };
  }, [address, branchName, coordinates]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${height} ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
};

export default YandexMap;
