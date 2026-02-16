import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings, Users, Flag, Star, User, Heart, Wrench, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSocialWorkPageContentQuery, useUpdateSocialWorkPageContentMutation } from '@/app/services/socialWorkPageContentApi';
import { useGetAllSocialWorkCategoriesQuery } from '@/app/services/socialWorkCategoryApi';
import ContentConstructor from './admin/ContentConstructor';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import { getRolePermissions } from '@/utils/roleUtils';
import type { TableCellContent } from '@/types/branch';
import { BASE_URL } from '@/constants';
import { FileText, Mail, Lock } from 'lucide-react';
import { useLoginMutation } from '@/app/services/userApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/user/userSlice';
import type { AppDispatch } from '@/store';
import { Label } from '@/components/ui/label';

// Маппинг типов страниц на иконки и названия
const PAGE_CONFIG = {
  'trade-union': {
    icon: Users,
    title: 'Объединенная профсоюзная организация',
    defaultSubtitle: 'Информация о деятельности профсоюзной организации предприятия'
  },
  'belaya-rus': {
    icon: Flag,
    title: 'Белая Русь',
    defaultSubtitle: 'Деятельность общественного объединения "Белая Русь"'
  },
  'brsm': {
    icon: Star,
    title: 'БРСМ',
    defaultSubtitle: 'Молодежное движение Белорусского республиканского союза молодежи'
  },
  'women-union': {
    icon: User,
    title: 'Белорусский союз женщин',
    defaultSubtitle: 'Деятельность Белорусского союза женщин на предприятии'
  },
  'healthy-lifestyle': {
    icon: Heart,
    title: 'За здоровый образ жизни',
    defaultSubtitle: 'Программы и мероприятия по пропаганде здорового образа жизни'
  },
  'improvement-year': {
    icon: Wrench,
    title: 'Год благоустройства',
    defaultSubtitle: 'Мероприятия в рамках года благоустройства'
  },
  'memory': {
    icon: Flame,
    title: 'Память и боль белорусской земли',
    defaultSubtitle: 'Мероприятия по сохранению исторической памяти'
  }
};

interface SocialWorkPageProps {
  pageType: string;
}

