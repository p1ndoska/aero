import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Trash2, Calendar, Mail, Phone, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetAllServicesCategoriesQuery } from '@/app/services/servicesCategoryApi';
import { getTranslatedField } from '@/utils/translationHelpers';
import { fetchWithAuth } from '@/utils/apiHelpers';

interface ServiceRequest {
  id: number;
  serviceType: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  preferredDate?: string;
  budget?: string;
  notes?: string;
  assignedTo?: number;
  response?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceRequestStats {
  total: number;
  byStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  byServiceType: Array<{
    serviceType: string;
    count: number;
  }>;
}

const ServiceRequestManagement: React.FC = () => {
  const { language } = useLanguage();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Получаем категории услуг для преобразования serviceType в названия
  const { data: servicesCategories = [] } = useGetAllServicesCategoriesQuery(undefined);

  // Функция для получения названия услуги по serviceType
  const getServiceNameByType = (serviceType: string): string => {
    const category = (servicesCategories as any[]).find((cat: any) => cat.pageType === serviceType);
    if (category) {
      return getTranslatedField(category, 'name', language) || category.name || serviceType;
    }
    return serviceType;
  };
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    serviceType: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const getTranslatedText = (ru: string, en: string, be: string) => {
    switch (language) {
      case 'en': return en;
      case 'be': return be;
      default: return ru;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return getTranslatedText('Ожидает', 'Pending', 'Чакае');
      case 'in_progress': return getTranslatedText('В работе', 'In Progress', 'У працы');
      case 'completed': return getTranslatedText('Завершена', 'Completed', 'Завершана');
      case 'cancelled': return getTranslatedText('Отменена', 'Cancelled', 'Скасавана');
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return getTranslatedText('Низкий', 'Low', 'Нізкі');
      case 'medium': return getTranslatedText('Средний', 'Medium', 'Сярэдні');
      case 'high': return getTranslatedText('Высокий', 'High', 'Высокі');
      case 'urgent': return getTranslatedText('Срочный', 'Urgent', 'Тэрміновы');
      default: return priority;
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.serviceType && filters.serviceType !== 'all' && { serviceType: filters.serviceType })
      });

      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443');
      const response = await fetchWithAuth(`${apiUrl}/api/service-requests?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service requests');
      }

      const data = await response.json();
      setServiceRequests(data.serviceRequests);
      setPagination(data.pagination);
    } catch (error: any) {
      // Не показываем ошибку, если это 401 (уже выполнен logout и перенаправление)
      if (error?.message?.includes('Unauthorized')) {
        return;
      }
      console.error('Error fetching service requests:', error);
      toast.error('Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443');
      const response = await fetchWithAuth(`${apiUrl}/api/service-requests-stats`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      // Не показываем ошибку, если это 401 (уже выполнен logout и перенаправление)
      if (error?.message?.includes('Unauthorized')) {
        return;
      }
      console.error('Error fetching stats:', error);
    }
  };

  const updateServiceRequest = async (id: number, updateData: Partial<ServiceRequest>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443');
      const response = await fetchWithAuth(`${apiUrl}/api/service-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update service request');
      }

