//@ts-nocheck
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, MapPin, Clock, FileText, Settings, Type, Heading, Image as ImageIcon, List, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllVacanciesQuery } from '@/app/services/vacancyApi';
import { useGetVacancyPageContentQuery, useUpdateVacancyPageContentMutation } from '@/app/services/vacancyPageContentApi';
import { useGetAllAboutCompanyCategoriesQuery } from '@/app/services/aboutCompanyCategoryApi';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';
import type { Vacancy } from '@/types/vacancy';
import VacancyApplicationForm from './VacancyApplicationForm';
import ContentConstructor from './admin/ContentConstructor';

export default function VacanciesPage() {
  const HR_EMAIL = 'office@ban.by';

  const handleSendResumeByEmail = (vacancy: Vacancy) => {
    const translatedTitle = getTranslatedField(vacancy, 'title', language) || vacancy.title;
    const subject = `${t('application_for_vacancy')}: ${translatedTitle}`;
    const body = [
      t('hello'),
      '',
      `${t('application_for_vacancy')}: ${translatedTitle}`,
      '',
      `${t('full_name')}: `,
      `${t('phone')}: `,
      `${t('cover_letter')}: `,
      '',
      t('resume_attached')
    ].join('%0D%0A');
    const mailto = `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
  };
  const { language, t } = useLanguage();
  const { data: vacancies, isLoading } = useGetAllVacanciesQuery({ active: true });
  const { data: pageContent, refetch: refetchPageContent } = useGetVacancyPageContentQuery();
  const [updatePageContent, { isLoading: isUpdatingContent }] = useUpdateVacancyPageContentMutation();
  
  // Получаем категории "О предприятии" для получения переведенного названия
  const { data: aboutCompanyCategories, isLoading: isLoadingCategories } = useGetAllAboutCompanyCategoriesQuery();
  const vacanciesCategory = useMemo(() => {
    return aboutCompanyCategories?.find((cat: any) => cat.pageType === 'vacancies') || null;
  }, [aboutCompanyCategories]);

  // Мемоизируем заголовок страницы
  const pageTitle = useMemo(() => {
    // Приоритет: название категории > заголовок из контента > дефолтный
    if (vacanciesCategory) {
      const categoryName = getTranslatedField(vacanciesCategory, 'name', language);
      if (categoryName) {
        return categoryName;
      }
      if (vacanciesCategory.name) {
        return vacanciesCategory.name;
      }
    }
    const contentTitle = pageContent ? getTranslatedField(pageContent, 'title', language) : null;
    return contentTitle || 'Открытые вакансии';
  }, [vacanciesCategory, pageContent, language]);

  // Мемоизируем подзаголовок страницы
  const pageSubtitle = useMemo(() => {
    // Приоритет: описание категории > подзаголовок из контента > дефолтный
    if (vacanciesCategory) {
      const categoryDescription = getTranslatedField(vacanciesCategory, 'description', language);
      if (categoryDescription) {
        return categoryDescription;
      }
      if (vacanciesCategory.description) {
        return vacanciesCategory.description;
      }
    }
    const contentSubtitle = pageContent ? getTranslatedField(pageContent, 'subtitle', language) : null;
    return contentSubtitle || 'Присоединяйтесь к нашей команде профессионалов. Мы ищем талантливых специалистов для работы в сфере аэронавигации.';
  }, [vacanciesCategory, pageContent, language]);

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
      // Используем переведенное название категории, если доступно
      const categoryTitle = vacanciesCategory ? getTranslatedField(vacanciesCategory, 'name', language) : null;
      const contentTitle = getTranslatedField(pageContent, 'title', language);
      const contentSubtitle = getTranslatedField(pageContent, 'subtitle', language);
      const content = getTranslatedField(pageContent, 'content', language);
      setEditableTitle(contentTitle || categoryTitle || 'Открытые вакансии');
      setEditableSubtitle(contentSubtitle || '');
      setEditableContent(Array.isArray(content) ? content : []);
    } else {
      // Используем переведенное название категории, если доступно
      const categoryTitle = vacanciesCategory ? getTranslatedField(vacanciesCategory, 'name', language) : null;
      setEditableTitle(categoryTitle || 'Открытые вакансии');
      setEditableSubtitle('');
      setEditableContent([]);
    }
    setIsContentEditorOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      // Сохраняем переводы в зависимости от текущего языка
      const updateData: any = {
        content: editableContent,
      };

      if (language === 'en') {
        updateData.titleEn = editableTitle;
        updateData.subtitleEn = editableSubtitle;
        updateData.contentEn = editableContent;
      } else if (language === 'be') {
        updateData.titleBe = editableTitle;
        updateData.subtitleBe = editableSubtitle;
        updateData.contentBe = editableContent;
      } else {
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
        // Render list element
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
        // Render image element
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
                // Image loaded successfully
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
        <div className="text-lg">{t('loading_vacancies')}</div>
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
                {t('manage_content')}
              </Button>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {pageSubtitle}
          </p>
        </div>

        {/* Дополнительный контент */}
        {(() => {
          const translatedContent = pageContent ? getTranslatedField(pageContent, 'content', language) : null;
          return translatedContent && Array.isArray(translatedContent) && translatedContent.length > 0 ? (
            <div className="w-full mb-12">
              <div className="py-8">
                {translatedContent.map((element: any) => (
                  <div key={element.id}>
                    {renderContentElement(element)}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

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
                    <CardTitle className="text-2xl text-gray-900 line-clamp-2 break-words">
                      {getTranslatedField(vacancy, 'title', language) || vacancy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {getTranslatedField(vacancy, 'description', language) || vacancy.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {(() => {
                        const translatedSalary = getTranslatedField(vacancy, 'salary', language) || vacancy.salary;
                        return translatedSalary ? (
                          <div className="flex items-center text-gray-600">
                            <span className="w-9 mr-2 text-green-600 font-bold text-lg flex items-center justify-center">BYN</span>
                            <span className="font-medium">{translatedSalary}</span>
                          </div>
                        ) : null;
                      })()}
                      {(() => {
                        const translatedLocation = getTranslatedField(vacancy, 'location', language) || vacancy.location;
                        return translatedLocation ? (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-2 text-red-600" />
                            <span>{translatedLocation}</span>
                          </div>
                        ) : null;
                      })()}
                      {(() => {
                        const translatedEmploymentType = getTranslatedField(vacancy, 'employmentType', language) || vacancy.employmentType;
                        return translatedEmploymentType ? (
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            <span>{translatedEmploymentType}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center text-gray-500 text-sm">
                        <FileText className="w-5 h-5 mr-2" />
                        <span>{t('published')}: {new Date(vacancy.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'be' ? 'be-BY' : 'ru-RU')}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleViewDetails(vacancy)} variant="outline">
                        {t('details')}
                      </Button>
                      <Button onClick={() => handleApply(vacancy)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                        {t('apply')}
                      </Button>
                      <Button onClick={() => handleSendResumeByEmail(vacancy)} variant="outline" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('send_resume')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('no_vacancies_available')}</h3>
                <p className="text-gray-500">{t('no_vacancies_message')}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-12 max-w-5xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {t('why_work_with_us')}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">{t('stability')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('stability_description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">{t('development')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('development_description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">{t('social_package')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('social_package_description')}
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
                <DialogTitle className="text-2xl break-words">
                  {getTranslatedField(selectedVacancy, 'title', language) || selectedVacancy.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('description')}</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {getTranslatedField(selectedVacancy, 'description', language) || selectedVacancy.description}
                  </p>
                </div>

                {(() => {
                  const translatedRequirements = getTranslatedField(selectedVacancy, 'requirements', language) || selectedVacancy.requirements;
                  return translatedRequirements ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('requirements')}</h3>
                      <p className="text-gray-700 whitespace-pre-line">{translatedRequirements}</p>
                    </div>
                  ) : null;
                })()}

                {(() => {
                  const translatedConditions = getTranslatedField(selectedVacancy, 'conditions', language) || selectedVacancy.conditions;
                  return translatedConditions ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('work_conditions')}</h3>
                      <p className="text-gray-700 whitespace-pre-line">{translatedConditions}</p>
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const translatedSalary = getTranslatedField(selectedVacancy, 'salary', language) || selectedVacancy.salary;
                    return translatedSalary ? (
                      <div>
                        <span className="font-semibold">{t('salary')}:</span>
                        <p className="text-gray-700">{translatedSalary}</p>
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const translatedLocation = getTranslatedField(selectedVacancy, 'location', language) || selectedVacancy.location;
                    return translatedLocation ? (
                      <div>
                        <span className="font-semibold">{t('location')}:</span>
                        <p className="text-gray-700">{translatedLocation}</p>
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const translatedEmploymentType = getTranslatedField(selectedVacancy, 'employmentType', language) || selectedVacancy.employmentType;
                    return translatedEmploymentType ? (
                      <div>
                        <span className="font-semibold">{t('employment_type')}:</span>
                        <p className="text-gray-700">{translatedEmploymentType}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    {t('close')}
                  </Button>
                  <Button onClick={() => handleApply(selectedVacancy)} className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                    {t('apply_to_vacancy')}
                  </Button>
                  <Button onClick={() => handleSendResumeByEmail(selectedVacancy)} variant="outline" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('send_by_email')}
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
            <DialogTitle>{t('manage_vacancies_page_content')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('page_title')}</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder={t('open_vacancies')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('subtitle')}</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder={t('join_our_team_placeholder')}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">{t('additional_content')}</label>
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

