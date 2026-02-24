import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { History, Settings, FileText } from 'lucide-react';
import type { TableCellContent } from '@/types/branch';
import { toast } from 'sonner';
import { useGetHistoryPageContentQuery, useUpdateHistoryPageContentMutation } from '@/app/services/historyPageContentApi';
import ContentConstructor from './admin/ContentConstructor';
import { useForceStyles } from '../hooks/useForceStyles';
import { BASE_URL } from '@/constants';

export default function HistoryPage() {
  const { data: pageContent, refetch: refetchPageContent } = useGetHistoryPageContentQuery();
  const [updatePageContent, { isLoading: isUpdatingContent }] = useUpdateHistoryPageContentMutation();
  
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'ABOUT_ADMIN'].includes(roleName.toString().toUpperCase());

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

  // Принудительное применение стилей
  useForceStyles([pageContent]);

  const handleOpenContentEditor = () => {
    if (pageContent) {
      setEditableTitle(pageContent.title || 'История предприятия');
      setEditableSubtitle(pageContent.subtitle || '');
      setEditableContent(pageContent.content || []);
    } else {
      setEditableTitle('История предприятия');
      setEditableSubtitle('');
      setEditableContent([]);
    }
    setIsContentEditorOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      await updatePageContent({
        title: editableTitle,
        subtitle: editableSubtitle,
        content: editableContent,
      }).unwrap();
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
              href={cell.fileUrl}
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
                <History className="w-10 h-10 text-blue-600" />
                {pageContent?.title || 'История предприятия'}
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
              {pageContent?.subtitle || 'История развития и становления нашего предприятия в сфере аэронавигационного обслуживания воздушного движения.'}
            </p>
          </div>

          {/* Дополнительный контент */}
          {pageContent?.content && Array.isArray(pageContent.content) && pageContent.content.length > 0 && (
            <div className="w-full mb-12">
              <div className="py-8">
                {pageContent.content.map((element: any) => (
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
                <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">История предприятия</h3>
                <p className="text-gray-500 mb-6">
                  Здесь будет отображаться история развития предприятия, ключевые события и достижения.
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
            <DialogTitle>Управление контентом страницы истории предприятия</DialogTitle>
            <DialogDescription>
              Создайте и редактируйте контент для страницы истории предприятия
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок страницы</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="История предприятия"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder="Краткое описание истории предприятия..."
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Дополнительный контент</label>
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