      toast.success('Заявка успешно обновлена');
      fetchServiceRequests();
      fetchStats();
    } catch (error: any) {
      // Не показываем ошибку, если это 401 (уже выполнен logout и перенаправление)
      if (error?.message?.includes('Unauthorized')) {
        return;
      }
      console.error('Error updating service request:', error);
      toast.error('Ошибка при обновлении заявки');
    }
  };

  const deleteServiceRequest = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443');
      const response = await fetchWithAuth(`${apiUrl}/api/service-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete service request');
      }

      toast.success('Заявка успешно удалена');
      fetchServiceRequests();
      fetchStats();
    } catch (error: any) {
      // Не показываем ошибку, если это 401 (уже выполнен logout и перенаправление)
      if (error?.message?.includes('Unauthorized')) {
        return;
      }
      console.error('Error deleting service request:', error);
      toast.error('Ошибка при удалении заявки');
    }
  };

  useEffect(() => {
    fetchServiceRequests();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.search, filters.status, filters.serviceType]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleEditRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#213659]">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего заявок</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.inProgress}</div>
              <div className="text-sm text-gray-600">В работе</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</div>
              <div className="text-sm text-gray-600">Завершены</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Поиск по ФИО, email, теме..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#B1D1E0]">
                  <SelectItem value="all" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    Все статусы
                  </SelectItem>
                  <SelectItem value="pending" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    Ожидает
                  </SelectItem>
                  <SelectItem value="in_progress" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    В работе
                  </SelectItem>
                  <SelectItem value="completed" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    Завершена
                  </SelectItem>
                  <SelectItem value="cancelled" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    Отменена
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serviceType">Тип услуги</Label>
              <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange('serviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#B1D1E0]">
                  <SelectItem value="all" className="focus:bg-[#EFF6FF] focus:text-[#213659]">
                    Все типы
                  </SelectItem>
                  {stats?.byServiceType.map((type) => {
                    const serviceName = getServiceNameByType(type.serviceType);
                    return (
                      <SelectItem 
                        key={type.serviceType} 
                        value={type.serviceType}
                        className="focus:bg-[#EFF6FF] focus:text-[#213659]"
                      >
                        {serviceName} ({type.count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица заявок */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки на услуги</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceRequests.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">Заявки не найдены</p>
              <p className="text-gray-500 text-sm">Заявки на услуги будут отображаться здесь</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">#{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.fullName}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                        {request.organization && (
                          <div className="text-sm text-gray-500">{request.organization}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getServiceNameByType(request.serviceType)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.subject}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {getPriorityText(request.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => {
                          updateServiceRequest(request.id, { status: value });
                        }}
                      >
                        <SelectTrigger className={`w-36 h-7 text-xs border-0 ${getStatusColor(request.status)} cursor-pointer hover:opacity-80 transition-opacity`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#B1D1E0]">
                          <SelectItem value="pending" className="focus:bg-yellow-50 cursor-pointer">
                            {getStatusText('pending')}
                          </SelectItem>
                          <SelectItem value="in_progress" className="focus:bg-blue-50 cursor-pointer">
                            {getStatusText('in_progress')}
                          </SelectItem>
                          <SelectItem value="completed" className="focus:bg-green-50 cursor-pointer">
                            {getStatusText('completed')}
                          </SelectItem>
                          <SelectItem value="cancelled" className="focus:bg-red-50 cursor-pointer">
                            {getStatusText('cancelled')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRequest(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteServiceRequest(request.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}

          {/* Пагинация */}
          {serviceRequests.length > 0 && pagination.pages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Назад
                </Button>
                <span className="flex items-center px-4">
                  Страница {pagination.page} из {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог просмотра заявки */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка #{selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Контактная информация */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Контактная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ФИО</Label>
                    <div className="font-medium">{selectedRequest.fullName}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="font-medium">{selectedRequest.email}</div>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <Label>Телефон</Label>
                      <div className="font-medium">{selectedRequest.phone}</div>
                    </div>
                  )}
                  {selectedRequest.organization && (
                    <div>
                      <Label>Организация</Label>
                      <div className="font-medium">{selectedRequest.organization}</div>
                    </div>
                  )}
                  {selectedRequest.position && (
                    <div>
                      <Label>Должность</Label>
                      <div className="font-medium">{selectedRequest.position}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о заявке */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Информация о заявке</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Услуга</Label>
                    <div className="font-medium">{getServiceNameByType(selectedRequest.serviceType)}</div>
                  </div>
                  <div>
                    <Label>Тема</Label>
                    <div className="font-medium">{selectedRequest.subject}</div>
                  </div>
                  <div>
                    <Label>Приоритет</Label>
                    <Badge className={getPriorityColor(selectedRequest.priority)}>
                      {getPriorityText(selectedRequest.priority)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Статус</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusText(selectedRequest.status)}
                    </Badge>
                  </div>
                  {selectedRequest.preferredDate && (
                    <div>
                      <Label>Предпочтительная дата</Label>
                      <div className="font-medium">
                        {new Date(selectedRequest.preferredDate).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  )}
                  {selectedRequest.budget && (
                    <div>
                      <Label>Бюджет</Label>
                      <div className="font-medium">{selectedRequest.budget}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Описание */}
              <div>
                <Label>Описание заявки</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Дополнительные заметки */}
              {selectedRequest.notes && (
                <div>
                  <Label>Дополнительные заметки</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}

              {/* Ответ администратора */}
              {selectedRequest.response && (
                <div>
                  <Label>Ответ администратора</Label>
                  <div className="mt-2 p-4 bg-green-50 rounded-lg">
                    {selectedRequest.response}
                  </div>
                  {selectedRequest.responseDate && (
                    <div className="text-sm text-gray-500 mt-2">
                      Дата ответа: {new Date(selectedRequest.responseDate).toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              )}

              {/* Даты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Дата создания</Label>
                  <div className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div>
                  <Label>Дата обновления</Label>
                  <div className="font-medium">
                    {new Date(selectedRequest.updatedAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования заявки */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование заявки #{selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => setSelectedRequest(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger className={`${getStatusColor(selectedRequest.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#B1D1E0]">
                    <SelectItem value="pending" className="focus:bg-yellow-50">
                      {getStatusText('pending')}
                    </SelectItem>
                    <SelectItem value="in_progress" className="focus:bg-blue-50">
                      {getStatusText('in_progress')}
                    </SelectItem>
                    <SelectItem value="completed" className="focus:bg-green-50">
                      {getStatusText('completed')}
                    </SelectItem>
                    <SelectItem value="cancelled" className="focus:bg-red-50">
                      {getStatusText('cancelled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Приоритет</Label>
                <Select
                  value={selectedRequest.priority}
                  onValueChange={(value) => setSelectedRequest(prev => prev ? { ...prev, priority: value } : null)}
                >
                  <SelectTrigger className={`${getPriorityColor(selectedRequest.priority)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#B1D1E0]">
                    <SelectItem value="low" className="focus:bg-green-50">
                      {getPriorityText('low')}
                    </SelectItem>
                    <SelectItem value="medium" className="focus:bg-yellow-50">
                      {getPriorityText('medium')}
                    </SelectItem>
                    <SelectItem value="high" className="focus:bg-orange-50">
                      {getPriorityText('high')}
                    </SelectItem>
                    <SelectItem value="urgent" className="focus:bg-red-50">
                      {getPriorityText('urgent')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response">Ответ администратора</Label>
                <Textarea
                  id="response"
                  value={selectedRequest.response || ''}
                  onChange={(e) => setSelectedRequest(prev => prev ? { ...prev, response: e.target.value } : null)}
                  rows={4}
                  placeholder="Введите ответ клиенту..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  value={selectedRequest.notes || ''}
                  onChange={(e) => setSelectedRequest(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={3}
                  placeholder="Внутренние заметки..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRequest) {
                      updateServiceRequest(selectedRequest.id, {
                        status: selectedRequest.status,
                        priority: selectedRequest.priority,
                        response: selectedRequest.response,
                        notes: selectedRequest.notes
                      });
                      setIsEditDialogOpen(false);
                    }
                  }}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestManagement;