export default function SocialWorkPage({ pageType }: SocialWorkPageProps) {
  const { language } = useLanguage();
  const { data: pageContent, refetch: refetchPageContent } = useGetSocialWorkPageContentQuery(pageType);
  const [updatePageContent, { isLoading: isUpdatingContent }] = useUpdateSocialWorkPageContentMutation();
  const { data: socialWorkCategories } = useGetAllSocialWorkCategoriesQuery();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const permissions = getRolePermissions(roleName);
  const isAdmin = permissions.canManageSocial;

  // Находим категорию социальной работы по pageType для получения названия
  const socialWorkCategory = socialWorkCategories && Array.isArray(socialWorkCategories)
    ? socialWorkCategories.find((cat: any) => cat.pageType === pageType)
    : null;
  
  // Отладочная информация (можно удалить после проверки)
  // console.log('SocialWorkPage debug:', {
  //   pageType,
  //   language,
  //   socialWorkCategories: socialWorkCategories?.length,
  //   socialWorkCategory,
  //   categoryName: socialWorkCategory ? getTranslatedField(socialWorkCategory, 'name', language) : null,
  //   pageContentTitle: pageContent ? getTranslatedField(pageContent, 'title', language) : null
  // });

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
  }, [editableContent]);

  const pageConfig = PAGE_CONFIG[pageType as keyof typeof PAGE_CONFIG];
  const IconComponent = pageConfig?.icon || Users;
  
  // Получаем переведенное название категории
  // Приоритет: название категории > заголовок из контента (если не дефолтный) > fallback
  const getPageTitle = () => {
    // Сначала проверяем категорию - это основной источник названия
    // Название категории всегда должно использоваться, если оно доступно
    if (socialWorkCategory) {
      const categoryName = getTranslatedField(socialWorkCategory, 'name', language);
      if (categoryName) {
        return categoryName;
      }
      // Если перевода нет, используем базовое название
      if (socialWorkCategory.name) {
        return socialWorkCategory.name;
      }
    }
    
    // Если категории нет, проверяем заголовок в контенте
    const contentTitle = getTranslatedField(pageContent, 'title', language);
    // Используем заголовок из контента только если он не является дефолтным
    const defaultTitles = ['Социальная работа', 'Social work', 'Сацыяльная праца'];
    if (contentTitle && !defaultTitles.includes(contentTitle)) {
      return contentTitle;
    }
    
    // Fallback на PAGE_CONFIG
    return pageConfig?.title || 'Социальная работа';
  };

  const getPageSubtitle = () => {
    // Сначала проверяем описание категории
    if (socialWorkCategory) {
      const categoryDescription = getTranslatedField(socialWorkCategory, 'description', language) || socialWorkCategory.description;
      if (categoryDescription) {
        return categoryDescription;
      }
    }
    
    // Если категории нет или нет описания, проверяем подзаголовок в контенте
    const contentSubtitle = getTranslatedField(pageContent, 'subtitle', language);
    if (contentSubtitle) {
      return contentSubtitle;
    }
    
    // Fallback на PAGE_CONFIG
    return pageConfig?.defaultSubtitle || '';
  };

  const pageTitle = getPageTitle();
  const pageSubtitle = getPageSubtitle();

  const handleOpenContentEditor = () => {
    if (pageContent) {
      setEditableTitle(getTranslatedField(pageContent, 'title', language) || pageTitle);
      setEditableSubtitle(getTranslatedField(pageContent, 'subtitle', language) || pageSubtitle);
      setEditableContent(getTranslatedField(pageContent, 'content', language) || []);
    } else {
      setEditableTitle(pageTitle);
      setEditableSubtitle(pageSubtitle);
      setEditableContent([]);
    }
    setIsContentEditorOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      const updateData: any = {
        title: editableTitle,
        subtitle: editableSubtitle,
        content: editableContent,
      };

      // Add multilingual fields if needed
      if (language === 'en') {
        updateData.titleEn = editableTitle;
        updateData.subtitleEn = editableSubtitle;
        updateData.contentEn = editableContent;
      } else if (language === 'be') {
        updateData.titleBe = editableTitle;
        updateData.subtitleBe = editableSubtitle;
        updateData.contentBe = editableContent;
      } else { // Default to Russian
        updateData.title = editableTitle;
        updateData.subtitle = editableSubtitle;
        updateData.content = editableContent;
      }

      await updatePageContent({ pageType, body: updateData }).unwrap();
      toast.success('Контент страницы успешно обновлен');
      refetchPageContent();
      setIsContentEditorOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при сохранении контента');
    }
  };

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
              src={cell.src} 
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
              href={cell.fileUrl}
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

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.props?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const HeadingComponent = HeadingTag;
        return (
          <HeadingComponent 
            className={`text-2xl font-bold text-gray-900 mb-4 break-words force-text-${element.props?.textAlign || 'left'}`}
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
          <ul className="list-disc list-inside mb-4 space-y-2">
            {items.map((item: string, idx: number) => (
              <li key={idx} className="text-gray-700 break-words">{item}</li>
            ))}
          </ul>
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
              src={element.props?.src} 
              alt={element.props?.alt || ''}
              className="max-w-full h-auto rounded-lg object-contain"
              style={{ maxWidth: '800px', maxHeight: '400px' }}
              onError={(e) => {
                console.error('Image failed to load in SocialWorkPage:', element.props?.src);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully in SocialWorkPage:', element.props?.src);
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
          <div className="mb-4 flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
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
                {element.props.fileType && `${element.props.fileType} • `}
                {element.props.fileSize && formatFileSize(element.props.fileSize)}
              </p>
            </div>
            <a
              href={element.props.fileUrl}
              download={element.props.fileName}
              className="flex-shrink-0 text-blue-600 hover:text-blue-800 text-sm font-medium"
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Белый закругленный контейнер на фоне */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <IconComponent className="w-12 h-12 text-blue-600" />
                {pageTitle}
              </h1>
              {isAuthenticated && isAdmin && (
                <Button
                  onClick={handleOpenContentEditor}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Управление контентом
                </Button>
              )}
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {pageSubtitle || 'Информация о социальной и идеологической работе на предприятии.'}
            </p>
          </div>

          {/* Дополнительный контент */}
          {pageContent?.content && Array.isArray(pageContent.content) && pageContent.content.length > 0 && (
            <div className="w-full mb-12">
              <div className="py-8">
                {(() => {
                  const translatedContent = getTranslatedField(pageContent, 'content', language);
                  // Проверяем, есть ли приватные блоки
                  const hasPrivateContent = translatedContent.some((element: any) => {
                    const isPrivate = element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
                    return isPrivate;
                  });

                  // Если есть приватный контент и пользователь не авторизован, показываем одну форму логина
                  if (hasPrivateContent && !isAuthenticated) {
                    const handleLoginSubmit = async (e: React.FormEvent) => {
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
                    };

                    return (
                      <>
                        {/* Показываем публичный контент */}
                        {translatedContent.map((element: any, index: number) => {
                          const isPrivate = element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
                          if (!isPrivate) {
                            return (
                              <div key={element.id || `content-${index}`}>
                                {renderContentElement(element)}
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
                                {language === 'en' 
                                  ? 'This content is available only to authorized users. Please log in to view.' 
                                  : language === 'be' 
                                  ? 'Гэты кантэнт даступны толькі аўтарызаваным карыстальнікам. Калі ласка, увайдзіце ў сістэму для прагляду.'
                                  : 'Этот контент доступен только авторизованным пользователям. Пожалуйста, войдите в систему для просмотра.'
                                }
                              </p>
                            </div>
                          </div>
                          
                          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
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
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    );
                  }
                  
                  // Если пользователь авторизован или нет приватного контента, показываем весь контент
                  return translatedContent.map((element: any, index: number) => {
                    const isPrivate = element.isPrivate === true || String(element.isPrivate) === 'true' || Number(element.isPrivate) === 1;
                    // Показываем приватный контент только авторизованным пользователям
                    if (isPrivate && !isAuthenticated) {
                      return null;
                    }
                    return (
                      <div key={element.id || `content-${index}`}>
                        {renderContentElement(element)}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Заглушка контента, если нет динамического контента */}
          {(!pageContent?.content || pageContent.content.length === 0) && (
            <div className="w-full">
              <div className="bg-blue-50 py-12 text-center rounded-lg">
                <div className="flex justify-center mb-4">
                  <IconComponent className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {pageTitle}
                </h3>
                <p className="text-gray-500 mb-6">
                  Здесь будет размещена информация о социальной и идеологической работе.
                </p>
                {isAuthenticated && isAdmin && (
                  <Button
                    onClick={handleOpenContentEditor}
                    variant="outline"
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Добавить контент
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Редактор контента страницы */}
      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white min-w-0 dialog-content">
          <DialogHeader>
            <DialogTitle>Управление контентом страницы социальной работы</DialogTitle>
            <DialogDescription>
              Редактируйте заголовок, подзаголовок и основной контент страницы.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок страницы</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder={pageTitle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder={pageSubtitle || 'Описание страницы...'}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Основной контент</label>
              <ContentConstructor
                content={editableContent}
                onChange={setEditableContent}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsContentEditorOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveContent} disabled={isUpdatingContent}>
                {isUpdatingContent ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
