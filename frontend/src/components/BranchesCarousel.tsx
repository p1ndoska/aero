import React, { useState, useEffect, useRef } from 'react';
import { useGetAllBranchesQuery } from '@/app/services/branchApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import { BASE_URL } from '@/constants';

export default function BranchesCarousel() {
  const { language, t } = useLanguage();
  const { data: branchesResponse, isLoading, error } = useGetAllBranchesQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const branches = branchesResponse?.branches ?? [];

  // Автоматическая прокрутка
  useEffect(() => {
    if (isAutoPlaying && branches.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= branches.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Переключение каждые 3 секунды
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, branches.length]);

  // Прокрутка к текущему элементу
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Получаем реальную ширину первой карточки + отступ
      const firstCard = container.querySelector('a');
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 12; // 12px = gap-3 (0.75rem)
        const scrollAmount = currentIndex * cardWidth;
        container.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? branches.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex >= branches.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md flex items-center justify-center min-h-[100px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#213659] mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t('loading_branches') || 'Загрузка филиалов...'}</p>
        </div>
      </div>
    );
  }

  if (error || !branches.length) {
    return (
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md flex items-center justify-center min-h-[100px]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded bg-gray-200" />
          <p className="text-gray-600 text-sm">
            {t('branches_not_available') || (language === 'en' ? 'No branches available' : 
             language === 'be' ? 'Філіялы не даступныя' : 
             'Филиалы недоступны')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-4 flex flex-col min-h-0">
      <div className="flex items-center justify-center mb-3 shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {t('branches') || (language === 'en' ? 'Our Branches' : 
           language === 'be' ? 'Нашы філіялы' : 
           'Наши филиалы')}
        </h3>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-hidden scrollbar-hide h-full w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {branches.map((branch, index) => {
            const mainImage = branch.images?.[0];
            
            return (
              <Link
                key={branch.id}
                to={`/about/branches/${branch.id}`}
                className="flex-shrink-0 h-full min-h-[288px] bg-white rounded-lg shadow-md border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ 
                  aspectRatio: '4/5',
                  width: 'auto',
                  minWidth: '256px',
                  maxWidth: '450px'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-full h-full flex flex-col">
                  {/* Фотография филиала */}
                  <div className="flex-[3] relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    {mainImage ? (
                      <img
                        src={`${BASE_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`}
                        alt={getTranslatedField(branch, 'name', language)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ${mainImage ? 'hidden' : ''}`}>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Фото</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Название филиала */}
                  <div className="p-2 bg-white rounded-b-lg flex-1 flex flex-col justify-center">
                    <h4 className="font-semibold text-[#213659] text-base text-center leading-tight line-clamp-2">
                      {getTranslatedField(branch, 'name', language)}
                    </h4>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Стрелки по бокам */}
        {branches.length > 1 && (
          <>
            {/* Кнопка прокрутки влево */}
            <button
              onClick={handlePrev}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 shadow-md"
              disabled={branches.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* Кнопка прокрутки вправо */}
            <button
              onClick={handleNext}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 shadow-md"
              disabled={branches.length <= 1}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}

      </div>
    </div>
  );
}
