import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Building2, Settings, FileText, Plane, MessageSquare, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import MultilingualContentEditor from './admin/MultilingualContentEditor';
import ServiceRequestForm from './ServiceRequestForm';
import ELTRegistrationForm from './ELTRegistrationForm';
import ELTDeregistrationForm from './ELTDeregistrationForm';

// Импорты для API запросов
import { useGetAboutCompanyPageContentByPageTypeQuery, useUpdateAboutCompanyPageContentByPageTypeMutation, useCreateAboutCompanyPageContentMutation } from '@/app/services/aboutCompanyPageContentApi';
import { useGetAeronauticalInfoPageContentByPageTypeQuery, useUpdateAeronauticalInfoPageContentByPageTypeMutation, useCreateAeronauticalInfoPageContentMutation } from '@/app/services/aeronauticalInfoPageContentApi';
import { useGetAppealsPageContentByPageTypeQuery, useUpdateAppealsPageContentByPageTypeMutation, useCreateAppealsPageContentMutation } from '@/app/services/appealsPageContentApi';
import { useGetServicesPageContentQuery, useUpdateServicesPageContentMutation, useCreateServicesPageContentMutation } from '@/app/services/servicesPageContentApi';
import { useGetAllServicesCategoriesQuery } from '@/app/services/servicesCategoryApi';
import { useGetAllAboutCompanyCategoriesQuery } from '@/app/services/aboutCompanyCategoryApi';
import { useGetELTDocumentQuery, useUploadELTDocumentMutation, useDeleteELTDocumentMutation, useGetELTInstructionQuery, useUploadELTInstructionMutation, useDeleteELTInstructionMutation } from '@/app/services/eltDocumentApi';
import { BASE_URL } from '@/constants';
import SocialWorkPage from './SocialWorkPage';
import VoluntaryReportForm from './VoluntaryReportForm';
import ConsumerQuestionnaireForm from './ConsumerQuestionnaireForm';
import { getRolePermissions } from '@/utils/roleUtils';
import type { TableCellContent } from '@/types/branch';
import { useLoginMutation } from '@/app/services/userApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/user/userSlice';
import type { AppDispatch } from '@/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

interface DynamicPageProps {
  pageType: 'about' | 'aeronautical' | 'appeals' | 'social' | 'services';
}

