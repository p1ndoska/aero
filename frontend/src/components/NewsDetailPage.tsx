import React, { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetNewsByIdQuery } from '@/app/services/newsApi';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, User, X, ChevronLeft, ChevronRight, FileText, Mail, Lock as LockIcon } from 'lucide-react';
import { BASE_URL } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';
import type { ContentElement, TableCellContent } from '@/types/branch';
import { renderTableBody } from '@/utils/tableRender';
import { useLoginMutation } from '@/app/services/userApi';
import { setCredentials } from '@/features/user/userSlice';
import type { AppDispatch } from '@/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DynamicForm from './DynamicForm';
import { isVisibleBySchedule, renderScheduleBadge } from '@/utils/scheduleVisibility';

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const newsId = id ? parseInt(id, 10) : null;
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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

  // Функция для рендеринга содержимого ячейки таблицы
  const renderTableCell = (cell: TableCellContent | string) => {
    if (typeof cell === 'string') return <span>{cell}</span>;
    if (cell.type === 'covered') return <span className="text-gray-400">—</span>;
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
              src={`${BASE_URL}${cell.src?.startsWith('/') ? '' : '/'}${cell.src}`}
              alt={cell.alt || ''}
              className="max-w-full h-auto rounded object-contain"
              style={{ maxHeight: '150px', maxWidth: '200px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      case 'file':
        const formatFileSize = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <a
              href={`${BASE_URL}${cell.fileUrl?.startsWith('/') ? '' : '/'}${cell.fileUrl}`}
              download={cell.fileName}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {cell.fileName} ({formatFileSize(cell.fileSize)})
            </a>
          </div>
        );
      default:
        return <span>{typeof cell === 'string' ? cell : JSON.stringify(cell)}</span>;
    }
  };

  const roleValue = user?.role;
  const currentRole = (typeof roleValue === 'string' ? roleValue : roleValue?.name || '').toString().toUpperCase();
  const isNewsAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'NEWS_ADMIN';
  const isAdminPreview = isAuthenticated && isNewsAdmin;

  const isElementPrivate = (element: any) => {
    return element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
  };

  const canViewElement = (element: any): boolean => {
    const isPrivate = isElementPrivate(element);
    if (!isPrivate) return true;
    if (!isAuthenticated) return false;

    const allowedRoles = Array.isArray(element.allowedRoles)
      ? element.allowedRoles.map((r: string) => r.toString().toUpperCase())
      : [];

    if (!allowedRoles.length) return true; // нет ограничений — любой авторизованный
    if (!currentRole) return false;
    if (currentRole === 'SUPER_ADMIN') return true;

    return allowedRoles.includes(currentRole);
  };

  // Функция для рендеринга элементов контента конструктора
  const renderContentElement = (element: ContentElement) => {
    const getHeadingSizeClass = (level?: number) => {
      switch (level) {
        case 1:
          return 'text-3xl md:text-4xl';
        case 2:
          return 'text-2xl md:text-3xl';
        case 3:
          return 'text-xl md:text-2xl';
        case 4:
          return 'text-lg md:text-xl';
        case 5:
          return 'text-base md:text-lg';
        case 6:
        default:
          return 'text-base';
      }
    };
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.props?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const HeadingComponent = HeadingTag;
        return (
          <HeadingComponent 
            className={`${getHeadingSizeClass(element.props?.level)} font-bold text-gray-900 mb-4 break-words force-text-${element.props?.textAlign || 'left'}`}
            style={{ 
              color: element.props?.color || '#000000',
              textAlign: element.props?.textAlign || 'left'
            }}
            data-align={element.props?.textAlign || 'left'}
            data-color={element.props?.color || '#000000'}
          >
            {element.content}
          </HeadingComponent>
        );
      case 'paragraph':
        return (
          <p 
            className={`text-gray-700 mb-4 leading-relaxed break-words force-text-${element.props?.textAlign || 'left'}`}
            style={{ 
              textIndent: element.props?.textIndent ? '1.5em' : '0',
              textAlign: element.props?.textAlign || 'left'
            }}
            data-align={element.props?.textAlign || 'left'}
          >
            {element.content}
          </p>
        );
      case 'list':
        const items = element.props?.items || [];
        return (
          <div className="mb-4">
            {element.props?.listTitle && (
              <h3
                className="text-lg font-semibold text-gray-900 mb-2 break-words"
                style={{
                  textAlign:
                    element.props.listTitleAlign === 'center'
                      ? 'center'
                      : element.props.listTitleAlign === 'right'
                      ? 'right'
                      : 'left',
                }}
              >
                {element.props.listTitle}
              </h3>
            )}
            <ul className="list-disc list-inside space-y-2">
              {items.map((item: string, idx: number) => (
                <li key={idx} className="text-gray-700 break-words">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'link':
        return (
          <a
            href={element.props?.href}
            target={element.props?.target || '_blank'}
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mb-4 inline-block break-words"
          >
            {element.content}
          </a>
        );
      case 'image':
        return (
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={`${BASE_URL}${element.props?.src?.startsWith('/') ? '' : '/'}${element.props?.src}`}
              alt={element.props?.alt || ''}
              className="max-w-full h-auto rounded-lg object-contain"
              style={{ maxWidth: '800px', maxHeight: '400px' }}
              onError={(e) => {
                console.error('Image failed to load:', element.props?.src);
                e.currentTarget.style.display = 'none';
              }}
            />
            {element.props?.alt && <p className="text-sm text-gray-500 mt-2 text-center">{element.props.alt}</p>}
          </div>
        );
      case 'table':
        const headers = element.props?.headers || [];
        const rows = element.props?.rows || [];
        return (
          <div className="mb-6 overflow-x-auto">
            {element.props?.tableTitle && (
              <h3
                className="text-lg font-semibold text-gray-900 mb-2 break-words"
                style={{
                  textAlign:
                    element.props.tableTitleAlign === 'center'
                      ? 'center'
                      : element.props.tableTitleAlign === 'right'
                      ? 'right'
                      : 'left',
                }}
              >
                {element.props.tableTitle}
              </h3>
            )}
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
                {renderTableBody(rows, headers.length || 1, (c) => renderTableCell(c), 'border border-gray-300 px-4 py-2')}
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
        const fileDisplayName =
          (element.content && String(element.content).trim())
            ? String(element.content).trim()
            : (element.props.fileName || 'Неизвестный файл');
        return (
          <div className="mb-4 flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">
                {fileDisplayName}
              </p>
              <p className="text-xs text-gray-500">
                {element.props.fileType && `${element.props.fileType} • `}
                {element.props.fileSize && formatFileSize(element.props.fileSize)}
              </p>
            </div>
            <a
              href={`${BASE_URL}${element.props.fileUrl?.startsWith('/') ? '' : '/'}${element.props.fileUrl}`}
              download={element.props.fileName}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Скачать
            </a>
          </div>
        );
      case 'video':
        if (!element.props?.videoSrc) return null;
        // Если URL уже полный (начинается с http), используем как есть, иначе добавляем BASE_URL
        const videoSrc = element.props.videoSrc.startsWith('http') 
          ? element.props.videoSrc 
          : `${BASE_URL}${element.props.videoSrc.startsWith('/') ? '' : '/'}${element.props.videoSrc}`;
        return (
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-full flex justify-center">
              <video
                src={videoSrc}
                controls={element.props.controls !== false}
                autoPlay={element.props.autoplay || false}
                loop={element.props.loop || false}
                muted={element.props.muted || false}
                width={element.props.videoWidth || 800}
                height={element.props.videoHeight || 450}
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                Ваш браузер не поддерживает видео.
              </video>
            </div>
            {element.props.videoTitle && (
              <p className="text-sm text-gray-500 mt-2 text-center">{element.props.videoTitle}</p>
            )}
          </div>
        );
      case 'page-link': {
        const linkText = element.content || element.props?.linkText;
        if (!linkText) return null;

        // Внешняя ссылка
        if (element.props?.isExternal && element.props.externalUrl) {
          return (
            <div className="mb-6">
              <a
                href={element.props.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-2"
              >
                {linkText}
              </a>
            </div>
          );
        }

        // Внутренняя страница
        const pageTitle = element.props?.pageTitle || '';
        const pageSlug =
          element.props?.pageSlug ||
          (pageTitle
            ? pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : '');
        if (!pageSlug) return null;
        return (
          <div className="mb-6">
            <a
              href={`/page/${pageSlug}`}
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-2"
            >
              {linkText}
            </a>
          </div>
        );
      }
      case 'form':
        return (
          <div className="my-6">
            <DynamicForm fields={element.props?.formConfig?.fields || []} />
          </div>
        );
      case 'map': {
        const lat = Number(element.props?.latitude) || 53.9023;
        const lng = Number(element.props?.longitude) || 27.5619;
        const zoom = Number(element.props?.zoom) || 13;
        const ll = `${lng.toFixed(6)},${lat.toFixed(6)}`;
        const pt = `${lng.toFixed(6)},${lat.toFixed(6)},pm2rdm`;
        const src = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(pt)}`;
        const height = Number(element.props?.mapHeight) || 400;
        return (
          <div className="mb-6">
            <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                title="Карта"
                src={src}
                style={{ border: 0, width: '100%', height }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {element.props?.mapLabel && (
              <p className="text-sm text-gray-500 mt-2 text-center break-words">
                {element.props.mapLabel}
              </p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
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
                {(() => {
                  // Пытаемся распарсить контент как JSON (конструктор контента)
                  let contentElements: ContentElement[] | null = null;
                  if (translatedContent) {
                    try {
                      const parsed = JSON.parse(translatedContent);
                      if (Array.isArray(parsed)) {
                        contentElements = parsed;
                      }
                    } catch {
                      // Если не JSON, значит это старый формат (HTML/текст)
                    }
                  }
                  
                  if (contentElements && contentElements.length > 0) {
                    // Проверяем, есть ли приватные блоки
                    const hasPrivateContent = contentElements.some((element: any) => {
                      const isPrivate = element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
                      return isPrivate;
                    });

                    // Рендерим контент из конструктора
                    return (
                      <div className="text-gray-700 leading-relaxed">
                        {/* Если есть приватный контент и пользователь не авторизован, показываем одну форму логина */}
                        {hasPrivateContent && !isAuthenticated ? (
                          <>
                            {/* Показываем публичный контент */}
                            {contentElements
                              .filter((element: any) => isVisibleBySchedule(element, new Date(), isAdminPreview))
                              .map((element: any, index: number) => {
                              const isPrivate = element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
                              if (!isPrivate) {
                                return (
                                  <div key={element.id || index}>
                                    {renderContentElement(element)}
                                    {renderScheduleBadge(element, isAdminPreview)}
                                  </div>
                                );
                              }
                              return null;
                            })}
                            
                            {/* Показываем одну форму логина для всех приватных блоков */}
                            <div className="mb-4 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3 text-gray-800 mb-4">
                                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="font-medium text-lg">Доступ ограничен</p>
                                  <p className="text-sm text-gray-600">
                                    Этот контент доступен только авторизованным пользователям. Пожалуйста, войдите в систему для просмотра.
                                  </p>
                                </div>
                              </div>
                              
                              <form onSubmit={async (e: React.FormEvent) => {
                                e.preventDefault();
                                try {
                                  const result = await login({ email: loginEmail, password: loginPassword }).unwrap();
                                  if (result.token) {
                                    dispatch(setCredentials({
                                      user: result.user,
                                      token: result.token,
                                      mustChangePassword: (result as any).mustChangePassword || false
                                    }));
                                    toast.success(`Добро пожаловать, ${result.user.email}! 🎉`);
                                    setLoginEmail('');
                                    setLoginPassword('');
                                  }
                                } catch (err: any) {
                                  toast.error(err.data?.error || 'Ошибка входа');
                                }
                              }} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="login-email" className="text-gray-700">
                                    Email
                                  </Label>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                      id="login-email"
                                      type="email"
                                      placeholder="Введите email"
                                      value={loginEmail}
                                      onChange={(e) => setLoginEmail(e.target.value)}
                                      required
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="login-password" className="text-gray-700">
                                    Пароль
                                  </Label>
                                  <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                      id="login-password"
                                      type="password"
                                      placeholder="Введите пароль"
                                      value={loginPassword}
                                      onChange={(e) => setLoginPassword(e.target.value)}
                                      required
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                <Button
                                  type="submit"
                                  className="w-full bg-[#213659] hover:bg-[#1a2a4a] text-white"
                                  disabled={isLoggingIn}
                                >
                                  {isLoggingIn ? 'Вход...' : 'Войти'}
                                </Button>
                              </form>
                            </div>
                          </>
                        ) : (
                          // Если пользователь авторизован или нет приватного контента,
                          // показываем только те блоки, которые он имеет право видеть
                          contentElements
                            .filter((element: any) => isVisibleBySchedule(element, new Date(), isAdminPreview))
                            .map((element, index) => {
                              if (!canViewElement(element)) return null;
                              return (
                                <div key={element.id || index}>
                                  {renderContentElement(element)}
                                  {renderScheduleBadge(element, isAdminPreview)}
                                </div>
                              );
                            })
                        )}
                      </div>
                    );
                  } else {
                    // Рендерим старый формат (HTML/текст)
                    return (
                      <div
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap overflow-x-auto break-words [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_td]:align-top"
                        dangerouslySetInnerHTML={{ __html: translatedContent || t('no_data') }}
                      />
                    );
                  }
                })()}
              </div>

              {/* Дополнительная информация */}
              <footer className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {/*  <span>{t('published_by_admin')}</span>*/}
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
