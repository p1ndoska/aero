//@ts-nocheck
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearchAllQuery } from '../app/services/searchApi';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Tag, Loader2 } from 'lucide-react';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language, t } = useLanguage();

  const { data, isLoading, error } = useSearchAllQuery(
    { query, language },
    { skip: !query || query.length < 2 }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'news': 'Новость',
      'vacancy': 'Вакансия',
      'branch': 'Филиал',
      'about-company': 'О предприятии',
      'aeronautical-info': 'Аэронавигация',
      'social-work': 'Социальная работа',
      'services': 'Услуги',
      'appeals': 'Обращения',
      'management': 'Руководство',
    };
    return labels[type] || type;
  };

  if (!query || query.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">
                {t('search_min_chars')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#213659] mb-4" />
              <p className="text-gray-600">{t('search_loading')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-red-600">
                <h2 className="text-xl font-semibold mb-2">{t('search_error')}</h2>
                <p>{t('search_error_desc')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#213659] mb-2">
            {t('search_results')}
          </h1>
          <p className="text-gray-600">
            {t('search_query')} <span className="font-semibold">"{query}"</span> {t('search_found')}{' '}
            {data?.totalCount || 0} {t('search_results_count')}
          </p>
        </div>

        {data?.results && data.results.length > 0 ? (
          <div className="space-y-4">
            {data.results.map((result, index) => (
              <Card key={`${result.type}-${result.id}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl">
                      <Link
                        to={result.url}
                        className="text-[#213659] hover:text-blue-700 transition-colors"
                      >
                        {result.title}
                      </Link>
                    </CardTitle>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {result.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>{result.category}</span>
                    </div>
                    {result.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(result.date)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {t('search_no_results')}
              </h2>
              <p className="text-gray-600">
                {t('search_no_results_desc')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

