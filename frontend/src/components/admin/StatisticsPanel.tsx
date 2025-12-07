//@ts-nocheck
import { useGetStatisticsQuery } from '@/app/services/statisticsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Newspaper, Briefcase, Building2, UserCheck, Mail, FolderOpen, Shield, TrendingUp, Clock, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StatisticsPanel() {
  const { data: statistics, isLoading, error } = useGetStatisticsQuery();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Ошибка загрузки статистики</div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const { overview, usersByRole, requestsByStatus, newsByCategory, recentUsers, recentNews } = statistics;

  const statCards = [
    {
      title: 'Всего пользователей',
      value: overview.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Всего новостей',
      value: overview.totalNews,
      icon: Newspaper,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Всего вакансий',
      value: overview.totalVacancies,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Активных вакансий',
      value: overview.activeVacancies,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Филиалов',
      value: overview.totalBranches,
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Руководителей',
      value: overview.totalManagement,
      icon: UserCheck,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Заявок на услуги',
      value: overview.totalServiceRequests,
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Категорий новостей',
      value: overview.totalCategories,
      icon: FolderOpen,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Ролей',
      value: overview.totalRoles,
      icon: Shield,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#213659] mb-6">Статистика системы</h2>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#213659]">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пользователи по ролям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Пользователи по ролям
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(usersByRole).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{role}</span>
                    <span className="text-lg font-bold text-[#213659]">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Заявки по статусам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Заявки на услуги по статусам
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(requestsByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(requestsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 capitalize">{status}</span>
                    <span className="text-lg font-bold text-[#213659]">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Новости по категориям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Новости по категориям
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newsByCategory && newsByCategory.length > 0 ? (
              <div className="space-y-3">
                {newsByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{item.categoryName}</span>
                    <span className="text-lg font-bold text-[#213659]">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Последние пользователи */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Последние зарегистрированные пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                        {user.role?.name || 'USER'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(user.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Последние новости */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Последние новости
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNews && recentNews.length > 0 ? (
            <div className="space-y-3">
              {recentNews.map((news) => (
                <div key={news.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{news.title}</span>
                    <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                      {news.category?.name || 'Без категории'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(news.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Нет данных</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

