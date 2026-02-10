import React, { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useGetNewsByIdQuery } from '@/app/services/newsApi';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BASE_URL } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const newsId = id ? parseInt(id, 10) : null;
  const { language, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!newsId || isNaN(newsId)) {
    return <Navigate to="/news" replace />;
  }

  const { data: news, isLoading, error } = useGetNewsByIdQuery(newsId);
  
  // Отладочная информация
  console.log('NewsDetailPage - news:', news);

  // Функции для прокрутки стрелками в галерее
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 272; // Ширина фото + отступ (256px + 16px)
      container.scrollTo({ left: container.scrollLeft - scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 272; // Ширина фото + отступ (256px + 16px)
      container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: 'smooth' });
    }
  };

  // Функция для навигации по изображениям в модальном окне
  const navigateImage = (direction: number, images: string[]) => {
    if (!images.length) return;
    const newIndex = (selectedImageIndex + direction + images.length) % images.length;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка новости...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Новость не найдена</h2>
            <p className="text-red-600 mb-4">Возможно, новость была удалена или перемещена.</p>
            <Link 
              to="/news" 
              className="text-[#2A52BE] hover:underline font-medium"
            >
              Вернуться к списку новостей
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-3 py-6 sm:py-8 max-w-none">
      {/* Навигация назад */}
      <div className="mb-6">
        <Link 
          to="/news" 
          className="text-[#213659] flex items-center gap-2 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_news')}
        </Link>
      </div>

      {/* Основной контент */}
      {(() => {
        const translatedName = getTranslatedField(news, 'name', language) || news.name;
        const translatedContent = getTranslatedField(news, 'content', language) || news.content;
        const translatedCategoryName = news.newsCategory ? getTranslatedField(news.newsCategory, 'name', language) || news.newsCategory.name : null;
        
        return (
          <article className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto w-full">
            {/* Изображение новости */}
            {news.photo && (
              <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                <img
                  src={(() => {
                    // Нормализуем путь: если начинается с 'uploads/', добавляем '/'
                    let photoPath = news.photo;
                    if (photoPath && !photoPath.startsWith('/') && !photoPath.startsWith('http')) {
                      photoPath = photoPath.startsWith('uploads/') ? `/${photoPath}` : `/uploads/${photoPath}`;
                    }
                    const fullUrl = `${BASE_URL}${photoPath}`;
                    console.log('🖼️ Loading news detail image:', { original: news.photo, normalized: photoPath, fullUrl, BASE_URL });
                    return fullUrl;
                  })()}
                  alt={translatedName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(' Ошибка загрузки изображения новости:', news.photo);
                    let photoPath = news.photo;
                    if (photoPath && !photoPath.startsWith('/') && !photoPath.startsWith('http')) {
                      photoPath = photoPath.startsWith('uploads/') ? `/${photoPath}` : `/uploads/${photoPath}`;
                    }
                    const imageUrl = `${BASE_URL}${photoPath}`;
                    console.error(' Полный URL:', imageUrl);
                    console.error(' BASE_URL:', BASE_URL);
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log(' Изображение новости загружено:', news.photo);
                  }}
                />
                <div 
                  className="hidden w-full h-full bg-[#213659] items-center justify-center"
                >
                  <ImageIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            )}

            {/* Заголовок и метаданные */}
            <div className="p-6 md:p-8">
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#213659] mb-4 leading-tight">
                  {translatedName}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(news.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : language === 'be' ? 'be-BY' : 'ru-RU',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }
                    )}</span>
                  </div>
                  
                  {news.newsCategory && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="bg-[#213659] text-white px-2 py-1 rounded-full text-xs">
                        {translatedCategoryName}
                      </span>
                    </div>
                  )}
                </div>
              </header>

              {/* Содержание новости */}
              <div className="prose max-w-none sm:prose-md md:prose-lg [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto break-words">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap overflow-x-auto break-words [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_td]:align-top"
                  dangerouslySetInnerHTML={{ __html: translatedContent || t('no_data') }}
                />
              </div>

              {/* Дополнительная информация */}
              <footer className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{t('published_by_admin')}</span>
                  </div>
                  <div>
                    {t('updated')}: {new Date(news.updatedAt || news.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : language === 'be' ? 'be-BY' : 'ru-RU'
                    )}
                  </div>
                </div>
              </footer>
            </div>
          </article>
        );
      })()}

      {/* Дополнительные фото */}
      {news.images && news.images.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-[#213659] mb-4">{t('additional_photos')}</h3>
          <div className="relative">
            {/* Стрелка влево */}
            <button
              onClick={() => scrollLeft()}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            {/* Стрелка вправо */}
            <button
              onClick={() => scrollRight()}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
            
            {/* Горизонтальная прокрутка */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide px-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
                {news.images.map((image, index) => {
                  const translatedName = getTranslatedField(news, 'name', language) || news.name;
                  // Нормализуем путь: если начинается с 'uploads/', добавляем '/'
                  let imagePath = image;
                  if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                    imagePath = imagePath.startsWith('uploads/') ? `/${imagePath}` : `/uploads/${imagePath}`;
                  }
                  const imageUrl = `${BASE_URL}${imagePath}`;
                  return (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${translatedName} - фото ${index + 1}`}
                      className="w-64 h-48 object-cover rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:opacity-90 flex-shrink-0"
                      onClick={() => {
                        setSelectedImage(imageUrl);
                        setSelectedImageIndex(index);
                      }}
                      onError={(e) => {
                        console.error(' Ошибка загрузки дополнительного изображения:', image);
                        console.error(' Полный URL:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log(' Дополнительное изображение загружено:', image);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Похожие новости или навигация */}
      <div className="mt-8 text-center">
        <Link 
          to="/news" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#213659] text-white rounded-lg hover:bg-[#1a2a4a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('all_news')}
        </Link>
      </div>

      {/* Модальное окно для просмотра изображений в полный размер */}
      {selectedImage && news.images && news.images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Кнопка закрытия */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Стрелка влево */}
            {news.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1, news.images.map(img => {
                    let imagePath = img;
                    if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                      imagePath = imagePath.startsWith('uploads/') ? `/${imagePath}` : `/uploads/${imagePath}`;
                    }
                    return `${BASE_URL}${imagePath}`;
                  }));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Стрелка вправо */}
            {news.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1, news.images.map(img => {
                    let imagePath = img;
                    if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                      imagePath = imagePath.startsWith('uploads/') ? `/${imagePath}` : `/uploads/${imagePath}`;
                    }
                    return `${BASE_URL}${imagePath}`;
                  }));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Изображение в фиксированном контейнере для единообразного размера */}
            <div className="w-[90vw] max-w-5xl h-[80vh] mx-auto flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Полный размер"
                className="w-full h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Счетчик изображений */}
            {news.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {news.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetailPage;
