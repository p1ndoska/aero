import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getTranslatedField } from '@/utils/translationHelpers';
import { useLanguage } from '@/contexts/LanguageContext';

type HookResult<T> = { data?: T; isLoading?: boolean; error?: any };

interface CategoryListPageProps<TCategory> {
  title: string;
  subtitle?: string;
  // Хук RTK Query для получения списка категорий (без аргументов)
  useCategoriesHook: () => HookResult<TCategory[]>;
  // Поле со слагом/типом для построения ссылки
  slugField: keyof TCategory;
  // Базовый путь, к которому добавляется слаг
  basePath: string; // например: '/about' | '/air-navigation' | '/appeals' | '/social'
}

export default function CategoryListPage<TCategory extends Record<string, any>>({
  title,
  subtitle,
  useCategoriesHook,
  slugField,
  basePath,
}: CategoryListPageProps<TCategory>) {
  const { language, t } = useLanguage();
  const { data: categories = [], isLoading, error } = useCategoriesHook();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">{t('loading')}</div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">{t('error_loading_data')}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-gray-600">{t('categories_not_found')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .filter((c: any) => c.isActive !== false)
                .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((category: any) => {
                  const name = getTranslatedField(category, 'name', language) || category.name;
                  const description = getTranslatedField(category, 'description', language) || category.description;
                  const slug = String(category[slugField]);
                  return (
                    <Card key={slug} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {description && (
                          <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
                        )}
                        <Link to={`${basePath}/${slug}`} className="block">
                          <Button className="w-full transition-colors bg-[#213659] text-white hover:bg-[#1a2a4a]">
                            {t('go')}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