export default function DynamicPage({ pageType }: DynamicPageProps) {
  const { pageType: urlPageType } = useParams<{ pageType: string }>();
  const { language, t } = useLanguage();
  
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
  
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const permissions = getRolePermissions(roleName);
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
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
  const [showELTForm, setShowELTForm] = useState(false);
  const [showELTDeregistrationForm, setShowELTDeregistrationForm] = useState(false);
  
  // Состояния для русского языка
  const [editableTitleRu, setEditableTitleRu] = useState('');
  const [editableSubtitleRu, setEditableSubtitleRu] = useState('');
  const [editableContentRu, setEditableContentRu] = useState<any[]>([]);
  
  // Состояния для английского языка
  const [editableTitleEn, setEditableTitleEn] = useState('');
  const [editableSubtitleEn, setEditableSubtitleEn] = useState('');
  const [editableContentEn, setEditableContentEn] = useState<any[]>([]);
  
  // Состояния для белорусского языка
  const [editableTitleBe, setEditableTitleBe] = useState('');
  const [editableSubtitleBe, setEditableSubtitleBe] = useState('');
  const [editableContentBe, setEditableContentBe] = useState<any[]>([]);

  // Вызываем все хуки на верхнем уровне (правило React Hooks)
  // Используем skip для условных запросов
  const aboutPageContentQuery = useGetAboutCompanyPageContentByPageTypeQuery(urlPageType || '', {
    skip: pageType !== 'about' || !urlPageType
  });
  const aeronauticalPageContentQuery = useGetAeronauticalInfoPageContentByPageTypeQuery(urlPageType || '', {
    skip: pageType !== 'aeronautical' || !urlPageType
  });
  const appealsPageContentQuery = useGetAppealsPageContentByPageTypeQuery(urlPageType || '', {
    skip: pageType !== 'appeals' || !urlPageType
  });
  const servicesPageContentQuery = useGetServicesPageContentQuery(urlPageType || '', {
    skip: pageType !== 'services' || !urlPageType
  });

  // Мутации всегда доступны
  const [updateAboutPageContent] = useUpdateAboutCompanyPageContentByPageTypeMutation();
  const [createAboutPageContent] = useCreateAboutCompanyPageContentMutation();
  const [updateAeronauticalPageContent] = useUpdateAeronauticalInfoPageContentByPageTypeMutation();
  const [createAeronauticalPageContent] = useCreateAeronauticalInfoPageContentMutation();
  const [updateAppealsPageContent] = useUpdateAppealsPageContentByPageTypeMutation();
  const [createAppealsPageContent] = useCreateAppealsPageContentMutation();
  const [updateServicesPageContent] = useUpdateServicesPageContentMutation();
  const [createServicesPageContent] = useCreateServicesPageContentMutation();

  // Получаем категории услуг (всегда вызываем хук, но используем skip)
  const servicesCategoriesQuery = useGetAllServicesCategoriesQuery(undefined, {
    skip: pageType !== 'services'
  });
  const servicesCategories = servicesCategoriesQuery?.data || [];

  // Получаем категории "О предприятии" (всегда вызываем хук, но используем skip)
  const aboutCompanyCategoriesQuery = useGetAllAboutCompanyCategoriesQuery(undefined, {
    skip: pageType !== 'about'
  });
  const aboutCompanyCategories = (aboutCompanyCategoriesQuery?.data || []) as any[];
  
  // Отладочная информация для категорий (только при ошибках)
  useEffect(() => {
    if (pageType === 'about' && aboutCompanyCategoriesQuery?.isError) {
      console.error('About Company Categories Error:', {
        error: aboutCompanyCategoriesQuery?.error,
        urlPageType
      });
    }
  }, [pageType, aboutCompanyCategoriesQuery?.isError, aboutCompanyCategoriesQuery?.error, urlPageType]);

  // Определяем какой API использовать в зависимости от типа страницы
  let pageContentQuery, updatePageContentMutation, createPageContentMutation, defaultTitle, defaultSubtitle, icon;

  switch (pageType) {
    case 'about':
      pageContentQuery = aboutPageContentQuery;
      updatePageContentMutation = updateAboutPageContent;
      createPageContentMutation = createAboutPageContent;
      defaultTitle = t('about_company');
      defaultSubtitle = t('about_company_default_subtitle');
      icon = Building2;
      break;
    case 'aeronautical':
      pageContentQuery = aeronauticalPageContentQuery;
      updatePageContentMutation = updateAeronauticalPageContent;
      createPageContentMutation = createAeronauticalPageContent;
      defaultTitle = t('aeronautical_information');
      defaultSubtitle = t('aeronautical_information_subtitle');
      icon = Plane;
      break;
    case 'appeals':
      pageContentQuery = appealsPageContentQuery;
      updatePageContentMutation = updateAppealsPageContent;
      createPageContentMutation = createAppealsPageContent;
      defaultTitle = t('appeals');
      defaultSubtitle = t('appeals_subtitle');
      icon = MessageSquare;
      break;
    case 'services':
      pageContentQuery = servicesPageContentQuery;
      updatePageContentMutation = updateServicesPageContent;
      createPageContentMutation = createServicesPageContent;
      defaultTitle = t('services');
      defaultSubtitle = t('services_subtitle');
      icon = FileText;
      break;
    default:
      // Для неизвестных типов страниц создаем пустой объект запроса
      pageContentQuery = { 
        data: undefined, 
        refetch: () => Promise.resolve(), 
        isLoading: false, 
        error: null,
        isError: false,
        isSuccess: false,
        isFetching: false
      };
      updatePageContentMutation = [null, { isLoading: false }];
      createPageContentMutation = [null, { isLoading: false }];
      defaultTitle = t('page');
      defaultSubtitle = t('information');
      icon = FileText;
  }

  // Безопасно извлекаем данные из запроса
  // RTK Query всегда возвращает объект, даже когда skip: true
  const pageContent = (pageContentQuery && 'data' in pageContentQuery) 
    ? (pageContentQuery.data || null)
    : null;
  const refetchPageContent = (pageContentQuery && 'refetch' in pageContentQuery && typeof pageContentQuery.refetch === 'function')
    ? pageContentQuery.refetch
    : (() => Promise.resolve());
  
  // Безопасно извлекаем мутации
  const updatePageContent = Array.isArray(updatePageContentMutation) 
    ? updatePageContentMutation[0]
    : (typeof updatePageContentMutation === 'function' ? updatePageContentMutation : null);
  const mutationState = Array.isArray(updatePageContentMutation) 
    ? updatePageContentMutation[1]
    : { isLoading: false };
  const createPageContent = Array.isArray(createPageContentMutation) 
    ? createPageContentMutation[0]
    : (typeof createPageContentMutation === 'function' ? createPageContentMutation : null);
  const isUpdatingContent = (mutationState as any)?.isLoading || false;

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
  }, [editableContentRu, editableContentEn, editableContentBe]);

  // Получаем документ ELT, если это страница ELT
  const isELTPage = pageType === 'services' && urlPageType === 'elt-registration-services';
  const eltDocumentQuery = useGetELTDocumentQuery(undefined, {
    // Пропускаем запрос, если это не страница ELT
    skip: !isELTPage,
    // Не показываем ошибку, если документ не найден (404)
    refetchOnMountOrArgChange: false,
  });
  const eltDocument = eltDocumentQuery?.data;
  const [uploadELTDocument, { isLoading: isUploadingDocument }] = useUploadELTDocumentMutation();
  const [deleteELTDocument] = useDeleteELTDocumentMutation();
  
  // Получаем документ инструкции ELT
  const eltInstructionQuery = useGetELTInstructionQuery(undefined, {
    skip: !isELTPage,
    refetchOnMountOrArgChange: false,
  });
  const eltInstruction = eltInstructionQuery?.data;
  const [uploadELTInstruction, { isLoading: isUploadingInstruction }] = useUploadELTInstructionMutation();
  const [deleteELTInstruction] = useDeleteELTInstructionMutation();
  
  const canManageELTDocument = isAuthenticated && (roleName === 'SUPER_ADMIN' || roleName === 'SERVICES_ADMIN');

  // Приводим pageContent к общему типу
  // Если pageContentQuery был пропущен (skip: true), pageContent будет undefined
  const content = pageContent as any;
  
  // Проверяем, что запрос выполнен или пропущен корректно
  // Если запрос был пропущен (skip: true), pageContentQuery может быть undefined
  // RTK Query всегда возвращает объект, даже когда skip: true
  // Логируем ошибки только если это не 502 (Bad Gateway) - это означает, что сервер недоступен
  if (pageContentQuery && 'isError' in pageContentQuery && pageContentQuery.isError && !pageContentQuery.isLoading) {
    const errorStatus = (pageContentQuery.error as any)?.status;
    // Не логируем 502 ошибки постоянно, чтобы не засорять консоль
    if (errorStatus !== 502) {
      console.error('Error loading page content:', {
        error: pageContentQuery.error,
        errorStatus,
        errorMessage: (pageContentQuery.error as any)?.data?.error || (pageContentQuery.error as any)?.message,
        pageType,
        urlPageType
      });
    }
  }
  
  // Находим категорию услуги по pageType для получения названия
  const serviceCategory = pageType === 'services' && urlPageType
    ? (servicesCategories as any[]).find((cat: any) => cat.pageType === urlPageType)
    : null;
  
  // Находим категорию "О предприятии" по pageType для получения названия
  // Используем useMemo для мемоизации, чтобы пересчитывать при изменении категорий или urlPageType
  const aboutCompanyCategory = useMemo(() => {
    if (pageType === 'about' && urlPageType && aboutCompanyCategories.length > 0) {
      const found = aboutCompanyCategories.find((cat: any) => cat.pageType === urlPageType);
      return found || null;
    }
    return null;
  }, [pageType, urlPageType, aboutCompanyCategories]);
  
  // Определяем заголовок: приоритет - название категории, затем заголовок из контента, затем дефолтный
  const pageTitle = useMemo(() => {
    // Для "О предприятии" - всегда используем название категории, если доступно
    if (pageType === 'about' && aboutCompanyCategory) {
      const categoryName = getTranslatedField(aboutCompanyCategory, 'name', language);
      // getTranslatedField уже возвращает правильное значение (перевод или базовое)
      // Проверяем, что значение не пустое и не null/undefined
      if (categoryName != null && String(categoryName).trim() !== '') {
        return String(categoryName);
      }
      // Если перевод пустой, используем базовое значение
      if (aboutCompanyCategory.name != null && String(aboutCompanyCategory.name).trim() !== '') {
        return String(aboutCompanyCategory.name);
      }
    }
    
    // Для услуг - используем название категории, если доступно
    if (pageType === 'services' && serviceCategory) {
      const categoryName = getTranslatedField(serviceCategory, 'name', language);
      if (categoryName) {
        return categoryName;
      }
      if (serviceCategory.name) {
        return serviceCategory.name;
      }
    }
    
    // Если категории нет или для других типов страниц, используем заголовок из контента или дефолтный
    if (content) {
      const contentTitle = getTranslatedField(content, 'title', language);
      if (contentTitle) {
        return contentTitle;
      }
    }
    return defaultTitle || t('page');
  }, [pageType, urlPageType, aboutCompanyCategory, serviceCategory, content, language, defaultTitle, t, aboutCompanyCategories]);
  
  // Функция для получения подзаголовка: приоритет - описание категории, затем подзаголовок из контента, затем дефолтный
  const pageSubtitle = useMemo(() => {
    // Для "О предприятии" - используем описание категории, если доступно
    if (pageType === 'about' && aboutCompanyCategory) {
      const categoryDescription = getTranslatedField(aboutCompanyCategory, 'description', language);
      // getTranslatedField уже возвращает правильное значение (перевод или базовое)
      // Проверяем, что значение не пустое и не null/undefined
      if (categoryDescription != null && String(categoryDescription).trim() !== '') {
        return String(categoryDescription);
      }
      // Если перевод пустой, используем базовое значение
      if (aboutCompanyCategory.description != null && String(aboutCompanyCategory.description).trim() !== '') {
        return String(aboutCompanyCategory.description);
      }
    }
    
    // Для услуг - используем описание категории, если доступно
    if (pageType === 'services' && serviceCategory) {
      const categoryDescription = getTranslatedField(serviceCategory, 'description', language);
      if (categoryDescription) {
        return categoryDescription;
      }
      if (serviceCategory.description) {
        return serviceCategory.description;
      }
    }
    
    // Для остальных типов страниц используем стандартную логику
    if (content) {
      const contentSubtitle = getTranslatedField(content, 'subtitle', language);
      if (contentSubtitle) {
        return contentSubtitle;
      }
    }
    return defaultSubtitle || t('information');
  }, [pageType, urlPageType, aboutCompanyCategory, serviceCategory, content, language, defaultSubtitle, t, aboutCompanyCategories]);
  
  // Отладочная информация только при ошибках (не в production)
  useEffect(() => {
    if (import.meta.env.DEV && pageType === 'about' && aboutCompanyCategoriesQuery?.isError) {
      const errorStatus = (aboutCompanyCategoriesQuery.error as any)?.status;
      if (errorStatus !== 502) {
        console.error('DynamicPage about error:', {
          pageType,
          urlPageType,
          error: aboutCompanyCategoriesQuery.error,
          errorStatus
        });
      }
    }
  }, [pageType, urlPageType, aboutCompanyCategoriesQuery?.isError, aboutCompanyCategoriesQuery?.error]);

  const handleOpenContentEditor = () => {
    if (content) {
      // Загружаем данные для всех трех языков
      setEditableTitleRu(content.title || '');
      setEditableSubtitleRu(content.subtitle || '');
      setEditableContentRu(Array.isArray(content.content) ? content.content : []);
      
      setEditableTitleEn(content.titleEn || '');
      setEditableSubtitleEn(content.subtitleEn || '');
      setEditableContentEn(Array.isArray(content.contentEn) ? content.contentEn : []);
      
      setEditableTitleBe(content.titleBe || '');
      setEditableSubtitleBe(content.subtitleBe || '');
      setEditableContentBe(Array.isArray(content.contentBe) ? content.contentBe : []);
      
      // Если заголовки пустые, используем название категории
      if (!content.title && !content.titleEn && !content.titleBe) {
        if (pageType === 'services' && serviceCategory) {
          setEditableTitleRu(serviceCategory.name || '');
          setEditableTitleEn(serviceCategory.nameEn || '');
          setEditableTitleBe(serviceCategory.nameBe || '');
        } else if (pageType === 'about' && aboutCompanyCategory) {
          setEditableTitleRu(aboutCompanyCategory.name || '');
          setEditableTitleEn(aboutCompanyCategory.nameEn || '');
          setEditableTitleBe(aboutCompanyCategory.nameBe || '');
      } else {
          setEditableTitleRu(defaultTitle);
        }
      }
      
      if (!content.subtitle && !content.subtitleEn && !content.subtitleBe) {
        if (pageType === 'services' && serviceCategory) {
          setEditableSubtitleRu(serviceCategory.description || '');
          setEditableSubtitleEn(serviceCategory.descriptionEn || '');
          setEditableSubtitleBe(serviceCategory.descriptionBe || '');
        } else if (pageType === 'about' && aboutCompanyCategory) {
          setEditableSubtitleRu(aboutCompanyCategory.description || '');
          setEditableSubtitleEn(aboutCompanyCategory.descriptionEn || '');
          setEditableSubtitleBe(aboutCompanyCategory.descriptionBe || '');
        }
      }
    } else {
      // Если контент не создан, используем название категории
      if (pageType === 'services' && serviceCategory) {
        setEditableTitleRu(serviceCategory.name || '');
        setEditableTitleEn(serviceCategory.nameEn || '');
        setEditableTitleBe(serviceCategory.nameBe || '');
        setEditableSubtitleRu(serviceCategory.description || '');
        setEditableSubtitleEn(serviceCategory.descriptionEn || '');
        setEditableSubtitleBe(serviceCategory.descriptionBe || '');
      } else if (pageType === 'about' && aboutCompanyCategory) {
        setEditableTitleRu(aboutCompanyCategory.name || '');
        setEditableTitleEn(aboutCompanyCategory.nameEn || '');
        setEditableTitleBe(aboutCompanyCategory.nameBe || '');
        setEditableSubtitleRu(aboutCompanyCategory.description || '');
        setEditableSubtitleEn(aboutCompanyCategory.descriptionEn || '');
        setEditableSubtitleBe(aboutCompanyCategory.descriptionBe || '');
      } else {
        setEditableTitleRu(defaultTitle);
        setEditableTitleEn('');
        setEditableTitleBe('');
      }
      setEditableSubtitleRu('');
      setEditableSubtitleEn('');
      setEditableSubtitleBe('');
      setEditableContentRu([]);
      setEditableContentEn([]);
      setEditableContentBe([]);
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
        // Всегда сохраняем все три языка
        title: editableTitleRu,
        titleEn: editableTitleEn,
        titleBe: editableTitleBe,
        subtitle: editableSubtitleRu,
        subtitleEn: editableSubtitleEn,
        subtitleBe: editableSubtitleBe,
        content: editableContentRu,
        contentEn: editableContentEn,
        contentBe: editableContentBe,
      };

      if (typeof updatePageContent === 'function') {
        try {
          let result;
          if (pageType === 'aeronautical' || pageType === 'appeals') {
            // Для аэронавигационных страниц и обращений используем updateByPageType
            // pageType передается в URL, остальные данные в body
            // @ts-ignore
            result = await updatePageContent({ pageType: urlPageType || '', body: updateData });
          } else if (pageType === 'about') {
            // Для страниц о предприятии используем updateByPageType
            // pageType передается в URL, остальные данные в body
            // @ts-ignore
            result = await updatePageContent({ 
              pageType: urlPageType || '', 
              ...updateData
            });
          } else {
            // Для остальных страниц используем обычный update
            result = await updatePageContent(updateData);
          }
          
          if (result && 'unwrap' in result && typeof (result as any).unwrap === 'function') {
            await (result as any).unwrap();
          }
        } catch (error: any) {
          const status = error?.status || error?.data?.statusCode;
        if ((pageType === 'services' || pageType === 'about' || pageType === 'aeronautical' || pageType === 'appeals') && status === 404 && typeof createPageContent === 'function') {
          // Создаём запись и не падаем с ошибкой
          // Используем уже загруженные данные для всех языков
          await (createPageContent as any)({ 
            pageType: urlPageType, 
            ...updateData
          });
          } else {
            console.error('Error updating page content:', error);
            throw error;
          }
        }
      } else {
        console.warn('Update function not available for this page type');
      }
      toast.success(t('content_updated_successfully'));
      
      // Принудительно обновляем данные
      if (refetchPageContent && typeof refetchPageContent === 'function') {
      await refetchPageContent();
      }
      
      setIsContentEditorOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при сохранении контента');
    }
  };

  // Функция для рендеринга содержимого ячейки таблицы
  const renderTableCell = (cell: TableCellContent | string) => {
    // Поддержка старого формата (строка) для обратной совместимости
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
            {items.map((item: string, idx: number) => {
              // Если это страница ELT, проверяем элементы списка по ключевым словам на всех языках
              if (pageType === 'services' && urlPageType === 'elt-registration-services') {
                // Проверяем на всех языках: русский, английский, белорусский
                const isRegistrationForm = 
                  item.includes('ЗАЯВЛЕНИЕ о регистрации') || 
                  item.includes('APPLICATION for registration') ||
                  item.includes('ЗАЯЎЛЕННЕ пра рэгістрацыю');
                
                const isDeregistrationForm = 
                  item.includes('ЗАЯВЛЕНИЕ о снятии с регистрации') || 
                  item.includes('APPLICATION for deregistration') ||
                  item.includes('ЗАЯЎЛЕННЕ пра зняцце з рэгістрацыі');
                
                const isContract = 
                  item.includes('ДОГОВОР') || 
                  item.includes('CONTRACT') ||
                  item.includes('ДОГАВОР');
                
                const isInstruction = 
                  item.includes('ИНСТРУКЦИЯ') || 
                  item.includes('INSTRUCTIONS') ||
                  item.includes('ІНСТРУКЦЫЯ');
                
                if (isRegistrationForm) {
                  return (
                    <li key={idx} className="text-gray-700 break-words">
                      <button
                        onClick={() => setShowELTForm(true)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {item}
                      </button>
                    </li>
                  );
                }
                if (isDeregistrationForm) {
                  return (
                    <li key={idx} className="text-gray-700 break-words">
                      <button
                        onClick={() => setShowELTDeregistrationForm(true)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {item}
                      </button>
                    </li>
                  );
                }
                // Если это "ДОГОВОР", делаем его кликабельным для открытия документа
                if (isContract) {
                  const handleContractClick = () => {
                    if (eltDocument?.documentUrl) {
                      window.open(`${BASE_URL}${eltDocument.documentUrl}`, '_blank');
                    } else {
                      toast.error(t('document_not_found'));
                    }
                  };
                  return (
                    <li key={idx} className="text-gray-700 break-words">
                      <button
                        onClick={handleContractClick}
                        className="text-blue-600 hover:underline cursor-pointer"
                        disabled={!eltDocument?.documentUrl}
                      >
                        {item}
                      </button>
                    </li>
                  );
                }
                // Если это "ИНСТРУКЦИЯ", делаем его кликабельным для открытия документа
                if (isInstruction) {
                  const handleInstructionClick = () => {
                    if (eltInstruction?.instructionUrl) {
                      window.open(`${BASE_URL}${eltInstruction.instructionUrl}`, '_blank');
                    } else {
                      toast.error(t('instruction_document_not_found'));
                    }
                  };
                  return (
                    <li key={idx} className="text-gray-700 break-words">
                      <button
                        onClick={handleInstructionClick}
                        className="text-blue-600 hover:underline cursor-pointer"
                        disabled={!eltInstruction?.instructionUrl}
                      >
                        {item}
                      </button>
                    </li>
                  );
                }
              }
              return (
              <li key={idx} className="text-gray-700 break-words">{item}</li>
              );
            })}
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

  const IconComponent = icon;

  // Если открыта форма ELT, показываем её (после всех хуков)
  if (showELTForm && pageType === 'services' && urlPageType === 'elt-registration-services') {
    return <ELTRegistrationForm />;
  }

  if (showELTDeregistrationForm && pageType === 'services' && urlPageType === 'elt-registration-services') {
    return <ELTDeregistrationForm />;
  }

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
                {pageTitle}
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
              {pageSubtitle}
            </p>
          </div>

          {/* Дополнительный контент */}
          {(() => {
            const translatedContent = getTranslatedField(content, 'content', language);
            const hasContent = translatedContent && Array.isArray(translatedContent) && translatedContent.length > 0;
            // Отладочное логирование (раскомментируйте при необходимости)
            // if (pageType === 'aeronautical' || pageType === 'appeals') {
            //   console.log('Content rendering check:', { pageType, urlPageType, hasContent, language });
            // }
            return hasContent ? (
            <div className="w-full mb-12">
              <div className="py-8">
                {(() => {
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
            ) : null;
          })()}

          {/* Заглушка контента, если нет динамического контента */}
          {(() => {
            const translatedContent = getTranslatedField(content, 'content', language);
            const hasContent = translatedContent && Array.isArray(translatedContent) && translatedContent.length > 0;
            return !hasContent ? (
            <div className="w-full">
              <div className="bg-blue-50 py-12 text-center rounded-lg">
                <IconComponent className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{pageTitle}</h3>
                <p className="text-gray-500 mb-6">
                  {pageSubtitle}
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
            ) : null;
          })()}
        </div>
      </div>

      {/* Редактор контента страницы */}
      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white min-w-0 dialog-content">
          <DialogHeader>
            <DialogTitle>{t('manage_content')}</DialogTitle>
            <DialogDescription>
              {t('edit_page_content_description') || 'Редактируйте заголовок, подзаголовок и основной контент страницы на трех языках.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <MultilingualContentEditor
              titleRu={editableTitleRu}
              subtitleRu={editableSubtitleRu}
              contentRu={editableContentRu}
              titleEn={editableTitleEn}
              subtitleEn={editableSubtitleEn}
              contentEn={editableContentEn}
              titleBe={editableTitleBe}
              subtitleBe={editableSubtitleBe}
              contentBe={editableContentBe}
              onTitleRuChange={setEditableTitleRu}
              onSubtitleRuChange={setEditableSubtitleRu}
              onContentRuChange={setEditableContentRu}
              onTitleEnChange={setEditableTitleEn}
              onSubtitleEnChange={setEditableSubtitleEn}
              onContentEnChange={setEditableContentEn}
              onTitleBeChange={setEditableTitleBe}
              onSubtitleBeChange={setEditableSubtitleBe}
              onContentBeChange={setEditableContentBe}
              titlePlaceholder={defaultTitle}
              subtitlePlaceholder={t('subtitle_placeholder') || 'Краткое описание...'}
            />
            {/* Управление документом ELT (только для страницы ELT и админов) */}
            {isELTPage && canManageELTDocument && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium mb-4">Документ договора ELT</label>
                <div className="space-y-4">
                  {eltDocument?.documentUrl ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
            <div>
                          <p className="text-sm font-medium text-gray-900">{eltDocument.documentName}</p>
                          <a
                            href={`${BASE_URL}${eltDocument.documentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Открыть документ
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          try {
                            await deleteELTDocument().unwrap();
                            toast.success('Документ удален');
                            eltDocumentQuery?.refetch();
                          } catch (error: any) {
                            toast.error(error?.data?.error || 'Ошибка при удалении документа');
                          }
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">Документ не загружен</p>
                  )}
                  <div>
              <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Проверка типа файла
                        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Разрешены только PDF и DOC/DOCX файлы');
                          return;
                        }
                        
                        // Проверка размера (20MB)
                        if (file.size > 20 * 1024 * 1024) {
                          toast.error('Размер файла не должен превышать 20MB');
                          return;
                        }
                        
                        try {
                          // Проверяем, что пользователь авторизован
                          const token = localStorage.getItem('token');
                          if (!token) {
                            toast.error('Необходима авторизация для загрузки документа');
                            return;
                          }

                          const formData = new FormData();
                          formData.append('document', file);
                          
                          await uploadELTDocument(formData).unwrap();
                          toast.success('Документ успешно загружен');
                          eltDocumentQuery?.refetch();
                          e.target.value = ''; // Очищаем input
                        } catch (error: any) {
                          console.error('Upload error:', error);
                          if (error?.status === 401 || error?.status === 'FETCH_ERROR') {
                            toast.error('Ошибка авторизации. Пожалуйста, войдите в систему заново');
                          } else {
                            toast.error(error?.data?.error || error?.data?.message || 'Ошибка при загрузке документа');
                          }
                        }
                      }}
                      className="hidden"
                      id="elt-document-upload"
                      disabled={isUploadingDocument}
                    />
                    <label
                      htmlFor="elt-document-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingDocument ? 'Загрузка...' : eltDocument?.documentUrl ? 'Заменить документ' : 'Загрузить документ'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Разрешены файлы PDF, DOC, DOCX (макс. 20MB)</p>
            </div>
                </div>
              </div>
            )}
            {/* Управление документом инструкции ELT (только для страницы ELT и админов) */}
            {isELTPage && canManageELTDocument && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium mb-4">Документ инструкции ELT</label>
                <div className="space-y-4">
                  {eltInstruction?.instructionUrl ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
            <div>
                          <p className="text-sm font-medium text-gray-900">{eltInstruction.instructionName}</p>
                          <a
                            href={`${BASE_URL}${eltInstruction.instructionUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Открыть документ
                          </a>
            </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          try {
                            await deleteELTInstruction().unwrap();
                            toast.success('Документ инструкции удален');
                            eltInstructionQuery?.refetch();
                          } catch (error: any) {
                            toast.error(error?.data?.error || 'Ошибка при удалении документа инструкции');
                          }
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">Документ инструкции не загружен</p>
                  )}
            <div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Проверка типа файла
                        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Разрешены только PDF и DOC/DOCX файлы');
                          return;
                        }
                        
                        // Проверка размера (20MB)
                        if (file.size > 20 * 1024 * 1024) {
                          toast.error('Размер файла не должен превышать 20MB');
                          return;
                        }
                        
                        try {
                          // Проверяем, что пользователь авторизован
                          const token = localStorage.getItem('token');
                          if (!token) {
                            toast.error('Необходима авторизация для загрузки документа');
                            return;
                          }

                          const formData = new FormData();
                          formData.append('instruction', file);
                          
                          await uploadELTInstruction(formData).unwrap();
                          toast.success('Документ инструкции успешно загружен');
                          eltInstructionQuery?.refetch();
                          e.target.value = ''; // Очищаем input
                        } catch (error: any) {
                          console.error('Upload error:', error);
                          if (error?.status === 401 || error?.status === 'FETCH_ERROR') {
                            toast.error('Ошибка авторизации. Пожалуйста, войдите в систему заново');
                          } else {
                            toast.error(error?.data?.error || error?.data?.message || 'Ошибка при загрузке документа инструкции');
                          }
                        }
                      }}
                      className="hidden"
                      id="elt-instruction-upload"
                      disabled={isUploadingInstruction}
                    />
                    <label
                      htmlFor="elt-instruction-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingInstruction ? 'Загрузка...' : eltInstruction?.instructionUrl ? 'Заменить документ инструкции' : 'Загрузить документ инструкции'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Разрешены файлы PDF, DOC, DOCX (макс. 20MB)</p>
            </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsContentEditorOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSaveContent} disabled={isUpdatingContent}>
                {isUpdatingContent ? t('saving') : t('save_changes')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подачи заявки на услугу */}
      {pageType === 'services' && (
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-white">
              <DialogTitle>
                {language === 'en' ? 'Service Request' : language === 'be' ? 'Заяўка на паслугу' : 'Заявка на услугу'}
              </DialogTitle>
            </DialogHeader>
            <ServiceRequestForm
              serviceType={urlPageType || ''}
              serviceName={pageTitle}
              onClose={() => setIsRequestDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
