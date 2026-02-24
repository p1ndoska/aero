import { createElement, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetBranchByIdQuery } from '@/app/services/branchApi';
import { Building2, ArrowLeft, MapPin, Phone, Mail, Image as ImageIcon, X, ChevronLeft, ChevronRight, Navigation, FileText } from 'lucide-react';
import type { TableCellContent } from '@/types/branch';
import YandexMap from './YandexMap';
import { BASE_URL } from '@/constants';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';

export default function BranchDetailsPage() {
  const { language, t } = useLanguage();
  const { id } = useParams();
  const numericId = Number(id);
  const { data, isLoading, error } = useGetBranchByIdQuery(numericId, { skip: isNaN(numericId) });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Принудительное применение стилей выравнивания и цветов после рендеринга
  useEffect(() => {
    const applyStyles = () => {
      // Применяем стили ко всем элементам с data-align
      const elements = document.querySelectorAll('[data-align]');
      elements.forEach((element) => {
        const align = element.getAttribute('data-align');
        if (align) {
          (element as HTMLElement).style.setProperty('text-align', align, 'important');
        }
      });

      // Применяем стили ко всем заголовкам и абзацам
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      headings.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Принудительно применяем выравнивание
        if (htmlElement.getAttribute('data-align')) {
          const align = htmlElement.getAttribute('data-align');
          htmlElement.style.setProperty('text-align', align!, 'important');
        }
        
        // Принудительно применяем цвет из data-атрибута или inline стиля
        const colorAttr = htmlElement.getAttribute('data-color');
        if (colorAttr) {
          htmlElement.style.setProperty('color', colorAttr, 'important');
        } else if (htmlElement.style.color && htmlElement.style.color !== 'rgb(0, 0, 0)') {
          htmlElement.style.setProperty('color', htmlElement.style.color, 'important');
        }
      });

      // Дополнительно применяем стили ко всем элементам с force-классами
      const forceElements = document.querySelectorAll('[class*="force-text-"]');
      forceElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const className = htmlElement.className;
        
        // Извлекаем выравнивание из класса
        const alignMatch = className.match(/force-text-(center|left|right|justify)/);
        if (alignMatch) {
          htmlElement.style.setProperty('text-align', alignMatch[1], 'important');
        }
      });
    };

    // Применяем стили сразу
    applyStyles();

    // Применяем стили после каждого обновления
    const timeoutId = setTimeout(applyStyles, 100);
    
    return () => clearTimeout(timeoutId);
  }, [data]);

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
        navigateImage(-1, (data?.branch?.images || []).map(img => img && img.startsWith('http') ? img : `${BASE_URL}${img?.startsWith('/') ? '' : '/'}${img}`));
      } else if (e.key === 'ArrowRight') {
        navigateImage(1, (data?.branch?.images || []).map(img => img && img.startsWith('http') ? img : `${BASE_URL}${img?.startsWith('/') ? '' : '/'}${img}`));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedImageIndex, data]);

  if (isNaN(numericId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{t('invalid_branch_id') || 'Неверный идентификатор филиала'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_branch') || 'Загрузка информации о филиале...'}</p>
        </div>
      </div>
    );
  }

  if (error || !data?.branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{t('error_loading_branch') || 'Не удалось загрузить данные о филиале'}</p>
      </div>
    );
  }

  const branch = data.branch;
  const mainImage = branch.images?.[0];
  const additionalImages = branch.images?.slice(1) || [];
  const allImages = branch.images || [];
  const services = (branch.services as any) || {};
  const phones: Array<{ label?: string; labelEn?: string; labelBe?: string; number?: string }> = Array.isArray(services.phones) ? services.phones : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/about/branches" className="text-[#213659] flex items-center gap-2 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_list') || 'Назад к списку'}
        </Link>
      </div>

      {/* Закругленный белый квадрат для всего контента */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8" />
            {getTranslatedField(branch, 'name', language)}
          </h1>
        </div>

        {/* Основное изображение */}
        {mainImage ? (
          <div className="flex justify-center mb-6">
            <img
              src={mainImage && mainImage.startsWith('http') ? mainImage : `${BASE_URL}${mainImage?.startsWith('/') ? '' : '/'}${mainImage}`}
              alt={getTranslatedField(branch, 'name', language)}
              className="w-full max-w-2xl h-80 md:h-96 lg:h-[28rem] rounded-xl object-cover object-center border-2 border-[#213659] cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                const imageUrl = mainImage && mainImage.startsWith('http') ? mainImage : `${BASE_URL}${mainImage?.startsWith('/') ? '' : '/'}${mainImage}`;
                setSelectedImage(imageUrl);
                setSelectedImageIndex(0);
              }}
              onError={(e) => {
                console.error(' Ошибка загрузки основного изображения филиала:', mainImage);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log(' Основное изображение филиала загружено:', mainImage);
              }}
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
          {getTranslatedField(branch, 'address', language) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#213659] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{getTranslatedField(branch, 'address', language)}</span>
            </div>
          )}
          {/* Динамические телефоны */}
          {phones.length > 0 && (
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 mb-2">
                <Phone className="w-5 h-5 text-[#213659] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium">{t('contact_phones') || 'Контактные телефоны:'}</span>
              </div>
              <div className="pl-8 space-y-1">
                {phones.map((p, idx) => {
                  // Получаем переведенную подпись телефона
                  let phoneLabel = '';
                  if (language === 'en' && p.labelEn) {
                    phoneLabel = p.labelEn;
                  } else if (language === 'be' && p.labelBe) {
                    phoneLabel = p.labelBe;
                  } else {
                    phoneLabel = p.label || '';
                  }
                  
                  return (
                    <div key={idx} className="text-gray-700">
                      {phoneLabel ? (
                        <span className="font-medium">{phoneLabel}:</span>
                      ) : null} {p.number}
                    </div>
                  );
                })}
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
        {(() => {
          const translatedDescription = getTranslatedField(branch, 'description', language);
          return translatedDescription && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#213659] mb-4">{t('description') || 'Описание'}</h3>
              <p className="text-gray-700 leading-relaxed">{translatedDescription}</p>
            </div>
          );
        })()}

        {/* Контент из конструктора */}
        {(() => {
          // Получаем контент для текущего языка
          let translatedContent;
          if (language === 'en') {
            translatedContent = branch.contentEn != null && 
              (Array.isArray(branch.contentEn) ? branch.contentEn.length > 0 : true) 
              ? branch.contentEn 
              : branch.content;
          } else if (language === 'be') {
            translatedContent = branch.contentBe != null && 
              (Array.isArray(branch.contentBe) ? branch.contentBe.length > 0 : true) 
              ? branch.contentBe 
              : branch.content;
          } else {
            translatedContent = branch.content;
          }
          
          // Проверяем, что контент не пустой
          const hasContent = translatedContent != null && 
            (Array.isArray(translatedContent) ? translatedContent.length > 0 : 
             typeof translatedContent === 'string' ? translatedContent.trim() !== '' : 
             Object.keys(translatedContent || {}).length > 0);
          
          return hasContent && (
            <div className="mb-8 branch-content-container">
              <h3 className="text-xl font-bold text-[#213659] mb-4">{t('additional_information') || 'Дополнительная информация'}</h3>
              <div className="space-y-4">
                {(() => {
                  try {
                    const content = typeof translatedContent === 'string' ? JSON.parse(translatedContent) : translatedContent;
                  console.log('Branch content:', content);
                  if (Array.isArray(content)) {
                    return content.map((element: any, index: number) => {
                      switch (element.type) {
      case 'heading':
        const headingLevel = element.props?.level || 2;
        const HeadingTag = `h${headingLevel}`;
        return createElement(
          HeadingTag,
          { 
            key: index, 
            className: `text-lg font-bold mt-6 mb-2 force-text-${element.props?.textAlign || 'left'}`,
            style: { 
              color: element.props?.color || '#213659',
              textAlign: element.props?.textAlign || 'left'
            },
            'data-align': element.props?.textAlign || 'left',
            'data-color': element.props?.color || '#213659'
          },
          element.content
        );
                        case 'paragraph':
                          // Проверяем, не содержит ли параграф HTML с картой
                          const content = element.content;
                          if (typeof content === 'string' && (content.includes('<iframe') || content.includes('yandex') || content.includes('map'))) {
                            console.log('Found HTML content with map:', content);
                            return (
                              <div 
                                key={index} 
                                className="mb-4"
                                dangerouslySetInnerHTML={{ __html: content }}
                              />
                            );
                          }
                          return (
                            <p 
                              key={index} 
                              className={`text-gray-700 leading-relaxed mb-4 force-text-${element.props?.textAlign || 'left'}`}
                              style={{ 
                                textIndent: element.props?.textIndent ? '1.5em' : '0',
                                textAlign: element.props?.textAlign || 'left'
                              }}
                              data-align={element.props?.textAlign || 'left'}
                            >
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
                                src={element.props?.src && element.props.src.startsWith('http') ? element.props.src : `${BASE_URL}${element.props?.src?.startsWith('/') ? '' : '/'}${element.props?.src}`}
                                alt={element.props?.alt || (t('image') || 'Изображение')}
                                className="max-w-full h-auto rounded-lg border branch-content-image"
                                onError={(e) => {
                                  console.error(' Ошибка загрузки изображения в контенте:', element.props?.src);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log(' Изображение в контенте загружено:', element.props?.src);
                                }}
                              />
                            </div>
                          );
                        case 'list':
                          const items = element.props?.items || [];
                          const listType = element.props?.listType || 'unordered'; // 'ordered' или 'unordered'
                          if (listType === 'ordered') {
                            return (
                              <ol 
                                key={index} 
                                className={`list-decimal list-inside mb-4 space-y-2 force-text-${element.props?.textAlign || 'left'}`}
                                style={{ textAlign: element.props?.textAlign || 'left' }}
                                data-align={element.props?.textAlign || 'left'}
                              >
                                {items.map((item: string, idx: number) => (
                                  <li key={idx} className="text-gray-700">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            );
                          } else {
                            return (
                              <ul 
                                key={index} 
                                className={`list-disc list-inside mb-4 space-y-2 force-text-${element.props?.textAlign || 'left'}`}
                                style={{ textAlign: element.props?.textAlign || 'left' }}
                                data-align={element.props?.textAlign || 'left'}
                              >
                                {items.map((item: string, idx: number) => (
                                  <li key={idx} className="text-gray-700">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                        case 'table':
                          const headers = element.props?.headers || [];
                          const rows = element.props?.rows || [];
                          
                          // Функция для рендеринга содержимого ячейки таблицы
                          const renderTableCell = (cell: TableCellContent | string) => {
                            if (typeof cell === 'string') {
                              return <span>{cell}</span>;
                            }

                            switch (cell.type) {
                              case 'text':
                                return <span>{cell.value}</span>;
                              case 'link':
                                return (
                                  <a 
                                    href={cell.href} 
                                    target={cell.target || '_blank'}
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {cell.text}
                                  </a>
                                );
                              case 'image':
                                return (
                                  <div className="flex justify-center">
                                    <img 
                                      src={cell.src && cell.src.startsWith('http') ? cell.src : `${BASE_URL}${cell.src?.startsWith('/') ? '' : '/'}${cell.src}`}
                                      alt={cell.alt || ''}
                                      className="max-w-full h-auto rounded object-contain"
                                      style={{ maxHeight: '150px', maxWidth: '200px' }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                );
                              case 'file': {
                                const formatFileSize = (bytes: number) => {
                                  if (bytes === 0) return '0 Bytes';
                                  const k = 1024;
                                  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                                  const i = Math.floor(Math.log(bytes) / Math.log(k));
                                  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                                };
                                const displayName = cell.fileName
                                  ? cell.fileName.replace(/\.[^/.]+$/, '')
                                  : '';
                                return (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    <a 
                                      href={`${BASE_URL}${cell.fileUrl?.startsWith('/') ? '' : '/'}${cell.fileUrl}`}
                                      download={cell.fileName}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      {displayName || cell.fileName} ({formatFileSize(cell.fileSize)})
                                    </a>
                                  </div>
                                );
                              }
                              default:
                                return <span>{typeof cell === 'string' ? cell : JSON.stringify(cell)}</span>;
                            }
                          };
                          
                          return (
                            <div key={index} className="mb-6 overflow-x-auto">
                              <table className="min-w-full border border-gray-300 bg-white">
                                {headers.length > 0 && (
                                  <thead>
                                    <tr>
                                      {headers.map((header: string, idx: number) => (
                                        <th key={idx} className="border border-gray-300 px-4 py-2 bg-gray-100 text-left font-medium">
                                          {header || `Колонка ${idx + 1}`}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                )}
                                <tbody>
                                  {rows.map((row: any, rowIdx: number) => (
                                    <tr key={row.id || rowIdx}>
                                      {row.cells.map((cell: TableCellContent | string, cellIdx: number) => (
                                        <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                                          {renderTableCell(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        case 'file':
                          if (!element.props?.fileUrl) return null;
                          const formatFileSize = (bytes: number) => {
                            if (bytes === 0) return '0 Bytes';
                            const k = 1024;
                            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                            const i = Math.floor(Math.log(bytes) / Math.log(k));
                            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                          };
                          return (
                            <div key={index} className="mb-4 flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  {element.props.fileName || 'Неизвестный файл'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {element.props.fileSize ? formatFileSize(element.props.fileSize) : ''}
                                </p>
                              </div>
                              <a
                                href={`${BASE_URL}${element.props.fileUrl.startsWith('/') ? '' : '/'}${element.props.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2A52BE] hover:underline text-sm font-medium"
                              >
                                {t('download') || 'Скачать'}
                              </a>
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
                  return <p className="text-gray-500">{t('error_loading_content') || 'Ошибка загрузки контента'}</p>;
                }
              })()}
              </div>
            </div>
          );
        })()}

        {/* Карта расположения */}
        <div className="mt-8 pt-8 border-t border-gray-200 branch-map-container">
          <h3 className="text-xl font-bold text-[#213659] mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            {t('location_on_map') || 'Расположение на карте'}
          </h3>
          {getTranslatedField(branch, 'address', language) ? (
            <div className="branch-map-container">
              <YandexMap 
                key={`map-${branch.id}`}
                address={getTranslatedField(branch, 'address', language)}
                branchName={getTranslatedField(branch, 'name', language)}
                height="h-96"
                coordinates={branch.coordinates}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">{t('address_not_specified') || 'Адрес не указан'}</p>
                <p className="text-gray-500 text-sm mt-1">{t('address_required_for_map') || 'Для отображения карты необходимо указать адрес'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Дополнительные фото */}
        {additionalImages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#213659] mb-4">{t('additional_photos') || 'Дополнительные фото'}</h3>
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
                  {additionalImages.map((image, index) => {
                    const imageUrl = image && image.startsWith('http') ? image : `${BASE_URL}${image?.startsWith('/') ? '' : '/'}${image}`;
                    return (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`${getTranslatedField(branch, 'name', language)} - фото ${index + 2}`}
                        className="w-64 h-48 object-cover rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:opacity-90 flex-shrink-0"
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          setSelectedImageIndex(index + 1); // +1 because main image is at index 0
                        }}
                        onError={(e) => {
                          console.error(' Ошибка загрузки дополнительного изображения филиала:', image);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(' Дополнительное изображение филиала загружено:', image);
                        }}
                      />
                    );
                  })}
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
                  navigateImage(-1, allImages.map(img => `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`));
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
                  navigateImage(1, allImages.map(img => `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`));
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


