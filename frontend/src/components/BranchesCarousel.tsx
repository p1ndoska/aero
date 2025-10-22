import React, { useState, useEffect, useRef } from 'react';
import { useGetAllBranchesQuery } from '@/app/services/branchApi';
import { ChevronLeft, ChevronRight, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import { BASE_URL } from '@/constants';

export default function BranchesCarousel() {
  const { language } = useLanguage();
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
      const cardWidth = 200; // Ширина карточки + отступ
      const scrollAmount = currentIndex * cardWidth;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
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
          <p className="text-gray-600 text-sm">Загрузка филиалов...</p>
        </div>
      </div>
    );
  }

  if (error || !branches.length) {
    return (
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md flex items-center justify-center min-h-[100px]">
        <div className="text-center">
          <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            {language === 'en' ? 'No branches available' : 
             language === 'be' ? 'Філіялы не даступныя' : 
             'Филиалы недоступны'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-4 min-h-[100px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#213659] flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {language === 'en' ? 'Our Branches' : 
           language === 'be' ? 'Нашы філіялы' : 
           'Наши филиалы'}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={branches.length <= 1}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={branches.length <= 1}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-hidden scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {branches.map((branch, index) => {
            const mainImage = branch.images?.[0];
            const isActive = index === currentIndex;
            
            return (
              <Link
                key={branch.id}
                to={`/about/branches/${branch.id}`}
                className={`flex-shrink-0 w-48 h-56 bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isActive ? 'border-[#213659] shadow-lg' : 'border-gray-200'
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-full h-full flex flex-col">
                  {/* Фотография филиала */}
                  <div className="flex-1 relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-blue-100">
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
                      <Building2 className="w-12 h-12 text-[#213659]" />
                    </div>
                  </div>
                  
                  {/* Название филиала */}
                  <div className="p-3 bg-white rounded-b-lg flex-1 flex flex-col justify-center">
                    <h4 className="font-semibold text-[#213659] text-sm text-center leading-tight line-clamp-2 mb-1">
                      {getTranslatedField(branch, 'name', language)}
                    </h4>
                    {branch.address && (
                      <div className="flex items-center justify-center text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{branch.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Индикаторы */}
        {branches.length > 1 && (
          <div className="flex justify-center mt-3 gap-1">
            {branches.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#213659]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
