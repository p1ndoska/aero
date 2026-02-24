import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Building2, Settings, FileText } from 'lucide-react';
import type { TableCellContent } from '@/types/branch';
import { toast } from 'sonner';
import { useGetAboutCompanyPageContentQuery, useUpdateAboutCompanyPageContentMutation } from '@/app/services/aboutCompanyPageContentApi';
import ContentConstructor from './admin/ContentConstructor';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import { BASE_URL } from '@/constants';

export default function AboutCompanyPage() {
  const { language, t } = useLanguage();
  const { data: pageContent, refetch: refetchPageContent } = useGetAboutCompanyPageContentQuery();
  const [updatePageContent, { isLoading: isUpdatingContent }] = useUpdateAboutCompanyPageContentMutation();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'ABOUT_ADMIN'].includes(roleName.toString().toUpperCase());

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

  const handleOpenContentEditor = () => {
    if (pageContent) {
      setEditableTitle(getTranslatedField(pageContent, 'title', language) || 'О предприятии');
      setEditableSubtitle(getTranslatedField(pageContent, 'subtitle', language) || '');
      setEditableContent(getTranslatedField(pageContent, 'content', language) || []);
    } else {
      setEditableTitle('О предприятии');
      setEditableSubtitle('');
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

      await updatePageContent(updateData).unwrap();
      toast.success(t('content_updated_successfully'));
      refetchPageContent();
      setIsContentEditorOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || t('error_saving_content'));
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
                console.error('Image failed to load in AboutCompanyPage:', element.props?.src);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully in AboutCompanyPage:', element.props?.src);
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
                        {header || `${t('column')} ${idx + 1}`}
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
      case 'file': {
        if (!element.props?.fileUrl) return null;
        const formatFileSize = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        const displayName = element.props.fileName
          ? element.props.fileName.replace(/\.[^/.]+$/, '')
          : '';
        return (
          <div className="mb-4 flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">
                {element.props.fileName || t('unknown_file')}
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
              {t('download')}
            </a>
          </div>
        );
      }
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
      case 'page-link':
        const linkText = element.content || element.props?.linkText;
        if (!linkText) return null;
        const pageTitle = element.props?.pageTitle || '';
        const pageSlug = element.props?.pageSlug || (pageTitle ? pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '');
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
                <Building2 className="w-10 h-10 text-blue-600" />
                {getTranslatedField(pageContent, 'title', language) || 'О предприятии'}
              </h1>
              {isAuthenticated && isAdmin && (
                <Button
                  onClick={handleOpenContentEditor}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('manage_content')}
                </Button>
              )}
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getTranslatedField(pageContent, 'subtitle', language) || t('about_company_default_subtitle')}
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
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('about_company')}</h3>
                <p className="text-gray-500 mb-6">
                  {t('about_company_placeholder')}
                </p>
                {isAuthenticated && isAdmin && (
                  <Button
                    onClick={handleOpenContentEditor}
                    variant="outline"
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('add_content')}
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
            <DialogTitle>{t('manage_about_company_content')}</DialogTitle>
            <DialogDescription>
              {t('edit_about_company_content_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('page_title')}</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder={t('about_company')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('subtitle')}</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder={t('company_description_placeholder')}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">{t('main_content')}</label>
              <ContentConstructor
                content={editableContent}
                onChange={setEditableContent}
              />
            </div>
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
    </div>
  );
}
