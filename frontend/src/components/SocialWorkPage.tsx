import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings, Users, Flag, Star, User, Heart, Wrench, Bird } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSocialWorkPageContentQuery, useUpdateSocialWorkPageContentMutation } from '@/app/services/socialWorkPageContentApi';
import ContentConstructor from './admin/ContentConstructor';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';

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
    icon: Bird,
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

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'ABOUT_ADMIN'].includes(roleName.toString().toUpperCase());

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

  const pageConfig = PAGE_CONFIG[pageType as keyof typeof PAGE_CONFIG];
  const IconComponent = pageConfig?.icon || Users;
  

  const handleOpenContentEditor = () => {
    if (pageContent) {
      setEditableTitle(getTranslatedField(pageContent, 'title', language) || pageConfig?.title || 'Социальная работа');
      setEditableSubtitle(getTranslatedField(pageContent, 'subtitle', language) || pageConfig?.defaultSubtitle || '');
      setEditableContent(getTranslatedField(pageContent, 'content', language) || []);
    } else {
      setEditableTitle(pageConfig?.title || 'Социальная работа');
      setEditableSubtitle(pageConfig?.defaultSubtitle || '');
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

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.props?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const HeadingComponent = HeadingTag;
        return (
          <HeadingComponent 
            className="text-2xl font-bold text-gray-900 mb-4 break-words"
            style={{ color: element.props?.color || '#000000' }}
          >
            {element.content}
          </HeadingComponent>
        );
      case 'paragraph':
        return (
          <p 
            className="text-gray-700 mb-4 leading-relaxed break-words"
            style={{ textIndent: element.props?.textIndent ? '1.5em' : '0' }}
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
                {pageConfig?.title || getTranslatedField(pageContent, 'title', language) || 'Социальная работа'}
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
              {pageConfig?.defaultSubtitle || getTranslatedField(pageContent, 'subtitle', language) || 'Информация о социальной и идеологической работе на предприятии.'}
            </p>
          </div>

          {/* Дополнительный контент */}
          {pageContent?.content && Array.isArray(pageContent.content) && pageContent.content.length > 0 && (
            <div className="w-full mb-12">
              <div className="py-8">
                {getTranslatedField(pageContent, 'content', language).map((element: any) => (
                  <div key={element.id}>
                    {renderContentElement(element)}
                  </div>
                ))}
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
                  {pageConfig?.title || 'Социальная работа'}
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
                placeholder={pageConfig?.title || 'Социальная работа'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder={pageConfig?.defaultSubtitle || 'Описание страницы...'}
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
