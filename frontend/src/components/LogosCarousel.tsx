import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';

interface OrganizationLogo {
  id: number;
  logoUrl: string;
  name: string;
  internalPath?: string;
  externalUrl?: string;
}

interface LogosCarouselProps {
  logos: OrganizationLogo[];
  loading: boolean;
}

const LogosCarousel: React.FC<LogosCarouselProps> = ({ logos, loading }) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Количество логотипов, видимых одновременно
  const visibleCount = 4;
  const maxIndex = Math.max(0, logos.length - visibleCount);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const container = scrollContainerRef.current;
    const logoWidth = 140; // Примерная ширина логотипа с отступами (увеличено)
    const scrollLeft = index * logoWidth;
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    
    setCurrentIndex(index);
    
    // Сброс флага прокрутки через небольшую задержку
    setTimeout(() => setIsScrolling(false), 300);
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1);
    }
  };

  // Автоматическая прокрутка каждые 5 секунд
  React.useEffect(() => {
    if (logos.length <= visibleCount) return;
    
    const interval = setInterval(() => {
      if (!isScrolling) {
        const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        scrollToIndex(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, maxIndex, isScrolling, logos.length, visibleCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!logos || logos.length === 0) {
    return (
      <div className="flex items-center justify-center h-16">
        <p className="text-gray-500 text-center">
          {language === 'en' ? 'No organizations yet' :
           language === 'be' ? 'арганізацый пакуль няма' :
           'организации пока не добавлены'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Контейнер с логотипами */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-hidden scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logos.map((logo) => {
          const logoContent = (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm mb-1 p-1.5">
                <img
                  src={logo.logoUrl}
                  alt={getTranslatedField(logo, 'name', language)}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 text-center break-words leading-tight mt-0.5">
                {getTranslatedField(logo, 'name', language)}
              </span>
            </>
          );

          return (
            <div key={logo.id} className="flex-shrink-0 flex flex-col items-center min-w-[120px]">
              {logo.externalUrl && logo.externalUrl !== "" ? (
                <a
                  href={logo.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
                >
                  {logoContent}
                </a>
              ) : logo.internalPath && logo.internalPath !== "" ? (
                <Link
                  to={logo.internalPath}
                  className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
                >
                  {logoContent}
                </Link>
              ) : (
                <div className="flex flex-col items-center w-full">
                  {logoContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Стрелки по бокам */}
      {logos.length > visibleCount && (
        <>
          {/* Кнопка прокрутки влево */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 shadow-md"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Кнопка прокрутки вправо */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 shadow-md"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
};

export default LogosCarousel;
