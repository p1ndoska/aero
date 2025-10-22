import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Building2, Settings, FileText, Plane, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import ContentConstructor from './admin/ContentConstructor';
import ServiceRequestForm from './ServiceRequestForm';

// Импорты для API запросов
import { useGetAboutCompanyPageContentByPageTypeQuery, useUpdateAboutCompanyPageContentByPageTypeMutation, useCreateAboutCompanyPageContentMutation } from '@/app/services/aboutCompanyPageContentApi';
import { useGetAeronauticalInfoPageContentByPageTypeQuery, useUpdateAeronauticalInfoPageContentByPageTypeMutation, useCreateAeronauticalInfoPageContentMutation } from '@/app/services/aeronauticalInfoPageContentApi';
import { useGetAppealsPageContentByPageTypeQuery, useUpdateAppealsPageContentByPageTypeMutation, useCreateAppealsPageContentMutation } from '@/app/services/appealsPageContentApi';
import { useGetServicesPageContentQuery, useUpdateServicesPageContentMutation, useCreateServicesPageContentMutation } from '@/app/services/servicesPageContentApi';
import SocialWorkPage from './SocialWorkPage';
import VoluntaryReportForm from './VoluntaryReportForm';
import ConsumerQuestionnaireForm from './ConsumerQuestionnaireForm';
import { getRolePermissions } from '@/utils/roleUtils';

interface DynamicPageProps {
  pageType: 'about' | 'aeronautical' | 'appeals' | 'social' | 'services';
}

