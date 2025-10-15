//@ts-nocheck
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, MapPin, Clock, DollarSign, FileText, Settings, Type, Heading, Image as ImageIcon, List } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllVacanciesQuery } from '@/app/services/vacancyApi';
import { useGetVacancyPageContentQuery, useUpdateVacancyPageContentMutation } from '@/app/services/vacancyPageContentApi';
import type { Vacancy } from '@/types/vacancy';
import VacancyApplicationForm from './VacancyApplicationForm';
import ContentConstructor from './admin/ContentConstructor';

export default function VacanciesPage() {
  const { data: vacancies, isLoading } = useGetAllVacanciesQuery({ active: true });
  const { data: pageContent, refetch: refetchPageContent } = useGetVacancyPageContentQuery();
  const [updatePageContent, { isLoading: isUpdatingContent }] = useUpdateVacancyPageContentMutation();
  
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'HR_ADMIN'].includes(roleName.toString().toUpperCase());

  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState([]);

  const handleViewDetails = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsDetailDialogOpen(true);
  };

  const handleApply = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsDetailDialogOpen(false);
    setIsApplicationFormOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsApplicationFormOpen(false);
    setSelectedVacancy(null);
  };

  const handleOpenContentEditor = () => {
    if (pageContent) {
      setEditableTitle(pageContent.title || 'Открытые вакансии');
      setEditableSubtitle(pageContent.subtitle || '');
      setEditableContent(pageContent.content || []);
    } else {
      setEditableTitle('Открытые вакансии');
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
        console.log('VacanciesPage rendering list:', element, items);
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
        console.log('VacanciesPage rendering image:', element.props?.src);
        return (
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={element.props?.src} 
              alt={element.props?.alt || ''}
              className="max-w-full h-auto rounded-lg object-contain"
              style={{ maxWidth: '800px', maxHeight: '400px' }}
              onError={(e) => {
                console.error('Image failed to load in VacanciesPage:', element.props?.src);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully in VacanciesPage:', element.props?.src);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка вакансий...</div>
      </div>
    );
  }

  return (
    <div >
      <div className="container mx-auto px-4 py-12">
        {/* Белый закругленный контейнер на фоне */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-blue-600" />
              {pageContent?.title || 'Открытые вакансии'}
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
            {pageContent?.subtitle || 'Присоединяйтесь к нашей команде профессионалов. Мы ищем талантливых специалистов для работы в сфере аэронавигации.'}
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

        {/* Список вакансий */}
        <div className="grid gap-6 max-w-5xl mx-auto">
          {vacancies && vacancies.length > 0 ? (
            vacancies
              .filter((vacancy) => vacancy.isActive)
              .map((vacancy) => (
                <Card
                  key={vacancy.id}
                  className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-600"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 line-clamp-2 break-words">{vacancy.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">{vacancy.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {vacancy.salary && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                          <span className="font-medium">{vacancy.salary}</span>
                        </div>
                      )}
                      {vacancy.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-5 h-5 mr-2 text-red-600" />
                          <span>{vacancy.location}</span>
                        </div>
                      )}
                      {vacancy.employmentType && (
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-5 h-5 mr-2 text-blue-600" />
                          <span>{vacancy.employmentType}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 text-sm">
                        <FileText className="w-5 h-5 mr-2" />
                        <span>Опубликовано: {new Date(vacancy.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleViewDetails(vacancy)} variant="outline">
                        Подробнее
                      </Button>
                      <Button onClick={() => handleApply(vacancy)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                        Откликнуться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Нет доступных вакансий</h3>
                <p className="text-gray-500">В настоящее время открытых вакансий нет. Пожалуйста, зайдите позже.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-12 max-w-5xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Почему стоит работать с нами?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">Стабильность</h3>
                  <p className="text-sm text-gray-600">
                    Работа в крупной государственной организации с гарантированной занятостью
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">Развитие</h3>
                  <p className="text-sm text-gray-600">
                    Возможности для профессионального роста и обучения
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">Социальный пакет</h3>
                  <p className="text-sm text-gray-600">
                    Полный социальный пакет и дополнительные льготы
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div> {/* Закрытие белого закругленного контейнера */}
      </div>

      {/* Диалог с подробностями вакансии */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white min-w-0 dialog-content">
          {selectedVacancy && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl break-words">{selectedVacancy.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Описание</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedVacancy.description}</p>
                </div>

                {selectedVacancy.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Требования</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedVacancy.requirements}</p>
                  </div>
                )}

                {selectedVacancy.conditions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Условия работы</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedVacancy.conditions}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedVacancy.salary && (
                    <div>
                      <span className="font-semibold">Зарплата:</span>
                      <p className="text-gray-700">{selectedVacancy.salary}</p>
                    </div>
                  )}
                  {selectedVacancy.location && (
                    <div>
                      <span className="font-semibold">Местоположение:</span>
                      <p className="text-gray-700">{selectedVacancy.location}</p>
                    </div>
                  )}
                  {selectedVacancy.employmentType && (
                    <div>
                      <span className="font-semibold">Тип занятости:</span>
                      <p className="text-gray-700">{selectedVacancy.employmentType}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Закрыть
                  </Button>
                  <Button onClick={() => handleApply(selectedVacancy)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                    Откликнуться на вакансию
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Форма отклика */}
      {selectedVacancy && (
        <VacancyApplicationForm
          vacancy={selectedVacancy}
          isOpen={isApplicationFormOpen}
          onClose={() => setIsApplicationFormOpen(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Редактор контента страницы */}
      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white min-w-0 dialog-content">
          <DialogHeader>
            <DialogTitle>Управление контентом страницы вакансий</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок страницы</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="Открытые вакансии"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder="Присоединяйтесь к нашей команде..."
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

