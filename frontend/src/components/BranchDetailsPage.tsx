import { createElement, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetBranchByIdQuery } from '@/app/services/branchApi';
import { Building2, ArrowLeft, MapPin, Phone, Mail, Image as ImageIcon, X, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import YandexMap from './YandexMap';

export default function BranchDetailsPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const { data, isLoading, error } = useGetBranchByIdQuery(numericId, { skip: isNaN(numericId) });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Поддержка клавиатуры для модального окна (Esc, стрелки)
  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1, (data?.branch?.images || []));
      } else if (e.key === 'ArrowRight') {
        navigateImage(1, (data?.branch?.images || []));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedImageIndex, data]);

  if (isNaN(numericId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Неверный идентификатор филиала</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о филиале...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Не удалось загрузить данные о филиале</p>
      </div>
    );
  }

  const branch = data.branch;
  const mainImage = branch.images?.[0];
  const additionalImages = branch.images?.slice(1) || [];
  const allImages = branch.images || [];
  const services = (branch.services as any) || {};
  const phones: Array<{ label?: string; number?: string }> = Array.isArray(services.phones) ? services.phones : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/about/branches" className="text-[#213659] flex items-center gap-2 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
      </div>

      {/* Закругленный белый квадрат для всего контента */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8" />
            {branch.name}
          </h1>
        </div>

        {/* Основное изображение */}
        {mainImage ? (
          <div className="flex justify-center mb-6">
            <img
              src={mainImage}
              alt={branch.name}
              className="w-full max-w-2xl h-80 md:h-96 lg:h-[28rem] rounded-xl object-cover object-center border-2 border-[#213659] cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                setSelectedImage(mainImage);
                setSelectedImageIndex(0);
              }}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-2xl h-80 md:h-96 lg:h-[28rem] rounded-xl bg-[#213659] flex items-center justify-center border-2 border-[#213659]">
              <ImageIcon className="w-16 h-16 text-white" />
            </div>
          </div>
        )}

        {/* Контакты */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {branch.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#213659] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{branch.address}</span>
            </div>
          )}
          {/* Динамические телефоны */}
          {phones.length > 0 && (
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 mb-2">
                <Phone className="w-5 h-5 text-[#213659] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium">Контактные телефоны:</span>
              </div>
              <div className="pl-8 space-y-1">
                {phones.map((p, idx) => (
                  <div key={idx} className="text-gray-700">
                    {p.label ? (
                      <span className="font-medium">{p.label}:</span>
                    ) : null} {p.number}
                  </div>
                ))}
              </div>
            </div>
          )}
          {branch.email && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#213659] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{branch.email}</span>
            </div>
          )}
        </div>

        {/* Описание */}
        {branch.description && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#213659] mb-4">Описание</h3>
            <p className="text-gray-700 leading-relaxed">{branch.description}</p>
          </div>
        )}

        {/* Контент из конструктора */}
        {branch.content && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#213659] mb-4">Дополнительная информация</h3>
            <div className="space-y-4">
              {(() => {
                try {
                  const content = typeof branch.content === 'string' ? JSON.parse(branch.content) : branch.content;
                  if (Array.isArray(content)) {
                    return content.map((element: any, index: number) => {
                      switch (element.type) {
                        case 'heading':
                          const headingLevel = element.props?.level || 2;
                          const HeadingTag = `h${headingLevel}`;
                          return createElement(
                            HeadingTag,
                            { key: index, className: "text-lg font-bold text-[#213659] mt-6 mb-2" },
                            element.content
                          );
                        case 'paragraph':
                          return (
                            <p key={index} className="text-gray-700 leading-relaxed mb-4">
                              {element.content}
                            </p>
                          );
                        case 'link':
                          return (
                            <a
                              key={index}
                              href={element.props?.href}
                              target={element.props?.target || '_blank'}
                              rel="noopener noreferrer"
                              className="text-[#2A52BE] hover:underline block mb-2"
                            >
                              {element.content}
                            </a>
                          );
                        case 'image':
                          return (
                            <div key={index} className="flex justify-center mb-4">
                              <img
                                src={element.props?.src}
                                alt={element.props?.alt || 'Изображение'}
                                className="max-w-full h-auto rounded-lg border"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </div>
                          );
                        default:
                          return null;
                      }
                    });
                  }
                  return null;
                } catch (error) {
                  console.error('Ошибка парсинга контента:', error);
                  return <p className="text-gray-500">Ошибка загрузки контента</p>;
                }
              })()}
            </div>
          </div>
        )}

        {/* Карта расположения */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-[#213659] mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Расположение на карте
          </h3>
          {branch.address ? (
            <YandexMap 
              address={branch.address}
              branchName={branch.name}
              height="h-96"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Адрес не указан</p>
                <p className="text-gray-500 text-sm mt-1">Для отображения карты необходимо указать адрес</p>
              </div>
            </div>
          )}
        </div>

        {/* Дополнительные фото */}
        {additionalImages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#213659] mb-4">Дополнительные фото</h3>
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
                  {additionalImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${branch.name} - фото ${index + 2}`}
                      className="w-64 h-48 object-cover rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:opacity-90 flex-shrink-0"
                      onClick={() => {
                        setSelectedImage(image);
                        setSelectedImageIndex(index + 1); // +1 because main image is at index 0
                      }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра изображений в полный размер */}
      {selectedImage && allImages.length > 0 && (
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
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1, allImages);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Стрелка вправо */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1, allImages);
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
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