export default function DynamicPage({ pageType }: DynamicPageProps) {
  const { pageType: urlPageType } = useParams<{ pageType: string }>();
  
  // Для социальных страниц используем специальный компонент
  if (pageType === 'social') {
    return <SocialWorkPage pageType={urlPageType || ''} />;
  }
  
  // Для страницы добровольного сообщения используем специальную форму
  if (pageType === 'appeals' && urlPageType === 'voluntary-report') {
    return <VoluntaryReportForm />;
  }
  
  // Для анкеты потребителя аэронавигационных услуг используем специальную форму
  if (pageType === 'appeals' && (urlPageType === 'consumer-questionnaire' || urlPageType === 'customer-questionnaire')) {
    return <ConsumerQuestionnaireForm />;
  }
  
  const { language } = useLanguage();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const permissions = getRolePermissions(roleName);
  
  // Проверяем доступ в зависимости от типа страницы
  const isAdmin = (() => {
    switch (pageType) {
      case 'about':
        return permissions.canManageAbout;
      case 'aeronautical':
        return permissions.canManageAirNav;
      case 'appeals':
        return permissions.canManageAppeals;
      case 'services':
        return permissions.canManageServices;
      default:
        return false;
    }
  })();

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

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

  // Определяем какой API использовать в зависимости от типа страницы
  let pageContentQuery, updatePageContentMutation, defaultTitle, defaultSubtitle, icon, createPageContentMutation;

  switch (pageType) {
    case 'about':
      pageContentQuery = useGetAboutCompanyPageContentByPageTypeQuery(urlPageType || '');
      updatePageContentMutation = useUpdateAboutCompanyPageContentByPageTypeMutation();
      createPageContentMutation = useCreateAboutCompanyPageContentMutation();
      defaultTitle = 'О предприятии';
      defaultSubtitle = 'Информация о нашем предприятии, его структуре, целях и принципах работы в сфере аэронавигационного обслуживания воздушного движения.';
      icon = Building2;
      break;
    case 'aeronautical':
      pageContentQuery = useGetAeronauticalInfoPageContentByPageTypeQuery(urlPageType || '');
      updatePageContentMutation = useUpdateAeronauticalInfoPageContentByPageTypeMutation();
      createPageContentMutation = useCreateAeronauticalInfoPageContentMutation();
      defaultTitle = 'Аэронавигационная информация';
      defaultSubtitle = 'Информация о правилах и процедурах аэронавигационного обслуживания воздушного движения.';
      icon = Plane;
      break;
    case 'appeals':
      pageContentQuery = useGetAppealsPageContentByPageTypeQuery(urlPageType || '');
      updatePageContentMutation = useUpdateAppealsPageContentByPageTypeMutation();
      createPageContentMutation = useCreateAppealsPageContentMutation();
      defaultTitle = 'Обращения';
      defaultSubtitle = 'Информация о порядке подачи и рассмотрения обращений граждан и юридических лиц.';
      icon = MessageSquare;
      break;
    case 'services':
      pageContentQuery = useGetServicesPageContentQuery(urlPageType || '');
      updatePageContentMutation = useUpdateServicesPageContentMutation();
      createPageContentMutation = useCreateServicesPageContentMutation();
      defaultTitle = 'Услуги';
      defaultSubtitle = 'Информация об услугах предприятия.';
      icon = FileText;
      break;
    default:
      pageContentQuery = { data: null, refetch: () => {} };
      updatePageContentMutation = [null, { isLoading: false }];
      defaultTitle = 'Страница';
      defaultSubtitle = 'Информация';
      icon = FileText;
  }

  const { data: pageContent, refetch: refetchPageContent } = pageContentQuery;
  const [updatePageContent, mutationState] = updatePageContentMutation;
  const [createPageContent] = (createPageContentMutation as any) || [null];
  const isUpdatingContent = (mutationState as any)?.isLoading || false;

  // Приводим pageContent к общему типу
  const content = pageContent as any;
  
  // Отладочная информация
  console.log('DynamicPage content:', { pageType, urlPageType, content, pageContent });

  const handleOpenContentEditor = () => {
    if (content) {
      setEditableTitle(getTranslatedField(content, 'title', language) || defaultTitle);
      setEditableSubtitle(getTranslatedField(content, 'subtitle', language) || '');
      setEditableContent(getTranslatedField(content, 'content', language) || []);
    } else {
      setEditableTitle(defaultTitle);
      setEditableSubtitle('');
      setEditableContent([]);
    }
    setIsContentEditorOpen(true);
  };

  const handleRequestService = () => {
    setIsRequestDialogOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      const updateData: any = {
        pageType: urlPageType,
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

      if (typeof updatePageContent === 'function') {
        try {
          let result;
          if (pageType === 'aeronautical' || pageType === 'appeals') {
            // Для аэронавигационных страниц и обращений используем updateByPageType
            // @ts-ignore
            result = await updatePageContent({ pageType: urlPageType || '', body: { ...updateData, title: editableTitle } });
          } else if (pageType === 'about') {
            // Для страниц о предприятии используем updateByPageType с title
            // @ts-ignore
            result = await updatePageContent({ 
              pageType: urlPageType || '', 
              body: { ...updateData, title: editableTitle } 
            });
          } else {
            // Для остальных страниц используем обычный update
            result = await updatePageContent({ ...updateData, title: editableTitle });
          }
          
          if (result && 'unwrap' in result && typeof (result as any).unwrap === 'function') {
            await (result as any).unwrap();
          }
        } catch (error: any) {
          const status = error?.status || error?.data?.statusCode;
        if ((pageType === 'services' || pageType === 'about' || pageType === 'aeronautical' || pageType === 'appeals') && status === 404 && typeof createPageContent === 'function') {
          // Создаём запись и не падаем с ошибкой
          await (createPageContent as any)({ pageType: urlPageType, title: editableTitle, subtitle: editableSubtitle, content: editableContent });
          } else {
            console.error('Error updating page content:', error);
            throw error;
          }
        }
      } else {
        console.warn('Update function not available for this page type');
      }
      console.log('Content saved successfully, refetching...');
      toast.success('Контент страницы успешно обновлен');
      await refetchPageContent();
      setIsContentEditorOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при сохранении контента');
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
                    {row.cells.map((cell: string, cellIdx: number) => (
                      <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                        {cell}
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
      default:
        return null;
    }
  };

  const IconComponent = icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Белый закругленный контейнер на фоне */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <IconComponent className="w-10 h-10 text-blue-600" />
                {getTranslatedField(content, 'title', language) || defaultTitle}
              </h1>
              <div className="flex gap-2">
                {pageType === 'services' && (
                  <Button
                    onClick={handleRequestService}
                    variant="outline"
                    size="sm"
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white border-[#213659]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Request Service' : language === 'be' ? 'Запытаць паслугу' : 'Подать заявку'}
                  </Button>
                )}
                {isAuthenticated && isAdmin && (
                  <Button
                    onClick={handleOpenContentEditor}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Управление контентом
                  </Button>
                )}
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getTranslatedField(content, 'subtitle', language) || defaultSubtitle}
            </p>
          </div>

          {/* Дополнительный контент */}
          {content?.content && Array.isArray(content.content) && content.content.length > 0 && (
            <div className="w-full mb-12">
              <div className="py-8">
                {getTranslatedField(content, 'content', language).map((element: any) => {
                  // Проверяем, является ли блок приватным и авторизован ли пользователь
                  if (element.isPrivate && !isAuthenticated) {
                    return (
                      <div key={element.id} className="mb-4 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-3 text-amber-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium">Доступ ограничен</p>
                            <p className="text-sm text-amber-700">
                              {language === 'en' 
                                ? 'This content is available only to authorized users. Please log in to view.' 
                                : language === 'be' 
                                ? 'Гэты кантэнт даступны толькі аўтарызаваным карыстальнікам. Калі ласка, увайдзіце ў сістэму для прагляду.'
                                : 'Этот контент доступен только авторизованным пользователям. Пожалуйста, войдите в систему для просмотра.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={element.id}>
                      {renderContentElement(element)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Заглушка контента, если нет динамического контента */}
          {(!content?.content || content.content.length === 0) && (
            <div className="w-full">
              <div className="bg-blue-50 py-12 text-center rounded-lg">
                <IconComponent className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{defaultTitle}</h3>
                <p className="text-gray-500 mb-6">
                  {defaultSubtitle}
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
            <DialogTitle>Управление контентом страницы</DialogTitle>
            <DialogDescription>
              Редактируйте заголовок, подзаголовок и основной контент страницы.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок страницы</label>
              <input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder={defaultTitle}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder="Краткое описание..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
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

      {/* Диалог подачи заявки на услугу */}
      {pageType === 'services' && (
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Service Request' : language === 'be' ? 'Заяўка на паслугу' : 'Заявка на услугу'}
              </DialogTitle>
            </DialogHeader>
            <ServiceRequestForm
              serviceType={urlPageType || ''}
              serviceName={getTranslatedField(content, 'title', language) || defaultTitle}
              onClose={() => setIsRequestDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
